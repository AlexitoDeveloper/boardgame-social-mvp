import { TFunction } from 'i18next'
import { UserStats } from '../../hooks/useProfile'

export interface Tier {
  req: number;
  name: string;
  tier: 'Bronce' | 'Plata' | 'Oro' | 'Platino';
  color: string;
}

export interface AchievementItem {
  id: string;
  baseName: string;
  description: string;
  currentValue: number;
  currentTier: Tier | null;
  nextTier: Tier | null;
  progressVal: number;
  targetVal: number;
  unit: string;
  reqDesc: string;
  progressPercent: number;
  progressText: string;
  nextLevelDesc: string;
}

export function getTierInfo(tiers: Tier[], value: number) {
  let currentIdx = -1
  for (let i = 0; i < tiers.length; i++) {
    if (value >= tiers[i].req) {
      currentIdx = i
    }
  }
  const currentTier = currentIdx >= 0 ? tiers[currentIdx] : null
  const nextTier = currentIdx + 1 < tiers.length ? tiers[currentIdx + 1] : null
  return { currentTier, nextTier, progressVal: value, targetVal: nextTier ? nextTier.req : (currentTier?.req || 0) }
}

export function getAchievementsList(
  t: TFunction,
  organizedCount: number,
  stats: UserStats,
  savedRankingsCount: number
): AchievementItem[] {
  const hostTiers: Tier[] = [
    { req: 1,  name: t('profile.achievements.host_bronze'),   tier: 'Bronce', color: 'border-amber-700/60' },
    { req: 3,  name: t('profile.achievements.host_silver'),   tier: 'Plata',  color: 'border-slate-300/60' },
    { req: 8,  name: t('profile.achievements.host_gold'),     tier: 'Oro',    color: 'border-amber-400/60' },
    { req: 15, name: t('profile.achievements.host_platinum'), tier: 'Platino',color: 'border-cyan-400/60' }
  ]

  const winnerTiers: Tier[] = [
    { req: 1,  name: t('profile.achievements.winner_bronze'),   tier: 'Bronce', color: 'border-amber-700/60' },
    { req: 3,  name: t('profile.achievements.winner_silver'),   tier: 'Plata',  color: 'border-slate-300/60' },
    { req: 8,  name: t('profile.achievements.winner_gold'),     tier: 'Oro',    color: 'border-amber-400/60' },
    { req: 15, name: t('profile.achievements.winner_platinum'), tier: 'Platino',color: 'border-cyan-400/60' }
  ]

  const veteranTiers: Tier[] = [
    { req: 1,  name: t('profile.achievements.veteran_bronze'),   tier: 'Bronce', color: 'border-amber-700/60' },
    { req: 5,  name: t('profile.achievements.veteran_silver'),   tier: 'Plata',  color: 'border-slate-300/60' },
    { req: 15, name: t('profile.achievements.veteran_gold'),     tier: 'Oro',    color: 'border-amber-400/60' },
    { req: 30, name: t('profile.achievements.veteran_platinum'), tier: 'Platino',color: 'border-cyan-400/60' }
  ]

  const reliableTiers = [
    { reqKarma: 80,  reqPlayed: 1,  name: t('profile.achievements.reliable_bronze'),   tier: 'Bronce' as const, color: 'border-amber-700/60' },
    { reqKarma: 90,  reqPlayed: 3,  name: t('profile.achievements.reliable_silver'),   tier: 'Plata'  as const, color: 'border-slate-300/60' },
    { reqKarma: 95,  reqPlayed: 8,  name: t('profile.achievements.reliable_gold'),     tier: 'Oro'    as const, color: 'border-amber-400/60' },
    { reqKarma: 100, reqPlayed: 15, name: t('profile.achievements.reliable_platinum'), tier: 'Platino'as const, color: 'border-cyan-400/60' }
  ]

  const criticTiers: Tier[] = [
    { req: 1,  name: t('profile.achievements.critic_bronze'),   tier: 'Bronce', color: 'border-amber-700/60' },
    { req: 3,  name: t('profile.achievements.critic_silver'),   tier: 'Plata',  color: 'border-slate-300/60' },
    { req: 6,  name: t('profile.achievements.critic_gold'),     tier: 'Oro',    color: 'border-amber-400/60' },
    { req: 10, name: t('profile.achievements.critic_platinum'), tier: 'Platino',color: 'border-cyan-400/60' }
  ]

  const getReliableInfo = (currentKarma: number, currentPlayed: number) => {
    let currentIdx = -1
    for (let i = 0; i < reliableTiers.length; i++) {
      if (currentKarma >= reliableTiers[i].reqKarma && currentPlayed >= reliableTiers[i].reqPlayed) {
        currentIdx = i
      }
    }
    const currentTier = currentIdx >= 0 ? reliableTiers[currentIdx] : null
    const nextTier = currentIdx + 1 < reliableTiers.length ? reliableTiers[currentIdx + 1] : null
    return {
      currentTier: currentTier as Tier | null,
      nextTier: nextTier as Tier | null,
      progressVal: currentKarma,
      targetVal: nextTier ? nextTier.reqKarma : (currentTier?.reqKarma || 0)
    }
  }

  const raw = [
    {
      id: 'host',
      baseName: t('profile.achievements.hostTitle'),
      description: t('profile.achievements.hostDesc'),
      currentValue: organizedCount,
      ...getTierInfo(hostTiers, organizedCount),
      unit: t('profile.achievements.hostUnit'),
      reqDesc: t('profile.achievements.hostReq')
    },
    {
      id: 'winner',
      baseName: t('profile.achievements.winnerTitle'),
      description: t('profile.achievements.winnerDesc'),
      currentValue: stats.won,
      ...getTierInfo(winnerTiers, stats.won),
      unit: t('profile.achievements.winnerUnit'),
      reqDesc: t('profile.achievements.winnerReq')
    },
    {
      id: 'veteran',
      baseName: t('profile.achievements.veteranTitle'),
      description: t('profile.achievements.veteranDesc'),
      currentValue: stats.played,
      ...getTierInfo(veteranTiers, stats.played),
      unit: t('profile.achievements.veteranUnit'),
      reqDesc: t('profile.achievements.veteranReq')
    },
    {
      id: 'reliable',
      baseName: t('profile.achievements.reliableTitle'),
      description: t('profile.achievements.reliableDesc'),
      currentValue: stats.karma,
      ...getReliableInfo(stats.karma, stats.played),
      unit: t('profile.achievements.reliableUnit'),
      reqDesc: t('profile.achievements.reliableReq')
    },
    {
      id: 'critic',
      baseName: t('profile.achievements.criticTitle'),
      description: t('profile.achievements.criticDesc'),
      currentValue: savedRankingsCount,
      ...getTierInfo(criticTiers, savedRankingsCount),
      unit: t('profile.achievements.criticUnit'),
      reqDesc: t('profile.achievements.criticReq')
    }
  ]

  return raw.map((ach) => {
    const hasUnlocked = ach.currentTier !== null
    let nextLevelDesc = ''
    let progressPercent = 0
    let progressText = ''

    if (ach.nextTier) {
      if (ach.id === 'reliable') {
        const nextCast = ach.nextTier as any
        const nextKarma = nextCast.reqKarma
        const nextPlayed = nextCast.reqPlayed
        progressPercent = Math.min(100, Math.round((stats.karma / nextKarma) * 50 + (Math.min(stats.played, nextPlayed) / nextPlayed) * 50))
        nextLevelDesc = t('profile.achievements.nextLevel', { name: nextCast.name, tier: nextCast.tier })
        progressText = t('profile.achievements.reqKarma', { karma: nextKarma, current: stats.karma, played: stats.played, target: nextPlayed })
      } else {
        const nextReq = ach.nextTier.req
        progressPercent = Math.min(100, Math.round((ach.progressVal / nextReq) * 100))
        nextLevelDesc = t('profile.achievements.nextLevel', { name: ach.nextTier.name, tier: ach.nextTier.tier })
        progressText = t('profile.achievements.progress', { current: ach.progressVal, target: nextReq, unit: ach.reqDesc })
      }
    } else if (hasUnlocked) {
      progressPercent = 100
      nextLevelDesc = t('profile.achievements.maxLevel')
      progressText = t('profile.achievements.havePoints', { current: ach.progressVal, unit: ach.unit })
    } else {
      if (ach.id === 'reliable') {
        const reliableT = reliableTiers[0]
        progressPercent = Math.min(100, Math.round((stats.karma / reliableT.reqKarma) * 50 + (Math.min(stats.played, reliableT.reqPlayed) / reliableT.reqPlayed) * 50))
        nextLevelDesc = t('profile.achievements.unlockBronze', { name: reliableT.name })
        progressText = t('profile.achievements.reqKarma', { karma: reliableT.reqKarma, current: stats.karma, played: stats.played, target: reliableT.reqPlayed })
      } else {
        const firstReq = ach.targetVal
        progressPercent = Math.min(100, Math.round((ach.progressVal / firstReq) * 100))
        nextLevelDesc = t('profile.achievements.unlockBronze', { name: `${ach.baseName} ${t('profile.achievements.novelSuffix')}` })
        progressText = t('profile.achievements.progress', { current: ach.progressVal, target: firstReq, unit: ach.reqDesc })
      }
    }

    return {
      ...ach,
      progressPercent,
      progressText,
      nextLevelDesc
    }
  })
}
