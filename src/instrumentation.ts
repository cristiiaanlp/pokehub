// Next.js instrumentation hook — carga el config de Sentry correcto según runtime.
// Esto reemplaza a `sentry.server.config.ts` siendo importado manualmente.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Sentry v10 renamed `onRequestError` → `captureRequestError`.
// Lo re-exportamos como `onRequestError` (nombre que Next.js espera).
export { captureRequestError as onRequestError } from '@sentry/nextjs';
