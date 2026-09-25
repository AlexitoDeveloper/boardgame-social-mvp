import { Star, Users, Hourglass, Brain } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Game } from '../types'

interface FeaturedGameStatsProps {
  game: Game;
  formattedRating: string;
  formattedComplexity: string | null;
  hasComplexity: boolean;
}

export function FeaturedGameStats({
  game,
  formattedRating,
  formattedComplexity,
  hasComplexity,
}: FeaturedGameStatsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-2 border-y border-border max-w-xl mx-auto md:mx-0">
      <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-foreground/80">
        <Star className="w-4 h-4 text-[#D97706] fill-[#D97706] shrink-0" strokeWidth={2} aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none">{t('explore.rating')}</span>
          <span className="font-extrabold font-mono-tabular text-foreground text-sm sm:text-base leading-tight mt-0.5">{formattedRating}</span>
        </div>
      </div>

      <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-foreground/80">
        <Users className="w-4 h-4 text-primary shrink-0" strokeWidth={2} aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none">{t('common.players')}</span>
          <span className="font-extrabold font-mono-tabular text-foreground text-sm sm:text-base leading-tight mt-0.5">
            {game.min_players === game.max_players 
              ? game.min_players 
              : `${game.min_players}-${game.max_players}`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-foreground/80">
        <Hourglass className="w-4 h-4 text-[#0284C7] shrink-0" strokeWidth={2} aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none">{t('explore.duration')}</span>
          <span className="font-extrabold font-mono-tabular text-foreground text-sm sm:text-base leading-tight mt-0.5">
            {game.playing_time ? `${game.playing_time} ${t('explore.minutes')}` : 'N/A'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-foreground/80">
        <Brain className="w-4 h-4 text-[#243447] dark:text-[#67B5E6] shrink-0" strokeWidth={2} aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none">{t('explore.difficulty')}</span>
          <span className="font-extrabold font-mono-tabular text-foreground text-sm sm:text-base leading-tight mt-0.5">
            {hasComplexity ? (
              <>
                {formattedComplexity} <span className="text-xs text-muted-foreground font-normal">/5</span>
              </>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">{t('gameDetail.unratedComplexity')}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default FeaturedGameStats;
