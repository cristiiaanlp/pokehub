'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, SparklesIcon } from '@/components/ui/Icon';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

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
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Cloud save de equipos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Favoritos sincronizados
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
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

          {!isSupabaseConfigured && (
            <div className="mb-5 p-3 rounded-xl bg-accent-yellow/10 border border-accent-yellow/20 text-xs text-accent-yellow flex items-start gap-2">
              <SparklesIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Supabase no está configurado todavía. Rellena{' '}
                <code className="font-mono bg-black/30 px-1.5 py-0.5 rounded">
                  .env.local
                </code>{' '}
                para activar auth real. Mientras tanto, tus equipos y favoritos
                viven en tu navegador.
              </span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(
                'Auth real se activa cuando configures Supabase en .env.local'
              );
            }}
            className="space-y-3"
          >
            {mode === 'signup' && (
              <Input placeholder="Nombre" type="text" required />
            )}
            <Input placeholder="Correo electrónico" type="email" required />
            <Input placeholder="Contraseña" type="password" required />
            <Button variant="primary" size="md" className="w-full">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-sm text-ink-dim mt-5">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-brand-glow hover:text-brand-hover font-semibold"
                >
                  Crear una
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => setMode('login')}
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
