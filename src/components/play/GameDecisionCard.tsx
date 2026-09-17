import { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dices, Users, Clock, Plus, RotateCw, Vote, PackageCheck, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { useTranslation } from 'react-i18next'
import { SimpleGame } from '../../hooks/usePlayDecisionEngine'

interface GameDecisionCardProps {
  suggestedGame: SimpleGame | null
  isSpinning: boolean
  loadingGames: boolean
  filteredCount: number
  spinError: string | null
  availableExpansions: SimpleGame[]
  onSpin: () => void
  onOpenVoting: () => void
  onResetFilters: () => void
  onStartSession: (gameId: number) => void
}

export const GameDecisionCard: FC<GameDecisionCardProps> = ({
  suggestedGame,
  isSpinning,
  loadingGames,
  filteredCount,
  spinError,
  availableExpansions,
  onSpin,
  onOpenVoting,
  onResetFilters,
  onStartSession,
}) => {
  const { t, i18n } = useTranslation()

  if (loadingGames) {
    return (
      <div className="p-6 rounded-3xl bg-card/60 border border-border/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2.5 w-full">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-7 w-3/4 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (filteredCount === 0) {
    return (
      <div className="p-8 rounded-3xl bg-card/50 border border-dashed border-border/60 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
          <Dices className="w-7 h-7" aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold text-foreground max-w-md mx-auto">{t('play.noGamesFound')}</h3>
        <Button type="button" variant="outline" onClick={onResetFilters} className="h-11 rounded-xl font-bold text-xs px-5 shadow-xs">
          <RotateCcw className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
          <span>{t('ranking.reset', 'Restablecer Filtros')}</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 relative z-10">
      <AnimatePresence mode="wait">
        {suggestedGame ? (
          <motion.div
            key={suggestedGame.bgg_id}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-5 sm:p-6 rounded-3xl bg-primary/10 border border-primary/25 shadow-lg space-y-5"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {suggestedGame.image_url ? (
                <img src={suggestedGame.image_url} alt={suggestedGame.title} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-md shrink-0 border border-border/30" />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-card flex items-center justify-center border border-border/30 shrink-0 text-muted-foreground">
                  <Dices className="w-10 h-10" aria-hidden="true" />
                </div>
              )}

              <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                <span className="text-xs font-black uppercase text-primary tracking-wider">{t('play.suggestedTitle')}</span>
                <h3 className="text-xl sm:text-2xl font-black text-foreground truncate font-display">
                  {i18n.language === 'es' && suggestedGame.title_es ? suggestedGame.title_es : suggestedGame.title}
                  {suggestedGame.year_published ? <span className="text-sm font-semibold text-muted-foreground ml-2">({suggestedGame.year_published})</span> : null}
                </h3>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                  <Badge variant="secondary" size="sm" className="font-mono-tabular">
                    <Users className="w-3.5 h-3.5 mr-1 text-muted-foreground" aria-hidden="true" />
                    {suggestedGame.min_players || 2}-{suggestedGame.max_players || 5} jug.
                  </Badge>
                  <Badge variant="secondary" size="sm" className="font-mono-tabular">
                    <Clock className="w-3.5 h-3.5 mr-1 text-muted-foreground" aria-hidden="true" />
                    {suggestedGame.playing_time || 45} min
                  </Badge>
                  {typeof suggestedGame.complexity === 'number' && suggestedGame.complexity > 0 && (
                    <Badge variant="secondary" size="sm" className="font-mono-tabular">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" aria-hidden="true" />
                      Peso: {suggestedGame.complexity.toFixed(1)}/5
                    </Badge>
                  )}
                  {suggestedGame.is_unplayed && (
                    <Badge variant="purple" size="sm">
                      <PackageCheck className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                      Por estrenar
                    </Badge>
                  )}
                  {availableExpansions.length > 0 && (
                    <Badge variant="primary-soft" size="sm">
                      +{availableExpansions.length} {availableExpansions.length === 1 ? 'expansión' : 'expansiones'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button type="button" onClick={() => onStartSession(suggestedGame.bgg_id)} size="lg" className="w-full sm:w-auto h-12 px-6 rounded-2xl font-black shadow-md shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{t('play.startMeetupWithGame', 'Abrir Mesa')}</span>
              </Button>
              <Button type="button" variant="secondary" onClick={onSpin} disabled={isSpinning} size="lg" className="w-full sm:w-auto h-12 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{t('play.spinAgain')}</span>
              </Button>
              <Button type="button" variant="purple" onClick={onOpenVoting} disabled={isSpinning} size="lg" className="w-full sm:w-auto h-12 px-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xs">
                <Vote className="w-4 h-4 text-white" aria-hidden="true" />
                <span>{t('play.expressVoting', 'Votación Exprés')}</span>
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="p-6 rounded-3xl bg-card/60 border border-border/40 text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button type="button" onClick={onSpin} disabled={isSpinning} size="lg" className="w-full sm:w-auto h-12 px-8 rounded-2xl font-black shadow-md shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 transition-all">
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{t('play.spinRoulette')}</span>
              </Button>
              <Button type="button" variant="purple" size="lg" disabled={isSpinning} onClick={onOpenVoting} className="w-full sm:w-auto h-12 px-7 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xs">
                <Vote className="w-4 h-4 text-white" aria-hidden="true" />
                <span>{t('play.expressVoting', 'Votación Exprés (30s)')}</span>
              </Button>
            </div>
            {spinError && <p className="text-xs font-semibold text-destructive animate-in fade-in">{spinError}</p>}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
