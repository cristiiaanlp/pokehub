import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'group flex items-center gap-2.5 font-display font-bold tracking-tight',
        className
      )}
    >
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-red via-accent-red to-red-700 shadow-[0_0_20px_-4px_rgba(239,68,68,0.7)] group-hover:shadow-[0_0_30px_-4px_rgba(239,68,68,0.9)] transition-shadow" />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-bg-950" />
        <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-white border-[3px] border-bg-950" />
      </div>
      <div className="text-lg leading-none">
        Poké<span className="text-brand-glow">Hub</span>
      </div>
    </Link>
  );
}
