// Locales soportados. El orden importa: el primero es el default.

export const locales = ['es', 'en', 'fr', 'de', 'it'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
};

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
};

// PokéAPI usa códigos de idioma específicos. Mapeamos los nuestros a los suyos.
export const pokeApiLanguage: Record<Locale, string> = {
  es: 'es',
  en: 'en',
  fr: 'fr',
  de: 'de',
  it: 'it',
};
