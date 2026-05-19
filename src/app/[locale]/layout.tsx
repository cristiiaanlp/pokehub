import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';
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
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  if (!locales.includes(locale as Locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Landing' });
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${SITE.name} · ${t('heroTitle')}`,
      template: `%s · ${SITE.name}`,
    },
    description: t('heroSubtitle'),
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.author }],
    creator: SITE.author,
    publisher: SITE.author,
    applicationName: SITE.name,
    category: 'games',
    openGraph: {
      type: 'website',
      locale,
      url: locale === 'es' ? SITE.url : `${SITE.url}/${locale}`,
      title: `${SITE.name} · ${t('heroTitle')}`,
      description: t('heroSubtitle'),
      siteName: SITE.name,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: SITE.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE.name} · ${t('heroTitle')}`,
      description: t('heroSubtitle'),
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
      canonical: locale === 'es' ? SITE.url : `${SITE.url}/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, l === 'es' ? SITE.url : `${SITE.url}/${l}`])
      ),
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const tCommon = await getTranslations({ locale, namespace: 'Common' });

  return (
    <html lang={locale} className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-brand focus:text-white focus:font-semibold"
        >
          {tCommon('search') /* fallback; replace with proper skip link */}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
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
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
