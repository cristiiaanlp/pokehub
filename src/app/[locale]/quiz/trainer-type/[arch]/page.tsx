import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { TRAINER_RESULTS, ALL_ARCHETYPES, type TrainerArchetype } from '@/lib/trainer-quiz';
import { artworkFor } from '@/lib/pokeapi';
import { SITE } from '@/lib/site';
import { ArrowRight, SparklesIcon } from '@/components/ui/Icon';
import { ShareTrainerButton } from '@/components/quiz/ShareTrainerButton';

export const dynamicParams = false;

export async function generateStaticParams() {
  return ALL_ARCHETYPES.map((arch) => ({ arch }));
}

interface PageProps {
  params: { arch: string; locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = TRAINER_RESULTS[params.arch as TrainerArchetype];
  if (!result) return { title: 'Resultado · PokéHub' };
  const url = `${SITE.url}/quiz/trainer-type/${result.id}`;
  return {
    title: `Soy ${result.title} ${result.emoji} · Quiz Pokémon · PokéHub`,
    description: `${result.tagline}. ${result.description.slice(0, 120)}…`,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: `Soy ${result.title} ${result.emoji}`,
      description: result.tagline,
      url,
      // La OG image se sirve automáticamente desde opengraph-image.tsx
    },
    twitter: {
      card: 'summary_large_image',
      title: `Soy ${result.title} ${result.emoji}`,
      description: result.tagline,
    },
  };
}

export default function TrainerResultPage({ params }: PageProps) {
  const result = TRAINER_RESULTS[params.arch as TrainerArchetype];
  if (!result) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <div
        className="card-base p-8 text-center relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at top right, ${result.accent}22, transparent 70%)`,
        }}
      >
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: result.accent }}
        />
        <div className="relative">
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink-faint font-bold mb-2">
            Tu arquetipo competitivo
          </div>
          <div className="text-7xl mb-3">{result.emoji}</div>
          <h1
            className="font-display text-4xl sm:text-5xl font-bold mb-2"
            style={{ color: result.accent }}
          >
            {result.title}
          </h1>
          <div className="text-sm text-ink-dim italic mb-4">
            "{result.tagline}"
          </div>
          <p className="text-sm sm:text-base text-ink-soft max-w-md mx-auto leading-relaxed">
            {result.description}
          </p>
        </div>
      </div>

      {/* Iconic Pokémon */}
      <section>
        <h2 className="font-display font-bold text-sm mb-3 text-center">
          Tus Pokémon emblema
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {result.iconicPokemon.map((id) => (
            <Link
              key={id}
              href={`/pokedex/${id}`}
              className="card-base card-hover p-3 text-center group"
            >
              <img
                src={artworkFor(id)}
                alt={`#${id}`}
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain group-hover:scale-110 transition-transform"
              />
              <div className="text-[10px] font-mono text-ink-faint mt-1">
                #{String(id).padStart(4, '0')}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Share */}
      <ShareTrainerButton arch={result.id} title={result.title} emoji={result.emoji} />

      {/* CTA */}
      <div className="card-base p-5 text-center space-y-3">
        <p className="text-sm text-ink-soft">
          ¿Quieres construir un equipo con tu arquetipo?
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link
            href="/team-builder"
            className="inline-flex items-center gap-1.5 text-sm font-bold px-4 h-10 rounded-xl bg-brand text-white hover:bg-brand-hover shadow-glow"
          >
            <SparklesIcon className="w-4 h-4" /> Crear mi equipo
          </Link>
          <Link
            href="/quiz/trainer-type"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 h-10 rounded-xl glass hover:bg-white/[0.08]"
          >
            Repetir test
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <p className="text-[10px] text-ink-faint text-center">
        ¿Ningún resultado te encaja? El meta es flexible — un buen jugador mezcla
        arquetipos según el rival.
      </p>
    </div>
  );
}
