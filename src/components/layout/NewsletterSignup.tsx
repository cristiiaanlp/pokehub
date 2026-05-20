'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { CheckIcon, SparklesIcon } from '@/components/ui/Icon';

export function NewsletterSignup() {
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState('loading');
    setErrMsg(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState('error');
        setErrMsg(data.error ?? 'Error');
        return;
      }
      setState('ok');
      setEmail('');
    } catch {
      setState('error');
      setErrMsg('Error de red');
    }
  };

  if (state === 'ok') {
    return (
      <div className="card-base p-4 bg-accent-green/[0.04] border-accent-green/30">
        <div className="flex items-center gap-2 text-accent-green text-sm font-semibold">
          <CheckIcon className="w-4 h-4" />
          ¡Suscrito! Te llegará el resumen del meta cada lunes.
        </div>
      </div>
    );
  }

  return (
    <div className="card-base p-4">
      <h3 className="font-display font-bold text-sm flex items-center gap-2 mb-1">
        <SparklesIcon className="w-4 h-4 text-accent-yellow" />
        Newsletter semanal
      </h3>
      <p className="text-xs text-ink-dim mb-3">
        Cada lunes: cambios en Smogon usage, top team de la semana, nuevas
        guías. Sin spam, prometido.
      </p>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="flex-1 h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
        />
        <button
          type="submit"
          disabled={state === 'loading' || !email.trim()}
          className="h-10 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50"
        >
          {state === 'loading' ? '…' : 'Suscribir'}
        </button>
      </form>
      {errMsg && (
        <div className="text-xs text-accent-red mt-2">⚠ {errMsg}</div>
      )}
    </div>
  );
}
