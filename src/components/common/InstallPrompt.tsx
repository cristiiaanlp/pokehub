'use client';

import { useEffect, useState } from 'react';
import { SparklesIcon, XIcon } from '@/components/ui/Icon';

// `beforeinstallprompt` no está en el tipo Event estándar.
// Lo declaramos para que TS no proteste.
interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pokehub:pwa-install:dismissed-at';
const COOLDOWN_DAYS = 7; // tras dismiss, no volver a mostrar hasta 7d

function shouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return true;
  const dismissedAt = parseInt(raw) || 0;
  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt > cooldownMs;
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function InstallPrompt() {
  const [event, setEvent] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldShow()) return;

    // Detecta si la app ya está instalada (standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (standalone) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setEvent(e as BIPEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      markDismissed();
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible || !event) return null;

  const install = async () => {
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === 'dismissed') markDismissed();
      setVisible(false);
      setEvent(null);
    } catch {
      setVisible(false);
    }
  };

  const dismiss = () => {
    markDismissed();
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Instalar PokéHub como app"
      className="fixed bottom-24 lg:bottom-6 right-3 left-3 sm:left-auto sm:right-6 sm:max-w-sm z-[55] animate-in slide-in-from-bottom"
    >
      <div className="card-base p-4 shadow-card-hover border-brand/30 bg-bg-900/95 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/15 text-brand-glow inline-flex items-center justify-center shrink-0">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-sm">
              Instala PokéHub como app
            </h3>
            <p className="text-xs text-ink-dim mt-0.5 leading-relaxed">
              Más rápido, funciona offline en gran parte, sin barra del
              navegador.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={install}
                className="h-9 px-4 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-widest shadow-glow hover:bg-brand-hover"
              >
                Instalar
              </button>
              <button
                onClick={dismiss}
                className="h-9 px-3 rounded-lg text-xs text-ink-faint hover:text-ink"
              >
                Más tarde
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            aria-label="Cerrar"
            className="text-ink-faint hover:text-ink shrink-0 -mr-1 -mt-1"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
