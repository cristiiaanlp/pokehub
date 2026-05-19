import { Link } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SITE } from '@/lib/site';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'Legal' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LegalPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations('Legal');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-16 space-y-8 text-sm leading-relaxed">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
          {t('eyebrow')}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-ink-dim mt-3">
          {t.rich('intro', {
            author: (chunks) => (
              <a
                href={SITE.authorGithub}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-glow hover:text-brand-hover"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </div>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">{t('ipTitle')}</h2>
        <p className="text-ink-soft">{t('ipBody1')}</p>
        <p className="text-ink-soft">
          {t.rich('ipBody2', {
            pokeapi: (chunks) => (
              <a
                href="https://pokeapi.co"
                target="_blank"
                rel="noreferrer"
                className="text-brand-glow hover:text-brand-hover"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">{t('privacyTitle')}</h2>
        <p className="text-ink-soft">{t('privacyIntro')}</p>

        <h3 className="font-display font-bold text-base mt-4">
          {t('privacyDataTitle')}
        </h3>
        <ul className="space-y-1 text-ink-soft pl-5 list-disc">
          <li>{t('privacyData1')}</li>
          <li>{t('privacyData2')}</li>
          <li>{t('privacyData3')}</li>
        </ul>

        <h3 className="font-display font-bold text-base mt-4">
          {t('privacyCookiesTitle')}
        </h3>
        <p className="text-ink-soft">{t('privacyCookiesBody')}</p>
        <ul className="space-y-1 text-ink-soft pl-5 list-disc">
          <li>{t('privacyCookies1')}</li>
          <li>{t('privacyCookies2')}</li>
          <li>{t('privacyCookies3')}</li>
        </ul>

        <h3 className="font-display font-bold text-base mt-4">
          {t('privacyRightsTitle')}
        </h3>
        <p className="text-ink-soft">{t('privacyRightsBody')}</p>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">{t('licenseTitle')}</h2>
        <p className="text-ink-soft">{t('licenseIntro')}</p>
        <p className="text-ink-soft font-semibold">{t('licenseCan')}</p>
        <ul className="space-y-1 text-ink-soft pl-5 list-disc">
          <li>{t('licenseCan1')}</li>
          <li>{t('licenseCan2')}</li>
          <li>{t('licenseCan3')}</li>
          <li>{t('licenseCan4')}</li>
        </ul>
        <p className="text-ink-soft font-semibold mt-3">{t('licenseCant')}</p>
        <ul className="space-y-1 text-ink-soft pl-5 list-disc">
          <li>{t('licenseCant1')}</li>
          <li>{t('licenseCant2')}</li>
          <li>{t('licenseCant3')}</li>
        </ul>
        <p className="text-ink-faint text-xs pt-3 border-t border-white/[0.05]">
          {t.rich('licenseFooter', {
            license: (chunks) => (
              <a
                href={`${SITE.repo}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer"
                className="text-brand-glow hover:text-brand-hover"
              >
                {chunks}
              </a>
            ),
            contact: (chunks) => (
              <a
                href={SITE.authorGithub}
                target="_blank"
                rel="noreferrer"
                className="text-brand-glow hover:text-brand-hover"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">{t('sourcesTitle')}</h2>
        <ul className="space-y-2 text-ink-soft">
          <li>
            <a
              href="https://pokeapi.co"
              target="_blank"
              rel="noreferrer"
              className="text-brand-glow hover:text-brand-hover"
            >
              PokéAPI ↗
            </a>{' '}
            — {t('sourcesPokeapi')}
          </li>
          <li>
            <a
              href="https://www.smogon.com/stats/"
              target="_blank"
              rel="noreferrer"
              className="text-brand-glow hover:text-brand-hover"
            >
              Smogon Stats ↗
            </a>{' '}
            — {t('sourcesSmogon')}
          </li>
          <li>
            <a
              href="https://www.pikalytics.com"
              target="_blank"
              rel="noreferrer"
              className="text-brand-glow hover:text-brand-hover"
            >
              Pikalytics ↗
            </a>{' '}
            — {t('sourcesPikalytics')}
          </li>
        </ul>
      </section>

      <section className="card-base p-6 space-y-2 text-xs text-ink-faint">
        <p>{t('updated', { date: '2026-05-19' })}</p>
        <p>{t('contact')}</p>
      </section>

      <div className="text-center pt-4">
        <Link href="/" className="text-sm text-brand-glow hover:text-brand-hover">
          ← {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
