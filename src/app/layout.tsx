import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { SITE } from '@/lib/site';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SyncManager } from '@/components/auth/SyncManager';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { CommandPalette } from '@/components/common/CommandPalette';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · La plataforma definitiva para entrenadores Pokémon`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.author }],
  creator: SITE.author,
  publisher: SITE.author,
  applicationName: SITE.name,
  category: 'games',
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    title: `${SITE.name} · Pokémon todo-en-uno`,
    description: SITE.description,
    siteName: SITE.name,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${SITE.name} · Pokémon competitivo y casual`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} · Pokémon todo-en-uno`,
    description: SITE.description,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: SITE.url,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand focus:text-white focus:font-semibold"
        >
          Saltar al contenido
        </a>
        <AuthProvider>
          <SyncManager />
          <OnboardingModal />
          <CommandPalette />
          <AnnouncementBanner />
          <Navbar />
          <MobileNav />
          <main id="main" className="pb-24 lg:pb-0">{children}</main>
          <BottomTabBar />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
