'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  XIcon,
  ArrowRight,
  GridIcon,
  UsersIcon,
  TrendingUpIcon,
  SparklesIcon,
  HeartIcon,
  HomeIcon,
  GamepadIcon,
  BookOpenIcon,
} from '@/components/ui/Icon';
import type { ComponentType, SVGProps } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';

const NAV_LINKS: {
  href: string;
  labelKey: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
}[] = [
  { href: '/', labelKey: 'home', Icon: HomeIcon },
  { href: '/pokedex', labelKey: 'pokedex', Icon: GridIcon },
  { href: '/typemaster', labelKey: 'typemaster', Icon: GamepadIcon, badge: 'NEW' },
  { href: '/team-builder', labelKey: 'teamBuilder', Icon: UsersIcon },
  { href: '/meta', labelKey: 'metaHub', Icon: TrendingUpIcon },
  { href: '/guides', labelKey: 'guides', Icon: BookOpenIcon, badge: 'NEW' },
  { href: '/casual', labelKey: 'casual', Icon: SparklesIcon },
  { href: '/favorites', labelKey: 'favorites', Icon: HeartIcon },
];

export function MobileNav() {
  const t = useTranslations('Nav');
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-xs bg-bg-900 border-l border-white/[0.06] lg:hidden flex flex-col"
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06]">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="h-10 w-10 rounded-lg inline-flex items-center justify-center hover:bg-white/[0.06] text-ink"
              >
                <XIcon />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 px-3 h-12 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand/15 text-ink border border-brand/30'
                        : 'text-ink-soft hover:bg-white/[0.04] hover:text-ink'
                    )}
                  >
                    <link.Icon className="w-5 h-5" />
                    <span className="flex-1">{t(link.labelKey)}</span>
                    {link.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-brand text-white">
                        {link.badge}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/[0.06] space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mb-2">
                  {t('language')}
                </div>
                <LanguageSwitcher variant="mobile" />
              </div>
              <UserMenu variant="mobile" />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
