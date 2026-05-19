'use client';

import { useState, useRef, useEffect } from 'react';
import { useTeamStore } from '@/stores/teamStore';
import { ArrowRight, SparklesIcon } from '@/components/ui/Icon';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

type Intent = 'team' | 'counter' | 'set' | 'analysis' | 'chat';

const QUICK_PROMPTS: Array<{ intent: Intent; label: string; emoji: string }> = [
  { intent: 'team', label: 'Crea un equipo VGC alrededor de…', emoji: '⚔️' },
  { intent: 'counter', label: 'Counters para…', emoji: '🛡️' },
  { intent: 'set', label: 'Set competitivo de…', emoji: '📋' },
  { intent: 'analysis', label: 'Analiza mi equipo guardado', emoji: '🔍' },
];

export function AiCoach() {
  const saved = useTeamStore((s) => s.saved);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [intent, setIntent] = useState<Intent>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const ask = async (overrideMessage?: string) => {
    const message = (overrideMessage ?? input).trim();
    if (!message) return;
    setErr(null);
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);

    // Construye el body. Si el intent es 'analysis' y hay equipo seleccionado,
    // adjunta el dump del team en el message.
    let finalMessage = message;
    if (intent === 'analysis' && saved.length > 0) {
      const teamDump = saved[0].members
        .map(
          (m) =>
            `- ${m.name}${m.ability ? ` (${m.ability})` : ''}${m.item ? ` @ ${m.item}` : ''}${
              m.nature ? ` · ${m.nature}` : ''
            }${m.moves?.length ? ` · ${m.moves.join(', ')}` : ''}`
        )
        .join('\n');
      finalMessage = `${message}\n\nMi equipo:\n${teamDump}`;
    }

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent: intent === 'chat' ? 'analysis' : intent,
          message: finalMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message ?? data.error ?? 'Error');
        if (data.howTo) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: data.message + '\n\n' + data.howTo.join('\n'),
            },
          ]);
        }
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: data.text }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Intent picker */}
      <div className="card-base p-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-ink-dim font-mono mr-1">Modo:</span>
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.intent}
            onClick={() => setIntent(p.intent)}
            className={`text-xs px-2.5 h-8 rounded-md inline-flex items-center gap-1.5 ${
              intent === p.intent
                ? 'bg-brand text-white'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-ink-soft'
            }`}
          >
            {p.emoji} {p.label.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
        <button
          onClick={() => setIntent('chat')}
          className={`text-xs px-2.5 h-8 rounded-md inline-flex items-center gap-1.5 ${
            intent === 'chat'
              ? 'bg-brand text-white'
              : 'bg-white/[0.04] hover:bg-white/[0.08] text-ink-soft'
          }`}
        >
          💬 Libre
        </button>
      </div>

      {/* Conversación */}
      <div
        ref={scrollRef}
        className="card-base p-4 min-h-[400px] max-h-[600px] overflow-y-auto space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="w-10 h-10 text-brand-glow mx-auto mb-3" />
            <div className="text-sm text-ink-dim max-w-md mx-auto">
              Empieza una conversación. Algunos ejemplos:
            </div>
            <div className="mt-4 space-y-2 max-w-md mx-auto text-left">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p.intent}
                  onClick={() => {
                    setIntent(p.intent);
                    setInput(
                      p.intent === 'analysis'
                        ? '¿Qué puedo mejorar?'
                        : p.label.replace('…', '')
                    );
                  }}
                  className="block w-full text-left p-3 rounded-lg glass hover:bg-white/[0.08] text-sm"
                >
                  <span className="text-lg mr-2">{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
                  m.role === 'user'
                    ? 'bg-brand text-white rounded-br-sm'
                    : 'glass rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-glow animate-pulse" />
              Pensando…
            </div>
          </div>
        )}
        {err && (
          <div className="card-base p-3 text-xs text-accent-red bg-accent-red/[0.05] border-accent-red/30">
            ⚠ {err}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="card-base p-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              ask();
            }
          }}
          placeholder={
            intent === 'team'
              ? '¿Sobre qué Pokémon quieres armar el equipo?'
              : intent === 'counter'
              ? '¿A qué Pokémon quieres contrarrestar?'
              : intent === 'set'
              ? '¿De qué Pokémon quieres un set?'
              : intent === 'analysis'
              ? 'Pregunta sobre tu equipo…'
              : 'Pregunta lo que quieras sobre Pokémon competitivo…'
          }
          rows={2}
          className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm resize-y"
        />
        <button
          onClick={() => ask()}
          disabled={loading || !input.trim()}
          className="h-10 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {loading ? '…' : 'Enviar'}
          {!loading && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-[10px] text-ink-faint text-center">
        ⚡ Limit: 10 consultas / 10 min para users autenticados. Cada respuesta
        cuesta ~€0.03 de coste real — usa con cabeza, no spamees.
      </p>
    </div>
  );
}
