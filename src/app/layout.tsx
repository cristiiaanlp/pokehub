// Root layout — minimalista. Solo html/body + globals.css.
// El layout real (fuentes, providers, navbar) vive en [locale]/layout.tsx
// para que next-intl pueda inyectar el locale correcto.

import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
