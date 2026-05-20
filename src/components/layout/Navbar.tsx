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
  ChartIcon,
  TrophyIcon,
  FireIcon,
  SwordIcon,
  TargetIcon,
  ShieldIcon,
} from '@/components/ui/Icon';
import type { ComponentType, SVGProps } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';
import { NotificationsBell } from '@/components/auth/NotificationsBell';

interface NavLink {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavLink[];
}

// Items primarios SIEMPRE visibles en la barra (sin dropdown).
const PRIMARY: { href: string; labelKey: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { href: '/pokedex', labelKey: 'pokedex', Icon: GridIcon },
  { href: '/team-builder', labelKey: 'teamBuilder', Icon: UsersIcon },
  { href: '/meta', labelKey: 'metaHub', Icon: TrendingUpIcon },
  { href: '/casual', labelKey: 'casual', Icon: SparklesIcon },
];

// Daily dropdown — 3 retos diarios.
const DAILY_ITEMS: NavLink[] = [
  {
    href: '/daily/whos-that',
    label: '¿Quién es ese Pokémon?',
    Icon: GamepadIcon,
    badge: 'NEW',
  },
  {
    href: '/daily/wordle',
    label: 'PokéWordle',
    Icon: ChartIcon,
    badge: 'NEW',
  },
  {
    href: '/typemaster/meta-daily',
    label: 'Meta Daily Quiz',
    Icon: FireIcon,
  },
];

// Más dropdown — todo lo demás, agrupado.
const MORE_SECTIONS: NavSection[] = [
  {
    title: 'Herramientas',
    items: [
      { href: '/tools', label: 'Todas las herramientas', Icon: BoltIcon },
      { href: '/tools/damage-calc', label: 'Damage Calculator', Icon: SwordIcon },
      { href: '/tools/damage-vs-meta', label: 'Damage vs Meta', Icon: SwordIcon, badge: 'NEW' },
      { href: '/tools/synergy', label: 'Synergy Analyzer', Icon: TrendingUpIcon, badge: 'NEW' },
      { href: '/tools/ev-optimizer', label: 'EV Optimizer', Icon: TargetIcon },
      { href: '/tools/team-validator', label: 'Team Validator', Icon: ShieldIcon },
      { href: '/tools/moveset-wizard', label: 'Moveset Wizard', Icon: SparklesIcon },
      { href: '/tools/tier-list', label: 'Tier List Maker', Icon: TrendingUpIcon },
      { href: '/coach', label: 'AI Coach', Icon: BrainIcon, badge: 'SOON' },
    ],
  },
  {
    title: 'Datos',
    items: [
      { href: '/database', label: 'Database (moves/abilities/items)', Icon: ChartIcon },
      { href: '/guides', label: 'Guías competitivas', Icon: BookOpenIcon },
      { href: '/best', label: 'Best Pokémon listas', Icon: TrophyIcon },
      { href: '/glossary', label: 'Glosario competitivo', Icon: BookOpenIcon, badge: 'NEW' },
    ],
  },
  {
    title: 'Comunidad',
    items: [
      { href: '/community/teams', label: 'Equipos compartidos', Icon: UsersIcon },
      { href: '/compare', label: 'Comparar Pokémon', Icon: TrendingUpIcon },
      { href: '/favorites', label: 'Mis favoritos', Icon: HeartIcon },
      { href: '/favorites/vs-meta', label: 'Favorito vs Meta', Icon: SwordIcon },
      { href: '/me/collection', label: 'Mi Living Pokédex', Icon: GridIcon, badge: 'NEW' },
    ],
  },
  {
    title: 'Diversión',
    items: [
      { href: '/typemaster', label: 'TypeMaster (juego)', Icon: GamepadIcon },
      { href: '/random', label: 'Pokémon aleatorio', Icon: SparklesIcon },
    ],
  },
];

const ALL_MORE_HREFS = MORE_SECTIONS.flatMap((s) => s.items.map((i) => i.href));
const ALL_DAILY_HREFS = DAILY_ITEMS.map((i) => i.href).concat('/daily');

export function Navbar() {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const dailyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreOpen && moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
      if (
        dailyOpen &&
        dailyRef.current &&
        !dailyRef.current.contains(e.target as Node)
      ) {
        setDailyOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setDailyOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [moreOpen, dailyOpen]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const moreActive = ALL_MORE_HREFS.some((h) => isActive(h));
  const dailyActive = ALL_DAILY_HREFS.some((h) => isActive(h));

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

            {/* Daily dropdown */}
            <div className="relative" ref={dailyRef}>
              <button
                onClick={() => {
                  setDailyOpen((v) => !v);
                  setMoreOpen(false);
                }}
                className={cn(
                  'px-3 h-9 inline-flex items-center gap-2 rounded-lg text-sm font-medium transition-colors',
                  dailyActive || dailyOpen
                    ? 'text-ink bg-white/[0.06]'
                    : 'text-ink-dim hover:text-ink hover:bg-white/[0.03]'
                )}
              >
                <FireIcon className="w-4 h-4 text-accent-red" />
                Retos diarios
                <ChevronDown open={dailyOpen} />
              </button>
              {dailyOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-bg-900 border border-white/[0.08] shadow-card-hover overflow-hidden z-50 p-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint px-2 pt-1 pb-1.5">
                    🔥 Reta tu memoria
                  </div>
                  {DAILY_ITEMS.map((item) => (
                    <DropdownLink
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                      onClick={() => setDailyOpen(false)}
                    />
                  ))}
                  <div className="border-t border-white/[0.04] mt-1 pt-1">
                    <Link
                      href="/daily"
                      onClick={() => setDailyOpen(false)}
                      className="flex items-center gap-2 px-3 h-9 rounded-lg text-xs text-brand-glow hover:bg-white/[0.06]"
                    >
                      Ver hub de retos diarios
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* "Más" dropdown con secciones */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => {
                  setMoreOpen((v) => !v);
                  setDailyOpen(false);
                }}
                className={cn(
                  'px-3 h-9 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors',
                  moreActive || moreOpen
                    ? 'text-ink bg-white/[0.06]'
                    : 'text-ink-dim hover:text-ink hover:bg-white/[0.03]'
                )}
              >
                Más
                <ChevronDown open={moreOpen} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-2 w-[420px] max-h-[80vh] overflow-y-auto rounded-xl bg-bg-900 border border-white/[0.08] shadow-card-hover z-50 p-2">
                  <div className="grid grid-cols-2 gap-x-2">
                    {MORE_SECTIONS.map((section) => (
                      <div key={section.title} className="py-1">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint px-2 pb-1">
                          {section.title}
                        </div>
                        {section.items.map((item) => (
                          <DropdownLink
                            key={item.href}
                            item={item}
                            active={isActive(item.href)}
                            onClick={() => setMoreOpen(false)}
                            compact
                          />
                        ))}
                      </div>
                    ))}
                  </div>
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

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={cn('w-3 h-3 transition-transform', open && 'rotate-180')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DropdownLink({
  item,
  active,
  onClick,
  compact,
}: {
  item: NavLink;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-2 rounded-lg transition-colors',
        compact ? 'h-8 text-xs' : 'h-10 text-sm',
        active
          ? 'bg-brand/10 text-brand-glow'
          : 'text-ink-soft hover:bg-white/[0.06] hover:text-ink'
      )}
    >
      <item.Icon className={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      <span className="flex-1 truncate font-medium">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            'text-[8px] font-bold px-1 py-0.5 rounded',
            item.badge === 'SOON'
              ? 'bg-accent-yellow/15 text-accent-yellow'
              : 'bg-brand text-white'
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}
