import { Card, CardTitle, CardDescription } from './ui/card'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tag } from './ui/tag'
import { MapPin, CalendarDays, Users, Loader2, Laptop } from 'lucide-react'
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

  // Extract games list from meetup
  const gamesList = Array.isArray(meetup.games) ? meetup.games : (meetup.games ? [meetup.games] : []);
  const mainGame = gamesList[0] || null;

  const renderJoinButton = () => {
    if (meetup.completed) {
      return (
        <Button 
          disabled 
          variant="secondary" 
          size="sm" 
          className="flex-1 select-none"
        >
          Finalizada
        </Button>
      )
    }

    if (!user) {
      return (
        <Button 
          onClick={() => onNavigate('/auth')} 
          variant="default" 
          size="sm" 
          className="flex-1 h-9"
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
          className="flex-1"
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
          className="flex-1 h-9"
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
          className="flex-1 h-9"
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
          className="flex-1"
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
        className="flex-1 h-9"
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
          <CardTitle className="text-lg font-extrabold leading-tight tracking-tight text-card-foreground truncate flex items-center gap-2">
            <span className="truncate">{meetup.title || 'Partida de Juego de Mesa'}</span>
            {meetup.completed && (
              <Tag variant="success">
                Completada
              </Tag>
            )}
          </CardTitle>
          
          {gamesList.length === 0 ? (
            <div className="text-xs font-bold text-amber-500 tracking-wide flex items-center gap-1">
              <span>Juego:</span> <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Por decidir en chat</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-primary tracking-wide flex flex-wrap items-center gap-1.5">
              <span>Juego:</span> 
              <span className="text-foreground/90 font-semibold truncate max-w-[150px] inline-block align-middle">{mainGame?.title || meetup.game_name}</span>
              {gamesList.length > 1 && (
                <Badge variant="primary-soft">
                  +{gamesList.length - 1} fillers
                </Badge>
              )}
            </div>
          )}
          
          <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {new Date(meetup.date || meetup.created_at || '').toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
            </span>
            {meetup.is_online ? (
              <span className="flex items-center gap-1">
                <Laptop className="h-3.5 w-3.5 text-primary" />
                Online • {meetup.platform || 'Por definir'}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {meetup.location || 'Ubicación por definir'}
              </span>
            )}
          </CardDescription>
        </div>

        {/* Game Cover Showcase Frame */}
        <div className="flex-shrink-0 flex items-center">
          {gamesList.length <= 1 ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-background/50 border border-border/40 p-1.5 flex items-center justify-center shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 group-hover:border-primary/30 transition-all duration-300">
              {mainGame?.image_url ? (
                <img 
                  src={mainGame.image_url} 
                  alt={mainGame.title || 'Juego'} 
                  className="w-full h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-[10px] text-muted-foreground/60 font-extrabold text-center uppercase tracking-wider p-1 leading-snug">
                  {gamesList.length === 0 ? '💬 ?' : (mainGame?.title || meetup.game_name || 'JUE').slice(0, 3)}
                </div>
              )}
            </div>
          ) : (
            <div className="flex -space-x-5 hover:-space-x-2 transition-all duration-350 items-center pl-2">
              {gamesList.slice(0, 3).map((game, idx) => (
                <div 
                  key={game.bgg_id}
                  style={{ zIndex: 10 - idx }}
                  className="w-12 h-12 sm:w-15 sm:h-15 rounded-xl overflow-hidden bg-background border border-border/50 p-1 flex items-center justify-center shadow-md bg-gradient-to-br from-primary/5 to-primary/10 hover:scale-110 hover:z-30 transition-all duration-200"
                >
                  {game.image_url ? (
                    <img 
                      src={game.image_url} 
                      alt={game.title || 'Juego'} 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-[9px] text-muted-foreground/60 font-extrabold text-center uppercase">
                      {game.title.slice(0, 3)}
                    </div>
                  )}
                </div>
              ))}
              {gamesList.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center z-0 translate-x-1 hover:scale-110 transition-transform">
                  <span className="text-[10px] font-black text-primary">+{gamesList.length - 3}</span>
                </div>
              )}
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
          <div 
            className="flex items-center gap-2 cursor-pointer group/creator"
            onClick={() => onNavigate(`/perfil/${meetup.creator_id}`)}
          >
            <Avatar className="w-6 h-6 border border-background shadow-sm group-hover/creator:scale-105 transition-transform duration-300">
              <AvatarImage src={meetup.users?.avatar_url || undefined} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {meetup.users?.username?.slice(0,2)?.toUpperCase() || 'H'}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-muted-foreground font-medium group-hover/creator:text-primary transition-colors">
              Master: <span className="font-semibold text-foreground group-hover/creator:text-primary transition-colors">{meetup.users?.username || 'anónimo'}</span>
            </span>
          </div>

          {/* Player spots badge */}
          <div className="flex flex-col items-end gap-1">
            <Tag variant="default">
              <Users className="w-3.5 h-3.5" />
              {totalAttendees} / {meetup.max_players} plazas
            </Tag>
            {isLastSpot && (
              <Tag
                variant="warning"
                pulse
              >
                Última plaza
              </Tag>
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
          className="flex-1 h-9"
        >
          Ver Detalles
        </Button>
        {renderJoinButton()}
      </div>
    </Card>
  )
}
