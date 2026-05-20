// IA Pokémon — endpoint preparado para Claude.
// Devuelve 501 hasta que se configure ANTHROPIC_API_KEY en .env.local.
// Cuando esté activo, acepta { intent, pokemon?, types?, format? } y responde con
// sugerencias de team / counter / set generadas por Claude.

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { getSupabaseServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

interface RecommendBody {
  intent: 'team' | 'counter' | 'set' | 'analysis';
  pokemon?: string;
  types?: string[];
  format?: 'gen9ou' | 'gen9vgc' | 'reg-ma';
  message?: string;
}

export async function POST(req: NextRequest) {
  // Kill switch: si NEXT_PUBLIC_AI_COACH_ENABLED no está a 'true',
  // bloqueamos el endpoint completamente para no consumir tokens.
  // Aunque el flag tenga prefijo NEXT_PUBLIC_, lo leemos también en server.
  if (process.env.NEXT_PUBLIC_AI_COACH_ENABLED !== 'true') {
    return NextResponse.json(
      {
        error: 'coach_disabled',
        message:
          'El AI Coach está deshabilitado temporalmente. Vuelve pronto.',
      },
      { status: 503 }
    );
  }

  // Rate limit estricto: el endpoint llama a Anthropic y CUESTA dinero.
  // 10 peticiones / 10 min por user. Anónimo: 3/10min.
  const sb = getSupabaseServer();
  const userId = sb ? (await sb.auth.getUser()).data.user?.id : null;
  const limit = userId ? 10 : 3;
  const rl = await rateLimit(`ai:${getRateLimitKey(req, userId)}`, limit, 600);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: `Demasiadas consultas a la IA. Espera ${rl.resetIn}s.`,
      },
      { status: 429, headers: { 'retry-after': String(rl.resetIn) } }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'not_configured',
        message:
          'IA Pokémon no está activa todavía. Configura ANTHROPIC_API_KEY en .env.local para habilitarla.',
        howTo: [
          '1. Crea cuenta en https://console.anthropic.com',
          '2. Genera una API key',
          '3. Añádela a .env.local como ANTHROPIC_API_KEY=sk-ant-...',
          '4. Reinicia el dev server',
        ],
      },
      { status: 501 }
    );
  }

  let body: RecommendBody;
  try {
    body = (await req.json()) as RecommendBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.intent) {
    return NextResponse.json(
      { error: 'missing_intent' },
      { status: 400 }
    );
  }

  // System prompt tunes Claude for Pokémon competitive expertise
  const systemPrompt = [
    'You are PokéHub AI, a competitive Pokémon expert.',
    'You know SV OU/VGC, Pokémon Champions Regulation M-A (Mega Evolutions legal, no Paradox, no Treasures of Ruin), and the broader competitive history.',
    'Respond concisely in Spanish. When recommending sets, use Showdown export format inside a fenced ```showdown code block.',
    'When recommending teams, list 6 members with item / ability / nature / tera / moves.',
    'When listing counters, explain the matchup briefly (why X beats Y).',
    'Cite usage stats when relevant ("Garchomp Reg M-A: 39.8% usage").',
  ].join('\n');

  const userMessage = buildPrompt(body);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json(
        { error: 'upstream_error', detail: text.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = (await r.json()) as {
      content: { type: string; text: string }[];
    };
    const text = data.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');

    return NextResponse.json({ text, intent: body.intent });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'request_failed',
        detail: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 }
    );
  }
}

function buildPrompt(body: RecommendBody): string {
  switch (body.intent) {
    case 'team':
      return `Crea un equipo de 6 Pokémon competitivo para el formato ${
        body.format ?? 'gen9ou'
      }${body.pokemon ? ` que incluya ${body.pokemon}` : ''}. Explica el rol de cada uno.`;
    case 'counter':
      if (!body.pokemon) return 'Sugiere counters para Garchomp en SV OU.';
      return `Dame los 3 mejores counters para ${body.pokemon} en ${
        body.format ?? 'gen9ou'
      }. Explica por qué.`;
    case 'set':
      if (!body.pokemon)
        return 'Sugiere un set competitivo para Iron Valiant en SV OU.';
      return `Dame un set competitivo de ${body.pokemon} para ${
        body.format ?? 'gen9ou'
      }, justificando EVs e items.`;
    case 'analysis':
      return (
        body.message ?? 'Analiza un team genérico y sugiere mejoras.'
      );
    default:
      return body.message ?? '¿En qué puedo ayudarte con tu equipo?';
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'PokéHub IA recommend endpoint',
    methods: ['POST'],
    intents: ['team', 'counter', 'set', 'analysis'],
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
