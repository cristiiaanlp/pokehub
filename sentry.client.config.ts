// Sentry config — client-side errors.
// Solo se activa si NEXT_PUBLIC_SENTRY_DSN está set; en local sin DSN no hace nada.
// Conseguir el DSN: sentry.io → Create project → Next.js → copia el DSN.

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Performance monitoring sample rate. 0.1 = 10% de las transacciones.
    // En producción seria 0.01-0.05; en preview 0.5; en local 1.0.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Session replays — graba sesiones cuando hay errores (1.0) y un 1% al azar.
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.01,
    // No reportes errores conocidos / ruido
    ignoreErrors: [
      // Errores de extensiones del navegador
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors transitorios
      'Failed to fetch',
      'NetworkError',
      'Load failed',
    ],
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  });
}
