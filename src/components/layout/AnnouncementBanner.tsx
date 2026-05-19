'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { XIcon } from '@/components/ui/Icon';

interface Item {
  id: string;
  title: string;
  body: string | null;
  severity: 'info' | 'warning' | 'error' | 'maintenance';
  link_url: string | null;
  link_label: string | null;
  ends_at: string | null;
}

const STYLES: Record<Item['severity'], string> = {
  info: 'bg-brand/90 text-white',
  warning: 'bg-accent-yellow/95 text-bg-900',
  error: 'bg-accent-red/95 text-white',
  maintenance: 'bg-purple-600/95 text-white',
};

const DISMISSED_KEY = 'pokehub:announcements:dismissed';

function getDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function setDismissed(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    /* full disk, private mode, etc — silently skip */
  }
}

export function AnnouncementBanner() {
  const [items, setItems] = useState<Item[]>([]);
  const [dismissed, setDismissedState] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissedState(getDismissed());
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.items)) setItems(data.items as Item[]);
      })
      .catch(() => {
        /* never block UI on banner failure */
      });
  }, []);

  if (!mounted) return null;
  const now = Date.now();
  const visible = items.filter((it) => {
    if (dismissed.has(it.id)) return false;
    if (it.ends_at && new Date(it.ends_at).getTime() < now) return false;
    return true;
  });

  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissedState(next);
    setDismissed(next);
  };

  return (
    <div className="sticky top-0 z-[60] space-y-0.5">
      {visible.map((it) => {
        const isExternal = it.link_url?.startsWith('http');
        return (
          <div
            key={it.id}
            className={`${STYLES[it.severity]} text-xs sm:text-sm px-4 py-2 flex items-center gap-3 shadow-md`}
            role="status"
          >
            <div className="flex-1 min-w-0">
              <span className="font-bold">{it.title}</span>
              {it.body && (
                <span className="ml-2 opacity-90 hidden sm:inline">
                  {it.body}
                </span>
              )}
              {it.link_url &&
                (isExternal ? (
                  <a
                    href={it.link_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="ml-2 underline font-semibold"
                  >
                    {it.link_label ?? 'Más info'} ↗
                  </a>
                ) : (
                  <Link
                    href={it.link_url}
                    className="ml-2 underline font-semibold"
                  >
                    {it.link_label ?? 'Más info'} →
                  </Link>
                ))}
            </div>
            <button
              onClick={() => dismiss(it.id)}
              aria-label="Cerrar aviso"
              className="shrink-0 opacity-80 hover:opacity-100"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
