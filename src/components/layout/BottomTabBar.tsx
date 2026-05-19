'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  GridIcon,
  UsersIcon,
  TrendingUpIcon,
  HomeIcon,
  GamepadIcon,
} from '@/components/ui/Icon';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/utils';

const TABS: {
  href: string;
  labelKey: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { href: '/', labelKey: 'home', Icon: HomeIcon },
  { href: '/pokedex', labelKey: 'pokedex', Icon: GridIcon },
  { href: '/typemaster', labelKey: 'typemaster', Icon: GamepadIcon },
  { href: '/team-builder', labelKey: 'teamBuilder', Icon: UsersIcon },
  { href: '/meta', labelKey: 'metaHub', Icon: TrendingUpIcon },
];

export function BottomTabBar() {
  const t = useTranslations('Nav');
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="glass-strong rounded-2xl flex items-center justify-around p-2 shadow-card-hover">
          {TABS.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== '/' && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-2.5 py-1.5 min-w-[56px] transition-colors',
                  active ? 'text-brand-glow bg-brand/10' : 'text-ink-dim hover:text-ink'
                )}
              >
                <l.Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold leading-none">
                  {t(l.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
