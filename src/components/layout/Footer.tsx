import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.05] bg-bg-900/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 lg:grid-cols-4">
        <div className="lg:col-span-2 space-y-4">
          <Logo />
          <p className="text-sm text-ink-dim max-w-md leading-relaxed">
            La plataforma definitiva todo-en-uno para entrenadores Pokémon
            modernos. Datos de PokéAPI. Hecho con cariño para la comunidad.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink-faint font-semibold mb-3">
            Producto
          </h4>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>
              <Link href="/pokedex" className="hover:text-ink">
                Pokédex
              </Link>
            </li>
            <li>
              <Link href="/team-builder" className="hover:text-ink">
                Team Builder
              </Link>
            </li>
            <li>
              <Link href="/meta" className="hover:text-ink">
                Meta Hub
              </Link>
            </li>
            <li>
              <Link href="/casual" className="hover:text-ink">
                Modo Casual
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-ink-faint font-semibold mb-3">
            Datos
          </h4>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>
              <a
                href="https://pokeapi.co"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                PokéAPI ↗
              </a>
            </li>
            <li className="text-ink-faint text-xs leading-relaxed pt-2">
              Pokémon y todas las marcas relacionadas son © Nintendo / Game
              Freak. PokéHub es un proyecto fan no oficial.
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/[0.04] py-5 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} PokéHub · Built for trainers
      </div>
    </footer>
  );
}
