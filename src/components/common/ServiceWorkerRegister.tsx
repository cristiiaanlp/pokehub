'use client';

import { useEffect } from 'react';

// Registra el service worker. Solo en producción para no interferir con
// hot-reload en dev. El SW maneja: cache de sprites + stale-while-revalidate
// de la pokédex para tener una experiencia offline decente.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch {
        // Silencioso — el sitio funciona igual sin SW
      }
    };

    // Registra tras window load para no bloquear el first paint
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  return null;
}
