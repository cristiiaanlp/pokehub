import Link from 'next/link';
import { Logo } from './Logo';
import { SITE } from '@/lib/site';

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

          {SITE.kofiUsername && (
            <a
              href={`https://ko-fi.com/${SITE.kofiUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-sm shadow-[0_0_20px_-5px_rgba(244,114,182,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-transform"
            >
              <span>☕</span>
              Invitarme a un café
            </a>
          )}

          <div className="flex items-center gap-3 text-xs text-ink-faint pt-1">
            <a
              href={SITE.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink-soft inline-flex items-center gap-1"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
            <span>·</span>
            <Link href="/legal" className="hover:text-ink-soft">
              Licencia
            </Link>
          </div>
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
              <Link href="/typemaster" className="hover:text-ink">
                TypeMaster
              </Link>
            </li>
            <li>
              <Link href="/community/teams" className="hover:text-ink">
                Comunidad
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
            Fuentes de datos
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
            <li>
              <a
                href="https://www.smogon.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                Smogon ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.pikalytics.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                Pikalytics ↗
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
        © {new Date().getFullYear()} {SITE.name} · Hecho por{' '}
        <a
          href={SITE.authorGithub}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-ink-soft"
        >
          {SITE.author}
        </a>
      </div>
    </footer>
  );
}
