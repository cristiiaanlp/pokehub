// GET /api/replay?url=...
// Resolves a Pokémon Showdown replay URL, fetches the .log, parses it.

import { NextResponse } from 'next/server';
import { parseReplay } from '@/lib/replay-parser';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export const runtime = 'nodejs';
// 1h cache — los replays son inmutables
export const revalidate = 3600;

function normalizeUrl(input: string): string | null {
  try {
    const u = new URL(input.trim());
    if (!u.hostname.endsWith('pokemonshowdown.com')) return null;
    // /[battle-id] o /[battle-id].html → /[battle-id].log
    const path = u.pathname.replace(/\.(html|json|log)$/, '');
    return `${u.protocol}//${u.hostname}${path}.log`;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  // 20 replays / 5 min por IP — el parser hace un fetch externo, así que limitamos abusos.
  const rl = await rateLimit(`replay:${getRateLimitKey(req)}`, 20, 300);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Demasiadas peticiones. Espera ${rl.resetIn}s.` },
      { status: 429, headers: { 'retry-after': String(rl.resetIn) } }
    );
  }

  const url = new URL(req.url).searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  const target = normalizeUrl(url);
  if (!target) {
    return NextResponse.json(
      {
        error:
          'URL no válida. Pega un enlace de https://replay.pokemonshowdown.com/…',
      },
      { status: 400 }
    );
  }

  const res = await fetch(target, {
    headers: { 'user-agent': 'PokeHub Replay Analyzer/1.0' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    return NextResponse.json(
      { error: `Replay not found (${res.status})` },
      { status: 404 }
    );
  }
  const log = await res.text();
  const analysis = parseReplay(log);

  return NextResponse.json({ analysis });
}
