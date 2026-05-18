// Smogon usage stats parser + fetcher with Next.js ISR cache.
// Reads from https://www.smogon.com/stats/YYYY-MM/<format>-<elo>.txt
// Falls back to previous months if current isn't published yet.

export interface SmogonEntry {
  rank: number;
  name: string;
  usagePct: number;
  rawCount: number;
  rawPct: number;
}

export interface SmogonStats {
  format: string;
  elo: number;
  month: string; // YYYY-MM
  totalBattles: number;
  entries: SmogonEntry[];
}

const BASE = 'https://www.smogon.com/stats';

// 24h ISR; falls back through 3 months looking for available data
const REVALIDATE = 60 * 60 * 24;

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function previousMonth(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  return monthKey(d);
}

function parseStats(text: string, format: string, elo: number, month: string): SmogonStats {
  const lines = text.split('\n');
  const entries: SmogonEntry[] = [];
  let totalBattles = 0;

  for (const line of lines) {
    const battlesMatch = line.match(/Total battles:\s*(\d+)/i);
    if (battlesMatch) totalBattles = Number(battlesMatch[1]);

    // Match: | 1    | Great Tusk         | 32.91750% | 632915 | 27.870% | 499694 | 27.846% |
    const row = line.match(
      /^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([\d.]+)%\s*\|\s*(\d+)\s*\|\s*([\d.]+)%\s*\|/
    );
    if (row) {
      entries.push({
        rank: Number(row[1]),
        name: row[2].trim(),
        usagePct: Number(row[3]),
        rawCount: Number(row[4]),
        rawPct: Number(row[5]),
      });
    }
  }

  return { format, elo, month, totalBattles, entries };
}

async function tryFetch(format: string, elo: number, month: string): Promise<SmogonStats | null> {
  const url = `${BASE}/${month}/${format}-${elo}.txt`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.length < 200) return null;
    const parsed = parseStats(text, format, elo, month);
    return parsed.entries.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

// Try last 4 months until we find data. Returns null if nothing available.
export async function getUsageStats(
  format: string = 'gen9ou',
  elo: number = 1500
): Promise<SmogonStats | null> {
  let month = monthKey(new Date());
  // Start from previous month (current month likely not published yet)
  month = previousMonth(month);
  for (let i = 0; i < 4; i++) {
    const data = await tryFetch(format, elo, month);
    if (data) return data;
    month = previousMonth(month);
  }
  return null;
}

// Available competitive formats with friendly labels
export const SMOGON_FORMATS: { id: string; label: string; description: string; elo: number }[] = [
  { id: 'gen9ou', label: 'OU', description: 'OverUsed · el formato singles más popular', elo: 1500 },
  { id: 'gen9uu', label: 'UU', description: 'UnderUsed · tier por debajo de OU', elo: 1500 },
  { id: 'gen9ubers', label: 'Ubers', description: 'Legendarios y míticos permitidos', elo: 1500 },
  { id: 'gen9vgc2025regi', label: 'VGC 2025', description: 'Formato oficial doubles', elo: 1500 },
  { id: 'gen9doublesou', label: 'Doubles OU', description: 'Doubles competitivo', elo: 1500 },
];
