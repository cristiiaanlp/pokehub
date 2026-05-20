'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import {
  MenuIcon,
  ArrowRight,
  SearchIcon,
  GridIcon,
  UsersIcon,
  TrendingUpIcon,
  SparklesIcon,
  HeartIcon,
  GamepadIcon,
  BookOpenIcon,
  BoltIcon,
  BrainIcon,
} from '@/components/ui/Icon';
import type { ComponentType, SVGProps } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationsBell } from '@/components/auth/NotificationsBell';

interface NavLink {
  href: string;
  labelKey: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
}

// Items que siempre se ven en el navbar (los 4 más importantes).
const PRIMARY: NavLink[] = [
  { href: '/pokedex', labelKey: 'pokedex', Icon: GridIcon },
  { href: '/team-builder', labelKey: 'teamBuilder', Icon: UsersIcon },
  { href: '/meta', labelKey: 'metaHub', Icon: TrendingUpIcon },
  { href: '/casual', labelKey: 'casual', Icon: SparklesIcon },
];

// Items en el dropdown "Más" — herramientas, juegos y secciones de uso menos diario.
const SECONDARY: NavLink[] = [
  { href: '/tools', labelKey: 'tools', Icon: BoltIcon, badge: 'NEW' },
  { href: '/coach', labelKey: 'coach', Icon: BrainIcon, badge: 'SOON' },
  { href: '/typemaster', labelKey: 'typemaster', Icon: GamepadIcon, badge: 'NEW' },
  { href: '/guides', labelKey: 'guides', Icon: BookOpenIcon },
  { href: '/favorites', labelKey: 'favorites', Icon: HeartIcon },
];

export function Navbar() {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "Más" dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [moreOpen]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  // Si alguna de las rutas secundarias está activa, marcamos "Más" como activo.
  const secondaryActive = SECONDARY.some((s) => isActive(s.href));

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-950/70 border-b border-white/[0.05]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden lg:flex items-center gap-1">
            {PRIMARY.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3 h-9 inline-flex items-center gap-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'text-ink bg-white/[0.06]'
                      : 'text-ink-dim hover:text-ink hover:bg-white/[0.03]'
                  )}
                >
                  <link.Icon className="w-4 h-4" />
                  {t(link.labelKey)}
                </Link>
              );
            })}

            {/* "Más" dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  'px-3 h-9 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors',
                  secondaryActive || moreOpen
                    ? 'text-ink bg-white/[0.06]'
                    : 'text-ink-dim hover:text-ink hover:bg-white/[0.03]'
                )}
              >
                Más
                <svg
                  className={cn(
                    'w-3 h-3 transition-transform',
                    moreOpen && 'rotate-180'
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-bg-900 border border-white/[0.08] shadow-card-hover overflow-hidden z-50 p-1">
                  {SECONDARY.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm font-medium transition-colors',
                          active
                            ? 'bg-brand/10 text-brand-glow'
                            : 'text-ink-soft hover:bg-white/[0.06] hover:text-ink'
                        )}
                      >
                        <link.Icon className="w-4 h-4" />
                        <span className="flex-1">{t(link.labelKey)}</span>
                        {link.badge && (
                          <span
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded-md',
                              link.badge === 'SOON'
                                ? 'bg-accent-yellow/15 text-accent-yellow'
                                : 'bg-brand text-white'
                            )}
                          >
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const ev = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true,
                bubbles: true,
              });
              window.dispatchEvent(ev);
            }}
            aria-label={t('search')}
            className="hidden sm:inline-flex items-center gap-2 h-9 px-2.5 rounded-lg glass hover:bg-white/[0.06] text-sm text-ink-dim hover:text-ink"
            title={`${t('search')} · Ctrl+K`}
          >
            <SearchIcon className="w-4 h-4" />
            <kbd className="hidden xl:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06]">
              ⌘K
            </kbd>
          </button>
          <Link href="/pokedex" className="hidden md:block">
            <Button variant="primary" size="sm">
              {t('explore')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="hidden md:block">
            <LanguageSwitcher variant="desktop" />
          </div>
          <div className="hidden md:block">
            <NotificationsBell />
          </div>
          <div className="hidden md:block">
            <UserMenu variant="desktop" />
          </div>
          <button
            aria-label={t('openMenu')}
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg glass hover:bg-white/[0.08] text-ink"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
