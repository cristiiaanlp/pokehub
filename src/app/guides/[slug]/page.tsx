import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GUIDES, getGuideBySlug } from '@/lib/guides';
import { artworkFor } from '@/lib/pokeapi';
import { SITE } from '@/lib/site';
import {
  ArrowRight,
  BookOpenIcon,
  ClockIcon,
} from '@/components/ui/Icon';

export const dynamicParams = false;

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const g = getGuideBySlug(params.slug);
  if (!g) return { title: 'Guía no encontrada' };
  const url = `${SITE.url}/guides/${g.slug}`;
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: g.title,
      description: g.description,
      url,
      publishedTime: g.publishedAt,
      authors: [SITE.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: g.title,
      description: g.description,
    },
  };
}

export default function GuidePage({ params }: PageProps) {
  const g = getGuideBySlug(params.slug);
  if (!g) notFound();

  // JSON-LD Article structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.title,
    description: g.description,
    image: g.heroPokemon.map((id) => artworkFor(id)),
    datePublished: g.publishedAt,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/icon` },
    },
    mainEntityOfPage: `${SITE.url}/guides/${g.slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/guides"
        className="text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1 mb-4"
      >
        <BookOpenIcon className="w-3.5 h-3.5" /> Todas las guías
      </Link>

      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold">
            {g.category}
          </span>
          <span className="text-ink-faint">·</span>
          <span className="text-[11px] text-ink-faint inline-flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {g.readingTime}
          </span>
          <span className="text-[11px] text-ink-faint">
            · {new Date(g.publishedAt).toLocaleDateString('es', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {g.title}
        </h1>
        <p className="text-base text-ink-dim mt-3 leading-relaxed">{g.description}</p>
        <div className="mt-5 flex -space-x-3">
          {g.heroPokemon.map((id) => (
            <img
              key={id}
              src={artworkFor(id)}
              alt={`#${id}`}
              className="w-16 h-16 object-contain rounded-full bg-bg-800 ring-2 ring-bg-900"
            />
          ))}
        </div>
      </header>

      <div className="card-base p-5 mb-6 italic text-ink-soft leading-relaxed">
        <Markdown text={g.intro} />
      </div>

      <div className="space-y-6">
        {g.sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-xl font-bold mb-2 tracking-tight">
              {s.heading}
            </h2>
            <div className="text-sm text-ink-soft leading-relaxed">
              <Markdown text={s.body} />
            </div>
            {s.bullets && (
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="text-brand-glow shrink-0">▸</span>
                    <Markdown text={b} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-white/[0.06]">
        <h3 className="font-display font-bold text-sm mb-3">Sigue leyendo</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {GUIDES.filter((x) => x.slug !== g.slug)
            .slice(0, 4)
            .map((o) => (
              <Link
                key={o.slug}
                href={`/guides/${o.slug}`}
                className="card-base card-hover p-3 text-sm group flex items-center gap-2"
              >
                <span className="flex-1 truncate font-semibold">{o.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
        </div>
      </div>
    </article>
  );
}

// Mini "markdown" — solo bold (**text**) y links [label](href).
// Suficiente para nuestras guías curadas; sin dependencias extra.
function Markdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const bold = remaining.match(/\*\*(.+?)\*\*/);
    const link = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const earliest =
      !bold && !link
        ? -1
        : !bold
        ? link!.index!
        : !link
        ? bold.index!
        : Math.min(bold.index!, link.index!);
    if (earliest === -1) {
      parts.push(remaining);
      break;
    }
    const which = bold && bold.index === earliest ? bold : link!;
    parts.push(remaining.slice(0, which.index!));
    if (which === bold) {
      parts.push(<strong key={key++}>{bold[1]}</strong>);
    } else {
      const href = link![2];
      parts.push(
        <Link key={key++} href={href} className="text-brand-glow hover:text-brand-hover">
          {link![1]}
        </Link>
      );
    }
    remaining = remaining.slice((which.index ?? 0) + which[0].length);
  }
  return <>{parts}</>;
}
