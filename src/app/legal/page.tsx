import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Licencia y aviso legal',
  description:
    'Información sobre licencia del código, derechos de Pokémon y fuentes de datos usadas por PokéHub.',
};

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-16 space-y-8 text-sm leading-relaxed">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
          Información legal
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Licencia y créditos
        </h1>
        <p className="text-ink-dim mt-3">
          PokéHub es un proyecto fan no oficial creado por{' '}
          <a
            href={SITE.authorGithub}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-glow hover:text-brand-hover"
          >
            {SITE.author}
          </a>
          . Sin afiliación con Nintendo, Game Freak, ni The Pokémon Company.
        </p>
      </div>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">
          Propiedad intelectual de Pokémon
        </h2>
        <p className="text-ink-soft">
          Pokémon y todas sus marcas, personajes, nombres, sprites y diseños
          son © Nintendo · Game Freak · The Pokémon Company. PokéHub no
          reclama ningún derecho sobre esa propiedad intelectual.
        </p>
        <p className="text-ink-soft">
          Las imágenes y los datos básicos de Pokémon se consumen desde{' '}
          <a
            href="https://pokeapi.co"
            target="_blank"
            rel="noreferrer"
            className="text-brand-glow hover:text-brand-hover"
          >
            PokéAPI
          </a>
          , una API pública de fans para fans.
        </p>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">
          Licencia del código (PokéHub)
        </h2>
        <p className="text-ink-soft">
          El código fuente de PokéHub es <strong>source-available</strong>{' '}
          bajo una licencia personalizada. Puedes:
        </p>
        <ul className="space-y-1 text-ink-soft pl-5 list-disc">
          <li>Leer y estudiar el código.</li>
          <li>Forkearlo en GitHub.</li>
          <li>Correr una copia personal para uso no comercial.</li>
          <li>Contribuir vía Pull Request.</li>
        </ul>
        <p className="text-ink-soft mt-3">No puedes:</p>
        <ul className="space-y-1 text-ink-soft pl-5 list-disc">
          <li>Hostear una versión comercial sin permiso escrito.</li>
          <li>Quitar la atribución al autor.</li>
          <li>Revender o sublicenciar el código.</li>
        </ul>
        <p className="text-ink-faint text-xs pt-3 border-t border-white/[0.05]">
          Lee la licencia completa en{' '}
          <a
            href={`${SITE.repo}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="text-brand-glow hover:text-brand-hover"
          >
            LICENSE
          </a>
          . Para licencias comerciales:{' '}
          <a
            href={SITE.authorGithub}
            target="_blank"
            rel="noreferrer"
            className="text-brand-glow hover:text-brand-hover"
          >
            contacta al autor
          </a>
          .
        </p>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">Fuentes de datos</h2>
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
            — Datos generales, sprites, evoluciones, stats base.
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
            — Usage stats mensuales del meta competitivo SV.
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
            — Top teams y stats por Pokémon en Pokémon Champions y VGC.
          </li>
        </ul>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">Privacidad</h2>
        <p className="text-ink-soft">
          PokéHub no recopila datos personales identificables. Tus equipos,
          favoritos y progreso de TypeMaster viven en el{' '}
          <code className="bg-white/[0.05] px-1.5 py-0.5 rounded text-ink">
            localStorage
          </code>{' '}
          de tu navegador. Si conectas tu cuenta Supabase, los datos quedan en
          tu propia base de datos.
        </p>
        <p className="text-ink-soft">
          No usamos cookies de tracking ni analítica de terceros por defecto.
        </p>
      </section>

      <div className="text-center pt-4">
        <Link
          href="/"
          className="text-sm text-brand-glow hover:text-brand-hover"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
