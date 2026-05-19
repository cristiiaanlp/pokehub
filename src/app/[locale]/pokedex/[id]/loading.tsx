import { Skeleton } from '@/components/ui/Skeleton';

export default function PokemonLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-12">
      <div className="rounded-[2rem] glass p-6 sm:p-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <Skeleton className="w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}
