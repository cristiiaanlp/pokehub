import Link from 'next/link';
import { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { SupportMethods, hasAnySupportMethod } from '@/components/support/SupportMethods';
import {
  ArrowRight,
  SparklesIcon,
  CheckIcon,
  HeartIcon,
} from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Apoyar PokéHub',
  description:
    'PokéHub se mantiene con donaciones. Ko-fi, GitHub Sponsors, PayPal — elige cómo apoyar el desarrollo de la app.',
};

export default function SupportPage() {
  const hasMethods = hasAnySupportMethod();
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 lg:py-14 space-y-10">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-accent-yellow font-semibold mb-2 flex items-center gap-1.5">
          <HeartIcon className="w-3.5 h-3.5" />
          Apoyar el proyecto
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
          PokéHub se mantiene con{' '}
          <span className="gradient-text">cariño y café</span>
        </h1>
        <p className="text-ink-soft mt-4 leading-relaxed">
          Es un proyecto fan, gratis y sin ánimo de lucro hecho por una persona
          en sus ratos libres. No hay anuncios, no se venden datos. Si la app te
          parece útil y quieres que siga creciendo, puedes invitarme a un café —
          literal o metafóricamente.
        </p>
      </div>

      {/* Why */}
      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-accent-yellow" />
          ¿En qué se va el dinero?
        </h2>
        <ul className="space-y-2.5 text-sm text-ink-soft">
          {[
            'Hosting en Vercel (gratis hasta cierto tráfico, después escala)',
            'Cache de PokéAPI / Smogon / Pikalytics (lectura intensiva con auto-update)',
            'API de Anthropic Claude para futuras features de IA Pokémon',
            'Dominio propio cuando crezca',
            'Tiempo invertido construyendo nuevas herramientas sin meter publicidad',
          ].map((reason) => (
            <li key={reason} className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        {SITE.support.monthlyGoalLabel && SITE.support.monthlyGoalEur > 0 && (
          <div className="mt-4 pt-4 border-t border-white/[0.05]">
            <div className="text-[10px] uppercase tracking-widest text-ink-faint font-bold mb-1.5">
              Meta mensual
            </div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm font-semibold">
                {SITE.support.monthlyGoalLabel}
              </span>
              <span className="text-xs text-ink-faint font-mono">
                €{SITE.support.monthlyGoalEur} / mes
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-yellow to-orange-500"
                style={{ width: '0%' }}
                title="Activa Ko-fi Gold para tracking real automático"
              />
            </div>
            <div className="text-[10px] text-ink-faint mt-1">
              El progreso real se sincroniza desde Ko-fi cuando actives su widget.
            </div>
          </div>
        )}
      </section>

      {/* Methods */}
      {hasMethods ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold">Cómo apoyar</h2>
          <SupportMethods variant="full" />
          <p className="text-[11px] text-ink-faint pt-1">
            Sin ataduras. Cancela en cualquier momento. Si donas, te
            agradeceré mucho — pero usar PokéHub sin donar también está
            totalmente bien.
          </p>
        </section>
      ) : (
        <section className="card-base p-6 text-center text-ink-dim text-sm">
          Las donaciones aún no están activas. El autor de la app está
          terminando de configurar Ko-fi.
        </section>
      )}

      {/* Other ways */}
      <section className="card-base p-6 space-y-3">
        <h2 className="font-display text-lg font-bold">
          Otras formas de ayudar (gratis)
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <a
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="block glass rounded-xl p-3 hover:bg-white/[0.06]"
          >
            <div className="text-xl mb-1">⭐</div>
            <div className="font-bold">Dale estrella en GitHub</div>
            <div className="text-xs text-ink-dim mt-0.5">
              Cada estrella ayuda en visibilidad y motiva un montón.
            </div>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              'Acabo de descubrir PokéHub, la mejor plataforma todo-en-uno para entrenadores Pokémon: '
            )}${encodeURIComponent(SITE.url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block glass rounded-xl p-3 hover:bg-white/[0.06]"
          >
            <div className="text-xl mb-1">📣</div>
            <div className="font-bold">Compártelo en redes</div>
            <div className="text-xs text-ink-dim mt-0.5">
              Twitter / X, Discord, r/pokemon. Trae usuarios reales.
            </div>
          </a>
          <a
            href={`${SITE.repo}/issues`}
            target="_blank"
            rel="noopener noreferrer"
            className="block glass rounded-xl p-3 hover:bg-white/[0.06]"
          >
            <div className="text-xl mb-1">🐛</div>
            <div className="font-bold">Reporta bugs</div>
            <div className="text-xs text-ink-dim mt-0.5">
              Abrir issues con bugs o ideas vale oro.
            </div>
          </a>
          <Link
            href="/team-builder"
            className="block glass rounded-xl p-3 hover:bg-white/[0.06]"
          >
            <div className="text-xl mb-1">🔗</div>
            <div className="font-bold">Comparte tu equipo</div>
            <div className="text-xs text-ink-dim mt-0.5">
              Cuando compartes un team de PokéHub, traes gente nueva.
            </div>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Preguntas frecuentes</h2>
        <FaqItem
          q="¿Donar me da algo a cambio?"
          a="Hoy, solo mi gratitud y la satisfacción de mantener vivo el proyecto. En el futuro habrá perks (acceso anticipado a IA, temas premium) pero la idea es que las features core sigan siendo gratuitas para todos."
        />
        <FaqItem
          q="¿Es seguro pagar por Ko-fi / PayPal?"
          a="Sí. Yo nunca veo tus datos de tarjeta — los procesa la plataforma. Ko-fi acepta PayPal o Stripe, ambos con cifrado bancario estándar."
        />
        <FaqItem
          q="¿Puedo cancelar una donación recurrente?"
          a="Sí, en cualquier momento desde la configuración de tu cuenta Ko-fi / GitHub Sponsors. No hay penalización ni preguntas."
        />
        <FaqItem
          q="¿Qué pasa si Nintendo cierra el proyecto?"
          a="Es un riesgo real (PokéHub es un proyecto fan no afiliado). Si pasa, devuelvo cualquier donación reciente. Lo que recibí antes lo invertí en hosting, ya no se puede recuperar — pero seré transparente."
        />
      </section>

      <div className="text-center pt-6">
        <Link
          href="/"
          className="text-sm text-ink-faint hover:text-ink"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="card-base p-4 group">
      <summary className="cursor-pointer flex items-center justify-between gap-3 font-semibold text-sm">
        <span>{q}</span>
        <ArrowRight className="w-4 h-4 text-ink-faint group-open:rotate-90 transition-transform" />
      </summary>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed">{a}</p>
    </details>
  );
}
