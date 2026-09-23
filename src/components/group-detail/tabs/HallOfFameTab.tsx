import { Trophy, Dices, Users, Sparkles, Plus, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/button'
import { Card } from '../../ui/card'
import { useGroupHallOfFame } from '../../../hooks/useGroupHallOfFame'
import { GroupPodium } from '../hall-of-fame/GroupPodium'
import { GroupRivalries } from '../hall-of-fame/GroupRivalries'
import { GroupGameRecords } from '../hall-of-fame/GroupGameRecords'
import { GroupWinStreaks } from '../hall-of-fame/GroupWinStreaks'

interface HallOfFameTabProps {
  groupId: string
}

export function HallOfFameTab({ groupId }: HallOfFameTabProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    membersLeaderboard,
    nemesis,
    favoriteVictim,
    gameRecords,
    activeStreaks,
    totalSessionsPlayed,
    totalUniqueGames,
    loading,
    error,
  } = useGroupHallOfFame(groupId)

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">
          {t('groups.loadingHallOfFame', 'Consultando el Salón de la Fama...')}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold text-center">
        {error}
      </div>
    )
  }

  const hasHistory = membersLeaderboard.length > 0 && totalSessionsPlayed > 0

  if (!hasHistory) {
    return (
      <Card className="border-dashed border-border/50 bg-card/40 text-center py-12 px-6 space-y-4 max-w-lg mx-auto rounded-3xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Trophy className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-base font-black text-foreground font-display">
            {t('groups.noHallOfFame', 'El Salón de la Fama aguarda')}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('groups.noHallOfFameDesc', 'Registrad vuestras partidas para desatar las rivalidades, coronar a los campeones y forjar el podio del grupo.')}
          </p>
        </div>
        <Button
          onClick={() => navigate(`/mesa/nueva?groupId=${groupId}`)}
          className="rounded-xl gap-2 font-bold text-xs h-10 px-4 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('groups.createTable', 'Organizar Partida')}</span>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* High-Density Editorial Stat Ticker */}
      <div className="grid grid-cols-3 divide-x divide-border/30 rounded-2xl border border-border/40 bg-card/60 p-4 text-center">
        <div className="space-y-0.5 px-2">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <Dices className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-muted-foreground">
              {t('groups.sessionsTotal', 'Partidas')}
            </span>
          </div>
          <p className="font-mono text-xl sm:text-2xl font-black text-foreground">
            {totalSessionsPlayed}
          </p>
        </div>

        <div className="space-y-0.5 px-2">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-muted-foreground">
              {t('groups.uniqueGamesTotal', 'Títulos')}
            </span>
          </div>
          <p className="font-mono text-xl sm:text-2xl font-black text-foreground">
            {totalUniqueGames}
          </p>
        </div>

        <div className="space-y-0.5 px-2">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-bold text-muted-foreground">
              {t('groups.rankedPlayers', 'Jugadores')}
            </span>
          </div>
          <p className="font-mono text-xl sm:text-2xl font-black text-foreground">
            {membersLeaderboard.length}
          </p>
        </div>
      </div>

      {/* 1. Champions Podium */}
      <GroupPodium members={membersLeaderboard} />

      {/* 2. Active Win Streaks */}
      {activeStreaks.length > 0 && <GroupWinStreaks streaks={activeStreaks} />}

      {/* 3. Rivalries (Nemesis & Favorite Victim) */}
      <GroupRivalries nemesis={nemesis} favoriteVictim={favoriteVictim} />

      {/* 4. Game High Score Records */}
      <GroupGameRecords records={gameRecords} />
    </div>
  )
}

export default HallOfFameTab
