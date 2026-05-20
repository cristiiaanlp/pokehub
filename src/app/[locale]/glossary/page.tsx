import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { GLOSSARY, GLOSSARY_CATEGORIES } from '@/lib/glossary';
import { BookOpenIcon, ArrowRight } from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Glosario competitivo Pokémon · PokéHub',
  description:
    'Términos competitivos Pokémon explicados: STAB, OHKO, EV, IV, BST, Tera, Priority, Hazards y más. Glossary completo en español.',
};

const CATEGORY_EMOJI: Record<string, string> = {
  Estadísticas: '📊',
  Mecánicas: '⚙️',
  Estrategia: '♟️',
  Juego: '🎮',
  Formato: '⚖️',
};

export default function GlossaryIndexPage() {
  // Agrupar por categoría
  const byCategory: Record<string, typeof GLOSSARY> = {};
  for (const cat of GLOSSARY_CATEGORIES) {
    byCategory[cat] = GLOSSARY.filter((t) => t.category === cat).sort(
      (a, b) => a.term.localeCompare(b.term)
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1 inline-flex items-center gap-1">
          <BookOpenIcon className="w-3 h-3" />
          Glossary
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Glosario competitivo Pokémon
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          ¿Qué es STAB? ¿OHKO? ¿EVs? Aquí los {GLOSSARY.length} términos
          competitivos más importantes explicados. Cada uno con su propia
          página para profundizar.
        </p>
      </header>

      <div className="space-y-6">
        {GLOSSARY_CATEGORIES.map((cat) => (
          <section key={cat}>
            <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">{CATEGORY_EMOJI[cat]}</span>
              {cat}{' '}
              <span className="text-xs text-ink-faint font-normal">
                ({byCategory[cat].length})
              </span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {byCategory[cat].map((t) => (
                <Link
                  key={t.slug}
                  href={`/glossary/${t.slug}`}
                  className="card-base card-hover p-3 group"
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-display font-bold text-sm">{t.term}</span>
                  </div>
                  <p className="text-xs text-ink-dim line-clamp-2 leading-relaxed">
                    {t.short}
                  </p>
                  <div className="text-[10px] text-brand-glow mt-2 inline-flex items-center gap-1">
                    Leer más
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
