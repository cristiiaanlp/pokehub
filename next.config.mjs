import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.pokemon.com',
      },
      {
        protocol: 'https',
        hostname: 'pokeapi.co',
      },
    ],
  },
};

// Sentry wrap. Solo se activa si SENTRY_AUTH_TOKEN está set en el build
// (lo provee Vercel cuando configures la integración de Sentry).
// En local sin token: Sentry no genera source maps pero la app funciona igual.
const wrappedConfig = withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG ?? 'pokehub',
  project: process.env.SENTRY_PROJECT ?? 'pokehub',
  silent: !process.env.CI,
  // Sube source maps SOLO si hay auth token (production builds en Vercel)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});

export default wrappedConfig;
