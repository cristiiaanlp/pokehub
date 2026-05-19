'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

export function LanguageSwitcher({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const change = (next: Locale) => {
    setOpen(false);
    if (next === currentLocale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  if (variant === 'mobile') {
    return (
      <div className="space-y-1">
        {locales.map((l) => (
          <button
            key={l}
            onClick={() => change(l)}
            disabled={pending}
            className={`w-full text-left px-3 h-11 rounded-lg flex items-center gap-3 text-sm ${
              l === currentLocale
                ? 'bg-brand/15 text-brand-glow'
                : 'glass hover:bg-white/[0.08]'
            } disabled:opacity-50`}
          >
            <span className="text-base">{localeFlags[l]}</span>
            <span className="font-semibold">{localeNames[l]}</span>
            {l === currentLocale && (
              <span className="ml-auto text-[10px] uppercase tracking-widest">
                actual
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Idioma"
        disabled={pending}
        className="h-10 px-2.5 inline-flex items-center gap-1.5 rounded-lg glass hover:bg-white/[0.08] text-sm font-semibold"
      >
        <span className="text-base">{localeFlags[currentLocale]}</span>
        <span className="hidden xl:inline uppercase text-[11px] tracking-wider">
          {currentLocale}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-900 border border-white/[0.08] shadow-card-hover overflow-hidden z-50 p-1">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => change(l)}
              className={`w-full text-left px-3 h-10 rounded-lg flex items-center gap-3 text-sm ${
                l === currentLocale
                  ? 'bg-brand/15 text-brand-glow'
                  : 'hover:bg-white/[0.06]'
              }`}
            >
              <span className="text-base">{localeFlags[l]}</span>
              <span className="font-semibold">{localeNames[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
