'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/Icon';
import { isAdminEmail } from '@/lib/admin';

interface Props {
  variant?: 'desktop' | 'mobile';
}

export function UserMenu({ variant = 'desktop' }: Props) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  if (isLoading) {
    // Tiny loading dot — avoids layout shift when session resolves
    return (
      <div
        className={
          variant === 'desktop'
            ? 'h-10 w-10 rounded-full glass animate-pulse'
            : 'h-12 px-3 rounded-xl glass animate-pulse'
        }
      />
    );
  }

  if (!user) {
    if (variant === 'mobile') {
      return (
        <Link
          href="/login"
          className="block text-center text-sm font-semibold h-11 inline-flex items-center justify-center w-full rounded-xl bg-brand text-white shadow-glow"
        >
          Iniciar sesión
        </Link>
      );
    }
    return (
      <Link href="/login">
        <Button variant="ghost" size="sm">
          Iniciar sesión
        </Button>
      </Link>
    );
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined)?.trim() || '';
  const email = user.email ?? '';
  const displayLetter = (fullName || email || '?').charAt(0).toUpperCase();
  const displayName = fullName || email.split('@')[0] || 'Entrenador';

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push('/');
    router.refresh();
  };

  if (variant === 'mobile') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl glass">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-glow flex items-center justify-center text-white font-bold shrink-0">
            {displayLetter}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{displayName}</div>
            <div className="text-[11px] text-ink-faint truncate">{email}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="block w-full text-center text-sm font-semibold h-11 rounded-xl bg-accent-red/15 text-accent-red hover:bg-accent-red/25"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
        className="relative h-10 w-10 rounded-full bg-gradient-to-br from-brand to-brand-glow flex items-center justify-center text-white font-bold text-sm shadow-glow hover:scale-105 transition-transform"
      >
        {displayLetter}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-green ring-2 ring-bg-950" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-bg-900 border border-white/[0.08] shadow-card-hover overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-glow flex items-center justify-center text-white font-bold shrink-0">
                  {displayLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-ink-faint truncate">
                    {email}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <Link
                href="/me"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-ink-soft hover:bg-white/[0.06] hover:text-ink"
              >
                👤 Mi perfil
                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-40" />
              </Link>
              <Link
                href="/favorites"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-ink-soft hover:bg-white/[0.06] hover:text-ink"
              >
                ❤️ Mis favoritos
                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-40" />
              </Link>
              <Link
                href="/team-builder"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-ink-soft hover:bg-white/[0.06] hover:text-ink"
              >
                ⚔️ Mis equipos
                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-40" />
              </Link>
              <Link
                href="/typemaster/stats"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-ink-soft hover:bg-white/[0.06] hover:text-ink"
              >
                📊 Mis stats TypeMaster
                <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-40" />
              </Link>
            </div>
            {isAdminEmail(email) && (
              <div className="p-1.5 border-t border-white/[0.06]">
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-accent-yellow hover:bg-accent-yellow/10 font-semibold"
                >
                  👑 Admin Panel
                  <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60" />
                </Link>
              </div>
            )}
            <div className="p-1.5 border-t border-white/[0.06]">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-accent-red hover:bg-accent-red/15"
              >
                ⏏️ Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
