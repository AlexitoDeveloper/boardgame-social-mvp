import { Skeleton } from '../ui/skeleton'
import { FeaturedGameHeroSkeleton } from '../FeaturedGameHero'
import { GameCoverCardSkeleton } from '../GameCoverCard'
import { cn } from '../../lib/utils'

export function ExploreSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <GameCoverCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ExploreSkeletonCarousel({ isTop10 = false }: { isTop10?: boolean }) {
  return (
    <div className="w-full max-w-full min-w-0 flex gap-4 overflow-x-hidden py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "shrink-0",
            isTop10
              ? "w-[130px] sm:w-[150px] md:w-[170px] ml-12"
              : "w-[140px] sm:w-[160px] md:w-[180px]"
          )}
        >
          <GameCoverCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function ExploreLoadingState() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando juegos...">
      {/* Featured Game Hero Skeleton */}
      <FeaturedGameHeroSkeleton />

      {/* Top 10 Week Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <ExploreSkeletonCarousel isTop10 />
      </div>

      {/* Novedades Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <ExploreSkeletonCarousel />
      </div>

      {/* Juegos para 2 Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <ExploreSkeletonCarousel />
      </div>

      {/* Top 10 Month Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <ExploreSkeletonCarousel isTop10 />
      </div>

      {/* Community Rankings Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <div className="w-full max-w-full min-w-0 flex gap-4 overflow-x-hidden py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[180px] w-[220px] sm:w-[260px] md:w-[280px] rounded-2xl border border-border/20 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Classics Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-lg" />
        <ExploreSkeletonCarousel />
      </div>
    </div>
  )
}

export default ExploreLoadingState;
