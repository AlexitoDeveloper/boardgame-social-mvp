import { Card, CardTitle, CardDescription } from './ui/card'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { MapPin, CalendarDays, Users, Loader2 } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { Meetup } from '../types'

interface MeetupCardProps {
  meetup: Meetup;
  user: User | null;
  updatingId: string | null;
  onJoinLeave: (meetup: Meetup) => void;
  onNavigate: (path: string) => void;
}

export function MeetupCard({ meetup, user, updatingId, onJoinLeave, onNavigate }: MeetupCardProps) {
  const userId = user?.id
  const isJoined = userId ? meetup.joined_players?.includes(userId) : false
  const isCreator = meetup.creator_id === userId
  const registeredCount = meetup.joined_players?.length || 0
  const guestsCount = meetup.meetup_guests?.length || 0
  const totalAttendees = registeredCount + guestsCount
  const isFull = totalAttendees >= meetup.max_players
  const isLoading = updatingId === meetup.id

  const spotsRemaining = meetup.max_players - totalAttendees
  const isLastSpot = spotsRemaining === 1

  // Extract game title and image url from meetup
  // Sometimes meetup.games can be an array or a single object due to PostgREST structure
  const gameInfo = Array.isArray(meetup.games) ? meetup.games[0] : meetup.games;

  const renderJoinButton = () => {
    if (!user) {
      return (
        <Button 
          onClick={() => onNavigate('/auth')} 
          variant="default" 
          size="sm" 
          className="flex-1 rounded-xl font-bold text-xs h-9 shadow-md shadow-primary/10 transition-all"
        >
          Apuntarse
        </Button>
      )
    }

    if (isCreator) {
      return (
        <Button 
          disabled 
          variant="secondary" 
          size="sm" 
          className="flex-1 rounded-xl font-bold text-xs h-9 bg-primary/10 text-primary opacity-80"
        >
          Master
        </Button>
      )
    }

    if (isLoading) {
      return (
        <Button 
          disabled 
          variant="secondary" 
          size="sm" 
          className="flex-1 rounded-xl font-bold text-xs h-9"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </Button>
      )
    }

    if (isJoined) {
      return (
        <Button 
          onClick={() => onJoinLeave(meetup)} 
          variant="destructive" 
          size="sm" 
          className="flex-1 rounded-xl font-bold text-xs h-9 shadow-md shadow-destructive/15 transition-all hover:bg-destructive/90"
        >
          Salirse
        </Button>
      )
    }

    if (isFull) {
      return (
        <Button 
          disabled 
          variant="outline" 
          size="sm" 
          className="flex-1 rounded-xl font-bold text-xs h-9 border-muted-foreground/30 text-muted-foreground"
        >
          Completo
        </Button>
      )
    }

    return (
      <Button 
        onClick={() => onJoinLeave(meetup)} 
        variant="default" 
        size="sm" 
        className="flex-1 rounded-xl font-bold text-xs h-9 shadow-md shadow-primary/15 transition-all hover:bg-primary/95"
      >
        Apuntarse
      </Button>
    )
  }

  return (
    <Card className="overflow-hidden bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 group border border-border/40 p-4 sm:p-5">
      {/* Header with Title and Game Cover Frame */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <CardTitle className="text-lg font-extrabold leading-tight tracking-tight text-card-foreground truncate">
            {meetup.title || 'Partida de Juego de Mesa'}
          </CardTitle>
          
          {(gameInfo?.title || meetup.game_name) && (
            <div className="text-xs font-bold text-primary tracking-wide">
              Juego: <span className="text-foreground/90 font-semibold">{gameInfo?.title || meetup.game_name}</span>
            </div>
          )}
          
          <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {new Date(meetup.date || meetup.created_at || '').toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {meetup.location || 'Ubicación por definir'}
            </span>
          </CardDescription>
        </div>

        {/* Game Cover Showcase Frame */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative rounded-xl overflow-hidden bg-background/50 border border-border/40 p-1.5 flex items-center justify-center shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 group-hover:border-primary/30 transition-all duration-300">
          {gameInfo?.image_url ? (
            <img 
              src={gameInfo.image_url} 
              alt={gameInfo.title || 'Juego'} 
              className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-[10px] text-muted-foreground/60 font-extrabold text-center uppercase tracking-wider p-1 leading-snug">
              {(gameInfo?.title || meetup.game_name || 'Juego').slice(0, 3)}
            </div>
          )}
        </div>
      </div>

      {/* Card Body Description */}
      <div className="mt-3.5 space-y-3.5">
        {meetup.description && (
          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-3">{meetup.description}</p>
        )}
        
        {/* Joined players info */}
        <div className={`flex items-center justify-between pt-3 ${meetup.description ? 'border-t border-border/30' : ''}`}>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border border-background shadow-sm">
              <AvatarImage src={meetup.users?.avatar_url || undefined} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {meetup.users?.username?.slice(0,2)?.toUpperCase() || 'H'}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-muted-foreground font-medium">
              Master: <span className="font-semibold text-foreground">{meetup.users?.username || 'anónimo'}</span>
            </span>
          </div>

          {/* Player spots badge */}
          <div className="flex flex-col items-end gap-1">
            <div className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 border border-primary/20 bg-primary/10 text-primary transition-all duration-300">
              <Users className="w-3 h-3" />
              {totalAttendees} / {meetup.max_players} plazas
            </div>
            {isLastSpot && (
              <Badge
                variant="outline"
                className="text-[11px] font-bold bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse [animation-duration:2s]"
              >
                Última plaza
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions footer */}
      <div className="flex gap-2 pt-4">
        <Button 
          onClick={() => onNavigate(`/tablero/${meetup.id}`)}
          variant="outline" 
          size="sm" 
          className="flex-1 rounded-xl font-semibold border-border/50 text-xs h-9 transition-colors hover:bg-muted/80"
        >
          Ver Detalles
        </Button>
        {renderJoinButton()}
      </div>
    </Card>
  )
}
