'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  SearchIcon,
  XIcon,
  GridIcon,
  GamepadIcon,
  UsersIcon,
  TrendingUpIcon,
  SparklesIcon,
  HeartIcon,
  HomeIcon,
  BookOpenIcon,
  TrophyIcon,
  TargetIcon,
  FireIcon,
  ChartIcon,
  BoltIcon,
} from '@/components/ui/Icon';
import {
  getPokedexIndex,
  hydrateTypesForIds,
  artworkFor,
} from '@/lib/pokeapi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import type { PokemonListItem } from '@/types/pokemon';
import { formatPokemonName, padId } from '@/lib/utils';

interface Action {
  id: string;
  label: string;
  hint?: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  keywords?: string;
  section: 'Navegación' | 'Casual' | 'TypeMaster' | 'Meta';
}

const ACTIONS: Action[] = [
  { id: 'home', label: 'Inicio', Icon: HomeIcon, href: '/', section: 'Navegación' },
  { id: 'pokedex', label: 'Pokédex', Icon: GridIcon, href: '/pokedex', keywords: 'lista pokemon', section: 'Navegación' },
  { id: 'team-builder', label: 'Team Builder', Icon: UsersIcon, href: '/team-builder', keywords: 'equipos crear amenazas heatmap', section: 'Navegación' },
  { id: 'speed-tier', label: 'Speed Tier Visualizer', Icon: BoltIcon, href: '/tools/speed-tier', keywords: 'velocidad ev nature scarf', section: 'Navegación' },
  { id: 'damage-calc', label: 'Damage Calculator', Icon: FireIcon, href: '/tools/damage-calc', keywords: 'damage calc calculadora ohko 2hko', section: 'Navegación' },
  { id: 'favorites', label: 'Favoritos', Icon: HeartIcon, href: '/favorites', section: 'Navegación' },
  { id: 'meta', label: 'Meta Hub', Icon: TrendingUpIcon, href: '/meta', keywords: 'smogon usage', section: 'Meta' },
  { id: 'champions', label: 'Pokémon Champions', Icon: FireIcon, href: '/meta/champions', keywords: 'reg ma', section: 'Meta' },
  { id: 'teams-explorer', label: 'Explorador de equipos (curados)', Icon: TrophyIcon, href: '/meta/teams', section: 'Meta' },
  { id: 'community-teams', label: 'Comunidad · Equipos compartidos', Icon: UsersIcon, href: '/community/teams', keywords: 'public publicos gallery galeria community', section: 'Meta' },
  { id: 'typemaster', label: 'TypeMaster', Icon: GamepadIcon, href: '/typemaster', section: 'TypeMaster' },
  { id: 'typemaster-play', label: 'Jugar TypeMaster · Beginner', Icon: GamepadIcon, href: '/typemaster/play?difficulty=beginner', section: 'TypeMaster' },
  { id: 'typemaster-pro', label: 'Jugar TypeMaster · Pro', Icon: FireIcon, href: '/typemaster/play?difficulty=pro', keywords: 'dificil', section: 'TypeMaster' },
  { id: 'typemaster-daily', label: 'Daily Challenge ⭐', Icon: SparklesIcon, href: '/typemaster/play?daily=1', section: 'TypeMaster' },
  { id: 'typemaster-meta-daily', label: 'Meta Daily Quiz 📊', Icon: ChartIcon, href: '/typemaster/meta-daily', keywords: 'meta diario pikalytics', section: 'TypeMaster' },
  { id: 'typemaster-learn', label: 'Modo Aprender tipos', Icon: BookOpenIcon, href: '/typemaster/learn', section: 'TypeMaster' },
  { id: 'typemaster-stats', label: 'Mis stats TypeMaster', Icon: ChartIcon, href: '/typemaster/stats', section: 'TypeMaster' },
  { id: 'typemaster-leaderboard', label: 'Leaderboard TypeMaster', Icon: TrophyIcon, href: '/typemaster/leaderboard', section: 'TypeMaster' },
  { id: 'casual', label: 'Modo Casual', Icon: SparklesIcon, href: '/casual', section: 'Casual' },
  { id: 'shiny', label: 'Shiny Tracker', Icon: SparklesIcon, href: '/casual/shiny', keywords: 'cazar shinies hunt', section: 'Casual' },
  { id: 'randomizer', label: 'Randomizer', Icon: GamepadIcon, href: '/casual/randomizer', keywords: 'random aleatorio', section: 'Casual' },
  { id: 'nuzlocke', label: 'Nuzlocke Helper', Icon: TargetIcon, href: '/casual/nuzlocke', section: 'Casual' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pool, setPool] = useState<PokemonListItem[]>([]);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Global Cmd/Ctrl+K + Esc shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Lazy-load Pokédex index when palette first opens
  useEffect(() => {
    if (!open || pool.length > 0) return;
    getPokedexIndex().then((idx) => setPool([...idx]));
  }, [open, pool.length]);

  // Focus input + reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlight(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Build result set
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    type Row =
      | { kind: 'action'; action: Action }
      | { kind: 'pokemon'; p: PokemonListItem };

    if (!q) {
      // No query: show all top actions
      return ACTIONS.map((a) => ({ kind: 'action' as const, action: a }));
    }

    const matchedActions = ACTIONS.filter((a) => {
      const hay = `${a.label} ${a.keywords ?? ''} ${a.section}`.toLowerCase();
      return hay.includes(q);
    }).map((a) => ({ kind: 'action' as const, action: a }));

    let pokes: Row[] = [];
    if (pool.length > 0) {
      if (/^\d+$/.test(q)) {
        pokes = pool
          .filter((p) => String(p.id).includes(q))
          .slice(0, 8)
          .map((p) => ({ kind: 'pokemon' as const, p }));
      } else {
        pokes = pool
          .filter((p) => p.name.includes(q))
          .slice(0, 8)
          .map((p) => ({ kind: 'pokemon' as const, p }));
      }
    }

    return [...matchedActions, ...pokes];
  }, [query, pool]);

  // Hydrate Pokémon types for currently visible result subset
  useEffect(() => {
    const ids = results
      .filter((r) => r.kind === 'pokemon')
      .map((r) => (r as { p: PokemonListItem }).p)
      .filter((p) => p.types.length === 0)
      .map((p) => p.id);
    if (ids.length) {
      hydrateTypesForIds(ids).then(() =>
        getPokedexIndex().then((idx) => setPool([...idx]))
      );
    }
  }, [results]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const run = (idx: number) => {
    const r = results[idx];
    if (!r) return;
    setOpen(false);
    if (r.kind === 'action') router.push(r.action.href);
    else router.push(`/pokedex/${r.p.id}`);
  };

  // Keyboard nav inside palette
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        run(highlight);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, highlight]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-idx="${highlight}"]`
    ) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-bg-950/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="fixed left-1/2 top-[12vh] -translate-x-1/2 w-[560px] max-w-[92vw] z-[61] rounded-2xl bg-bg-900 border border-white/[0.08] shadow-card-hover overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06]">
              <SearchIcon className="w-5 h-5 text-ink-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar Pokémon, ir a una sección, jugar TypeMaster…"
                className="flex-1 bg-transparent outline-none text-ink placeholder:text-ink-faint"
              />
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 h-6 rounded bg-white/[0.06] text-ink-faint inline-flex items-center">
                ESC
              </kbd>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="h-8 w-8 rounded-md hover:bg-white/[0.06] inline-flex items-center justify-center text-ink-faint"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-ink-dim">
                  Sin resultados. Prueba con otra cosa.
                </div>
              ) : (
                results.map((r, i) => {
                  const active = i === highlight;
                  if (r.kind === 'action') {
                    const a = r.action;
                    return (
                      <button
                        key={a.id}
                        data-idx={i}
                        onClick={() => run(i)}
                        onMouseEnter={() => setHighlight(i)}
                        className={`w-full text-left flex items-center gap-3 px-3 h-11 rounded-lg transition-colors ${
                          active
                            ? 'bg-brand/15 text-ink'
                            : 'text-ink-soft hover:bg-white/[0.04]'
                        }`}
                      >
                        <a.Icon className="w-4 h-4 shrink-0 text-ink-faint" />
                        <span className="flex-1 truncate text-sm font-medium">
                          {a.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-ink-faint">
                          {a.section}
                        </span>
                      </button>
                    );
                  }
                  const p = r.p;
                  return (
                    <button
                      key={`p-${p.id}`}
                      data-idx={i}
                      onClick={() => run(i)}
                      onMouseEnter={() => setHighlight(i)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? 'bg-brand/15 text-ink'
                          : 'text-ink-soft hover:bg-white/[0.04]'
                      }`}
                    >
                      <img
                        src={artworkFor(p.id)}
                        alt={p.name}
                        className="w-8 h-8 object-contain shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = p.sprite;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {formatPokemonName(p.name)}
                        </div>
                        <div className="flex gap-1 mt-0.5">
                          {p.types.map((t) => (
                            <TypeBadge key={t} type={t} size="xs" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-ink-faint">
                        #{padId(p.id)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t border-white/[0.06] px-4 h-9 flex items-center justify-between text-[10px] text-ink-faint">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 h-4 inline-flex items-center rounded bg-white/[0.06] font-mono">↑↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 h-4 inline-flex items-center rounded bg-white/[0.06] font-mono">↵</kbd>
                  ir
                </span>
              </div>
              <span className="font-mono">
                {results.length} resultado{results.length === 1 ? '' : 's'}
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
