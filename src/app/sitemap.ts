import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { GUIDES } from '@/lib/guides';
import { BEST_LISTS } from '@/lib/best-lists';
import { GLOSSARY } from '@/lib/glossary';
import { ALL_COUNTER_IDS } from '@/lib/meta/counters-detail';
import { ALL_ARCHETYPES } from '@/lib/trainer-quiz';
import { ALL_HISTORY_IDS } from '@/lib/gen-history';
import { getAllMoveSlugs } from '@/lib/moves-detail';
import { locales, defaultLocale } from '@/i18n/config';

// Para cada locale generamos las mismas rutas. El default (es) NO lleva
// prefijo en la URL, los demás sí.
function urlFor(locale: string, path: string): string {
  if (locale === defaultLocale) return `${SITE.url}${path}`;
  return `${SITE.url}/${locale}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    '',
    '/pokedex',
    '/team-builder',
    '/tools',
    '/tools/speed-tier',
    '/tools/damage-calc',
    '/tools/replay-analyzer',
    '/tools/type-chart',
    '/tools/stat-calc',
    '/tools/ev-optimizer',
    '/tools/team-validator',
    '/tools/damage-vs-meta',
    '/tools/synergy',
    '/tools/tier-list',
    '/random',
    '/coach',
    '/typemaster',
    '/typemaster/play',
    '/typemaster/meta-daily',
    '/typemaster/learn',
    '/typemaster/stats',
    '/typemaster/leaderboard',
    '/meta',
    '/meta/champions',
    '/meta/teams',
    '/community/teams',
    '/compare',
    '/database',
    '/database/moves',
    '/database/abilities',
    '/database/items',
    '/casual',
    '/casual/shiny',
    '/casual/randomizer',
    '/casual/nuzlocke',
    '/favorites',
    '/favorites/vs-meta',
    '/daily',
    '/daily/whos-that',
    '/daily/wordle',
    '/daily/trivia',
    '/quiz/trainer-type',
    '/guides',
    '/best',
    '/glossary',
    '/legal',
    '/login',
    '/support',
  ];

  const staticEntries: MetadataRoute.Sitemap = [];
  for (const r of routes) {
    for (const l of locales) {
      staticEntries.push({
        url: urlFor(l, r),
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: r === '' ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(locales.map((x) => [x, urlFor(x, r)])),
        },
      });
    }
  }

  const featuredPokemon = [
    1, 4, 7, 25, 6, 9, 3, 150, 151,
    149, 248, 376, 445, 448, 658, 727, 887, 903, 983, 984, 1000, 1006, 1017, 1021,
  ];
  const pokemonEntries: MetadataRoute.Sitemap = [];
  for (const id of featuredPokemon) {
    for (const l of locales) {
      pokemonEntries.push({
        url: urlFor(l, `/pokedex/${id}`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    }
  }

  const guideEntries: MetadataRoute.Sitemap = [];
  for (const g of GUIDES) {
    for (const l of locales) {
      guideEntries.push({
        url: urlFor(l, `/guides/${g.slug}`),
        lastModified: new Date(g.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      });
    }
  }

  // Best lists: 1 URL × locale × lista
  const bestEntries: MetadataRoute.Sitemap = [];
  for (const list of BEST_LISTS) {
    for (const l of locales) {
      bestEntries.push({
        url: urlFor(l, `/best/${list.slug}`),
        lastModified: new Date(list.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }
  }

  // Competitive analysis: 1 URL × locale × Pokémon featured (los del
  // pokemonEntries para no inflar el sitemap a 5000+ URLs)
  const competitiveEntries: MetadataRoute.Sitemap = [];
  for (const id of featuredPokemon) {
    for (const l of locales) {
      competitiveEntries.push({
        url: urlFor(l, `/pokedex/${id}/competitive`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }
  }

  // Glossary: 1 URL × locale × término (capta queries "qué es STAB", "qué es OHKO")
  const glossaryEntries: MetadataRoute.Sitemap = [];
  for (const term of GLOSSARY) {
    for (const l of locales) {
      glossaryEntries.push({
        url: urlFor(l, `/glossary/${term.slug}`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      });
    }
  }

  // Counters: 1 URL × locale × Pokémon (capta "counters to X", "how to beat X")
  const counterEntries: MetadataRoute.Sitemap = [];
  for (const id of ALL_COUNTER_IDS) {
    for (const l of locales) {
      counterEntries.push({
        url: urlFor(l, `/pokedex/${id}/counters`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      });
    }
  }

  // Trainer quiz results — 6 arquetipos × locale (viral via OG image)
  const trainerEntries: MetadataRoute.Sitemap = [];
  for (const arch of ALL_ARCHETYPES) {
    for (const l of locales) {
      trainerEntries.push({
        url: urlFor(l, `/quiz/trainer-type/${arch}`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      });
    }
  }

  // Historia por gen × Pokémon — capta queries "garchomp gen 4 vs gen 9"
  const historyEntries: MetadataRoute.Sitemap = [];
  for (const id of ALL_HISTORY_IDS) {
    for (const l of locales) {
      historyEntries.push({
        url: urlFor(l, `/pokedex/${id}/history`),
        lastModified: now,
        changeFrequency: 'yearly' as const,
        priority: 0.5,
      });
    }
  }

  // Move detail pages — capta "earthquake pokemon", "knock off explained" etc
  const moveEntries: MetadataRoute.Sitemap = [];
  for (const slug of getAllMoveSlugs()) {
    for (const l of locales) {
      moveEntries.push({
        url: urlFor(l, `/database/moves/${slug}`),
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      });
    }
  }

  return [
    ...staticEntries,
    ...pokemonEntries,
    ...guideEntries,
    ...bestEntries,
    ...competitiveEntries,
    ...glossaryEntries,
    ...counterEntries,
    ...trainerEntries,
    ...historyEntries,
    ...moveEntries,
  ];
}
