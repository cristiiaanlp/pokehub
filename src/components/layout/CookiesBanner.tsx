'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'pokehub-cookies-acknowledged';

/**
 * Banner GDPR-friendly: solo necesario para tracking opcional (analytics + ads).
 * Las cookies estrictamente funcionales (auth, preferencias) no requieren consent.
 *
 * Usamos enfoque "notice only" — informamos del uso, link al privacy policy.
 * Sin granularidad por categoría hasta que se introduzcan ads/analytics más
 * intrusivos. Esto es estándar para sites informativos pequeños.
 */
export function CookiesBanner() {
  const t = useTranslations('Cookies');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const acknowledged = localStorage.getItem(STORAGE_KEY);
      if (!acknowledged) {
        // Pequeño delay para que no aparezca antes de pintar el resto
        setTimeout(() => setShow(true), 400);
      }
    } catch {
      // localStorage bloqueado / private mode — mostramos por defecto
      setShow(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-3 inset-x-3 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-md z-[100]"
          role="dialog"
          aria-labelledby="cookies-banner-title"
        >
          <div className="card-base p-4 sm:p-5 shadow-card-hover bg-bg-900/95 backdrop-blur border border-white/[0.08]">
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0" aria-hidden>
                🍪
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  id="cookies-banner-title"
                  className="font-display font-bold text-sm mb-1"
                >
                  {t('title')}
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed">
                  {t.rich('body', {
                    privacy: (chunks) => (
                      <Link
                        href="/legal"
                        className="text-brand-glow hover:text-brand-hover underline"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Link
                    href="/legal"
                    className="text-[11px] text-ink-faint hover:text-ink-soft underline"
                  >
                    {t('moreInfo')}
                  </Link>
                  <button
                    onClick={accept}
                    className="h-9 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover"
                  >
                    {t('accept')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
