import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(s: string) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatPokemonName(name: string) {
  return name
    .split('-')
    .map(capitalize)
    .join(' ')
    .replace(/\bMr\b/i, 'Mr.')
    .replace(/\bJr\b/i, 'Jr.');
}

export function padId(id: number, width = 4) {
  return String(id).padStart(width, '0');
}

export function formatHeightMeters(decimeters: number) {
  return (decimeters / 10).toFixed(1) + ' m';
}

export function formatWeightKg(hectograms: number) {
  return (hectograms / 10).toFixed(1) + ' kg';
}

export function statColor(value: number) {
  if (value >= 130) return 'from-emerald-400 to-emerald-500';
  if (value >= 100) return 'from-green-400 to-green-500';
  if (value >= 80) return 'from-lime-400 to-lime-500';
  if (value >= 60) return 'from-yellow-400 to-yellow-500';
  if (value >= 40) return 'from-orange-400 to-orange-500';
  return 'from-red-400 to-red-500';
}

export function bst(stats: {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}) {
  return (
    stats.hp +
    stats.attack +
    stats.defense +
    stats.specialAttack +
    stats.specialDefense +
    stats.speed
  );
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 200) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function range(start: number, end: number) {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}
