import { motion } from 'framer-motion'
import { BookmarkCheck } from 'lucide-react'
import { ExpansionBadge } from '../../ui/expansion-badge'
import { Game } from '../../../types'
import { useGameLocale } from '../../../hooks/useGameLocale'

interface GamePosterCardProps {
  game: Game;
  isWishlisted: boolean;
  isUnplayed: boolean;
  gameTitle: string;
  onClick: () => void;
}

export function GamePosterCard({
  game,
  isWishlisted,
  isUnplayed,
  gameTitle,
  onClick,
}: GamePosterCardProps) {
  const { getGameCover } = useGameLocale()
  const coverUrl = getGameCover(game) || game.image_url

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-2xl"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="block relative rounded-2xl overflow-hidden glass-panel border border-border/40 hover:border-primary/40 hover:shadow-xl transition-all duration-300">
        {/* Poster Artwork (2:3 Aspect Ratio) */}
        <div className="w-full aspect-[2/3] relative bg-muted/30 overflow-hidden flex items-center justify-center">
          {coverUrl ? (
            <>
              <img
                src={coverUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none"
              />
              <img
                src={coverUrl}
                alt={gameTitle}
                className="w-full h-full object-contain p-2 relative z-10 rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </>
          ) : (
            <span className="text-xs font-bold text-muted-foreground p-3 text-center">
              {gameTitle}
            </span>
          )}

          {/* Wishlist / Quiero Jugar Indicator Ribbon (Top Right) */}
          {isWishlisted && (
            <div 
              className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-purple-600/90 text-white backdrop-blur-md shadow-xs border border-purple-400/30 flex items-center justify-center"
              title="En tu lista Quiero Jugar"
              aria-label="En tu lista Quiero Jugar"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Unplayed / Shelf of Shame Indicator Tag (Bottom Left) */}
          {isUnplayed && (
            <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-amber-400 text-zinc-950 shadow-md border border-amber-300 select-none">
                Sin jugar
              </span>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="p-2.5 text-center space-y-0.5 bg-card/80">
          <h4 className="font-extrabold text-xs text-foreground group-hover:text-primary transition-colors truncate">
            {gameTitle}
          </h4>
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono-tabular text-muted-foreground font-semibold">
            {game.is_expansion && <ExpansionBadge size="xs" />}
            <span>{game.year_published || 'N/A'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
