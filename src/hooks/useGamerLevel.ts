import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UserStats } from './useProfile'

export interface GamerLevelData {
  totalXp: number;
  playerLevel: number;
  xpCurrent: number;
  xpRange: number;
  xpProgress: number;
  playerTitle: string;
}

export function useGamerLevel(
  stats: UserStats,
  organizedCount: number,
  savedRankingsCount: number
): GamerLevelData {
  const { t } = useTranslation()

  return useMemo(() => {
    const totalXp =
      stats.played * 100 +
      stats.won * 250 +
      organizedCount * 150 +
      savedRankingsCount * 200

    const playerLevel = Math.floor(totalXp / 1000) + 1
    const prevLevelXp = (playerLevel - 1) * 1000
    const xpRange = 1000
    const xpCurrent = totalXp - prevLevelXp
    const xpProgress = Math.min(100, Math.max(0, (xpCurrent / xpRange) * 100))

    const getPlayerTitle = (level: number) => {
      if (level >= 10) return t('profile.level10')
      if (level >= 6) return t('profile.level6')
      if (level >= 4) return t('profile.level4')
      if (level >= 2) return t('profile.level2')
      return t('profile.level1')
    }

    return {
      totalXp,
      playerLevel,
      xpCurrent,
      xpRange,
      xpProgress,
      playerTitle: getPlayerTitle(playerLevel),
    }
  }, [stats, organizedCount, savedRankingsCount, t])
}
