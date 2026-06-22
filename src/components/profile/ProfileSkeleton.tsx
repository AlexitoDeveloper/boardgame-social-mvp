import { Card, CardContent } from '../ui/card'

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-xl mx-auto p-0 pb-6 md:p-4 animate-pulse">
      {/* Header bar Skeleton */}
      <div className="sticky top-[-2px] pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 z-30 flex items-center justify-between -mx-4 px-4 md:-mx-8 md:px-8 bg-background/85 border-b border-border/20">
        <div className="h-9 w-16 bg-muted rounded-xl" />
        <div className="h-6 w-32 bg-muted rounded-full" />
      </div>

      {/* Profile Card Skeleton (Match card banner and layout to eliminate CLS) */}
      <Card className="glass-panel border-border/30 shadow-2xl overflow-hidden rounded-3xl relative">
        {/* Banner backdrop skeleton matching height */}
        <div className="h-32 bg-muted/40 border-b border-white/5 relative overflow-hidden" />
        
        <CardContent className="p-4 pb-6 sm:p-6 sm:pb-6 relative flex flex-col items-center sm:items-start sm:flex-row gap-5">
          {/* Avatar container skeleton overlapping banner */}
          <div className="relative -mt-16 z-10 shrink-0">
            <div className="w-28 h-28 rounded-full bg-muted border-[6px] border-card shadow-xl" />
          </div>
          
          <div className="pt-2 sm:pt-4 space-y-3 text-center sm:text-left flex-1 min-w-0 w-full">
            <div className="space-y-2 flex flex-col items-center sm:items-start">
              <div className="h-7 w-48 bg-muted rounded-lg" />
              <div className="h-4.5 w-32 bg-muted rounded-md" />
            </div>
            
            {/* Experience bar skeleton */}
            <div className="space-y-2 p-2.5 rounded-xl border border-border/20 bg-muted/40 w-full">
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full" />
              <div className="h-2.5 w-40 bg-muted rounded" />
            </div>
            
            {/* Location & date badges skeleton */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <div className="h-6 w-24 bg-muted rounded-lg border border-border/40" />
              <div className="h-6 w-32 bg-muted rounded-lg border border-border/40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Vitrina Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 bg-muted rounded" />
        <div className="grid grid-cols-5 gap-2.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-muted" />
              <div className="h-2 w-10 bg-muted rounded" />
              <div className="h-2 w-6 bg-muted rounded" />
            </div>
          ))}
        </div>
        {/* Achievement detail sub-card skeleton */}
        <div className="h-20 w-full bg-muted/20 border border-border/30 rounded-2xl p-3.5 space-y-2">
          <div className="h-3.5 w-24 bg-muted rounded" />
          <div className="h-3 w-40 bg-muted rounded" />
        </div>
      </div>

      {/* Stats Dashboard Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-border/30 bg-muted/20 flex justify-between items-center gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded-lg" />
            <div className="h-3.5 w-32 bg-muted rounded" />
          </div>
          <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-border/30 bg-muted/20 flex justify-between items-center gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded-lg" />
            <div className="h-3.5 w-32 bg-muted rounded" />
          </div>
          <div className="w-16 h-16 rounded-full bg-muted shrink-0" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex border-b border-border/20 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 py-3 flex justify-center">
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Tab content placeholder skeleton */}
      <div className="space-y-3 pt-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 w-full bg-muted/20 border border-border/30 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
