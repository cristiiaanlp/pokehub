# PokéHub

Plataforma todo-en-uno para entrenadores Pokémon — **competitivos y casuales**. Pokédex moderna, Team Builder con análisis en vivo, Meta Hub con datos reales de Smogon + Pikalytics, soporte completo Pokémon Champions Reg M-A, y TypeMaster: el minijuego con XP y rangos para dominar la tabla de tipos.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · Zustand · Supabase (preparado). Datos vía [PokéAPI](https://pokeapi.co), [Smogon](https://smogon.com/stats) y [Pikalytics](https://www.pikalytics.com).

## 🚀 Empezar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 🌐 Deploy a Vercel

1. Push este repo a GitHub
2. Importa el proyecto en [vercel.com/new](https://vercel.com/new) — detecta Next.js automáticamente
3. Variables de entorno (opcional, ver `.env.local.example`):
   - `NEXT_PUBLIC_SITE_URL` — tu dominio (`https://pokehub.app`)
   - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — para auth y cloud save
   - `ANTHROPIC_API_KEY` — para activar IA Pokémon en `/api/recommend`
4. Deploy — el `vercel.json` ya configura headers de seguridad y caché

Las páginas de meta hacen ISR de 24h, así que se actualizan solas. Sin cron jobs necesarios.

## 📋 Rutas

| Ruta                       | Qué hay                                                                       |
| -------------------------- | ----------------------------------------------------------------------------- |
| `/`                        | Landing con hero, banner Champions, features y CTA                            |
| `/pokedex`                 | Grid de 1025+ Pokémon, búsqueda, filtros, infinite scroll                    |
| `/pokedex/[id]`            | Detalle: stats, moves, tipos, evolución, sets, counters, **live Pikalytics** |
| `/team-builder`            | Slots, picker, análisis defensivo/ofensivo, save/load                         |
| `/meta`                    | Smogon usage real (OU/UU/Ubers/VGC/Doubles) · ISR 24h                         |
| `/meta/champions`          | Hub Pokémon Champions Reg M-A · top usage, core pairs, equipos del ladder    |
| `/meta/teams`              | Explorador de equipos con filtros y export Showdown                           |
| `/typemaster`              | Hub del minijuego: modos, XP bar, badges, daily challenge                     |
| `/typemaster/play`         | Quiz interactivo con timer, combo, sonido, atajos de teclado                  |
| `/typemaster/learn`        | Modo aprender · 18 cartas tipo con ejemplos                                   |
| `/typemaster/stats`        | Stats personales: precisión, tipos fallados, histórico                        |
| `/typemaster/leaderboard`  | Rankings global / semanal / combos / velocidad                                |
| `/casual`                  | Hub casual                                                                    |
| `/casual/shiny`            | Shiny Tracker: hunts, odds en vivo, galería de capturados                     |
| `/casual/randomizer`       | Random Pokémon, equipos, monotipo, starter, nuzlocke challenge                |
| `/casual/nuzlocke`         | Nuzlocke Helper: runs, encuentros, deaths, medallas                           |
| `/favorites`               | Pokémon marcados                                                              |
| `/login`                   | Auth (Supabase preparado)                                                     |
| `/api/recommend`           | LLM endpoint para counters/sets/teams generados por IA                        |

## 🔌 Variables de entorno

Copia `.env.local.example` a `.env.local`:

```bash
# Dominio publicado — usado en sitemap, OG, manifest
NEXT_PUBLIC_SITE_URL=https://pokehub.vercel.app

# Supabase (auth + cloud save) — opcional
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Anthropic API — opcional, activa /api/recommend
ANTHROPIC_API_KEY=
```

## 📊 Datos reales y auto-actualización

| Sección                          | Fuente                                 | Refresh         |
| -------------------------------- | -------------------------------------- | --------------- |
| Pokédex                          | PokéAPI                                | 24h cache       |
| `/meta` usage stats              | Smogon `/stats/YYYY-MM/*.txt`          | 24h ISR         |
| `/meta/champions` partners/teams | Pikalytics `/ai/pokedex/...` markdown  | 24h ISR         |
| `/pokedex/[id]` tab Live         | Pikalytics per-Pokémon                 | 24h ISR         |
| Champions usage % / core pairs   | Curado (Pokémon Zone, ChampionsMeta)   | Snapshot manual |

Smogon publica un mes nuevo cada ~30 días — la app detecta y migra automáticamente. Pikalytics actualiza semanalmente. Pokémon Champions usage % está curado a mayo 2026; se actualizará cuando salga Reg M-B.

## 🛠️ Tablas Supabase (cuando conectes)

```sql
create table teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  format text,
  members jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table favorites (
  user_id uuid references auth.users not null,
  pokemon_id int not null,
  created_at timestamptz default now(),
  primary key (user_id, pokemon_id)
);
```

## 🎮 Modo Casual completo

- **Shiny Tracker** — Calcula odds según método (Full Odds, Masuda, SV Outbreak con 30/60 KOs, PokéRadar, SOS chain...). Probabilidad acumulada en vivo. Galería shiny.
- **Randomizer** — Random Pokémon, equipo de 6, monotipo, starter, challenge nuzlocke con reglas + twist.
- **Nuzlocke Helper** — Multi-run. Per-route encounters con estado (equipo/caja/muerto/huido). 8 medallas, 7 cláusulas configurables.

## 🤖 IA Pokémon (preparada)

`POST /api/recommend` con `{intent: 'team'|'counter'|'set'|'analysis', pokemon?, format?}`. Devuelve 501 hasta que pongas `ANTHROPIC_API_KEY`. Sistema preparado con Claude Sonnet 4.6 + cache de prompts.

## ⚙️ Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## ☕ Soporte

Si esta app te resulta útil y quieres apoyar el desarrollo, puedes invitarme a un café:

- [Ko-fi · cristiiaanlp](https://ko-fi.com/cristiiaanlp) *(activo cuando el username esté configurado en `src/lib/site.ts`)*
- ⭐ Una estrella en el [repo de GitHub](https://github.com/cristiiaanlp/pokehub) también ayuda

## 📄 Licencia

PokéHub está bajo una **Source-Available License** personalizada. Resumen:

- ✓ Puedes leer, estudiar, forkear y correr una copia personal no comercial
- ✓ Puedes contribuir vía Pull Request
- ✗ NO puedes hostear una versión comercial sin permiso escrito
- ✗ NO puedes quitar la atribución al autor
- ✗ NO puedes revender ni sublicenciar el código

Lee la [LICENSE completa](LICENSE) para detalles. Para licencias comerciales contacta a través de [GitHub](https://github.com/cristiiaanlp).

### Sobre Pokémon

Pokémon y todas las marcas relacionadas son © Nintendo / Game Freak / The Pokémon Company. PokéHub es un proyecto fan no oficial, sin afiliación con esas entidades. Los datos provienen de fuentes públicas (PokéAPI, Smogon, Pikalytics).
