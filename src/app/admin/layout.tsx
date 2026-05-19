import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Inter, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabase-server';
import { isAdminEmail, getAdminEmails } from '@/lib/admin';
import {
  ChartIcon,
  GridIcon,
  TrophyIcon,
  ShieldIcon,
  UsersIcon,
  SparklesIcon,
  BoltIcon,
  ClockIcon,
} from '@/components/ui/Icon';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Admin · PokéHub',
  description: 'Panel de administración interno.',
  robots: { index: false, follow: false },
};

const NAV = [
  { href: '/admin', label: 'Dashboard', Icon: ChartIcon },
  { href: '/admin/users', label: 'Usuarios', Icon: UsersIcon },
  { href: '/admin/teams', label: 'Teams públicos', Icon: GridIcon },
  { href: '/admin/featured', label: 'Destacados', Icon: TrophyIcon },
  { href: '/admin/announcements', label: 'Anuncios', Icon: SparklesIcon },
  { href: '/admin/audit', label: 'Audit log', Icon: ClockIcon },
  { href: '/admin/system', label: 'Sistema', Icon: BoltIcon },
  { href: '/admin/cache', label: 'Caché', Icon: ShieldIcon },
];

// Admin tiene su propio <html>/<body> porque está fuera de [locale].
// El panel es internal-only y siempre en español.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <AdminInner>{children}</AdminInner>
      </body>
    </html>
  );
}

async function AdminInner({ children }: { children: React.ReactNode }) {
  const sb = getSupabaseServer();
  if (!sb) {
    return (
      <Wrapper>
        <Alert tone="warn" title="Supabase no configurado">
          Añade <code>NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en las env vars para activar
          el panel.
        </Alert>
      </Wrapper>
    );
  }
  const { data } = await sb.auth.getUser();
  const email = data.user?.email ?? null;
  if (!email) {
    redirect('/login?next=/admin');
  }
  if (!isAdminEmail(email)) {
    return (
      <Wrapper>
        <Alert tone="error" title="Acceso denegado">
          Tu cuenta (<code>{email}</code>) no está en la lista de
          administradores. Configura <code>NEXT_PUBLIC_ADMIN_EMAILS</code> en
          las env vars y redeploya.
          {getAdminEmails().length === 0 && (
            <div className="mt-2 text-xs">
              ⚠️ Actualmente no hay ningún email de admin configurado.
            </div>
          )}
        </Alert>
      </Wrapper>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-10">
      <header className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-accent-yellow font-semibold mb-1">
              👑 Admin Panel
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Panel de administración
            </h1>
          </div>
          <div className="text-xs text-ink-faint">
            Sesión:{' '}
            <span className="text-ink font-mono">{email}</span>
          </div>
        </div>
        <nav className="mt-5 flex flex-wrap gap-1.5">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="inline-flex items-center gap-2 h-9 px-3 rounded-lg glass hover:bg-white/[0.08] text-sm font-semibold text-ink-soft hover:text-ink"
            >
              <n.Icon className="w-4 h-4" />
              {n.label}
            </Link>
          ))}
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 h-9 px-3 rounded-lg glass hover:bg-white/[0.08] text-xs text-ink-faint"
          >
            ← Volver al sitio público
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
      <div className="text-xs uppercase tracking-[0.25em] text-accent-yellow font-semibold mb-2">
        👑 Admin Panel
      </div>
      <h1 className="font-display text-3xl font-bold mb-6">Acceso restringido</h1>
      {children}
      <div className="mt-6">
        <TrophyIcon className="w-4 h-4 inline mr-1 text-ink-faint" />
        <Link href="/" className="text-sm text-brand-glow hover:text-brand-hover">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function Alert({
  tone,
  title,
  children,
}: {
  tone: 'warn' | 'error';
  title: string;
  children: React.ReactNode;
}) {
  const cls =
    tone === 'error'
      ? 'border-accent-red/30 bg-accent-red/5 text-accent-red'
      : 'border-accent-yellow/30 bg-accent-yellow/5 text-accent-yellow';
  return (
    <div className={`card-base p-5 border ${cls}`}>
      <h2 className="font-display font-bold mb-2">{title}</h2>
      <div className="text-sm text-ink-soft leading-relaxed">{children}</div>
    </div>
  );
}
