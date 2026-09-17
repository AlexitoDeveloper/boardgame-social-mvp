import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Bookmark, BookmarkCheck } from 'lucide-react'
import { ExpansionBadge } from '../../ui/expansion-badge'
import { Button } from '../../ui/button'
import { Game } from '../../../types'

interface GamePosterCardProps {
  game: Game;
  isWishlisted: boolean;
  isUnplayed: boolean;
  isOwnProfileEditable: boolean;
  gameTitle: string;
  onToggleWishlist: (e: React.MouseEvent, bggId: number) => void;
  onRemove: (e: React.MouseEvent, bggId: number) => void;
  removeLabel?: string;
}

export function GamePosterCard({
  game,
  isWishlisted,
  isUnplayed,
  isOwnProfileEditable,
  gameTitle,
  onToggleWishlist,
  onRemove,
  removeLabel = 'Quitar de la ludoteca'
}: GamePosterCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group relative"
    >
      <Link
        to={`/juegos/${game.bgg_id}`}
        className="block relative rounded-2xl overflow-hidden glass-panel border border-border/40 hover:border-primary/40 hover:shadow-xl transition-all duration-300"
      >
        {/* Poster Artwork (2:3 Aspect Ratio) */}
        <div className="w-full aspect-[2/3] relative bg-muted/30 overflow-hidden flex items-center justify-center">
          {game.image_url ? (
            <>
              <img
                src={game.image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none"
              />
              <img
                src={game.image_url}
                alt={gameTitle}
                className="w-full h-full object-contain p-2 relative z-10 rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </>
          ) : (
            <span className="text-xs font-bold text-muted-foreground p-3 text-center">
              {gameTitle}
            </span>
          )}

          {/* Unplayed / Shelf of Shame Indicator Tag - 100% Solid & High-Contrast (Accessible) */}
          {isUnplayed && (
            <div className="absolute top-2 left-2 z-20">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-zinc-950 shadow-md border border-amber-300 select-none">
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
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono-tabular text-muted-foreground font-semibold">
            {game.is_expansion && <ExpansionBadge size="xs" />}
            <span>{game.year_published || 'N/A'}</span>
          </div>
        </div>
      </Link>

      {/* Tactile Action Icons Overlay - Prominent and Touch-Accessible */}
      <div 
        className="absolute top-2 right-2 z-30 flex items-center gap-1"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Bookmark / Quiero Jugar */}
        <Button
          type="button"
          variant={isWishlisted ? "purple" : "ghost"}
          size="icon-sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleWishlist(e, game.bgg_id)
          }}
          className={`h-7 w-7 rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-purple-600 text-white border border-purple-400 opacity-100'
              : 'bg-black/75 text-white/90 hover:text-white border border-white/20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          title={isWishlisted ? 'Quitar de Quiero Jugar' : 'Marcar Quiero Jugar'}
          aria-label="Quiero Jugar"
          icon={isWishlisted ? BookmarkCheck : Bookmark}
        />

        {/* Delete from Collection Button */}
        {isOwnProfileEditable && (
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove(e, game.bgg_id)
            }}
            className="h-7 w-7 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-400 shadow-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
            title={removeLabel}
            aria-label={removeLabel}
            icon={Trash2}
          />
        )}
      </div>
    </motion.div>
  )
}
