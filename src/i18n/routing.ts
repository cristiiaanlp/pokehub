import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // 'as-needed' = sin prefijo para el default (/pokedex en vez de /es/pokedex)
  // Mejor para SEO + UX. Los otros idiomas sí llevan prefijo.
  localePrefix: 'as-needed',
});

// Wrappers tipados de Link, redirect, usePathname y useRouter
// que automáticamente preservan el locale actual.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
