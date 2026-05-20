import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import {
  SwordIcon,
  SparklesIcon,
  ArrowRight,
  GridIcon,
} from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Database Pokémon · Movimientos, Habilidades · PokéHub',
  description:
    'Base de datos completa de movimientos y habilidades Pokémon Gen 1-9. Filtrable por tipo, categoría, generación y más.',
};

const DATABASES = [
  {
    href: '/database/moves',
    label: 'Movimientos',
    desc: 'Todos los moves: BP, accuracy, tipo, categoría, efecto y Pokémon que lo aprenden.',
    count: '900+',
    Icon: SwordIcon,
    color: 'bg-accent-red/15 text-accent-red',
  },
  {
    href: '/database/abilities',
    label: 'Habilidades',
    desc: 'Cada ability con su descripción detallada y la lista de Pokémon que la pueden tener (incluso hidden).',
    count: '300+',
    Icon: SparklesIcon,
    color: 'bg-accent-yellow/15 text-accent-yellow',
  },
  {
    href: '/pokedex',
    label: 'Pokémon',
    desc: '1.025 Pokémon Gen 1-9 con stats, evoluciones, sprites y datos completos.',
    count: '1025',
    Icon: GridIcon,
    color: 'bg-brand/15 text-brand-glow',
  },
];

export default function DatabaseIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Database
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Base de datos Pokémon
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Movimientos, habilidades y Pokémon. Datos oficiales de Game Freak
          (vía PokéAPI), filtrables y enlazados entre sí. Click en cualquier
          item para ver su detalle y qué Pokémon lo usan.
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        {DATABASES.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="card-base card-hover p-5 group"
          >
            <div
              className={`w-12 h-12 rounded-xl ${d.color} inline-flex items-center justify-center mb-3`}
            >
              <d.Icon className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h2 className="font-display font-bold text-lg">{d.label}</h2>
              <span className="text-xs text-ink-faint font-mono">{d.count}</span>
            </div>
            <p className="text-xs text-ink-dim leading-relaxed mb-3">{d.desc}</p>
            <span className="inline-flex items-center gap-1 text-xs text-brand-glow font-semibold">
              Explorar
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
