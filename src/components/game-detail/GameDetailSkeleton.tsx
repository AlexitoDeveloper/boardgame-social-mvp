import { Skeleton } from '@/components/ui/skeleton'

export function GameDetailSkeleton() {
  return (
    <div className="relative min-h-dvh pb-24 space-y-6 animate-pulse select-none">
      {/* Top navigation placeholder */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-2 -mx-4 px-4 md:-mx-8 md:px-8 bg-background/85 backdrop-blur-md border-b border-border/20">
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>

      {/* Hero Header Skeleton */}
      <div className="relative max-w-6xl mx-auto px-4 flex gap-4 md:gap-8 items-start md:items-end">
        {/* Cover Skeleton */}
        <Skeleton className="h-28 sm:h-36 md:h-48 w-24 sm:w-32 md:w-44 shrink-0 rounded-2xl" />

        {/* Title and Badge rows */}
        <div className="flex-grow space-y-2 md:space-y-3 pb-1 md:pb-2 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-8 sm:h-12 w-3/4 max-w-md rounded-xl" />
          <Skeleton className="h-4 w-1/3 max-w-xs rounded-md" />
        </div>
      </div>

      {/* Mobile Actions placeholder */}
      <div className="lg:hidden max-w-6xl mx-auto px-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>

      {/* Main Grid Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs bar */}
            <Skeleton className="h-11 w-full max-w-md rounded-xl" />

            {/* Quick stats row */}
            <Skeleton className="h-24 w-full rounded-2xl" />

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
              <Skeleton className="h-36 rounded-2xl" />
            </div>

            {/* Content block */}
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>

          {/* Desktop Sidebar Column */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
