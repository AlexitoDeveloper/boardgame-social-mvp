import { Trophy, Dices, Users, Sparkles, Plus, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { useGroupHallOfFame } from '../../hooks/useGroupHallOfFame'
import { GroupPodium } from './hall-of-fame/GroupPodium'
import { GroupRivalries } from './hall-of-fame/GroupRivalries'
import { GroupGameRecords } from './hall-of-fame/GroupGameRecords'
import { GroupWinStreaks } from './hall-of-fame/GroupWinStreaks'

interface GroupHallOfFameTabProps {
  groupId: string;
}

export function GroupHallOfFameTab({ groupId }: GroupHallOfFameTabProps) {
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
    error
  } = useGroupHallOfFame(groupId)

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t('groups.loadingHallOfFame')}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-medium text-center">
        {error}
      </div>
    )
  }

  const hasHistory = membersLeaderboard.length > 0 && totalSessionsPlayed > 0

  if (!hasHistory) {
    return (
      <Card className="border-border/50 bg-card/30 text-center py-12 px-4 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-base font-bold text-foreground">
            {t('groups.noHallOfFame')}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('groups.noHallOfFameDesc')}
          </p>
        </div>
        <Button
          onClick={() => navigate(`/mesa/nueva?groupId=${groupId}`)}
          className="rounded-xl gap-2 font-bold shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          {t('groups.createTable')}
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Stat Ribbon */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Dices className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('groups.sessionsTotal')}
              </span>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-foreground">
              {totalSessionsPlayed}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('groups.uniqueGamesTotal')}
              </span>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-foreground">
              {totalUniqueGames}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {t('groups.rankedPlayers')}
              </span>
            </div>
            <p className="font-mono text-xl sm:text-2xl font-black text-foreground">
              {membersLeaderboard.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 1. Podium & General Leaderboard */}
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
