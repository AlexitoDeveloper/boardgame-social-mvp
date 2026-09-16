import { motion } from 'framer-motion'
import { CalendarDays, Globe, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Game } from '@/types'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

interface GameHeroHeaderProps {
  game: Game
  title: string
  coverUrl: string | null
  language: string
}

export function GameHeroHeader({ game, title, coverUrl, language }: GameHeroHeaderProps) {
  const { t } = useTranslation()

  return (
    <>
      {/* Ambient background blur */}
      {coverUrl && (
        <div className="absolute top-0 inset-x-0 h-[360px] overflow-hidden pointer-events-none select-none -z-10 opacity-25 dark:opacity-30">
          <OptimizedImage
            src={coverUrl}
            alt=""
            widthSize={100}
            className="w-full h-full object-cover filter blur-[40px] scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/70 to-background" />
        </div>
      )}

      {/* Info Header */}
      <div className="relative max-w-6xl mx-auto px-4 flex gap-4 md:gap-8 items-start md:items-end text-left select-text">
        {/* Cover Art */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative h-28 sm:h-36 md:h-48 w-24 sm:w-32 md:w-44 shrink-0 rounded-2xl shadow-xl border border-border/30 flex items-center justify-center bg-card/40 backdrop-blur-xs overflow-hidden"
        >
          <OptimizedImage
            src={coverUrl || game.image_url}
            alt={title}
            widthSize={350}
            fit="contain"
            loading="eager"
            className="w-full h-full p-1"
          />
        </motion.div>

        {/* Title and metadata */}
        <div className="flex-grow space-y-2 md:space-y-3 pb-1 md:pb-2 select-text min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {game.year_published && (
              <Badge variant="secondary" size="sm">
                <CalendarDays className="h-3 w-3 mr-1 opacity-70" />
                {game.year_published}
              </Badge>
            )}
            {game.has_spanish_edition && (
              <Badge variant="primary-soft" size="sm">
                <Globe className="h-3 w-3 mr-1 opacity-70" />
                ES
              </Badge>
            )}
            {game.is_expansion && (
              <Badge variant="warning" size="sm">
                {t('gameDetail.expansion')}
              </Badge>
            )}
            <a
              href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center group/bgg"
              title="Ver en BoardGameGeek"
            >
              <Badge variant="outline" size="sm" className="group-hover/bgg:border-primary/50 group-hover/bgg:text-primary transition-colors">
                BGG
                <ExternalLink className="h-2.5 w-2.5 ml-1 opacity-60 group-hover/bgg:opacity-100" />
              </Badge>
            </a>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-foreground drop-shadow-xs leading-tight break-words">
            {title}
          </h1>

          {language === 'es' && game.title_es && game.title_es !== game.title && (
            <p className="text-xs font-semibold text-muted-foreground">
              {t('gameDetail.originalTitle')}: <span className="italic font-bold text-foreground/80">{game.title}</span>
            </p>
          )}
        </div>
      </div>
    </>
  )
}
