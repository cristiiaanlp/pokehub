import { Skeleton } from '@/components/ui/Skeleton';

export default function ChampionsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <Skeleton className="h-64 rounded-3xl" />
      <div className="grid lg:grid-cols-2 gap-5">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
