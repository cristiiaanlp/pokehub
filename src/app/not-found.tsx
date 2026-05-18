import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/Icon';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-16rem)] grid place-items-center px-4">
      <div className="text-center max-w-md">
        <div className="font-display text-7xl font-bold gradient-text">404</div>
        <h1 className="font-display text-2xl font-bold mt-3">
          Este Pokémon escapó
        </h1>
        <p className="text-ink-dim mt-2">
          La página que buscas no existe o ha sido movida.
        </p>
        <Link href="/" className="inline-block mt-6">
          <Button variant="primary" size="md">
            Volver al inicio
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
