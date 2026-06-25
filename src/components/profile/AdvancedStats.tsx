import { useMemo } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts'
import { Skull, Swords, Zap, Crown, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart'
import { Meetup, UserProfile } from '../../types'
import { UserStats } from '../../hooks/useProfile'
import { useTranslation } from 'react-i18next'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdvancedStatsProps {
  stats: UserStats
  meetups: Meetup[]
  profileId: string
  attendees?: UserProfile[]
}

// ─── Dynamic Title Logic ───────────────────────────────────────────────────────

type TitleId = 'legend' | 'conqueror' | 'eternal' | 'ghost' | 'social' | 'rookie'

const TITLE_CONFIGS: {
  id: TitleId
  emoji: string
  color: string
  border: string
  bg: string
  check: (stats: UserStats) => boolean
}[] = [
  { id: 'legend',    emoji: '👑', color: 'from-amber-500 to-yellow-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10',   check: (s) => s.won >= 20 },
  { id: 'conqueror', emoji: '⚔️', color: 'from-rose-500 to-red-400',       border: 'border-rose-500/30',    bg: 'bg-rose-500/10',    check: (s) => s.winRate >= 60 && s.played >= 5 },
  { id: 'eternal',   emoji: '🎲', color: 'from-violet-500 to-purple-400',  border: 'border-violet-500/30',  bg: 'bg-violet-500/10',  check: (s) => s.played >= 15 },
  { id: 'ghost',     emoji: '👻', color: 'from-slate-500 to-gray-400',     border: 'border-slate-500/30',   bg: 'bg-slate-500/10',   check: (s) => s.karma < 50 && s.missed >= 3 },
  { id: 'social',    emoji: '🤝', color: 'from-emerald-500 to-teal-400',   border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', check: (s) => s.karma >= 80 && s.winRate < 20 && s.played >= 5 },
  { id: 'rookie',    emoji: '🌱', color: 'from-lime-500 to-green-400',     border: 'border-lime-500/30',    bg: 'bg-lime-500/10',    check: (s) => s.played < 5 },
]

function getDynamicTitleId(stats: UserStats): TitleId {
  return TITLE_CONFIGS.find(c => c.check(stats))?.id ?? 'rookie'
}

// ─── Nemesis / Victim Calculation ─────────────────────────────────────────────

function calcNemesisAndVictim(meetups: Meetup[], profileId: string) {
  const lossesFrom: Record<string, { username: string; avatar_url: string | null; count: number }> = {}
  const winsOver: Record<string, { username: string; avatar_url: string | null; count: number }> = {}

  const completedAttended = meetups.filter(
    m => m.completed && m.attended_players?.includes(profileId)
  )

  for (const meetup of completedAttended) {
    const games = meetup.games || []
    const allAttendees = meetup.attended_players || []

    for (const game of games) {
      const winnerId = game.winner_user_id
      if (!winnerId) continue

      if (winnerId !== profileId && allAttendees.includes(profileId)) {
        if (!lossesFrom[winnerId]) {
          lossesFrom[winnerId] = { username: winnerId.slice(0, 8), avatar_url: null, count: 0 }
        }
        lossesFrom[winnerId].count++
      }

      if (winnerId === profileId) {
        for (const opponentId of allAttendees) {
          if (opponentId === profileId) continue
          if (!winsOver[opponentId]) {
            winsOver[opponentId] = { username: opponentId.slice(0, 8), avatar_url: null, count: 0 }
          }
          winsOver[opponentId].count++
        }
      }
    }
  }

  const nemesis = Object.entries(lossesFrom)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)[0] ?? null

  const victim = Object.entries(winsOver)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)[0] ?? null

  return { nemesis, victim }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdvancedStats({ stats, meetups, profileId }: AdvancedStatsProps) {
  const { t } = useTranslation()

  const titleId = useMemo(() => getDynamicTitleId(stats), [stats])
  const titleConfig = TITLE_CONFIGS.find(c => c.id === titleId)!
  const { nemesis, victim } = useMemo(() => calcNemesisAndVictim(meetups, profileId), [meetups, profileId])

  const radarData = useMemo(() => {
    const completedAttended = meetups.filter(
      m => m.completed && m.attended_players?.includes(profileId)
    )
    const organized = meetups.filter(m => m.creator_id === profileId).length
    const uniqueGames = new Set<number>()
    completedAttended.forEach(m => (m.games || []).forEach(g => uniqueGames.add(g.bgg_id)))

    return [
      { axis: t('profile.advancedStats.axisWin'),          value: Math.min(100, stats.winRate) },
      { axis: t('profile.advancedStats.axisAttendance'),   value: Math.min(100, stats.karma) },
      { axis: t('profile.advancedStats.axisExperience'),   value: Math.min(100, Math.round((stats.played / 20) * 100)) },
      { axis: t('profile.advancedStats.axisOrganization'), value: Math.min(100, Math.round((organized / 10) * 100)) },
      { axis: t('profile.advancedStats.axisVariety'),      value: Math.min(100, Math.round((uniqueGames.size / 15) * 100)) },
    ]
  }, [stats, meetups, profileId, t])

  const chartConfig = {
    value: { label: t('profile.advancedStats.radarScore'), color: 'hsl(var(--primary))' },
  }

  const hasEnoughData = stats.played >= 3

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2 px-1">
        <Flame className="w-4 h-4 text-primary" />
        <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          {t('profile.advancedStats.sectionTitle')}
        </h2>
      </div>

      {/* 1. Dynamic Title */}
      <Card className={`border ${titleConfig.border} ${titleConfig.bg} rounded-2xl shadow-lg overflow-hidden relative`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className={`w-full h-full bg-gradient-to-br ${titleConfig.color}`} />
        </div>
        <CardContent className="p-4 flex items-center gap-4 relative z-10">
          <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${titleConfig.color} flex items-center justify-center shadow-lg text-xl`}>
            {titleConfig.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
              {t('profile.advancedStats.yourTitle')}
            </p>
            <p className="text-sm font-black text-foreground leading-tight">
              {t(`profile.advancedStats.title_${titleId}_label`)}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-normal">
              {t(`profile.advancedStats.title_${titleId}_desc`)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Nemesis & Victim */}
      <div className="grid grid-cols-2 gap-3">
        {/* Nemesis */}
        <Card className="border-border/30 bg-card/60 rounded-2xl shadow-lg overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Skull className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">{t('profile.advancedStats.nemesisLabel')}</span>
            </div>
            {nemesis ? (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-rose-500/30 shadow-md mx-auto">
                  <img
                    src={nemesis.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nemesis.username)}`}
                    alt={nemesis.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-black text-foreground text-center truncate">{nemesis.username}</p>
                <p className="text-[9px] text-rose-500 font-bold text-center">{t('profile.advancedStats.nemesisBeat', { count: nemesis.count })}</p>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-[10px] text-muted-foreground font-medium leading-normal">
                  {hasEnoughData ? t('profile.advancedStats.noNemesis') : t('profile.advancedStats.playMoreGames')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Victim */}
        <Card className="border-border/30 bg-card/60 rounded-2xl shadow-lg overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">{t('profile.advancedStats.victimLabel')}</span>
            </div>
            {victim ? (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/30 shadow-md mx-auto">
                  <img
                    src={victim.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(victim.username)}`}
                    alt={victim.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-black text-foreground text-center truncate">{victim.username}</p>
                <p className="text-[9px] text-amber-500 font-bold text-center">{t('profile.advancedStats.victimBeat', { count: victim.count })}</p>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-[10px] text-muted-foreground font-medium leading-normal">
                  {hasEnoughData ? t('profile.advancedStats.noVictim') : t('profile.advancedStats.playMoreGames')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Player Style Radar */}
      <Card className="border-border/30 bg-card/60 rounded-2xl shadow-lg overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            {t('profile.advancedStats.radarTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {hasEnoughData ? (
            <ChartContainer config={chartConfig} className="aspect-square max-h-[240px] w-full">
              <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <PolarGrid
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.4}
                />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{
                    fontSize: 9,
                    fontWeight: 700,
                    fill: 'hsl(var(--muted-foreground))',
                    textAnchor: 'middle',
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) => [`${value}%`, t('profile.advancedStats.radarScore')]}
                    />
                  }
                />
                <Radar
                  name="value"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </RadarChart>
            </ChartContainer>
          ) : (
            <div className="h-[160px] flex flex-col items-center justify-center gap-2 text-center">
              <Swords className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-[11px] text-muted-foreground font-medium">
                {t('profile.advancedStats.radarNeedsData')}
              </p>
              <p className="text-[10px] text-muted-foreground/60 font-medium">
                {t('profile.advancedStats.radarProgress', { played: stats.played })}
              </p>
            </div>
          )}
          <div className="mt-2 grid grid-cols-5 gap-1 text-center">
            {radarData.map(d => (
              <div key={d.axis} className="space-y-0.5">
                <div className="text-[9px] font-black text-muted-foreground truncate">{d.axis}</div>
                <div className="text-[10px] font-extrabold text-primary">{d.value}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
