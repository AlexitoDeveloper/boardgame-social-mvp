import { Skeleton } from './ui/skeleton'

export function FeaturedGameHeroSkeleton() {
  return (
    <div 
      aria-hidden="true"
      className="w-full relative rounded-3xl overflow-hidden border border-border/40 bg-card p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-xl"
    >
      {/* Game Cover Thumbnail Skeleton */}
      <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-44 md:h-44 shrink-0 rounded-2xl overflow-hidden border border-border/30 bg-muted/30 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-2xl" />
      </div>

      {/* Info on Right */}
      <div className="flex-1 min-w-0 w-full text-center md:text-left flex flex-col justify-between h-full space-y-4">
        <div className="space-y-2.5 flex flex-col items-center md:items-start">
          {/* Badge Skeleton */}
          <Skeleton className="h-6 w-36 rounded-full" />

          {/* Title Skeleton */}
          <Skeleton className="h-8 sm:h-9 w-3/4 max-w-sm rounded-xl" />

          {/* Subtitle / Edition Skeleton */}
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>

        {/* Quick Stats Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-3 border-y border-border/40 w-full max-w-xl mx-auto md:mx-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center md:justify-start gap-2">
              <Skeleton className="w-4 h-4 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-10 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Actions Skeleton */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default FeaturedGameHeroSkeleton;
