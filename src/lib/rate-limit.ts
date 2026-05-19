// Rate limiter en memoria (LRU + ventana fija). Adecuado para V1 — cada
// instancia serverless tiene su propia cuenta, así que con 10 invocaciones
// concurrentes el límite efectivo es ~10×. Para producción seria
// migrar a Upstash Redis (`@upstash/ratelimit`) cuando los abusos sean visibles.

const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_KEYS = 5000; // tope para que el Map no crezca infinito

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetIn: number; // segundos hasta el reset
}

/**
 * Comprueba si la `key` ha excedido `limit` peticiones en los últimos
 * `windowSec` segundos. Devuelve `ok: false` si supera el límite.
 *
 * @param key  Clave única (típicamente user_id o IP)
 * @param limit  Máximo de peticiones por ventana
 * @param windowSec  Tamaño de ventana en segundos
 */
export function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  // GC perezoso: si pasamos del tope, borra las primeras entradas (FIFO aprox)
  if (buckets.size > MAX_KEYS) {
    const cutoff = MAX_KEYS / 2;
    let i = 0;
    for (const k of buckets.keys()) {
      buckets.delete(k);
      if (++i >= cutoff) break;
    }
  }

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
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

/**
 * Convierte un Request en una clave razonable de rate-limit usando el
 * userId si existe (preferido) o la IP del proxy upstream.
 */
export function getRateLimitKey(req: Request, userId?: string | null): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get('x-forwarded-for');
  const ip = fwd?.split(',')[0]?.trim() ?? 'anon';
  return `ip:${ip}`;
}
