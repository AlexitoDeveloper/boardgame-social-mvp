import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Users, Brain, Globe } from 'lucide-react'
import { Game } from '../types'
import { OptimizedImage } from './ui/OptimizedImage'

interface GameCoverCardProps {
  game: Game;
}

export function GameCoverCard({ game }: GameCoverCardProps) {
  const title = game.title_es || game.title;
  
  // Try rating_geek first, then rating_average
  const rating = game.rating_geek 
    ? game.rating_geek.toFixed(1) 
    : (game.rating_average ? game.rating_average.toFixed(1) : null);

  const players = game.min_players && game.max_players
    ? game.min_players === game.max_players 
      ? `${game.min_players}` 
      : `${game.min_players}-${game.max_players}`
    : null;

  return (
    <Link 
      to={`/juegos/${game.bgg_id}`} 
      className="group relative block aspect-[2/3] w-full overflow-hidden rounded-2xl bg-card border border-border/30 shadow-md hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/45 transition-all duration-500 ease-out"
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
      >
        {/* Floating Badges (Always visible for mobile & quick desktop discovery) */}
        <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1 pointer-events-none">
          {rating && (
            <span className="flex items-center gap-0.5 rounded-md bg-amber-500/90 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm border border-amber-400/20">
              <Star className="h-2.5 w-2.5 fill-white text-white shrink-0" />
              {rating}
            </span>
          )}
          {game.has_spanish_edition && (
            <span className="flex items-center gap-0.5 rounded-md bg-primary/90 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground shadow-sm border border-primary-foreground/10">
              <Globe className="h-2.5 w-2.5 shrink-0" />
              ESP
            </span>
          )}
        </div>
        {/* Cover Image */}
        {game.image_url ? (
          <div className="absolute inset-0 w-full h-full">
            {/* Blurred background copy for cropped edges fill */}
            <OptimizedImage
              src={game.image_url}
              alt=""
              widthSize={50}
              className="absolute inset-0 h-full w-full object-cover blur-xl opacity-40 scale-110 pointer-events-none transition-all duration-500 group-hover:brightness-[0.3]"
            />
            {/* Contained front cover artwork */}
            <OptimizedImage
              src={game.image_url}
              alt={title}
              widthSize={250}
              fit="contain"
              className="absolute inset-0 h-full w-full object-contain p-2 z-0 transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-[0.5]"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 p-4 text-center">
            <span className="text-xs font-bold text-muted-foreground line-clamp-3 px-2">{title}</span>
          </div>
        )}
        {/* Hover Details Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/45 to-transparent p-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10 select-none">
          <div className="space-y-1.5 text-white">
            {/* Title */}
            <h4 className="text-xs font-black leading-tight line-clamp-2 tracking-tight group-hover:text-white transition-colors duration-200 text-pretty">
              {title}
            </h4>

            {/* Quick Specs */}
            <div className="flex items-center gap-2 text-[9px] text-gray-300 font-semibold">
              {players && (
                <span className="flex items-center gap-0.5">
                  <Users className="h-2.5 w-2.5 text-primary shrink-0" />
                  {players}
                </span>
              )}
              {game.complexity && (
                <span className="flex items-center gap-0.5">
                  <Brain className="h-2.5 w-2.5 text-primary shrink-0" />
                  {game.complexity.toFixed(1)}/5
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
export default GameCoverCard;
