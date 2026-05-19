'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';

interface Notif {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

const KIND_EMOJI: Record<string, string> = {
  comment: '💬',
  like: '❤️',
  badge: '🏆',
  admin: '👑',
  announcement: '📢',
};

export function NotificationsBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll cada 60s la cuenta de no leídas
  useEffect(() => {
    if (!user) {
      setUnread(0);
      setItems([]);
      return;
    }
    let mounted = true;
    const tick = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (!mounted) return;
        setUnread(data.unread ?? 0);
        setItems(data.items ?? []);
      } catch {
        /* silencioso */
      }
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [user]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

  const onOpen = async () => {
    setOpen(true);
    if (unread > 0) {
      setLoading(true);
      try {
        await fetch('/api/notifications', { method: 'PATCH' });
        setUnread(0);
        setItems((prev) => prev.map((it) => ({ ...it, is_read: true })));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => (open ? setOpen(false) : onOpen())}
        aria-label="Notificaciones"
        className="relative h-10 w-10 rounded-full glass hover:bg-white/[0.08] inline-flex items-center justify-center"
      >
        <BellIcon className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-red text-white text-[10px] font-bold inline-flex items-center justify-center ring-2 ring-bg-950">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-80 rounded-2xl bg-bg-900 border border-white/[0.08] shadow-card-hover overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="font-display font-bold text-sm">Notificaciones</span>
              {loading && (
                <span className="text-[10px] text-ink-faint">marcando…</span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-center text-sm text-ink-dim">
                  Sin notificaciones todavía.
                </div>
              ) : (
                items.map((n) => {
                  const Body = (
                    <div className="flex gap-3 p-3 hover:bg-white/[0.04]">
                      <div className="text-xl shrink-0">
                        {KIND_EMOJI[n.kind] ?? '🔔'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {n.title}
                        </div>
                        {n.body && (
                          <div className="text-xs text-ink-dim line-clamp-2 mt-0.5">
                            {n.body}
                          </div>
                        )}
                        <div className="text-[10px] text-ink-faint mt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                  return n.link_url ? (
                    <Link
                      key={n.id}
                      href={n.link_url}
                      onClick={() => setOpen(false)}
                      className="block border-b border-white/[0.04] last:border-0"
                    >
                      {Body}
                    </Link>
                  ) : (
                    <div
                      key={n.id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      {Body}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
