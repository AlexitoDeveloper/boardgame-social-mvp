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
import { Input } from '../ui/input'
import { Tag } from '../ui/tag'
import { User } from '@supabase/supabase-js'
import { Meetup, UserProfile } from '../../types'

interface MeetupDetailSidebarProps {
  meetup: Meetup;
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
  handleCompleteMeetup: (gameWinners: Record<number, string | null>, attendedPlayerIds: string[], attendedGuestIds: string[]) => void;
}

export function MeetupDetailSidebar({ 
  meetup, 
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
  const gamesList = meetup.games || []

  // Stats and Completion State
  const [isCompleting, setIsCompleting] = useState(false)
  const [gameWinners, setGameWinners] = useState<Record<number, string | null>>({})
  const [attendedPlayers, setAttendedPlayers] = useState<string[]>([])
  const [attendedGuests, setAttendedGuests] = useState<string[]>([])

  const openCompleteForm = () => {
    if (meetup.completed) {
      setAttendedPlayers(meetup.attended_players || [])
      setAttendedGuests(meetup.attended_guests || [])
      
      const initialWinners: Record<number, string | null> = {}
      gamesList.forEach(g => {
        initialWinners[g.bgg_id] = g.winner_user_id || g.winner_guest_id || null
      })
      setGameWinners(initialWinners)
    } else {
      const registeredIds = attendees.filter(a => !a.is_guest).map(a => a.id)
      const guestIds = attendees.filter(a => a.is_guest).map(a => a.id)
      setAttendedPlayers(registeredIds)
      setAttendedGuests(guestIds)
      
      const initialWinners: Record<number, string | null> = {}
      gamesList.forEach(g => {
        initialWinners[g.bgg_id] = null
      })
      setGameWinners(initialWinners)
    }
    setIsCompleting(true)
  }

  const selectGameWinner = (bggId: number, winnerId: string | null) => {
    setGameWinners(prev => ({
      ...prev,
      [bggId]: winnerId
    }))
  }

  const togglePlayerAttendance = (playerId: string) => {
    setAttendedPlayers(prev => {
      const isAttended = prev.includes(playerId)
      let next = []
      if (isAttended) {
        next = prev.filter(id => id !== playerId)
        setGameWinners(wPrev => {
          const wNext = { ...wPrev }
          Object.keys(wNext).forEach(key => {
            const numKey = Number(key)
            if (wNext[numKey] === playerId) {
              wNext[numKey] = null
            }
          })
          return wNext
        })
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
        setGameWinners(wPrev => {
          const wNext = { ...wPrev }
          Object.keys(wNext).forEach(key => {
            const numKey = Number(key)
            if (wNext[numKey] === guestId) {
              wNext[numKey] = null
            }
          })
          return wNext
        })
      } else {
        next = [...prev, guestId]
      }
      return next
    })
  }

  const handleSubmitComplete = () => {
    handleCompleteMeetup(gameWinners, attendedPlayers, attendedGuests)
    setIsCompleting(false)
  }

  const renderCompletedSection = () => {
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

        {/* Game results cards */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Resultados por juego</p>
          {gamesList.map((game) => {
            const winningId = game.winner_user_id || game.winner_guest_id
            const winner = winningId ? attendees.find(a => a.id === winningId) : null
            
            return (
              <div key={game.bgg_id} className="p-3 rounded-2xl border border-border/40 bg-muted/20 backdrop-blur-sm flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  {game.image_url ? (
                    <img 
                      src={game.image_url} 
                      alt={game.title} 
                      className="w-10 h-10 rounded-lg object-cover border border-border/20 shrink-0" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-black text-foreground truncate">{game.title}</p>
                    <p className="text-[9px] text-muted-foreground font-semibold">Ganador:</p>
                  </div>
                </div>
                
                <div className="shrink-0 max-w-[120px]">
                  {winner ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-500 font-bold text-xs">
                      <Crown className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span className="truncate max-w-[75px]">{winner.username}</span>
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 rounded-xl border border-border/50 bg-background/50 text-muted-foreground text-xs font-bold text-center">
                      Empate 🤝
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

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

        {/* Edit results option for master/creator */}
        {isCreator && (
          <div className="pt-2 flex justify-center">
            <Button
              onClick={openCompleteForm}
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-primary"
            >
              <Edit3 className="w-3.5 h-3.5" /> Editar resultados
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderCompleteForm = () => {
    return (
      <div className="space-y-4 pt-1 flex flex-col max-h-[520px]">
        <div className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border/20 pb-2 shrink-0">
          <NotebookPen className="w-4 h-4 text-primary" />
          Registrar Cierre de Partida
        </div>

        {/* Scrollable container for choices (the only scrollbar) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
          {/* 1. Who attended */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">1. ¿Quiénes asistieron?</label>
            <div className="space-y-1.5">
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

          {/* 2. Winners per game */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">2. Ganadores por juego</label>
            <div className="space-y-4">
              {gamesList.map((game) => {
                const gameWinnerId = gameWinners[game.bgg_id] || null
                
                return (
                  <div key={game.bgg_id} className="p-3 rounded-2xl border border-border/40 bg-muted/20 backdrop-blur-sm space-y-2">
                    <div className="flex items-center gap-2.5">
                      {game.image_url ? (
                        <img src={game.image_url} alt={game.title} className="w-8 h-8 rounded object-cover border border-border/20 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-xs font-black text-foreground truncate">{game.title}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1">
                      <div 
                        onClick={() => selectGameWinner(game.bgg_id, null)}
                        className={`flex items-center p-2 rounded-lg border cursor-pointer select-none text-xs font-bold transition-colors ${
                          gameWinnerId === null 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border/30 bg-background/20 hover:bg-muted/30 text-foreground'
                        }`}
                      >
                        <span>🤝 Sin Ganador / Empate / Coop</span>
                      </div>

                      {attendees
                        .filter(a => a.is_guest ? attendedGuests.includes(a.id) : attendedPlayers.includes(a.id))
                        .map(a => (
                          <div 
                            key={a.id} 
                            onClick={() => selectGameWinner(game.bgg_id, a.id)}
                            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none text-xs font-semibold transition-colors ${
                              gameWinnerId === a.id 
                                ? 'border-primary bg-primary/5 text-primary font-bold' 
                                : 'border-border/30 bg-background/20 hover:bg-muted/30 text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img src={a.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.username)}`} alt={a.username} className="w-5 h-5 rounded-full" />
                              <span>{a.username} {a.is_guest && <span className="text-[9px] text-muted-foreground">(invitado)</span>}</span>
                            </div>
                            {gameWinnerId === a.id && <Crown className="w-3.5 h-3.5 text-primary fill-current shrink-0 animate-pulse" />}
                          </div>
                        ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-border/20 shrink-0">
          <Button 
            onClick={handleSubmitComplete}
            variant="default"
            className="w-full h-9"
          >
            Confirmar y Guardar
          </Button>
          <Button 
            onClick={() => setIsCompleting(false)}
            variant="outline" 
            className="w-full h-9"
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
        <Button disabled variant="outline" className="w-full select-none">
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
            className="w-full flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4" /> Chat de la Partida
          </Button>
          <Button
            onClick={handleLeaveAsGuest}
            variant="destructive"
            className="w-full h-11"
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
            className="w-full select-none"
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
            <Input
              type="text"
              placeholder="Introduce tu nombre..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              maxLength={25}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              disabled={joining || !guestName.trim()}
              className="px-4 h-9 shrink-0"
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
        <Button disabled variant="outline" className="w-full select-none">
          Mesa Cerrada
        </Button>
      )
    }

    if (joining) {
      return (
        <Button disabled className="w-full h-11">
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
            className="w-full flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4" /> Chat de la Partida
          </Button>
          <Button
            onClick={handleJoinLeave}
            variant="destructive"
            className="w-full h-11"
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
          className="w-full select-none"
        >
          Mesa Llena
        </Button>
      )
    }

    return (
      <Button
        onClick={handleJoinLeave}
        variant="default"
        className="w-full h-11"
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
          {isCompleting ? (
            renderCompleteForm()
          ) : meetup.completed ? (
            renderCompletedSection()
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
                    className="w-full flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat de la Partida
                  </Button>

                  <Button 
                    onClick={openCompleteForm}
                    variant="default"
                    className="w-full h-11 flex items-center justify-center gap-2 mb-1"
                  >
                    <CheckSquare className="w-4 h-4" /> Cerrar Partida
                  </Button>

                  {!confirmCancel ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => navigate(`/tablero/${meetup.id}/edit`)}
                        variant="outline" 
                        size="sm"
                        className="h-10 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </Button>
                      
                      <Button 
                        onClick={() => setConfirmCancel(true)}
                        variant="outline" 
                        size="sm"
                        className="h-10 text-destructive border-destructive/30 hover:bg-destructive/10 flex items-center gap-1.5"
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
                          className="flex-1 h-8"
                        >
                          {canceling ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sí, cancelar'}
                        </Button>
                        <Button 
                          onClick={() => setConfirmCancel(false)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
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

      {/* Boardgame Info Cards */}
      {gamesList.length === 0 ? (
        <Card className="border-border/30 bg-card/65 backdrop-blur-2xl shadow-xl overflow-hidden rounded-2xl hover:border-amber-500/25 transition-all">
          <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2 border-b border-border/20">
            <CardTitle className="text-sm font-extrabold tracking-tight uppercase text-amber-500">Mesa de Juego Libre</CardTitle>
          </CardHeader>
          <CardContent className="p-5 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <p className="font-extrabold text-xs text-foreground">Juegos por decidir</p>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Esta sesión no tiene un juego asignado todavía. ¡Usa el chat de la partida para acordar con otros jugadores a qué vais a jugar!
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {gamesList.map((game) => (
            <Card key={game.bgg_id} className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-xl overflow-hidden rounded-2xl">
              <CardHeader className="p-4 pb-3 sm:p-5 sm:pb-3 border-b border-border/20 flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CardTitle className="text-xs font-black tracking-tight uppercase text-primary truncate">
                    {game.title}
                  </CardTitle>
                  {game.is_expansion && (
                    <Tag variant="purple" className="shrink-0 text-[9px] px-1 py-0 shadow-sm">
                      Expansión
                    </Tag>
                  )}
                </div>
                {game.bgg_id && (
                  <a 
                    href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors cursor-pointer shrink-0"
                    title="Ver en BGG"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-4 sm:p-5 sm:pt-4 space-y-3.5">
                {/* Cover image in card */}
                {game.image_url && (
                  <div className="w-full h-32 overflow-hidden rounded-xl border border-border/30 bg-background/50 p-1.5 flex items-center justify-center shadow-inner">
                    <img 
                      src={game.image_url} 
                      alt={game.title} 
                      className="max-h-full max-w-full object-contain rounded-lg" 
                    />
                  </div>
                )}

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border/20">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Jugadores</p>
                    <p className="text-xs font-extrabold text-primary mt-0.5">
                      {game.min_players === game.max_players 
                        ? `${game.min_players}` 
                        : `${game.min_players}-${game.max_players}`}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border/20">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Duración</p>
                    <p className="text-xs font-extrabold text-primary mt-0.5">
                      {game.playing_time ? `${game.playing_time} min` : 'N/D'}
                    </p>
                  </div>
                </div>

                {/* Editorial Info */}
                {game.es_publisher && (
                  <div className="px-3 py-2 rounded-xl bg-muted/20 border border-border/15 text-center">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Editorial Española</p>
                    <p className="text-xs font-extrabold text-foreground mt-0.5">{game.es_publisher}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  )
}
