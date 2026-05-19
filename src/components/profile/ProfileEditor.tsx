'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { artworkFor } from '@/lib/pokeapi';
import { CheckIcon, ArrowRight } from '@/components/ui/Icon';
import type { Profile } from '@/lib/profiles';

// Pokémon icónicos sugeridos como avatar — el user puede poner cualquier ID.
const SUGGESTED_AVATARS = [
  25, // Pikachu
  6, // Charizard
  150, // Mewtwo
  9, // Blastoise
  3, // Venusaur
  448, // Lucario
  149, // Dragonite
  282, // Gardevoir
  445, // Garchomp
  658, // Greninja
];

export function ProfileEditor({
  initial,
  email,
}: {
  initial: Profile;
  email: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initial.username ?? '');
  const [displayName, setDisplayName] = useState(initial.display_name ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [avatarId, setAvatarId] = useState<number | null>(
    initial.avatar_pokemon_id
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: username.trim() || null,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          avatar_pokemon_id: avatarId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? res.statusText);
        return;
      }
      setMsg('Perfil guardado.');
      // Re-fetch del layout para actualizar el badge en el menú.
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Avatar */}
      <div className="card-base p-5">
        <h2 className="font-display font-bold text-sm mb-3">Avatar</h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-3">
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
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain bg-bg-800 rounded-full"
              />
            </button>
          ))}
        </div>
        <label className="text-xs flex items-center gap-2">
          <span className="text-ink-dim">O pega un ID de Pokédex:</span>
          <input
            type="number"
            min={1}
            max={1025}
            value={avatarId ?? ''}
            onChange={(e) =>
              setAvatarId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-20 h-8 px-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-sm"
          />
          {avatarId && (
            <button
              onClick={() => setAvatarId(null)}
              className="text-ink-faint hover:text-ink ml-2"
            >
              quitar
            </button>
          )}
        </label>
      </div>

      {/* Datos */}
      <div className="card-base p-5 space-y-3">
        <label className="block text-sm">
          <span className="text-ink-dim text-xs">Email</span>
          <input
            value={email}
            disabled
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-sm font-mono opacity-60"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-dim text-xs">
            Username (visible en /u/ — 3-20 chars, minúsculas/números/_-)
          </span>
          <input
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
              )
            }
            placeholder="ash_ketchum"
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm font-mono"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-dim text-xs">
            Nombre visible (cómo te ven los demás)
          </span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ash Ketchum"
            maxLength={40}
            className="mt-1 w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-dim text-xs">Bio (máx 200 chars)</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            rows={3}
            placeholder="Mi tipo favorito es planta, vivo en VGC Reg G…"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm resize-y"
          />
          <div className="text-[10px] text-ink-faint text-right mt-1">
            {bio.length}/200
          </div>
        </label>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs">
          {msg && (
            <span className="text-accent-green inline-flex items-center gap-1">
              <CheckIcon className="w-3 h-3" />
              {msg}
            </span>
          )}
          {err && <span className="text-accent-red">⚠ {err}</span>}
        </div>
        <div className="flex items-center gap-2">
          {username && (
            <Link
              href={`/u/${username}`}
              className="text-xs text-brand-glow hover:text-brand-hover inline-flex items-center gap-1"
            >
              Ver mi perfil
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="h-10 px-5 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar perfil'}
          </button>
        </div>
      </div>
    </div>
  );
}
