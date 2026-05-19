// Central site config used in metadata, sitemap, OG, donation methods.
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

  // ═════════════════════════════════════════════════════════════════════
  //  DONACIONES · activa solo los métodos que quieras usar
  // ═════════════════════════════════════════════════════════════════════
  //  Cada método solo aparece en la UI cuando su valor NO está vacío.
  //  Si rellenas varios, los usuarios verán las opciones lado a lado.
  // ═════════════════════════════════════════════════════════════════════
  support: {
    /** Ko-fi username · https://ko-fi.com/settings */
    kofiUsername: 'cristiiaanlp',
    /** GitHub Sponsors username (deja vacío hasta solicitar acceso al programa) */
    githubSponsors: '' as string, // ej: 'cristiiaanlp'
    /** PayPal.me link directo · https://paypal.me/settings */
    paypalMe: '' as string, // ej: 'cristiiaanlp' → https://paypal.me/cristiiaanlp
    /** Stripe Payment Link público · solo si activas Stripe Checkout */
    stripeLink: '' as string, // ej: 'https://buy.stripe.com/xxxx'
    /** Texto del goal mensual (déjalo vacío para no mostrar) */
    monthlyGoalLabel: 'Cubrir hosting + Anthropic API',
    monthlyGoalEur: 25,
  },

  // Backwards-compat: el footer antiguo lee SITE.kofiUsername
  kofiUsername: 'cristiiaanlp',
};
