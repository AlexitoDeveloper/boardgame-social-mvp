import { Skeleton } from '../ui/skeleton'

export function ExploreHeaderSkeleton() {
  return (
    <div 
      aria-hidden="true"
      className="sticky top-[-2px] z-30 w-auto -mx-4 px-4 md:-mx-8 md:px-8 bg-background border-b border-border/20 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4"
    >
      <div className="flex items-center gap-2.5 w-full">
        <Skeleton className="h-12 sm:h-11 flex-1 max-w-full sm:max-w-md rounded-xl" />
        <Skeleton className="h-12 sm:h-11 w-24 rounded-xl shrink-0" />
      </div>
    </div>
  )
}

export default ExploreHeaderSkeleton;
