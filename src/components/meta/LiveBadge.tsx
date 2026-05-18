'use client';

import { useEffect, useState } from 'react';

interface Props {
  source: string;
  dataDate?: string;
  fetchedAt: string;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'hace unos segundos';
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

export function LiveBadge({ source, dataDate, fetchedAt }: Props) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-accent-green/15 text-accent-green text-xs font-semibold"
      title={`Datos servidos desde ${source} — generados ${new Date(fetchedAt).toLocaleString()}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
      </span>
      LIVE · {source}
      {dataDate && (
        <>
          <span className="opacity-60">·</span>
          <span className="font-mono">{dataDate}</span>
        </>
      )}
      <span className="opacity-60">·</span>
      <span className="font-mono">{timeAgo(fetchedAt)}</span>
    </div>
  );
}
