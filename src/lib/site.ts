// Central site config used in metadata, sitemap, OG.
// NEXT_PUBLIC_SITE_URL set on Vercel to https://pokehub.app (or whatever domain).
export const SITE = {
  name: 'PokéHub',
  shortName: 'PokéHub',
  description:
    'Pokédex moderna, Team Builder competitivo, Meta Hub con datos reales (Smogon + Pikalytics) y TypeMaster: el minijuego para dominar la tabla de tipos. Soporte completo Pokémon Champions.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pokehub.vercel.app',
  ogImage: '/og',
  themeColor: '#0B0F17',
  keywords: [
    'Pokémon',
    'Pokédex',
    'Pokémon Champions',
    'Team Builder',
    'Competitive Pokémon',
    'VGC',
    'Smogon',
    'Pikalytics',
    'Tabla de tipos',
    'Nuzlocke',
    'Shiny hunting',
    'TypeMaster',
  ],
  locale: 'es_ES',
  author: 'Cristian López',
  authorGithub: 'https://github.com/cristiiaanlp',
  repo: 'https://github.com/cristiiaanlp/pokehub',
  // ─── DONACIONES ──────────────────────────────────────────────────────
  // Cuando crees tu cuenta en https://ko-fi.com sustituye '' por tu
  // username. Si lo dejas vacío, el botón "Buy Me a Coffee" NO aparece.
  // Cuando lo rellenes, push y Vercel redespliega automáticamente.
  kofiUsername: '', // ej: 'cristiiaanlp'
} as const;
