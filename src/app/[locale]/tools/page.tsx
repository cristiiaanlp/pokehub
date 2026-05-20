import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import {
  BoltIcon,
  ShieldIcon,
  SwordIcon,
  TargetIcon,
  TrendingUpIcon,
  BrainIcon,
  GridIcon,
  ArrowRight,
} from '@/components/ui/Icon';

export const metadata: Metadata = {
  title: 'Herramientas competitivas · PokéHub',
  description:
    'El toolkit más completo para preparar batallas Pokémon: damage calc, EV optimizer, team validator, stat calculator, AI coach y más.',
};

const TOOLS = [
  {
    href: '/coach',
    label: 'AI Coach',
    desc: 'Tu entrenador competitivo personal con Claude. En desarrollo — vuelve pronto.',
    Icon: BrainIcon,
    color: 'bg-brand/15 text-brand-glow',
    badge: 'SOON',
  },
  {
    href: '/tools/team-validator',
    label: 'Team Validator',
    desc: 'Comprueba si tu equipo es legal en VGC Reg G/H, OU, Ubers, Monotype.',
    Icon: ShieldIcon,
    color: 'bg-accent-green/15 text-accent-green',
    badge: 'NEW',
  },
  {
    href: '/tools/damage-calc',
    label: 'Damage Calculator',
    desc: 'Calcula daños exactos Gen 9 con todas las mecánicas (Tera, Booster, items).',
    Icon: SwordIcon,
    color: 'bg-accent-red/15 text-accent-red',
  },
  {
    href: '/tools/ev-optimizer',
    label: 'EV Optimizer',
    desc: 'Encuentra los EVs mínimos para outspeedear o resistir un golpe.',
    Icon: TargetIcon,
    color: 'bg-accent-yellow/15 text-accent-yellow',
    badge: 'NEW',
  },
  {
    href: '/tools/stat-calc',
    label: 'Stat Calculator',
    desc: 'Calcula stats finales con cualquier IV/EV/Nature/Level.',
    Icon: TrendingUpIcon,
    color: 'bg-purple-500/15 text-purple-300',
    badge: 'NEW',
  },
  {
    href: '/tools/speed-tier',
    label: 'Speed Tier Visualizer',
    desc: 'Quién outspeedea a quién. Ordenados por velocidad base + items.',
    Icon: BoltIcon,
    color: 'bg-accent-yellow/15 text-accent-yellow',
  },
  {
    href: '/tools/type-chart',
    label: 'Type Chart',
    desc: 'Tabla de efectividades interactiva 18×18 con filtros.',
    Icon: GridIcon,
    color: 'bg-brand/15 text-brand-glow',
    badge: 'NEW',
  },
  {
    href: '/tools/replay-analyzer',
    label: 'Replay Analyzer',
    desc: 'Pega un link de Showdown y obtén breakdown de la partida.',
    Icon: TrendingUpIcon,
    color: 'bg-accent-green/15 text-accent-green',
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramientas
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          El toolkit competitivo más completo
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Pokémon Showdown te deja jugar. PokéHub te deja{' '}
          <strong className="text-ink">prepararte para jugar</strong>.
          Calculadoras, validadores, optimizadores y un AI Coach. Todo gratis,
          sin login obligatorio.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="card-base card-hover p-5 group"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl ${t.color} inline-flex items-center justify-center shrink-0`}
              >
                <t.Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display font-bold">{t.label}</h2>
                  {t.badge && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-brand text-white">
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-dim mt-1 leading-relaxed">
                  {t.desc}
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
