import { PokedexGrid } from '@/components/pokedex/PokedexGrid';

export const metadata = {
  title: 'Pokédex · PokéHub',
  description:
    'Explora más de 1000 Pokémon con stats, tipos, evoluciones y movimientos.',
};

export default function PokedexPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
      <div className="mb-8 lg:mb-10">
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
      <PokedexGrid />
    </div>
  );
}
