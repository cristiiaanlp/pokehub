import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { GUIDES } from '@/lib/guides';
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
    '/tools/moveset-wizard',
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
    '/guides',
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

  return [...staticEntries, ...pokemonEntries, ...guideEntries];
}
