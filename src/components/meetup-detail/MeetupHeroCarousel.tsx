import { Button } from '../ui/button'
import { Tag } from '../ui/tag'
import { OptimizedImage } from '../ui/OptimizedImage'
import { Game } from '../../types'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameLocale } from '../../hooks/useGameLocale'
import { ChevronLeft, ChevronRight, Dices, Laptop } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface MeetupHeroCarouselProps {
  gamesList: Game[]
  activeGameIdx: number
  setActiveGameIdx: (idx: number | ((prev: number) => number)) => void
  isPast: boolean
  isFull: boolean
  spotsRemaining: number
  isOnline: boolean
  isMock: boolean
}

export function MeetupHeroCarousel({
  gamesList,
  activeGameIdx,
  setActiveGameIdx,
  isPast,
  isFull,
  spotsRemaining,
  isOnline,
  isMock
}: MeetupHeroCarouselProps) {
  const { getGameTitle, getGameCover } = useGameLocale()
  const { t } = useTranslation()

  const currentGame = gamesList[activeGameIdx] || null
  const currentCover = currentGame ? getGameCover(currentGame) : null

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveGameIdx((prev) => (prev - 1 + gamesList.length) % gamesList.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveGameIdx((prev) => (prev + 1) % gamesList.length)
  }

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation()
    setActiveGameIdx(idx)
  }

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[380px] overflow-hidden bg-muted/40 border-b border-border/30 flex items-center justify-center select-none">
      {currentCover ? (
        <>
          {/* Fondo difuminado ambiental con viñeta suave */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`bg-${currentGame.bgg_id || activeGameIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full pointer-events-none select-none absolute inset-0 -z-10"
            >
              <OptimizedImage
                src={currentCover}
                alt=""
                widthSize={100}
                className="w-full h-full object-cover filter blur-2xl scale-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Portada del juego centrada con proporción nativa sin recortes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`cover-wrapper-${currentGame.bgg_id || activeGameIdx}`}
              drag={gamesList.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (gamesList.length <= 1) return
                const swipeThreshold = 50
                if (info.offset.x < -swipeThreshold) {
                  setActiveGameIdx((prev) => (prev + 1) % gamesList.length)
                } else if (info.offset.x > swipeThreshold) {
                  setActiveGameIdx((prev) => (prev - 1 + gamesList.length) % gamesList.length)
                }
              }}
              initial={{ opacity: 0, scale: 0.94, x: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ 
                opacity: { duration: 0.25 },
                scale: { duration: 0.25 },
                x: { type: "spring", stiffness: 320, damping: 32 }
              }}
              className={`absolute inset-0 flex items-center justify-center p-6 sm:p-8 z-10 touch-pan-y ${
                gamesList.length > 1 ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            >
              <OptimizedImage
                src={currentCover}
                alt={getGameTitle(currentGame) || 'Juego'}
                widthSize={500}
                fit="contain"
                className="w-full h-full bg-transparent border-0 shadow-none flex items-center justify-center"
                imgClassName="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl border border-white/15 drop-shadow-2xl transition-transform duration-300 pointer-events-none select-none"
              />
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        /* Placeholder visual premium cuando no hay portada */
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 shadow-inner">
            {isOnline ? <Laptop className="w-9 h-9" /> : <Dices className="w-9 h-9" />}
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            {t('meetup.tableOnBoard', 'Mesa en el Tablero')}
          </span>
        </div>
      )}

      {/* Controles de navegación del carrusel */}
      {gamesList.length > 1 && (
        <>
          <Button
            onClick={handlePrev}
            variant="ghost"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 p-0 rounded-full bg-background/80 dark:bg-black/60 text-foreground dark:text-white flex items-center justify-center border border-border dark:border-white/10 hover:bg-background dark:hover:bg-black/80 hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer"
            aria-label={t('common.prevGame', 'Juego anterior')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleNext}
            variant="ghost"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 p-0 rounded-full bg-background/80 dark:bg-black/60 text-foreground dark:text-white flex items-center justify-center border border-border dark:border-white/10 hover:bg-background dark:hover:bg-black/80 hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer"
            aria-label={t('common.nextGame', 'Siguiente juego')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Paginación y contador */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/75 dark:bg-black/60 backdrop-blur-md border border-border/40 shadow-sm">
            <div className="flex gap-1.5 items-center">
              {gamesList.map((_, idx) => (
                <Button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  variant="ghost"
                  className={`min-w-0 p-0 transition-all cursor-pointer hover:bg-transparent ${
                    idx === activeGameIdx 
                      ? "bg-primary w-5 h-2 rounded-md" 
                      : "w-2 h-2 rounded-full bg-muted-foreground/45 hover:bg-muted-foreground/75"
                  }`}
                  aria-label={`${t('common.game', 'Juego')} ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Badges superiores: Estado de la mesa */}
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        {isPast ? (
          <Tag variant="secondary-solid" className="shadow-md">
            {t('common.completed', 'Finalizada')}
          </Tag>
        ) : isFull ? (
          <Tag variant="destructive-solid" className="shadow-md">
            {t('common.full', 'Mesa llena')}
          </Tag>
        ) : spotsRemaining === 1 ? (
          <Tag variant="warning-solid" className="shadow-md" pulse>
            {t('meetup.lastSpot', 'Última plaza')}
          </Tag>
        ) : (
          <Tag variant="success-solid" className="shadow-md">
            {t('meetup.openTable', 'Mesa abierta')}
          </Tag>
        )}
        
        {isMock && (
          <Tag variant="secondary-solid" className="shadow-md">
            Demo
          </Tag>
        )}
      </div>
    </div>
  )
}
