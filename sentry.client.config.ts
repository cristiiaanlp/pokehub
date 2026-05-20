// Sentry config — client-side errors.
// Solo se activa si NEXT_PUBLIC_SENTRY_DSN está set; en local sin DSN no hace nada.
// Conseguir el DSN: sentry.io → Create project → Next.js → copia el DSN.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Performance sampling — bajo en prod para no agotar la free tier.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
    // Session Replay desactivado: añade ~30kB al bundle y la quota free
    // (50 replays/mes) se agota fast. Activar más adelante cuando haga falta
    // y el plan lo permita.
    ignoreErrors: [
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Failed to fetch',
      'NetworkError',
      'Load failed',
    ],
  });
}
