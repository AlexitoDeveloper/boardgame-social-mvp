import { Trophy, Star, Brain, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Game } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { sanitizeGameText } from '@/lib/gameLocale'
import { GameQuickStats } from './GameQuickStats'

interface GameDetailsTabProps {
  game: Game
}

export function GameDetailsTab({ game }: GameDetailsTabProps) {
  const { t } = useTranslation()

  const avgRating = game.rating_average ? game.rating_average.toFixed(1) : 'N/A'
  const geekRating = game.rating_geek ? game.rating_geek.toFixed(1) : 'N/A'
  const complexity = game.complexity && game.complexity > 0 ? Number(game.complexity) : 0

  let complexityBarColor = 'bg-muted-foreground'

  if (complexity > 0) {
    if (complexity <= 2.2) {
      complexityBarColor = 'bg-emerald-500'
    } else if (complexity <= 3.5) {
      complexityBarColor = 'bg-amber-500'
    } else {
      complexityBarColor = 'bg-rose-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Specs Row */}
      <GameQuickStats game={game} />

      {/* BGG Rankings, Rating and Integrated Complexity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* BGG Rank Card */}
        <Card variant="glass" className="p-5 flex flex-col justify-between relative overflow-hidden h-36">
          <Trophy className="absolute right-4 top-4 h-12 w-12 text-muted-foreground/10 select-none pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('gameDetail.bggRank')}
            </span>
            <h3 className="text-3xl font-black tracking-tight text-foreground">
              {game.bgg_rank ? `#${game.bgg_rank}` : 'N/A'}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-normal">
            {t('gameDetail.globalRankDesc')}
          </p>
        </Card>

        {/* Rating Card */}
        <Card variant="glass" className="p-5 flex flex-col justify-between relative overflow-hidden h-36">
          <Star className="absolute right-4 top-4 h-12 w-12 text-muted-foreground/10 select-none pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('explore.rating')}
            </span>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black tracking-tight text-foreground">{avgRating}</h3>
              <span className="text-xs text-muted-foreground font-semibold">/10</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-normal">
            Geek Rating: <span className="font-bold text-foreground/80">{geekRating}</span>
          </p>
        </Card>

        {/* Complexity Card with Integrated Progress Bar */}
        <Card variant="glass" className="p-5 flex flex-col justify-between relative overflow-hidden min-h-36">
          <Brain className="absolute right-4 top-4 h-12 w-12 text-muted-foreground/10 select-none pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {t('explore.difficulty')}
            </span>
            {complexity > 0 ? (
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black tracking-tight text-foreground">
                  {complexity.toFixed(1)}
                </h3>
                <span className="text-xs text-muted-foreground font-semibold">/5</span>
              </div>
            ) : (
              <div className="pt-1">
                <Badge variant="secondary" size="sm" className="text-xs font-semibold text-muted-foreground bg-muted/60">
                  {t('gameDetail.unratedComplexity')}
                </Badge>
              </div>
            )}
          </div>

          {/* Integrated progress bar within card */}
          {complexity > 0 ? (
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${complexityBarColor}`}
                  style={{ width: `${(complexity / 5) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                <span>{t('gameDetail.light')}</span>
                <span>{t('gameDetail.medium')}</span>
                <span>{t('gameDetail.heavy')}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('gameDetail.unratedComplexity')}
            </p>
          )}
        </Card>
      </div>

      {/* Publishers Info Block */}
      {(game.publisher || game.es_publisher) && (
        <Card variant="glass" className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {t('gameDetail.distributionPublishers')}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-semibold text-foreground/80">
            {game.publisher && (
              <p>
                {t('gameDetail.intlPublisher')}: <span className="font-bold text-foreground block mt-1">{sanitizeGameText(game.publisher)}</span>
              </p>
            )}
            {game.es_publisher && (
              <p>
                {t('gameDetail.spainPublisher')}: <span className="font-bold text-primary block mt-1">{sanitizeGameText(game.es_publisher)}</span>
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
