import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Star, Users, Brain, Globe } from 'lucide-react'
import { Game } from '../types'
import { OptimizedImage } from './ui/OptimizedImage'
import { ExpansionBadge } from './ui/expansion-badge'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { useGameLocale } from '../hooks/useGameLocale'
import { cn } from '../lib/utils'

interface GameCoverCardProps {
  game: Game;
}

export const GameCoverCardSkeleton = memo(function GameCoverCardSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("aspect-[2/3] w-full rounded-2xl border border-border/20", className)} />
  )
})

export const GameCoverCard = memo(function GameCoverCard({ game }: GameCoverCardProps) {
  const { getGameTitle, getGameCover } = useGameLocale()
  const title = getGameTitle(game)
  const coverUrl = getGameCover(game)
  
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
    <div className="relative w-full aspect-[2/3] transition-transform duration-150 ease-out-custom [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:scale-[1.02] [@media(hover:hover)]:active:scale-[0.98]">
      <Link 
        to={`/juegos/${game.bgg_id}`} 
        className="group relative block w-full h-full overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-xl hover:shadow-primary/15 hover:border-primary/50 transition-[box-shadow,border-color] duration-150 ease-out-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="absolute inset-0 w-full h-full">
          {/* Floating Badges (Always visible for mobile & quick desktop discovery) */}
          <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1 pointer-events-none">
            {rating && (
              <Badge variant="amber" className="gap-1 px-1.5 py-0.5 text-xs font-mono-tabular shadow-sm">
                <Star className="h-3 w-3 fill-white text-white shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>{rating}</span>
              </Badge>
            )}
            {game.has_spanish_edition && (
              <Badge variant="raspberry" className="gap-1 px-1.5 py-0.5 text-xs font-bold shadow-sm">
                <Globe className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>ESP</span>
              </Badge>
            )}
            {game.is_expansion && (
              <ExpansionBadge size="xs" />
            )}
          </div>

          {/* Clean High-Performance Cover Display */}
          <div className="absolute inset-0 w-full h-full bg-muted/20 flex items-center justify-center">
            <OptimizedImage
              src={coverUrl}
              alt={title}
              widthSize={250}
              fit="contain"
              className="absolute inset-0 h-full w-full object-contain p-2 z-0 transition-[transform,filter] duration-200 ease-out group-hover:scale-105 group-hover:brightness-[0.7]"
            />
          </div>

          {/* Hover Details Overlay (Desktop only) */}
          <div className="absolute inset-0 hidden sm:flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/45 to-transparent p-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 z-10 select-none pointer-events-none">
            <div className="space-y-1.5 text-white">
              {/* Title */}
              <h4 className="text-xs font-black leading-tight line-clamp-2 tracking-tight group-hover:text-white transition-colors duration-150 text-pretty">
                {title}
              </h4>

              {/* Quick Specs */}
              <div className="flex items-center gap-2 text-xs text-gray-300 font-semibold">
                {players && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2} aria-hidden="true" />
                    {players}
                  </span>
                )}
                {game.complexity && (
                  <span className="flex items-center gap-1">
                    <Brain className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={2} aria-hidden="true" />
                    {game.complexity.toFixed(1)}/5
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
})

export default GameCoverCard;
