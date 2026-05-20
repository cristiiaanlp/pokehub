'use client';

// Wrapper que carga las piezas de UI no críticas vía dynamic imports.
// Esto saca framer-motion del shared bundle (~40-60kB de ahorro).
//
// Criterios para entrar aquí:
//  - El componente NO se ve en el primer paint de una página fría.
//  - O su renderizado es condicional (only-if-logged-in, only-if-open, etc).
//  - O usa una librería pesada (framer-motion, etc).

import dynamic from 'next/dynamic';

// CommandPalette: solo aparece cuando el user pulsa Cmd+K.
export const CommandPaletteLazy = dynamic(
  () =>
    import('@/components/common/CommandPalette').then((m) => ({
      default: m.CommandPalette,
    })),
  { ssr: false }
);

// OnboardingModal: solo aparece tras fetch a /api/profile/status que dice
// "needs_onboarding". Aplazable sin penalizar UX.
export const OnboardingModalLazy = dynamic(
  () =>
    import('@/components/auth/OnboardingModal').then((m) => ({
      default: m.OnboardingModal,
    })),
  { ssr: false }
);

// AnnouncementBanner: tiene su propio fetch, no es crítico para el primer paint.
export const AnnouncementBannerLazy = dynamic(
  () =>
    import('@/components/layout/AnnouncementBanner').then((m) => ({
      default: m.AnnouncementBanner,
    })),
  { ssr: false }
);

// MobileNav: panel lateral mobile, oculto hasta que se abre.
export const MobileNavLazy = dynamic(
  () =>
    import('@/components/layout/MobileNav').then((m) => ({
      default: m.MobileNav,
    })),
  { ssr: false }
);
