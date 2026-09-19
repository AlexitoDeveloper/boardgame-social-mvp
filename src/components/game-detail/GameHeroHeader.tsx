import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Globe, ExternalLink, ZoomIn, Users, Brain, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Game } from '@/types'
import { cn } from '@/lib/utils'
import { sanitizeGameText } from '@/lib/gameLocale'
import { Badge } from '@/components/ui/badge'
import { ExpansionBadge } from '@/components/ui/expansion-badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface GameHeroHeaderProps {
  game: Game
  title: string
  coverUrl: string | null
  language: string
}

export function GameHeroHeader({ game, title, coverUrl, language }: GameHeroHeaderProps) {
  const { t } = useTranslation()
  const [isCoverZoomOpen, setIsCoverZoomOpen] = useState(false)
  const fullCoverUrl = coverUrl || game.image_url

  const complexity = game.complexity && game.complexity > 0 ? Number(game.complexity) : 0
  let complexityBadgeClass = 'text-muted-foreground border-border/50 bg-muted/40'
  if (complexity > 0) {
    if (complexity <= 2.2) {
      complexityBadgeClass = 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    } else if (complexity <= 3.5) {
      complexityBadgeClass = 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'
    } else {
      complexityBadgeClass = 'text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10'
    }
  }

  const minPlayers = game.min_players != null && game.min_players > 0 ? game.min_players : null
  const maxPlayers = game.max_players != null && game.max_players > 0 ? game.max_players : null
  let playersDisplay = ''
  if (minPlayers && maxPlayers) {
    playersDisplay = minPlayers === maxPlayers ? `${minPlayers}p` : `${minPlayers}-${maxPlayers}p`
  } else if (minPlayers) {
    playersDisplay = `${minPlayers}+p`
  } else if (maxPlayers) {
    playersDisplay = `≤${maxPlayers}p`
  }

  return (
    <>
      {/* Ambient background blur */}
      {coverUrl && (
        <div className="absolute top-0 inset-x-0 h-[400px] overflow-hidden pointer-events-none select-none -z-10 opacity-30 dark:opacity-35">
          <OptimizedImage
            src={coverUrl}
            alt=""
            widthSize={100}
            className="w-full h-full object-cover filter blur-[50px] scale-135 transform-gpu"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/65 to-background" />
        </div>
      )}

      {/* Info Header */}
      <div className="relative max-w-6xl mx-auto px-4 flex gap-4 md:gap-8 items-start md:items-end text-left select-text">
        {/* Cover Art with Lightbox Trigger */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={() => fullCoverUrl && setIsCoverZoomOpen(true)}
          role={fullCoverUrl ? 'button' : undefined}
          tabIndex={fullCoverUrl ? 0 : undefined}
          onKeyDown={(e) => {
            if (fullCoverUrl && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              setIsCoverZoomOpen(true)
            }
          }}
          className={cn(
            "group/cover relative h-28 sm:h-36 md:h-48 w-24 sm:w-32 md:w-44 shrink-0 rounded-2xl shadow-xl border border-border/30 flex items-center justify-center bg-card/60 backdrop-blur-xs overflow-hidden transition-all duration-300",
            fullCoverUrl && "cursor-zoom-in hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/40"
          )}
          title={fullCoverUrl ? t('gameDetail.viewCover') : undefined}
          aria-label={fullCoverUrl ? t('gameDetail.viewCover') : undefined}
        >
          <OptimizedImage
            src={fullCoverUrl}
            alt={title}
            widthSize={350}
            fit="contain"
            loading="eager"
            className="w-full h-full p-1 transition-transform duration-300 group-hover/cover:scale-105"
          />

          {/* Hover zoom indicator overlay */}
          {fullCoverUrl && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 text-white pointer-events-none p-2 text-center">
              <div className="p-2 rounded-full bg-black/60 backdrop-blur-xs shadow-md border border-white/10">
                <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold leading-tight drop-shadow-md hidden sm:inline-block">
                {t('gameDetail.viewCover')}
              </span>
            </div>
          )}
        </motion.div>

        {/* Title and metadata */}
        <div className="flex-grow space-y-2 md:space-y-3 pb-1 md:pb-2 select-text min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {game.year_published && (
              <Badge variant="secondary" size="sm" className="font-bold">
                <CalendarDays className="h-3 w-3 mr-1 opacity-70" />
                {game.year_published}
              </Badge>
            )}

            {playersDisplay && (
              <Badge variant="outline" size="sm" className="font-bold bg-card/60 border-border/60">
                <Users className="h-3 w-3 mr-1 opacity-70" />
                {playersDisplay}
              </Badge>
            )}

            {complexity > 0 && (
              <Badge variant="outline" size="sm" className={cn("font-bold border", complexityBadgeClass)}>
                <Brain className="h-3 w-3 mr-1 opacity-80" />
                {complexity.toFixed(1)} / 5
              </Badge>
            )}

            {game.rating_average != null && game.rating_average > 0 && (
              <Badge variant="outline" size="sm" className="font-bold text-amber-500 border-amber-500/30 bg-amber-500/10">
                <Star className="h-3 w-3 mr-1 fill-amber-500/40 text-amber-500" />
                {game.rating_average.toFixed(1)}
              </Badge>
            )}

            {game.has_spanish_edition && (
              <Badge variant="primary-soft" size="sm" className="font-bold">
                <Globe className="h-3 w-3 mr-1 opacity-70" />
                ES
              </Badge>
            )}

            {game.is_expansion && <ExpansionBadge size="sm" />}

            <a
              href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center group/bgg"
              title={t('gameDetail.viewOnBgg')}
            >
              <Badge variant="outline" size="sm" className="font-bold group-hover/bgg:border-primary/50 group-hover/bgg:text-primary transition-colors bg-card/40">
                BGG
                <ExternalLink className="h-2.5 w-2.5 ml-1 opacity-60 group-hover/bgg:opacity-100" />
              </Badge>
            </a>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-foreground drop-shadow-xs leading-tight break-words">
            {title}
          </h1>

          {language === 'es' && game.title_es && sanitizeGameText(game.title_es) !== sanitizeGameText(game.title) && (
            <p className="text-xs font-semibold text-muted-foreground">
              {t('gameDetail.originalTitle')}: <span className="italic font-bold text-foreground/80">{sanitizeGameText(game.title)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Cover Image Lightbox Modal */}
      {fullCoverUrl && (
        <Dialog open={isCoverZoomOpen} onOpenChange={setIsCoverZoomOpen}>
          <DialogContent className="max-w-[94vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col p-3 sm:p-5 bg-card/95 backdrop-blur-2xl border border-border/40 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <DialogHeader className="px-1 pt-1 pb-2 sm:pb-3 border-b border-border/20 text-left shrink-0 min-w-0">
              <div className="flex items-center gap-2 pr-7 min-w-0">
                <DialogTitle className="text-base sm:text-xl font-black tracking-tight text-foreground truncate min-w-0 flex-1" title={title}>
                  {title}
                </DialogTitle>
                {game.year_published && (
                  <Badge variant="secondary" size="sm" className="shrink-0">
                    {game.year_published}
                  </Badge>
                )}
                {game.has_spanish_edition && (
                  <Badge variant="primary-soft" size="sm" className="shrink-0">
                    ES
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <div className="relative w-full flex-1 min-h-0 max-h-[72vh] flex items-center justify-center overflow-hidden rounded-xl bg-muted/15 p-2 sm:p-4">
              <OptimizedImage
                src={fullCoverUrl}
                alt={title}
                fit="contain"
                loading="eager"
                className="w-full h-full max-h-[68vh] bg-transparent border-0 shadow-none flex items-center justify-center"
                imgClassName="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-2xl rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
