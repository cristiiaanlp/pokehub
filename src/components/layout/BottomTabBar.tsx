'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from './NavLinks';
import { cn } from '@/lib/utils';

export function BottomTabBar() {
  const pathname = usePathname();
  const items = NAV_LINKS.slice(0, 5);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 lg:hidden">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="glass-strong rounded-2xl flex items-center justify-around p-2 shadow-card-hover">
          {items.map((l) => {
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
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
