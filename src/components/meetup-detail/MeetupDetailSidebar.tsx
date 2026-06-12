import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Clock, 
  Crown, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Info,
  AlertTriangle,
  Loader2,
  CalendarCheck2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { User } from '@supabase/supabase-js'
import { Meetup, Game, UserProfile } from '../../types'

interface MeetupDetailSidebarProps {
  meetup: Meetup;
  gameInfo: Game | null;
  attendees: UserProfile[];
  isPast: boolean;
  isCreator: boolean;
  isJoined: boolean;
  isFull: boolean;
  joining: boolean;
  canceling: boolean;
  timeLeft: string;
  user: User | null;
  handleJoinLeave: () => void;
  handleCancelMeetup: () => void;
}

export function MeetupDetailSidebar({ 
  meetup, 
  gameInfo, 
  attendees, 
  isPast, 
  isCreator, 
  isJoined, 
  isFull, 
  joining, 
  canceling, 
  timeLeft, 
  user, 
  handleJoinLeave, 
  handleCancelMeetup 
}: MeetupDetailSidebarProps) {
  const navigate = useNavigate()
  const [confirmCancel, setConfirmCancel] = useState(false)

  // Render the Join/Leave/Full button
  const renderActionButton = () => {
    if (isPast) {
      return (
        <Button disabled className="w-full rounded-xl font-bold h-11 bg-muted/60 text-muted-foreground border border-border/40 select-none">
          Mesa Cerrada
        </Button>
      )
    }

    if (joining) {
      return (
        <Button disabled className="w-full rounded-xl font-extrabold text-sm h-11 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      )
    }

    if (isJoined) {
      return (
        <Button
          onClick={handleJoinLeave}
          variant="destructive"
          className="w-full rounded-xl font-extrabold text-sm h-11 shadow-lg shadow-destructive/15 transition-all hover:bg-destructive/90 cursor-pointer"
        >
          Abandonar la Mesa
        </Button>
      )
    }

    if (isFull) {
      return (
        <Button
          disabled
          variant="outline"
          className="w-full rounded-xl font-bold h-11 border-border/50 bg-muted/40 text-muted-foreground/80 cursor-not-allowed select-none"
        >
          Mesa Llena
        </Button>
      )
    }

    return (
      <Button
        onClick={handleJoinLeave}
        variant="default"
        className="w-full rounded-xl font-extrabold text-sm h-11 shadow-sm cursor-pointer"
      >
        <span className="flex items-center gap-1.5 justify-center">
          <CalendarCheck2 className="w-4 h-4" /> Sentarse a la Mesa
        </span>
      </Button>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Action Card / Reservation & Admin Actions */}
      <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-xl overflow-hidden">
        <CardContent className="pt-5 space-y-5">
          
          {/* Countdown panel with extra padding */}
          {!isPast && (
            <div className="p-5 rounded-2xl border border-primary/15 bg-primary/5 text-center space-y-2">
              <Clock className="w-5 h-5 mx-auto text-primary" />
              <p className="text-xs font-extrabold text-primary uppercase tracking-widest">Cuenta Atrás</p>
              <p className="text-sm font-extrabold text-foreground tracking-tight">{timeLeft}</p>
            </div>
          )}

          {/* Spots Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span>Asientos Ocupados</span>
              <span className="text-foreground">{attendees.length} / {meetup.max_players}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden border border-border/30">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-amber-500' : 'bg-primary'}`} 
                style={{ width: `${(attendees.length / meetup.max_players) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Join / Leave / Full Buttons (For normal users) */}
          {!isCreator && renderActionButton()}

          {/* Admin panel for the creator (Edit / Cancel options) */}
          {isCreator && (
            <div className="space-y-3 pt-1 border-t border-border/20">
              <div className="text-center pb-1 text-xs font-bold text-primary flex items-center justify-center gap-1.5 bg-primary/5 p-2 rounded-lg border border-primary/10">
                <Crown className="w-4 h-4 text-primary fill-current" />
                Gestionar como Master
              </div>

              {!confirmCancel ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => navigate(`/tablero/${meetup.id}/edit`)}
                    variant="outline" 
                    size="sm"
                    className="rounded-xl font-bold h-10 border-border/50 text-xs flex items-center gap-1.5 hover:bg-muted/80 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </Button>
                  
                  <Button 
                    onClick={() => setConfirmCancel(true)}
                    variant="outline" 
                    size="sm"
                    className="rounded-xl font-bold h-10 border-destructive/30 hover:border-destructive/50 text-destructive bg-transparent hover:bg-destructive/5 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Cancelar
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3 text-center">
                  <div className="text-xs font-bold text-destructive flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> ¿Cancelar la partida?
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCancelMeetup}
                      disabled={canceling}
                      variant="destructive"
                      size="sm"
                      className="flex-1 rounded-lg font-bold text-xs h-8 cursor-pointer"
                    >
                      {canceling ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sí, cancelar'}
                    </Button>
                    <Button 
                      onClick={() => setConfirmCancel(false)}
                      variant="ghost"
                      size="sm"
                      className="flex-1 rounded-lg font-bold text-xs h-8 border border-border/40 bg-card cursor-pointer"
                    >
                      No
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!user && !isPast && (
            <p className="text-[11px] text-muted-foreground text-center font-semibold pt-1">
              Necesitas <Link to="/auth" className="text-primary hover:underline font-extrabold">iniciar sesión</Link> para unirte.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Boardgame Info Card */}
      {gameInfo && (
        <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/20">
            <CardTitle className="text-md font-extrabold tracking-tight uppercase text-primary">Información del Juego</CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            
            {/* Cover image in card */}
            {gameInfo.image_url ? (
              <div className="w-full h-44 overflow-hidden rounded-2xl border border-border/30 bg-background/50 p-2 flex items-center justify-center bg-gradient-to-br from-primary/[0.02] to-primary/[0.06] shadow-inner group">
                <img 
                  src={gameInfo.image_url} 
                  alt={gameInfo.title} 
                  className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-103" 
                />
              </div>
            ) : (
              <div className="w-full h-44 rounded-2xl bg-muted/40 border border-dashed border-border/60 flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                <Info className="w-8 h-8 opacity-40 mb-1" />
                <span className="text-xs font-semibold">Sin imagen de portada</span>
              </div>
            )}

            <div className="space-y-1">
              <h3 className="font-extrabold text-base leading-tight text-foreground">{gameInfo.title}</h3>
              {gameInfo.year_published && (
                <p className="text-xs text-muted-foreground font-semibold">Publicado en {gameInfo.year_published}</p>
              )}
            </div>

            {/* Players and Playing time specs */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Jugadores</p>
                <p className="text-sm font-extrabold text-primary mt-0.5">
                  {gameInfo.min_players === gameInfo.max_players 
                    ? `${gameInfo.min_players}` 
                    : `${gameInfo.min_players}-${gameInfo.max_players}`}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Duración</p>
                <p className="text-sm font-extrabold text-primary mt-0.5">
                  {gameInfo.playing_time ? `${gameInfo.playing_time} min` : 'N/D'}
                </p>
              </div>
            </div>

            {/* Link button to BoardGameGeek */}
            {gameInfo.bgg_id && (
              <a 
                href={`https://boardgamegeek.com/boardgame/${gameInfo.bgg_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full rounded-xl border border-border/50 text-xs font-bold h-9 flex items-center justify-center gap-1.5 hover:bg-muted/80 cursor-pointer">
                  Ver Ficha en BGG <ExternalLink className="w-3 h-3 text-primary" />
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  )
}
