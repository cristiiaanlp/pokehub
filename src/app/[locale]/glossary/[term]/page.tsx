import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { GLOSSARY, getGlossaryTerm } from '@/lib/glossary';
import { SITE } from '@/lib/site';
import { ArrowRight, BookOpenIcon } from '@/components/ui/Icon';
import React from 'react';

export const dynamicParams = false;

export async function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }));
}

interface PageProps {
  params: { term: string; locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const term = getGlossaryTerm(params.term);
  if (!term) return { title: 'Término no encontrado' };
  const url = `${SITE.url}/glossary/${term.slug}`;
  return {
    title: `${term.term} · Glosario Pokémon`,
    description: term.short,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: `${term.term} · Glosario Pokémon`,
      description: term.short,
      url,
    },
  };
}

export default function GlossaryTermPage({ params }: PageProps) {
  const term = getGlossaryTerm(params.term);
  if (!term) notFound();

  // JSON-LD DefinedTerm structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.short,
    inDefinedTermSet: `${SITE.url}/glossary`,
    url: `${SITE.url}/glossary/${term.slug}`,
  };

  // Related terms
  const related = (term.related ?? [])
    .map((slug) => getGlossaryTerm(slug))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/glossary"
        className="text-xs text-ink-faint hover:text-ink inline-flex items-center gap-1"
      >
        <BookOpenIcon className="w-3.5 h-3.5" /> Volver al glossary
      </Link>

      <header>
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          {term.category}
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold">{term.term}</h1>
        <p className="text-base text-ink-soft mt-3 leading-relaxed">
          {term.short}
        </p>
      </header>

      {/* Cuerpo con markdown light */}
      <div className="card-base p-6 space-y-4 text-sm text-ink-soft leading-relaxed">
        <Markdown text={term.body} />
      </div>

      {/* Related terms */}
      {related.length > 0 && (
        <section>
          <h3 className="font-display font-bold text-sm mb-3">
            Términos relacionados
          </h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/glossary/${r.slug}`}
                className="card-base card-hover p-3 group"
              >
                <div className="font-display font-bold text-sm">{r.term}</div>
                <p className="text-xs text-ink-dim line-clamp-2 mt-1">
                  {r.short}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="text-center pt-4">
        <Link
          href="/glossary"
          className="inline-flex items-center gap-1 text-sm text-brand-glow hover:text-brand-hover"
        >
          ← Ver todos los términos del glossary
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

// Mini-markdown: bold (**text**), inline code (`code`), links [text](href),
// code blocks (```\n...\n```), bullet lists, paragraphs separados por \n\n.
function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  return (
    <>
      {blocks.map((block, i) => {
        // Bloque de código
        if (block.startsWith('```')) {
          const code = block.replace(/^```\w*\n?/, '').replace(/```$/, '');
          return (
            <pre
              key={i}
              className="text-[11px] font-mono bg-black/30 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap"
            >
              {code}
            </pre>
          );
        }
        // Lista bullet
        if (block.match(/^- /m)) {
          const items = block.split('\n').filter((l) => l.trim().startsWith('-'));
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {items.map((it, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-brand-glow shrink-0">▸</span>
                  <span>
                    <Inline text={it.replace(/^-\s*/, '')} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        // Párrafo normal
        return (
          <p key={i}>
            <Inline text={block} />
          </p>
        );
      })}
    </>
  );
}

function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const bold = remaining.match(/\*\*(.+?)\*\*/);
    const code = remaining.match(/`(.+?)`/);
    const link = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const candidates = [bold, code, link].filter(
      (m): m is RegExpMatchArray => m !== null
    );
    if (candidates.length === 0) {
      parts.push(remaining);
      break;
    }
    const earliest = candidates.reduce((a, b) =>
      (a.index ?? 0) < (b.index ?? 0) ? a : b
    );
    parts.push(remaining.slice(0, earliest.index ?? 0));
    if (earliest === bold) {
      parts.push(<strong key={key++} className="text-ink font-bold">{bold![1]}</strong>);
    } else if (earliest === code) {
      parts.push(
        <code key={key++} className="text-[11px] font-mono px-1 py-0.5 rounded bg-white/[0.06]">
          {code![1]}
        </code>
      );
    } else if (earliest === link) {
      parts.push(
        <Link
          key={key++}
          href={link![2]}
          className="text-brand-glow hover:text-brand-hover underline"
        >
          {link![1]}
        </Link>
      );
    }
    remaining = remaining.slice((earliest.index ?? 0) + earliest[0].length);
  }
  return <>{parts}</>;
}
