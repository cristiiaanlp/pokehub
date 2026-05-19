'use client';

import { useState, useEffect, Suspense } from 'react';
import { Link } from '@/i18n/routing';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ArrowRight,
  SparklesIcon,
  CheckIcon,
} from '@/components/ui/Icon';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase-browser';
import { useAuth } from '@/components/auth/AuthProvider';

// Solo permitimos paths relativos al propio dominio para prevenir open redirects.
// Bloqueamos: "//evil.com", "https://evil.com", "javascript:...", "data:...".
function sanitizeNext(raw: string | null): string {
  if (!raw) return '/';
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//')) return '/';
  // Bloquea cualquier protocolo embebido por si acaso
  if (/^\/+\w+:/.test(raw)) return '/';
  return raw;
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const next = sanitizeNext(searchParams.get('next'));
  const initialMode = (searchParams.get('mode') as 'login' | 'signup') ?? 'login';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  // Already logged in → redirect away from /login
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(next);
    }
  }, [user, authLoading, next, router]);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setError(
        'Supabase no está configurado. Añade NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tus variables de entorno.'
      );
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
              next
            )}`,
            data: name.trim() ? { full_name: name.trim() } : undefined,
          },
        });
        if (err) {
          setError(translateError(err.message));
        } else if (data.user && !data.session) {
          // Email confirmation required (Supabase default for new projects)
          setNeedsConfirm(true);
        } else if (data.session) {
          // Auto-confirmed (email confirmation disabled in Supabase project)
          router.push(next);
          router.refresh();
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) {
          setError(translateError(err.message));
        } else {
          router.push(next);
          router.refresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Introduce tu correo primero.');
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });
    setLoading(false);
    if (err) setError(translateError(err.message));
    else setInfo(`Hemos enviado un enlace mágico a ${email}. Revisa tu correo.`);
  };

  if (needsConfirm) {
    return (
      <ConfirmEmailScreen
        email={email}
        onBack={() => setNeedsConfirm(false)}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] grid lg:grid-cols-2">
      {/* Left side */}
      <div className="hidden lg:flex relative overflow-hidden items-center p-12">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] bg-brand/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-yellow/10 blur-3xl rounded-full" />
        <div className="relative max-w-md space-y-6">
          <Logo />
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
            Tu cuenta. Tus equipos.{' '}
            <span className="gradient-text">En todos lados.</span>
          </h1>
          <p className="text-ink-soft leading-relaxed">
            Guarda equipos en la nube, sincroniza favoritos entre dispositivos y
            accede a herramientas premium próximamente.
          </p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-accent-green" />
              Cloud save de equipos
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-accent-green" />
              Favoritos sincronizados
            </li>
            <li className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-accent-yellow" />
              Acceso anticipado a IA Pokémon (próximamente)
            </li>
          </ul>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md card-base p-8"
        >
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h2>
            <p className="text-sm text-ink-dim mt-1">
              {mode === 'login'
                ? 'Inicia sesión para acceder a tus equipos.'
                : 'Empieza a guardar equipos y favoritos en la nube.'}
            </p>
          </div>

          {!configured && (
            <div className="mb-5 p-3 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 text-xs text-accent-yellow flex items-start gap-2">
              <SparklesIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Supabase no está configurado. Añade{' '}
                <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{' '}
                y{' '}
                <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{' '}
                a tu entorno.
              </span>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-sm text-accent-red"
              >
                {error}
              </motion.div>
            )}
            {info && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-accent-green/10 border border-accent-green/30 text-sm text-accent-green"
              >
                {info}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <Input
                placeholder="Nombre (opcional)"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              placeholder="Correo electrónico"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Contraseña (mínimo 6 caracteres)"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === 'signup' ? 'new-password' : 'current-password'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              variant="primary"
              size="md"
              className="w-full"
              loading={loading}
              disabled={!configured || loading}
            >
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {mode === 'login' && configured && (
            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full mt-2 text-xs text-brand-glow hover:text-brand-hover disabled:opacity-50"
              type="button"
            >
              ¿Olvidaste la contraseña? · Recibe un enlace mágico
            </button>
          )}

          <div className="text-center text-sm text-ink-dim mt-5">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-brand-glow hover:text-brand-hover font-semibold"
                >
                  Crear una
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-brand-glow hover:text-brand-hover font-semibold"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/pokedex"
              className="text-xs text-ink-faint hover:text-ink-dim"
            >
              Continuar sin cuenta →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ConfirmEmailScreen({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="card-base p-8 max-w-md text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-accent-green/15 text-accent-green inline-flex items-center justify-center mb-4">
          <CheckIcon className="w-8 h-8" />
        </div>
        <h2 className="font-display text-2xl font-bold">Revisa tu correo</h2>
        <p className="text-ink-dim text-sm mt-2 leading-relaxed">
          Hemos enviado un enlace de confirmación a{' '}
          <span className="text-ink font-semibold break-all">{email}</span>.
          Click en el enlace para activar tu cuenta y entrar.
        </p>
        <p className="text-ink-faint text-xs mt-4">
          ¿No te llega? Revisa la carpeta de spam o confirma el correo
          escrito.
        </p>
        <button
          onClick={onBack}
          className="mt-6 text-sm text-brand-glow hover:text-brand-hover font-semibold"
        >
          ← Volver al formulario
        </button>
      </motion.div>
    </div>
  );
}

/** Convert Supabase error strings to friendlier Spanish. */
function translateError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials'))
    return 'Email o contraseña incorrectos.';
  if (lower.includes('email not confirmed'))
    return 'Tienes que confirmar tu correo antes de entrar. Revisa tu bandeja.';
  if (lower.includes('user already registered'))
    return 'Ya hay una cuenta con ese correo. Prueba a iniciar sesión.';
  if (lower.includes('password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (lower.includes('rate limit'))
    return 'Demasiados intentos. Espera un minuto antes de reintentar.';
  if (lower.includes('signups not allowed'))
    return 'Los registros están desactivados en este servidor.';
  return msg;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
