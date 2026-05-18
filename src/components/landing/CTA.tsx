'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/Icon';

export function CTA() {
  return (
    <section className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[2rem] overflow-hidden p-10 lg:p-16 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-bg-900 to-accent-yellow/10" />
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-brand/40 via-transparent to-accent-yellow/30 [mask:linear-gradient(white,white)_content-box,linear-gradient(white,white)] p-px" />

          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-2xl mx-auto">
              ¿Listo para convertirte en{' '}
              <span className="gradient-text">campeón</span>?
            </h2>
            <p className="text-ink-soft mt-4 text-lg max-w-xl mx-auto">
              Empieza a construir tu próximo equipo en segundos. Sin registro
              obligatorio.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/team-builder">
                <Button size="lg" variant="gradient">
                  Crear mi primer equipo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pokedex">
                <Button size="lg" variant="secondary">
                  Explorar Pokédex
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
