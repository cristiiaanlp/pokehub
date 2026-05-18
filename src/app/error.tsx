'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/Icon';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PokéHub error]', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-16rem)] grid place-items-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-3">⚡</div>
        <h1 className="font-display text-3xl font-bold">
          Algo se cortocircuitó
        </h1>
        <p className="text-ink-dim mt-2 text-sm">
          Hubo un fallo inesperado renderizando esta página. Intenta de nuevo o
          vuelve al inicio.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-3 text-left text-[10px] text-ink-faint glass p-3 rounded-lg overflow-auto max-h-40">
            {error.message}
            {error.digest && `\n· ${error.digest}`}
          </pre>
        )}
        <div className="mt-6 flex gap-2 justify-center">
          <Button onClick={reset} variant="primary" size="md">
            Reintentar
          </Button>
          <Link href="/">
            <Button variant="secondary" size="md">
              Inicio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
