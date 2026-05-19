// Server-renderable support methods. Reads SITE config statically — no client
// state needed. Cards use plain CSS hover transitions instead of framer-motion
// so this can pre-render at build time inside server components like /support.
import { SITE } from '@/lib/site';
import { ArrowRight } from '@/components/ui/Icon';

export interface SupportMethodsProps {
  /** Compact = single Ko-fi button only; full = grid of every configured method */
  variant?: 'compact' | 'full';
  className?: string;
}

interface MethodCard {
  id: string;
  label: string;
  description: string;
  href: string;
  emoji: string;
  bg: string;
  border: string;
}

function buildMethods(): MethodCard[] {
  const s = SITE.support;
  const out: MethodCard[] = [];
  if (s.kofiUsername) {
    out.push({
      id: 'kofi',
      label: 'Ko-fi',
      description: 'Donación única o mensual. Pago vía PayPal o tarjeta.',
      href: `https://ko-fi.com/${s.kofiUsername}`,
      emoji: '☕',
      bg: 'from-pink-500/20 to-orange-400/10',
      border: 'border-pink-400/30',
    });
  }
  if (s.githubSponsors) {
    out.push({
      id: 'gh',
      label: 'GitHub Sponsors',
      description: 'Sponsor mensual desde GitHub. 0% comisión el primer año.',
      href: `https://github.com/sponsors/${s.githubSponsors}`,
      emoji: '🐙',
      bg: 'from-violet-500/20 to-purple-400/10',
      border: 'border-violet-400/30',
    });
  }
  if (s.paypalMe) {
    out.push({
      id: 'paypal',
      label: 'PayPal',
      description: 'Donación directa por PayPal. Sin intermediarios.',
      href: `https://paypal.me/${s.paypalMe}`,
      emoji: '💸',
      bg: 'from-blue-500/20 to-cyan-400/10',
      border: 'border-blue-400/30',
    });
  }
  if (s.stripeLink) {
    out.push({
      id: 'stripe',
      label: 'Tarjeta directa',
      description: 'Pago seguro con tarjeta vía Stripe Checkout.',
      href: s.stripeLink,
      emoji: '💳',
      bg: 'from-emerald-500/20 to-teal-400/10',
      border: 'border-emerald-400/30',
    });
  }
  return out;
}

export function SupportMethods({ variant = 'full', className }: SupportMethodsProps) {
  const methods = buildMethods();
  if (methods.length === 0) return null;

  if (variant === 'compact') {
    const primary = methods[0];
    return (
      <a
        href={primary.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-sm shadow-[0_0_20px_-5px_rgba(244,114,182,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-transform ${
          className ?? ''
        }`}
      >
        <span>{primary.emoji}</span>
        Invitarme a un {primary.label === 'Ko-fi' ? 'café' : primary.label}
      </a>
    );
  }

  return (
    <div className={`grid sm:grid-cols-2 gap-3 ${className ?? ''}`}>
      {methods.map((m) => (
        <a
          key={m.id}
          href={m.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative overflow-hidden block rounded-2xl border ${m.border} p-5 transition-transform hover:scale-[1.02]`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${m.bg} pointer-events-none`} />
          <div className="relative flex items-center gap-4">
            <div className="text-4xl shrink-0">{m.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg font-bold">{m.label}</div>
              <div className="text-xs text-ink-soft leading-relaxed">
                {m.description}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-faint group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </a>
      ))}
    </div>
  );
}

export function hasAnySupportMethod(): boolean {
  const s = SITE.support;
  return Boolean(s.kofiUsername || s.githubSponsors || s.paypalMe || s.stripeLink);
}
