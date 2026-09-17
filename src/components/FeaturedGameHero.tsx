import { motion } from 'framer-motion'
import { Plus, Star, Users, Hourglass, Brain } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { OptimizedImage } from './ui/OptimizedImage'
import { Game } from '../types'
import { useGameLocale } from '../hooks/useGameLocale'
import { useTranslation } from 'react-i18next'

interface FeaturedGameHeroProps {
  game: Game | null;
}

export function FeaturedGameHero({ game }: FeaturedGameHeroProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { getGameTitle, getGamePublisher, getGameCover } = useGameLocale()
  if (!game) return null

  const displayTitle = getGameTitle(game)
  const coverUrl = getGameCover(game)
  const isSpanish = game.has_spanish_edition || !!game.title_es
  
  // Format complexity (averageweight) to 1 decimal place or show placeholder
  const formattedComplexity = game.complexity 
    ? Number(game.complexity).toFixed(1) 
    : 'N/A'

  // Format rating (average) to 1 decimal place
  const formattedRating = game.rating_average 
    ? Number(game.rating_average).toFixed(1) 
    : (game.rating_geek ? Number(game.rating_geek).toFixed(1) : 'N/A')

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, a')) return
    navigate(`/juegos/${game.bgg_id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('button, a')) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(`/juegos/${game.bgg_id}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', damping: 25 }}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="w-full relative rounded-3xl overflow-hidden border border-border bg-card backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-xl group cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {/* Decorative Neon Glows in background */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-br from-primary/10 to-teal-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-purple-500/5 to-primary/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Game Cover on Left */}
      <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-44 md:h-44 shrink-0 rounded-2xl overflow-hidden border border-border bg-muted shadow-2xl relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <OptimizedImage
          src={coverUrl}
          alt={displayTitle}
          widthSize={350}
          fit="cover"
          loading="eager"
          className="w-full h-full"
        />
      </div>

      {/* Info on Right */}
      <div className="flex-1 min-w-0 text-center md:text-left flex flex-col justify-between h-full space-y-4">
        <div className="space-y-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider select-none">
            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-primary/30" />
            <span>{t('explore.recommendedTitle')}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight break-words text-pretty">
            {displayTitle}
            {game.year_published && (
              <span className="text-muted-foreground/60 text-sm sm:text-base md:text-lg font-normal ml-2">
                ({game.year_published})
              </span>
            )}
          </h2>

          {/* Subtitle / Edition */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-muted-foreground">
            {isSpanish && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-xs">
                {t('explore.spanishEdition')}
              </span>
            )}
            {getGamePublisher(game) && (
              <span className="text-muted-foreground/70">{t('explore.editedBy', { publisher: getGamePublisher(game) })}</span>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-2 border-y border-border max-w-xl mx-auto md:mx-0">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-foreground/80">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">{t('explore.rating')}</span>
              <span className="font-extrabold text-foreground text-sm sm:text-base leading-tight mt-0.5">{formattedRating}</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-foreground/80">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">{t('common.players')}</span>
              <span className="font-extrabold text-foreground text-sm sm:text-base leading-tight mt-0.5">
                {game.min_players === game.max_players 
                  ? game.min_players 
                  : `${game.min_players}-${game.max_players}`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-foreground/80">
            <Hourglass className="w-4 h-4 text-teal-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">{t('explore.duration')}</span>
              <span className="font-extrabold text-foreground text-sm sm:text-base leading-tight mt-0.5">
                {game.playing_time ? `${game.playing_time} ${t('explore.minutes')}` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-foreground/80">
            <Brain className="w-4 h-4 text-purple-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground leading-none">{t('explore.difficulty')}</span>
              <span className="font-extrabold text-foreground text-sm sm:text-base leading-tight mt-0.5">{formattedComplexity} <span className="text-xs text-muted-foreground">/5</span></span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
          <Link 
            to={`/mesa/nueva?gameId=${game.bgg_id}`} 
            onClick={(e) => e.stopPropagation()} 
            className="shrink-0"
          >
            <Button size="sm" className="font-bold cursor-pointer rounded-xl h-10 px-5 flex items-center gap-1.5 shadow-lg shadow-primary/10 hover:shadow-primary/20">
              <Plus className="w-4.5 h-4.5" />
              <span>{t('common.hostTable')}</span>
            </Button>
          </Link>
          <Link 
            to={`/juegos/${game.bgg_id}`} 
            onClick={(e) => e.stopPropagation()} 
            className="shrink-0"
          >
            <Button size="sm" variant="outline" className="font-semibold cursor-pointer rounded-xl h-10 px-5">
              {t('common.details')}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
