import { Users, Hourglass, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Game } from '@/types'
import { Card } from '@/components/ui/card'

interface GameQuickStatsProps {
  game: Game
}

export function GameQuickStats({ game }: GameQuickStatsProps) {
  const { t } = useTranslation()

  const players = game.min_players && game.max_players
    ? game.min_players === game.max_players
      ? `${game.min_players}`
      : `${game.min_players}-${game.max_players}`
    : 'N/A'

  return (
    <Card variant="glass" className="p-4 sm:p-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="flex flex-col items-center justify-center text-center p-1 sm:p-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mb-1.5" />
          <span className="text-xs uppercase font-black tracking-wider text-muted-foreground">
            {t('common.players')}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
            {players}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-1 sm:p-2 border-x border-border/30">
          <Hourglass className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mb-1.5" />
          <span className="text-xs uppercase font-black tracking-wider text-muted-foreground">
            {t('explore.duration')}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
            {game.playing_time ? `${game.playing_time} ${t('explore.minutes')}` : 'N/A'}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-1 sm:p-2">
          <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground mb-1.5" />
          <span className="text-xs uppercase font-black tracking-wider text-muted-foreground">
            {t('common.year') || 'Año'}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">
            {game.year_published || 'N/A'}
          </span>
        </div>
      </div>
    </Card>
  )
}
