import { useMemo } from 'react'
import { Swords, Dices, Flame, Layers } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { UserStats } from '../../hooks/useProfile'
import { Meetup } from '../../types'
import { useTranslation } from 'react-i18next'

interface StatsDashboardProps {
  stats: UserStats;
  meetups?: Meetup[];
  profileId?: string;
}

export function StatsDashboard({ stats, meetups = [], profileId }: StatsDashboardProps) {
  const { t } = useTranslation()

  // Calculate H-Index according to standard BG Stats formula
  const { hIndex, topCategory } = useMemo(() => {
    const completedAttended = meetups.filter(
      m => m.completed && (!profileId || m.attended_players?.includes(profileId))
    )

    const gamePlayCounts: Record<string, number> = {}
    const categoryCounts: Record<string, number> = {}

    completedAttended.forEach(m => {
      (m.games || []).forEach(g => {
        const key = g.title || String(g.bgg_id)
        gamePlayCounts[key] = (gamePlayCounts[key] || 0) + 1

        if (g.categories && Array.isArray(g.categories)) {
          g.categories.forEach(c => {
            categoryCounts[c] = (categoryCounts[c] || 0) + 1
          })
        } else if (g.mechanics && Array.isArray(g.mechanics)) {
          g.mechanics.forEach(mc => {
            categoryCounts[mc] = (categoryCounts[mc] || 0) + 1
          })
        }
      })
    })

    const counts = Object.values(gamePlayCounts).sort((a, b) => b - a)
    let calculatedH = 0
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] >= i + 1) {
        calculatedH = i + 1
      } else {
        break
      }
    }

    const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
    const favCat = topCategoryEntry 
      ? topCategoryEntry[0] 
      : (stats.played > 0 ? 'Estrategia / Euro' : 'En exploración')

    return { hIndex: calculatedH, topCategory: favCat }
  }, [meetups, profileId, stats.played])

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
      {/* 1. Total Plays Card */}
      <Card className="glass-panel border-border/30 shadow-md relative overflow-hidden group rounded-2xl hover:border-primary/30 transition-all duration-300">
        <div className="absolute -right-2 -bottom-2 opacity-5 dark:opacity-[0.04] group-hover:scale-110 transition-transform pointer-events-none">
          <Dices className="w-20 h-20 text-primary" />
        </div>
        <CardContent className="p-3.5 sm:p-4 text-left space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Dices className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider truncate">
              {t('profile.statsTotalPlays', 'Total Partidas')}
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="text-2xl sm:text-3xl font-black font-mono-tabular tracking-tight text-foreground">
              {stats.played}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold truncate leading-tight">
            {stats.karma}% asistencia
          </p>
        </CardContent>
      </Card>

      {/* 2. Win Rate Card */}
      <Card className="glass-panel border-border/30 shadow-md relative overflow-hidden group rounded-2xl hover:border-rose-500/30 transition-all duration-300">
        <div className="absolute -right-2 -bottom-2 opacity-5 dark:opacity-[0.04] group-hover:scale-110 transition-transform pointer-events-none">
          <Swords className="w-20 h-20 text-rose-500" />
        </div>
        <CardContent className="p-3.5 sm:p-4 text-left space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-rose-500">
            <Swords className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider truncate">
              {t('profile.statsWinRate', 'Win Rate')}
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="text-2xl sm:text-3xl font-black font-mono-tabular tracking-tight text-rose-500">
              {stats.winRate}%
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold truncate leading-tight">
            {stats.won} {stats.won === 1 ? 'victoria' : 'victorias'}
          </p>
        </CardContent>
      </Card>

      {/* 3. H-Index Card */}
      <Card className="glass-panel border-border/30 shadow-md relative overflow-hidden group rounded-2xl hover:border-amber-500/30 transition-all duration-300">
        <div className="absolute -right-2 -bottom-2 opacity-5 dark:opacity-[0.04] group-hover:scale-110 transition-transform pointer-events-none">
          <Flame className="w-20 h-20 text-amber-500" />
        </div>
        <CardContent className="p-3.5 sm:p-4 text-left space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider truncate">
              {t('profile.statsHIndex', 'Índice H')}
            </span>
          </div>
          <div className="flex items-baseline gap-1 pt-0.5">
            <span className="text-2xl sm:text-3xl font-black font-mono-tabular tracking-tight text-amber-500">
              h-{hIndex}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold truncate leading-tight">
            {hIndex > 0 ? `${hIndex} juegos ≥ ${hIndex} veces` : 'Juega más mesas'}
          </p>
        </CardContent>
      </Card>

      {/* 4. Favorite Faction / Category Card */}
      <Card className="glass-panel border-border/30 shadow-md relative overflow-hidden group rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
        <div className="absolute -right-2 -bottom-2 opacity-5 dark:opacity-[0.04] group-hover:scale-110 transition-transform pointer-events-none">
          <Layers className="w-20 h-20 text-indigo-400" />
        </div>
        <CardContent className="p-3.5 sm:p-4 text-left space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider truncate">
              {t('profile.statsFavoriteFaction', 'Estilo Top')}
            </span>
          </div>
          <div className="pt-1">
            <span className="text-sm sm:text-base font-black text-foreground truncate block leading-tight">
              {topCategory}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold truncate leading-tight">
            {stats.played > 0 ? 'Mecánica más jugada' : 'Sin datos de juego'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
