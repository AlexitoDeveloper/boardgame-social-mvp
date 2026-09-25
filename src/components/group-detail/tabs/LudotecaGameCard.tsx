import React from 'react'
import { Users, Clock, Flame, Check } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { MergedGame } from '../../../hooks/useGroupDetail'
import { User } from '@supabase/supabase-js'

interface LudotecaGameCardProps {
  item: MergedGame
  user: User | null
  isHighlighted?: boolean
  onClick: () => void
}

export const LudotecaGameCard: React.FC<LudotecaGameCardProps> = ({
  item,
  user,
  isHighlighted = false,
  onClick,
}) => {
  const { game, owners } = item
  const title = game.title_es || game.title
  const isMine = owners.some((o) => o.user_id === user?.id)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`group relative flex flex-col text-left rounded-2xl overflow-hidden border cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.97] transition-[transform,border-color,box-shadow] duration-160 ease-out ${
        isHighlighted
          ? 'border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/20 scale-[1.02]'
          : 'border-border/30 bg-card/40 hover:bg-card/90 hover:border-primary/40 hover:shadow-md'
      }`}
    >
      {/* Game Cover Poster Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-250 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted/30 text-muted-foreground/30 font-black text-xs">
            SIN PORTADA
          </div>
        )}

        {/* Ambient Bottom Gradient Scrim for crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />

        {/* Top Badges (Player Count & Optional Complexity) */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          {(game.min_players || game.max_players) && (
            <Badge
              variant="secondary"
              size="sm"
              className="bg-background/85 backdrop-blur-xs border-border/40 font-mono-tabular text-[10px] py-0 px-1.5 shadow-2xs"
            >
              <Users className="w-2.5 h-2.5 mr-0.5 text-primary" />
              {game.min_players === game.max_players
                ? `${game.min_players} jug.`
                : `${game.min_players ?? 1}-${game.max_players ?? '?'} jug.`}
            </Badge>
          )}
        </div>

        {isMine && (
          <div className="absolute top-2 left-2 z-10">
            <Badge
              variant="raspberry"
              size="sm"
              className="text-white font-black text-[11px] px-2 py-0.5 shadow-tactile-raspberry flex items-center gap-1 rounded-lg"
            >
              <Check className="w-3 h-3 stroke-[3]" />
              Mío
            </Badge>
          </div>
        )}

        {/* Bottom Floating Owner Stack */}
        <div className="absolute bottom-2 left-2.5 z-10 flex items-center -space-x-1.5">
          {owners.slice(0, 3).map((owner) => {
            const isMe = owner.user_id === user?.id
            return (
              <Avatar
                key={owner.user_id}
                className="h-5 w-5 border-2 border-background shadow-xs ring-1 ring-border/20"
                title={isMe ? 'Tú aportaste esta copia' : owner.username}
              >
                <AvatarImage src={owner.avatar_url || undefined} />
                <AvatarFallback className="text-[8px] font-black bg-primary/20 text-primary">
                  {owner.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )
          })}
          {owners.length > 3 && (
            <span className="h-5 min-w-5 px-1 rounded-full bg-background/90 border border-border/40 text-[9px] font-black text-muted-foreground flex items-center justify-center font-mono-tabular">
              +{owners.length - 3}
            </span>
          )}
        </div>

        {game.playing_time && (
          <div className="absolute bottom-2 right-2.5 z-10 text-[10px] font-mono-tabular font-bold text-foreground/90 bg-background/70 backdrop-blur-2xs px-1.5 py-0.5 rounded-md border border-border/20 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
            <span>{game.playing_time}m</span>
          </div>
        )}
      </div>

      {/* Typography Block */}
      <div className="p-3 space-y-1">
        <h4 className="font-extrabold text-xs text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-160">
          {title}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground/75 font-semibold">
          <span className="truncate">
            {owners.length === 1 ? owners[0].username : `${owners.length} aportaciones`}
          </span>
          {game.complexity && (
            <span className="flex items-center gap-0.5 text-[10px] font-mono-tabular text-amber dark:text-amber-hover font-bold shrink-0">
              <Flame className="w-2.5 h-2.5" />
              {game.complexity.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
