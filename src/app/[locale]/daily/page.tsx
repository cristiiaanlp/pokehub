import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import {
  ChartIcon,
  GamepadIcon,
  ArrowRight,
  FireIcon,
  BrainIcon,
} from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Daily challenges · PokéHub',
  description:
    'Retos diarios Pokémon: ¿Quién es ese Pokémon?, PokéWordle, Meta Daily Quiz. Mantén tu racha.',
};

const DAILIES = [
  {
    href: '/daily/whos-that',
    label: '¿Quién es ese Pokémon?',
    desc: 'Adivina la silueta. Un Pokémon nuevo cada día. Suma intentos = más reto.',
    Icon: GamepadIcon,
    color: 'bg-brand/15 text-brand-glow',
    badge: 'NEW',
  },
  {
    href: '/daily/wordle',
    label: 'PokéWordle',
    desc: 'Adivina el nombre del Pokémon en 6 intentos. Verde = letra correcta, amarillo = mal sitio.',
    Icon: ChartIcon,
    color: 'bg-accent-yellow/15 text-accent-yellow',
    badge: 'NEW',
  },
  {
    href: '/typemaster/meta-daily',
    label: 'Meta Daily Quiz',
    desc: '8 preguntas sobre el meta competitivo actual. Pikalytics + Smogon en vivo.',
    Icon: FireIcon,
    color: 'bg-accent-red/15 text-accent-red',
  },
  {
    href: '/daily/trivia',
    label: 'Trivia competitiva',
    desc: '5 preguntas sobre stats, mecánicas, tipos e historia. Aprende mientras juegas.',
    Icon: BrainIcon,
    color: 'bg-purple-500/15 text-purple-300',
    badge: 'NEW',
  },
];

export default function DailyIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1 inline-flex items-center gap-1">
          <FireIcon className="w-3 h-3" />
          Daily challenges
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Reta tu memoria Pokémon
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Tres retos distintos cada día. Cada uno con su propia racha
          independiente. Vuelve mañana — nuevo Pokémon cada 24h.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {DAILIES.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="card-base card-hover p-5 group"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl ${d.color} inline-flex items-center justify-center shrink-0`}
              >
                <d.Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display font-bold">{d.label}</h2>
                  {d.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-brand text-white">
                      {d.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-dim mt-1 leading-relaxed">
                  {d.desc}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform mt-1 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
