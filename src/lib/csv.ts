// Helper para generar CSV client-side y disparar descarga.
// RFC 4180-ish: comillas dobles para valores con comas/comillas/saltos, escape
// de comillas doblándolas, CRLF entre filas.

export type CsvValue = string | number | boolean | null | undefined;

export interface CsvColumn<T> {
  header: string;
  // Función que extrae el valor desde el item. Puede devolver Date, number, etc.
  get: (item: T) => CsvValue | Date;
}

function escapeCell(raw: CsvValue | Date): string {
  if (raw === null || raw === undefined) return '';
  let v: string;
  if (raw instanceof Date) {
    v = raw.toISOString();
  } else if (typeof raw === 'boolean') {
    v = raw ? 'true' : 'false';
  } else {
    v = String(raw);
  }
  // Solo escapamos si contiene caracteres problemáticos.
  if (/[,"\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function toCsv<T>(items: T[], columns: CsvColumn<T>[]): string {
  const lines: string[] = [];
  lines.push(columns.map((c) => escapeCell(c.header)).join(','));
  for (const item of items) {
    lines.push(columns.map((c) => escapeCell(c.get(item))).join(','));
  }
  // BOM UTF-8 para que Excel detecte la codificación correctamente.
  return '﻿' + lines.join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Liberar memoria tras unos segundos (Safari necesita el url un poco).
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
