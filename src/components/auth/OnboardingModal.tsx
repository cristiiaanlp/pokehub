'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from './AuthProvider';
import { artworkFor } from '@/lib/pokeapi';
import { CheckIcon, ArrowRight } from '@/components/ui/Icon';

const SUGGESTED_AVATARS = [25, 6, 150, 9, 3, 448, 149, 282, 445, 658];

export function OnboardingModal() {
  const { user } = useAuth();
  const router = useRouter();
  const [needs, setNeeds] = useState(false);
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [usernameErr, setUsernameErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Check si el user necesita onboarding (profile.onboarded_at IS NULL)
  useEffect(() => {
    if (!user) {
      setNeeds(false);
      return;
    }
    fetch('/api/profile/status')
      .then((r) => r.json())
      .then((data) => {
        if (data.needs_onboarding) setNeeds(true);
      })
      .catch(() => {});
  }, [user]);

  if (!needs || !user) return null;

  const next = async () => {
    if (step === 0) {
      // Validate username
      const u = username.trim().toLowerCase();
      if (!/^[a-z0-9_-]{3,20}$/.test(u)) {
        setUsernameErr('3-20 chars, solo letras/números/_-');
        return;
      }
      setUsernameErr(null);
      // Probar disponibilidad
      setSaving(true);
      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ username: u }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setUsernameErr(data.error ?? 'Error');
          return;
        }
        setStep(1);
      } finally {
        setSaving(false);
      }
    } else if (step === 1) {
      // Save avatar (opcional)
      if (avatarId) {
        setSaving(true);
        try {
          await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ avatar_pokemon_id: avatarId }),
          });
        } finally {
          setSaving(false);
        }
      }
      setStep(2);
    } else if (step === 2) {
      // Finalize
      setSaving(true);
      try {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ onboarded_at: new Date().toISOString() }),
        });
        setNeeds(false);
        router.refresh();
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-bg-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-base p-6 sm:p-8 max-w-lg w-full relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="relative">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i <= step ? 'bg-brand-glow' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <>
              <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
                Paso 1 de 3
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                ¡Bienvenido a PokéHub! 🎉
              </h2>
              <p className="text-sm text-ink-dim mb-5">
                Elige un username único — los demás te verán como{' '}
                <code>/u/&lt;username&gt;</code>.
              </p>
              <input
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                }
                placeholder="ash_ketchum"
                autoFocus
                className="w-full h-12 px-4 rounded-lg bg-white/[0.04] border border-white/[0.06] text-base font-mono"
              />
              {usernameErr && (
                <div className="text-xs text-accent-red mt-2">{usernameErr}</div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
                Paso 2 de 3
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Elige tu avatar
              </h2>
              <p className="text-sm text-ink-dim mb-5">
                Tu Pokémon favorito te representará en perfiles y comentarios.
              </p>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {SUGGESTED_AVATARS.map((id) => (
                  <button
                    key={id}
                    onClick={() => setAvatarId(id)}
                    className={`rounded-full ring-2 transition-all ${
                      avatarId === id
                        ? 'ring-brand shadow-glow scale-105'
                        : 'ring-white/[0.08] hover:ring-white/30'
                    }`}
                  >
                    <img
                      src={artworkFor(id)}
                      alt={`#${id}`}
                      className="w-14 h-14 object-contain bg-bg-800 rounded-full"
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAvatarId(null)}
                className="text-[11px] text-ink-faint hover:text-ink"
              >
                Saltar este paso
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-[10px] uppercase tracking-[0.3em] text-accent-green font-bold mb-1">
                Paso 3 de 3
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                ¡Listo, entrenador! 🚀
              </h2>
              <p className="text-sm text-ink-dim mb-5">
                Tu perfil está activo. Aquí tienes algunas ideas para empezar:
              </p>
              <div className="space-y-2 mb-2">
                <Link
                  href="/team-builder"
                  className="card-base card-hover p-3 flex items-center gap-3 group"
                  onClick={() => {
                    setNeeds(false);
                    fetch('/api/profile', {
                      method: 'PATCH',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ onboarded_at: new Date().toISOString() }),
                    }).catch(() => {});
                  }}
                >
                  <span className="text-2xl">⚔️</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm">
                      Crea tu primer equipo
                    </div>
                    <div className="text-[11px] text-ink-dim">
                      Team Builder con import/export Showdown
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/typemaster"
                  className="card-base card-hover p-3 flex items-center gap-3 group"
                  onClick={() => {
                    setNeeds(false);
                    fetch('/api/profile', {
                      method: 'PATCH',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ onboarded_at: new Date().toISOString() }),
                    }).catch(() => {});
                  }}
                >
                  <span className="text-2xl">🎯</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm">
                      Juega a TypeMaster
                    </div>
                    <div className="text-[11px] text-ink-dim">
                      Test de tipos con leaderboard global
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/community/teams"
                  className="card-base card-hover p-3 flex items-center gap-3 group"
                  onClick={() => {
                    setNeeds(false);
                    fetch('/api/profile', {
                      method: 'PATCH',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ onboarded_at: new Date().toISOString() }),
                    }).catch(() => {});
                  }}
                >
                  <span className="text-2xl">🌍</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm">
                      Explora la comunidad
                    </div>
                    <div className="text-[11px] text-ink-dim">
                      Equipos compartidos de otros entrenadores
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          )}

          <div className="flex items-center justify-between mt-6 gap-3">
            {step > 0 && step < 2 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs text-ink-faint hover:text-ink"
              >
                ← Atrás
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={next}
              disabled={saving || (step === 0 && !username.trim())}
              className="h-11 px-5 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving
                ? 'Guardando…'
                : step === 2
                ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    ¡Empezar a entrenar!
                  </>
                )
                : (
                  <>
                    Siguiente
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
