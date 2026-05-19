// Rate limiter con backend selectable:
//   1. Si UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN están set → Upstash
//      Redis (distribuido, sobrevive a múltiples instancias serverless).
//   2. Si no → fallback in-memory (suficiente para tráfico bajo / dev).
//
// Conseguir credentials Upstash: console.upstash.com → Create Database → Redis
// → Free tier (10K cmds/día) → copia "REST URL" + "REST Token".

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetIn: number;
}

// ─── BACKEND IN-MEMORY (fallback) ─────────────────────────────────────────
const memBuckets = new Map<string, { count: number; resetAt: number }>();
const MAX_MEM_KEYS = 5000;

function memRateLimit(
  key: string,
  limit: number,
  windowSec: number
): RateLimitResult {
  const now = Date.now();
  const existing = memBuckets.get(key);
  if (memBuckets.size > MAX_MEM_KEYS) {
    const cutoff = MAX_MEM_KEYS / 2;
    let i = 0;
    for (const k of memBuckets.keys()) {
      memBuckets.delete(k);
      if (++i >= cutoff) break;
    }
  }
  if (!existing || existing.resetAt <= now) {
    memBuckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, remaining: limit - 1, resetIn: windowSec };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetIn: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  existing.count += 1;
  return {
    ok: true,
    remaining: limit - existing.count,
    resetIn: Math.ceil((existing.resetAt - now) / 1000),
  };
}

// ─── BACKEND UPSTASH ──────────────────────────────────────────────────────
let upstash: Redis | null = null;
const upstashCache = new Map<string, Ratelimit>();

function getUpstash(): Redis | null {
  if (upstash) return upstash;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  upstash = new Redis({ url, token });
  return upstash;
}

function getRatelimiter(limit: number, windowSec: number): Ratelimit | null {
  const redis = getUpstash();
  if (!redis) return null;
  const cacheKey = `${limit}:${windowSec}`;
  const existing = upstashCache.get(cacheKey);
  if (existing) return existing;
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: false,
    prefix: 'pokehub:rl',
  });
  upstashCache.set(cacheKey, rl);
  return rl;
}

// ─── API PÚBLICA ──────────────────────────────────────────────────────────

/**
 * Comprueba si `key` ha excedido `limit` peticiones en `windowSec` segundos.
 * Async porque Upstash hace round-trip; el in-memory devuelve sincrónicamente
 * pero el contrato es Promise para que el caller no tenga que ramificar.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const rl = getRatelimiter(limit, windowSec);
  if (rl) {
    try {
      const result = await rl.limit(key);
      return {
        ok: result.success,
        remaining: result.remaining,
        resetIn: Math.ceil((result.reset - Date.now()) / 1000),
      };
    } catch {
      // Si Upstash falla, NO bloqueamos al usuario — caer a memoria.
      return memRateLimit(key, limit, windowSec);
    }
  }
  return memRateLimit(key, limit, windowSec);
}

export function getRateLimitKey(req: Request, userId?: string | null): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd?.split(',')[0]?.trim() ?? 'anon';
  return `ip:${ip}`;
}
