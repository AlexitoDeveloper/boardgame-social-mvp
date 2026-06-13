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
  MessageSquare,
  NotebookPen,
  Swords,
  CalendarCheck2,
  CheckSquare,
  Square
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
  guestReservation: { id: string, name: string } | null;
  handleJoinAsGuest: (name: string) => void;
  handleLeaveAsGuest: () => void;
  handleCompleteMeetup: (winnerId: string | null, attendedPlayerIds: string[], attendedGuestIds: string[]) => void;
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
  handleCancelMeetup,
  guestReservation,
  handleJoinAsGuest,
  handleLeaveAsGuest,
  handleCompleteMeetup
}: MeetupDetailSidebarProps) {
  const navigate = useNavigate()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [guestName, setGuestName] = useState('')

  // Stats and Completion State
  const [isCompleting, setIsCompleting] = useState(false)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [attendedPlayers, setAttendedPlayers] = useState<string[]>([])
  const [attendedGuests, setAttendedGuests] = useState<string[]>([])

  const openCompleteForm = () => {
    const registeredIds = attendees.filter(a => !a.is_guest).map(a => a.id)
    const guestIds = attendees.filter(a => a.is_guest).map(a => a.id)
    setAttendedPlayers(registeredIds)
    setAttendedGuests(guestIds)
    setWinnerId(null)
    setIsCompleting(true)
  }

  const togglePlayerAttendance = (playerId: string) => {
    setAttendedPlayers(prev => {
      const isAttended = prev.includes(playerId)
      let next = []
      if (isAttended) {
        next = prev.filter(id => id !== playerId)
        if (winnerId === playerId) setWinnerId(null)
      } else {
        next = [...prev, playerId]
      }
      return next
    })
  }

  const toggleGuestAttendance = (guestId: string) => {
    setAttendedGuests(prev => {
      const isAttended = prev.includes(guestId)
      let next = []
      if (isAttended) {
        next = prev.filter(id => id !== guestId)
        if (winnerId === guestId) setWinnerId(null)
      } else {
        next = [...prev, guestId]
      }
      return next
    })
  }

  const handleSubmitComplete = () => {
    handleCompleteMeetup(winnerId, attendedPlayers, attendedGuests)
    setIsCompleting(false)
  }

  const renderCompletedSection = () => {
    const winningId = meetup.winner_user_id || meetup.winner_guest_id
    const winner = winningId ? attendees.find(a => a.id === winningId) : null
    
    const attendedList = attendees.filter(a => {
      if (a.is_guest) {
        return meetup.attended_guests?.includes(a.id)
      } else {
        return meetup.attended_players?.includes(a.id)
      }
    })

    return (
      <div className="space-y-4">
        <div className="text-center p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-bold text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider">
          <Swords className="w-4 h-4 text-emerald-500 fill-current animate-bounce" />
          Partida Completada
        </div>

        {winner ? (
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center space-y-2.5 relative overflow-hidden shadow-inner">
            <div className="absolute top-1 right-2 opacity-15 rotate-12">
              <Swords className="w-16 h-16 text-amber-500 fill-current" />
            </div>
            <p className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest">Ganador de la mesa</p>
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <div className="w-12 h-12 rounded-full border border-amber-500/40 p-0.5 shadow-md shadow-amber-500/10">
                <img 
                  src={winner.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(winner.username)}`} 
                  alt={winner.username} 
                  className="w-full h-full rounded-full object-cover" 
                />
              </div>
              <p className="text-base font-extrabold text-foreground tracking-tight">{winner.username}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-border bg-muted/20 text-center space-y-1 py-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resultado</p>
            <p className="text-sm font-bold text-foreground">Empate o Cooperativo 🤝</p>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-border/20">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Asistieron ({attendedList.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {attendedList.map(a => (
              <div key={a.id} className="px-2.5 py-1 rounded-lg bg-background/50 border border-border/40 text-xs font-medium text-foreground flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full overflow-hidden">
                  <img src={a.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.username)}`} alt={a.username} className="w-full h-full object-cover" />
                </div>
                {a.username}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderCompleteForm = () => {
    return (
      <div className="space-y-4 pt-1">
        <div className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border/20 pb-2">
          <NotebookPen className="w-4 h-4 text-primary" />
          Registrar Cierre de Partida
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">1. ¿Quiénes asistieron?</label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
            {attendees.map(a => {
              const isUser = !a.is_guest
              const isChecked = isUser ? attendedPlayers.includes(a.id) : attendedGuests.includes(a.id)
              
              return (
                <div 
                  key={a.id} 
                  onClick={() => isUser ? togglePlayerAttendance(a.id) : toggleGuestAttendance(a.id)}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-background/20 hover:bg-muted/30 cursor-pointer select-none text-xs font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <img src={a.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.username)}`} alt={a.username} className="w-5 h-5 rounded-full" />
                    <span>{a.username} {a.is_guest && <span className="text-[9px] text-muted-foreground">(invitado)</span>}</span>
                  </div>
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">2. Selecciona al ganador</label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
            <div 
              onClick={() => setWinnerId(null)}
              className={`flex items-center p-2 rounded-lg border cursor-pointer select-none text-xs font-bold ${
                winnerId === null 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border/40 bg-background/20 hover:bg-muted/30 text-foreground'
              }`}
            >
              <span>🤝 Sin Ganador / Empate / Coop</span>
            </div>

            {attendees
              .filter(a => a.is_guest ? attendedGuests.includes(a.id) : attendedPlayers.includes(a.id))
              .map(a => (
                <div 
                  key={a.id} 
                  onClick={() => setWinnerId(a.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none text-xs font-semibold ${
                    winnerId === a.id 
                      ? 'border-primary bg-primary/5 text-primary font-bold' 
                      : 'border-border/40 bg-background/20 hover:bg-muted/30 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={a.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.username)}`} alt={a.username} className="w-5 h-5 rounded-full" />
                    <span>{a.username}</span>
                  </div>
                  {winnerId === a.id && <Swords className="w-3.5 h-3.5 text-primary fill-current" />}
                </div>
              ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/20">
          <Button 
            onClick={handleSubmitComplete}
            className="flex-1 rounded-xl font-bold text-xs h-9 bg-success hover:bg-success/90"
          >
            Guardar
          </Button>
          <Button 
            onClick={() => setIsCompleting(false)}
            variant="ghost" 
            className="flex-1 rounded-xl font-bold text-xs h-9 border border-border/40 bg-card"
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  const handleGuestJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestName.trim()) return
    handleJoinAsGuest(guestName.trim())
  }

  const renderGuestSection = () => {
    if (isPast) {
      return (
        <Button disabled className="w-full rounded-xl font-bold h-11 bg-muted/60 text-muted-foreground border border-border/40 select-none">
          Mesa Cerrada
        </Button>
      )
    }

    if (guestReservation) {
      return (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 text-center text-xs font-bold text-foreground">
            Te has unido como invitado: <span className="text-primary font-extrabold">{guestReservation.name}</span>
          </div>
          <Button
            onClick={() => navigate(`/chats?id=${meetup.id}`)}
            variant="outline"
            className="w-full rounded-xl font-extrabold text-sm h-11 bg-primary/10 hover:bg-primary/15 border-primary/20 hover:border-primary/30 text-primary flex items-center justify-center gap-2 cursor-pointer transition-all border"
          >
            <MessageSquare className="w-4 h-4" /> Chat de la Partida
          </Button>
          <Button
            onClick={handleLeaveAsGuest}
            variant="destructive"
            className="w-full rounded-xl font-extrabold text-sm h-11 shadow-lg shadow-destructive/15 transition-all hover:bg-destructive/90 cursor-pointer"
          >
            {joining ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Abandonar Mesa (Invitado)'}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center font-medium leading-normal mt-2">
            ¡Tu plaza está reservada! <Link to="/auth" className="text-primary hover:underline font-bold">Crea una cuenta</Link> para guardar tu historial.
          </p>
        </div>
      )
    }

    if (isFull) {
      return (
        <div className="space-y-3">
          <Button
            disabled
            variant="outline"
            className="w-full rounded-xl font-bold h-11 border-border/50 bg-muted/40 text-muted-foreground/80 cursor-not-allowed select-none"
          >
            Mesa Llena
          </Button>
          <p className="text-[10px] text-muted-foreground text-center font-semibold pt-1">
            Necesitas <Link to="/auth" className="text-primary hover:underline font-extrabold">iniciar sesión</Link> para unirte.
          </p>
        </div>
      )
    }

    return (
      <form onSubmit={handleGuestJoinSubmit} className="space-y-3 pt-1">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Sentarse como invitado</label>
          <div className="flex gap-2 flex-col">
            <input
              type="text"
              placeholder="Introduce tu nombre..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={25}
              className="flex-1 px-3.5 py-2 rounded-xl border border-border/40 bg-background/30 text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:bg-background/50 transition-all"
              required
            />
            <Button
              type="submit"
              disabled={joining || !guestName.trim()}
              className="rounded-xl font-extrabold text-xs px-4 h-9 shadow-sm shrink-0"
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sentarse'}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground text-center font-semibold pt-1">
          O si prefieres, <Link to="/auth" className="text-primary hover:underline font-extrabold">inicia sesión</Link> para guardar tus estadísticas.
        </p>
      </form>
    )
  }

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
        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/chats?id=${meetup.id}`)}
            variant="outline"
            className="w-full rounded-xl font-extrabold text-sm h-11 bg-primary/10 hover:bg-primary/15 border-primary/20 hover:border-primary/30 text-primary flex items-center justify-center gap-2 cursor-pointer transition-all border"
          >
            <MessageSquare className="w-4 h-4" /> Chat de la Partida
          </Button>
          <Button
            onClick={handleJoinLeave}
            variant="destructive"
            className="w-full rounded-xl font-extrabold text-sm h-11 shadow-lg shadow-destructive/15 transition-all hover:bg-destructive/90 cursor-pointer"
          >
            Abandonar la Mesa
          </Button>
        </div>
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
        <CardContent className="p-4 pt-5 sm:p-6 sm:pt-5 space-y-5">
          {meetup.completed ? (
            renderCompletedSection()
          ) : isCompleting ? (
            renderCompleteForm()
          ) : (
            <>
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
              {!isCreator && (
                user ? renderActionButton() : renderGuestSection()
              )}

              {/* Admin panel for the creator (Edit / Cancel / Complete options) */}
              {isCreator && (
                <div className="space-y-3 pt-1 border-t border-border/20">
                  <div className="text-center pb-1 text-xs font-bold text-primary flex items-center justify-center gap-1.5 bg-primary/5 p-2 rounded-lg border border-primary/10">
                    <Crown className="w-4 h-4 text-primary fill-current" />
                    Gestionar como Master
                  </div>

                  <Button 
                    onClick={() => navigate(`/chats?id=${meetup.id}`)}
                    variant="outline"
                    className="w-full rounded-xl font-extrabold h-11 bg-primary/10 hover:bg-primary/15 border-primary/20 hover:border-primary/30 text-primary text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat de la Partida
                  </Button>

                  <Button 
                    onClick={openCompleteForm}
                    className="w-full rounded-xl font-extrabold h-11 bg-success hover:bg-success/90 shadow-lg shadow-success/15 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mb-1 text-white border-0"
                  >
                    <CheckSquare className="w-4 h-4 text-white" /> Cerrar Partida
                  </Button>

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
            </>
          )}
        </CardContent>
      </Card>

      {/* Boardgame Info Card */}
      {gameInfo && (
        <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-xl overflow-hidden">
          <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3 border-b border-border/20">
            <CardTitle className="text-md font-extrabold tracking-tight uppercase text-primary">Información del Juego</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-5 sm:p-6 sm:pt-5 space-y-4">
            
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
