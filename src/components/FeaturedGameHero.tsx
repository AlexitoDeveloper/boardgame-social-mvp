import { motion } from 'framer-motion'
import { Plus, Star } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { OptimizedImage } from './ui/OptimizedImage'
import { ExpansionBadge } from './ui/expansion-badge'
import { Game } from '../types'
import { useGameLocale } from '../hooks/useGameLocale'
import { useTranslation } from 'react-i18next'
import { FeaturedGameStats } from './FeaturedGameStats'
import { FeaturedGameHeroSkeleton } from './FeaturedGameHeroSkeleton'

export { FeaturedGameHeroSkeleton }

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
  const hasComplexity = game.complexity != null && Number(game.complexity) > 0
  const formattedComplexity = hasComplexity 
    ? Number(game.complexity).toFixed(1) 
    : null

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
      whileHover={{ y: -3 }}
      transition={{ duration: 0.4, type: 'spring', damping: 25, stiffness: 300 }}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="w-full relative rounded-3xl overflow-hidden border border-border/40 bg-card/80 backdrop-blur-xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-xl group cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {/* Decorative Neon Aura Glows in background */}
      <div className="absolute -top-12 -right-12 w-72 h-72 bg-gradient-to-br from-primary/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-gradient-to-tr from-purple-500/10 via-primary/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Game Cover on Left */}
      <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-44 md:h-44 shrink-0 rounded-2xl overflow-hidden border border-border/40 bg-muted shadow-2xl relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
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
          <Badge variant="primary-soft" className="gap-1.5 px-3 py-1 text-xs border-primary/25">
            <Star className="w-3.5 h-3.5 fill-primary/30" strokeWidth={2} aria-hidden="true" />
            <span>{t('explore.recommendedTitle')}</span>
          </Badge>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-display tracking-tight text-foreground leading-tight break-words text-pretty">
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
            {game.is_expansion && (
              <ExpansionBadge size="sm" />
            )}
            {getGamePublisher(game) && (
              <span className="text-muted-foreground/70">{t('explore.editedBy', { publisher: getGamePublisher(game) })}</span>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <FeaturedGameStats
          game={game}
          formattedRating={formattedRating}
          formattedComplexity={formattedComplexity}
          hasComplexity={hasComplexity}
        />

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
          <Link 
            to={`/mesa/nueva?gameId=${game.bgg_id}`} 
            onClick={(e) => e.stopPropagation()} 
            className="shrink-0"
          >
            <Button size="default" className="font-bold cursor-pointer rounded-xl h-11 px-5 flex items-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20">
              <Plus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              <span>{t('common.hostTable')}</span>
            </Button>
          </Link>
          <Link 
            to={`/juegos/${game.bgg_id}`} 
            onClick={(e) => e.stopPropagation()} 
            className="shrink-0"
          >
            <Button size="default" variant="outline" className="font-semibold cursor-pointer rounded-xl h-11 px-5">
              {t('common.details')}
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
