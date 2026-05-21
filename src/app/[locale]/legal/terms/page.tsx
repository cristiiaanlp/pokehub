import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Términos de servicio · PokéHub',
  description:
    'Términos y condiciones de uso de PokéHub. Reglas básicas, responsabilidades, contenido de usuario y limitaciones.',
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-16 space-y-8 text-sm leading-relaxed">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
          Términos de servicio
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Términos y condiciones
        </h1>
        <p className="text-ink-dim mt-3">
          Al usar PokéHub aceptas estas condiciones. Léelas — son cortas y sin
          legalese innecesario.
        </p>
      </div>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">1. Naturaleza del servicio</h2>
        <p className="text-ink-soft">
          PokéHub es un proyecto independiente hecho por fans con fines
          informativos, educativos y de entretenimiento competitivo. **No tiene
          afiliación oficial con Nintendo, Game Freak, The Pokémon Company,
          Smogon, Pikalytics ni Pokémon Showdown.**
        </p>
        <p className="text-ink-soft">
          Toda la información sobre Pokémon (nombres, sprites, stats, etc.) es
          propiedad intelectual de Nintendo/Game Freak/The Pokémon Company. Se
          usa bajo el principio de uso justo (fair use) para análisis competitivo,
          comentario y herramientas de utilidad para la comunidad.
        </p>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">2. Tu cuenta y datos</h2>
        <ul className="space-y-1.5 text-ink-soft pl-5 list-disc">
          <li>
            Crear una cuenta es opcional. Sin cuenta puedes usar el 90% de la web.
          </li>
          <li>
            Eres responsable de la seguridad de tu cuenta (password, email).
            No compartas tus credenciales.
          </li>
          <li>
            Puedes solicitar borrar tu cuenta + todos tus datos en cualquier
            momento contactando vía GitHub del autor.
          </li>
          <li>
            Más detalles sobre qué datos guardamos:{' '}
            <Link href="/legal" className="text-brand-glow hover:text-brand-hover underline">
              página de privacidad
            </Link>.
          </li>
        </ul>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">3. Contenido de usuario</h2>
        <p className="text-ink-soft">
          Si subes contenido (equipos compartidos, comentarios, ratings):
        </p>
        <ul className="space-y-1.5 text-ink-soft pl-5 list-disc">
          <li>
            Eres responsable de su contenido. No spam, no insultos, no
            contenido ilegal.
          </li>
          <li>
            Nos concedes una licencia no-exclusiva para mostrarlo en el sitio
            (necesario para que funcione la feature).
          </li>
          <li>
            Tus equipos públicos son visibles para cualquier visitante.
            Equipos privados solo para ti.
          </li>
          <li>
            Nos reservamos el derecho de borrar contenido que viole estas reglas
            o que sea reportado por la comunidad.
          </li>
        </ul>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">4. Uso aceptable</h2>
        <p className="text-ink-soft">No está permitido:</p>
        <ul className="space-y-1.5 text-ink-soft pl-5 list-disc">
          <li>Scraping automatizado masivo (excede los rate limits)</li>
          <li>Intentar acceder a áreas administrativas sin autorización</li>
          <li>Usar el servicio para distribuir malware o phishing</li>
          <li>Inflar artificialmente ratings, likes o estadísticas</li>
          <li>Suplantar a otros usuarios o entidades</li>
        </ul>
        <p className="text-ink-soft pt-2">
          El incumplimiento puede resultar en suspensión inmediata de la cuenta.
        </p>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">5. Limitación de responsabilidad</h2>
        <p className="text-ink-soft">
          PokéHub se proporciona "tal cual", sin garantías. Los datos del meta,
          análisis competitivos, sets sugeridos y cálculos de damage son
          orientativos. No garantizamos:
        </p>
        <ul className="space-y-1.5 text-ink-soft pl-5 list-disc">
          <li>Que el servicio esté siempre disponible (free tier hosting)</li>
          <li>Que los datos sean 100% exactos en todo momento</li>
          <li>Resultados específicos en torneos o ladders competitivos</li>
        </ul>
        <p className="text-ink-soft">
          No somos responsables de pérdidas, daños o decisiones tomadas en base
          a información de PokéHub. Consulta fuentes oficiales (Pokémon Showdown,
          Smogon, Pikalytics) para decisiones críticas.
        </p>
      </section>

      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold">6. Cambios y contacto</h2>
        <p className="text-ink-soft">
          Estos términos pueden actualizarse. Cambios significativos se notificarán
          en la home. El uso continuado tras cambios implica aceptación.
        </p>
        <p className="text-ink-soft">
          Dudas o reportes: contacto vía{' '}
          <a
            href={SITE.authorGithub}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-glow hover:text-brand-hover underline"
          >
            GitHub del autor
          </a>{' '}
          o issues del{' '}
          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-glow hover:text-brand-hover underline"
          >
            repositorio
          </a>.
        </p>
      </section>

      <section className="card-base p-6 space-y-2 text-xs text-ink-faint">
        <p>Última actualización: 2026-05-21</p>
        <p>
          Si Nintendo, Game Freak o The Pokémon Company solicitan retirar
          contenido específico, lo retiraremos inmediatamente.
        </p>
      </section>

      <div className="text-center pt-4 space-x-4">
        <Link
          href="/legal"
          className="text-sm text-brand-glow hover:text-brand-hover"
        >
          ← Política de privacidad
        </Link>
        <Link href="/" className="text-sm text-brand-glow hover:text-brand-hover">
          Volver al inicio →
        </Link>
      </div>
    </div>
  );
}
