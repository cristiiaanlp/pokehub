'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { HeartIcon, TrashIcon } from '@/components/ui/Icon';
import { artworkFor } from '@/lib/pokeapi';

interface Comment {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  author: {
    username: string | null;
    display_name: string | null;
    avatar_pokemon_id: number | null;
  };
}

export function TeamSocial({ teamId }: { teamId: string }) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busyLike, setBusyLike] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/likes`)
      .then((r) => r.json())
      .then((data) => {
        setLikeCount(data.count ?? 0);
        setLiked(Boolean(data.liked));
      })
      .catch(() => {});
    fetch(`/api/teams/${teamId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        setComments((data.items as Comment[]) ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [teamId]);

  const toggleLike = async () => {
    if (!user) return;
    setBusyLike(true);
    // Optimistic
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await fetch(`/api/teams/${teamId}/likes`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLiked(Boolean(data.liked));
        setLikeCount(data.count ?? 0);
      } else {
        // Revertir
        setLiked((v) => !v);
        setLikeCount((c) => c + (liked ? 1 : -1));
      }
    } finally {
      setBusyLike(false);
    }
  };

  const post = async () => {
    const text = draft.trim();
    if (!text || !user) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/comments`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.error ?? res.statusText}`);
        return;
      }
      setComments((prev) => [data.comment as Comment, ...prev]);
      setDraft('');
    } finally {
      setPosting(false);
    }
  };

  const del = async (commentId: string) => {
    if (!confirm('¿Borrar este comentario?')) return;
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== commentId));
    const res = await fetch(`/api/teams/${teamId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) setComments(prev);
  };

  return (
    <section className="space-y-4">
      {/* Like + count */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={toggleLike}
          disabled={!user || busyLike}
          className={`h-10 px-4 rounded-lg inline-flex items-center gap-2 text-sm font-bold transition-all ${
            liked
              ? 'bg-accent-red/20 text-accent-red border border-accent-red/30'
              : 'glass hover:bg-white/[0.08]'
          } disabled:opacity-50`}
          title={user ? '' : 'Inicia sesión para dar like'}
        >
          <HeartIcon className="w-4 h-4" filled={liked} />
          {liked ? 'Te gusta' : 'Me gusta'}
          <span className="tabular-nums text-xs opacity-80">· {likeCount}</span>
        </button>
        {!user && (
          <Link
            href="/login?next=back"
            className="text-xs text-brand-glow hover:text-brand-hover"
          >
            Inicia sesión para interactuar →
          </Link>
        )}
      </div>

      {/* Comentarios */}
      <div>
        <h3 className="font-display font-bold text-base mb-3">
          Comentarios{' '}
          <span className="text-ink-faint text-sm">
            ({loadingComments ? '…' : comments.length})
          </span>
        </h3>

        {user ? (
          <div className="card-base p-3 mb-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
              rows={2}
              placeholder="¿Qué te parece este equipo?"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm resize-y"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-ink-faint">
                {draft.length}/1000
              </span>
              <button
                onClick={post}
                disabled={posting || !draft.trim()}
                className="h-8 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-hover disabled:opacity-50"
              >
                {posting ? 'Publicando…' : 'Comentar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card-base p-4 text-center text-sm text-ink-dim mb-3">
            <Link href="/login" className="text-brand-glow hover:text-brand-hover">
              Inicia sesión
            </Link>{' '}
            para dejar un comentario.
          </div>
        )}

        {loadingComments ? (
          <div className="text-sm text-ink-dim text-center py-6">
            Cargando comentarios…
          </div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-ink-dim text-center py-6">
            Sé el primero en comentar.
          </div>
        ) : (
          <div className="space-y-2">
            {comments.map((c) => {
              const display =
                c.author.display_name || c.author.username || 'Entrenador';
              const initial = (display || '?').charAt(0).toUpperCase();
              const avatar = c.author.avatar_pokemon_id
                ? artworkFor(c.author.avatar_pokemon_id)
                : null;
              const isMine = user?.id === c.author_id;
              return (
                <div key={c.id} className="card-base p-3 flex gap-3">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={display}
                      className="w-9 h-9 rounded-full bg-bg-800 object-contain shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-glow flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initial}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {c.author.username ? (
                        <Link
                          href={`/u/${c.author.username}`}
                          className="font-semibold text-ink hover:text-brand-glow"
                        >
                          {display}
                        </Link>
                      ) : (
                        <span className="font-semibold">{display}</span>
                      )}
                      <span className="text-ink-faint">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                      {isMine && (
                        <button
                          onClick={() => del(c.id)}
                          className="ml-auto text-ink-faint hover:text-accent-red"
                          aria-label="Borrar comentario"
                          title="Borrar"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-ink-soft mt-1 whitespace-pre-wrap break-words">
                      {c.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
