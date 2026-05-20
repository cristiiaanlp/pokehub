'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from '@/i18n/routing';

export function TeamRating({ teamId }: { teamId: string }) {
  const { user } = useAuth();
  const [average, setAverage] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/rating`)
      .then((r) => r.json())
      .then((data) => {
        setAverage(data.average);
        setCount(data.count ?? 0);
        setMyRating(data.myRating);
      })
      .catch(() => {});
  }, [teamId]);

  const rate = async (n: number) => {
    if (!user || busy) return;
    setBusy(true);
    setErr(null);
    const prev = myRating;
    setMyRating(n); // optimistic
    try {
      const res = await fetch(`/api/teams/${teamId}/rating`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rating: n }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error ?? 'Error');
        setMyRating(prev);
        return;
      }
      // Re-fetch para actualizar avg + count globales
      const r = await fetch(`/api/teams/${teamId}/rating`);
      const data = await r.json();
      setAverage(data.average);
      setCount(data.count ?? 0);
      setMyRating(data.myRating);
    } finally {
      setBusy(false);
    }
  };

  const removeRating = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      await fetch(`/api/teams/${teamId}/rating`, { method: 'DELETE' });
      const r = await fetch(`/api/teams/${teamId}/rating`);
      const data = await r.json();
      setAverage(data.average);
      setCount(data.count ?? 0);
      setMyRating(null);
    } finally {
      setBusy(false);
    }
  };

  const display = hover ?? myRating ?? 0;

  return (
    <section className="card-base p-5 space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h3 className="font-display text-base font-bold">Rating de la comunidad</h3>
        {average !== null ? (
          <div className="font-display text-3xl font-bold text-accent-yellow tabular-nums">
            {average.toFixed(1)}
            <span className="text-sm text-ink-faint ml-1 font-normal">/ 10</span>
            <span className="text-xs text-ink-faint ml-2">({count})</span>
          </div>
        ) : (
          <div className="text-xs text-ink-faint">Sin ratings todavía</div>
        )}
      </div>

      {user ? (
        <>
          <div className="text-xs text-ink-dim">
            {myRating !== null ? 'Tu rating:' : 'Puntúa este equipo del 1 al 10:'}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {Array.from({ length: 10 }).map((_, i) => {
              const n = i + 1;
              const active = display >= n;
              return (
                <button
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => rate(n)}
                  disabled={busy}
                  className={`w-8 h-9 sm:w-9 sm:h-10 rounded-md font-display font-bold text-sm transition-colors ${
                    active
                      ? 'bg-accent-yellow text-bg-950'
                      : 'bg-white/[0.04] text-ink-faint hover:bg-white/[0.08]'
                  } disabled:opacity-50`}
                >
                  {n}
                </button>
              );
            })}
            {myRating !== null && (
              <button
                onClick={removeRating}
                disabled={busy}
                className="ml-2 text-xs text-ink-faint hover:text-accent-red"
              >
                Quitar rating
              </button>
            )}
          </div>
          {err && (
            <div className="text-xs text-accent-red">
              ⚠ {err === 'cannot_rate_own_team' ? 'No puedes puntuar tu propio equipo.' : err}
            </div>
          )}
        </>
      ) : (
        <div className="text-xs text-ink-dim">
          <Link href="/login" className="text-brand-glow hover:text-brand-hover">
            Inicia sesión
          </Link>{' '}
          para puntuar este equipo.
        </div>
      )}
    </section>
  );
}
