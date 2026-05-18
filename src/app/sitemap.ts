import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    '',
    '/pokedex',
    '/team-builder',
    '/typemaster',
    '/typemaster/play',
    '/typemaster/learn',
    '/typemaster/stats',
    '/typemaster/leaderboard',
    '/meta',
    '/meta/champions',
    '/meta/teams',
    '/casual',
    '/casual/shiny',
    '/casual/randomizer',
    '/casual/nuzlocke',
    '/favorites',
    '/login',
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((r) => ({
    url: `${SITE.url}${r}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: r === '' ? 1 : 0.7,
  }));

  // Top popular Pokémon (sample). Full 1025 would be excessive; pick a useful subset.
  // SVG/static-friendly: SV OU + Champions favorites + iconic gen 1 starters.
  const featuredPokemon = [
    1, 4, 7, 25, 6, 9, 3, 150, 151,
    149, 248, 376, 445, 448, 658, 727, 887, 903, 983, 984, 1000, 1006, 1017, 1021,
  ];
  const pokemonEntries: MetadataRoute.Sitemap = featuredPokemon.map((id) => ({
    url: `${SITE.url}/pokedex/${id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...pokemonEntries];
}
