import { Link } from '@/i18n/routing';
import { PokedexGrid } from '@/components/pokedex/PokedexGrid';
import { SparklesIcon } from '@/components/ui/Icon';

export const metadata = {
  title: 'Pokédex · PokéHub',
  description:
    'Explora más de 1000 Pokémon con stats, tipos, evoluciones y movimientos.',
};

export default function PokedexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
      <div className="mb-8 lg:mb-10 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
            Pokédex
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Toda la Pokédex,{' '}
            <span className="gradient-text">a un clic</span>
          </h1>
          <p className="text-ink-dim mt-3 max-w-2xl">
            Datos de PokéAPI. Filtra por tipo, busca por nombre o número, marca
            favoritos y abre cada Pokémon para ver stats, movimientos y
            evoluciones.
          </p>
        </div>
        <Link
          href="/random"
          prefetch={false}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-white text-sm font-bold uppercase tracking-widest shadow-glow inline-flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-transform"
        >
          <SparklesIcon className="w-4 h-4" />
          Sorpréndeme
        </Link>
      </div>
      <PokedexGrid />
    </div>
  );
}
