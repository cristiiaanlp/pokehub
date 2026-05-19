import { Skeleton } from '@/components/ui/Skeleton';

export default function MetaLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 space-y-8">
      <Skeleton className="h-48 rounded-3xl" />
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-96" />
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}
