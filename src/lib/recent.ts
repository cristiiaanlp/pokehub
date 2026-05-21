// Recently viewed Pokémon — tracking client-side.
//
// Cada visita a /pokedex/[id] añade el id al historial. Limit 8.
// Persiste en localStorage. Sincroniza entre tabs vía storage event.

const STORAGE_KEY = 'pokehub-recent-pokemon';
const MAX_ITEMS = 8;

export interface RecentEntry {
  id: number;
  name: string;
  ts: number;
}

export function getRecent(): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

export function addRecent(entry: { id: number; name: string }): RecentEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getRecent();
    // Dedupe — mover al inicio si ya estaba
    const filtered = existing.filter((e) => e.id !== entry.id);
    const next: RecentEntry[] = [
      { id: entry.id, name: entry.name, ts: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecent();
  }
}

export function clearRecent() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
