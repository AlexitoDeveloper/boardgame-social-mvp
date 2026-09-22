import { FC } from 'react'
import { Skeleton } from '../ui/skeleton'

interface GroupsSkeletonGridProps {
  count?: number
}

export const GroupsSkeletonGrid: FC<GroupsSkeletonGridProps> = ({ count = 3 }) => {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando grupos..."
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-44 p-5 rounded-2xl border border-border/30 bg-card/40 flex flex-col justify-between"
        >
          <div className="space-y-2.5">
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <Skeleton className="h-4 w-20 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
