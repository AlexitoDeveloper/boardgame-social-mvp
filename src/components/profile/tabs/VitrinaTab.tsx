import { AchievementsVitrina } from '../AchievementsVitrina'
import { UserStats } from '../../../hooks/useProfile'

interface VitrinaTabProps {
  organizedCount: number;
  stats: UserStats;
  savedRankingsCount: number;
}

export function VitrinaTab({
  organizedCount,
  stats,
  savedRankingsCount
}: VitrinaTabProps) {
  return (
    <div className="space-y-4">
      <AchievementsVitrina
        organizedCount={organizedCount}
        stats={stats}
        savedRankingsCount={savedRankingsCount}
      />
    </div>
  )
}
