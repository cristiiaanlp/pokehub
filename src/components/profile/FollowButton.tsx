'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from '@/i18n/routing';
import { UsersIcon, CheckIcon, PlusIcon } from '@/components/ui/Icon';

export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { user } = useAuth();
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/follows/${targetUserId}`)
      .then((r) => r.json())
      .then((data) => {
        setFollowers(data.followers ?? 0);
        setFollowing(data.following ?? 0);
        setIsFollowing(Boolean(data.isFollowing));
      })
      .catch(() => {});
  }, [targetUserId]);

  const toggle = async () => {
    if (!user || busy) return;
    setBusy(true);
    // Optimistic
    setIsFollowing((v) => !v);
    setFollowers((c) => c + (isFollowing ? -1 : 1));
    try {
      const res = await fetch(`/api/follows/${targetUserId}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        // Revert
        setIsFollowing((v) => !v);
        setFollowers((c) => c + (isFollowing ? 1 : -1));
      } else {
        setIsFollowing(Boolean(data.following));
      }
    } finally {
      setBusy(false);
    }
  };

  const isSelf = user?.id === targetUserId;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-3 text-xs text-ink-dim">
        <span className="inline-flex items-center gap-1">
          <UsersIcon className="w-3.5 h-3.5" />
          <span className="font-bold text-ink tabular-nums">{followers}</span>
          followers
        </span>
        <span className="text-ink-faint">·</span>
        <span>
          <span className="font-bold text-ink tabular-nums">{following}</span>{' '}
          following
        </span>
      </div>
      {!isSelf && user && (
        <button
          onClick={toggle}
          disabled={busy}
          className={`h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5 disabled:opacity-50 ${
            isFollowing
              ? 'bg-white/[0.06] text-ink-soft hover:bg-accent-red/15 hover:text-accent-red'
              : 'bg-brand text-white shadow-glow hover:bg-brand-hover'
          }`}
        >
          {isFollowing ? (
            <>
              <CheckIcon className="w-3.5 h-3.5" />
              Siguiendo
            </>
          ) : (
            <>
              <PlusIcon className="w-3.5 h-3.5" />
              Seguir
            </>
          )}
        </button>
      )}
      {!isSelf && !user && (
        <Link
          href="/login"
          className="text-xs text-brand-glow hover:text-brand-hover"
        >
          Inicia sesión para seguir →
        </Link>
      )}
    </div>
  );
}
