'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { NAV_LINKS } from './NavLinks';
import { Button } from '@/components/ui/Button';
import { MenuIcon, ArrowRight } from '@/components/ui/Icon';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/auth/UserMenu';

export function Navbar() {
  const pathname = usePathname();
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-950/70 border-b border-white/[0.05]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.filter((l) => l.href !== '/').map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3.5 h-9 inline-flex items-center gap-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'text-ink bg-white/[0.06]'
                      : 'text-ink-dim hover:text-ink hover:bg-white/[0.03]'
                  )}
                >
                  <link.Icon className="w-4 h-4" />
                  {link.label}
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-brand text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/pokedex" className="hidden sm:block">
            <Button variant="primary" size="sm">
              Explorar
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="hidden md:block">
            <UserMenu variant="desktop" />
          </div>
          <button
            aria-label="Abrir menú"
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
