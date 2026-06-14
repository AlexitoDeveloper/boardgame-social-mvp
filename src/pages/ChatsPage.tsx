import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  Loader2,
  Clock,
  Info
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Tag } from '../components/ui/tag'
import { Meetup, MeetupMessage, Game } from '../types'


export function ChatsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlMeetupId = searchParams.get('id')

  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [allMessages, setAllMessages] = useState<MeetupMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeMeetupId, setActiveMeetupId] = useState<string | null>(urlMeetupId)
  const [messageText, setMessageText] = useState('')

  // Local read timestamps (meetupId -> ISO string)
  const [readTimestamps, setReadTimestamps] = useState<Record<string, string>>({})

  // Chat window scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth')
    }
  }, [user, authLoading, navigate])

  // Load timestamps on mount
  useEffect(() => {
    const stamps: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('boardgame_social_chat_last_read_')) {
        const mId = key.replace('boardgame_social_chat_last_read_', '')
        stamps[mId] = localStorage.getItem(key) || ''
      }
    }
    setReadTimestamps(stamps)
  }, [])

  // Mark a meetup chat as read
  const markAsRead = useCallback((meetupId: string) => {
    const nowStr = new Date().toISOString()
    localStorage.setItem(`boardgame_social_chat_last_read_${meetupId}`, nowStr)
    setReadTimestamps(prev => ({ ...prev, [meetupId]: nowStr }))
    
    // Also dispatch a storage/custom event so other components (like AppShell) update immediately
    window.dispatchEvent(new Event('chat_read_update'))
  }, [])

  // Load meetups and messages
  useEffect(() => {
    if (!user) return

    async function loadChatsData() {
      setLoading(true)
      setErrorMsg('')

      // Extract local guest reservations
      const guestReservationsStr = localStorage.getItem('boardgame_social_guest_reservations')
      const guestReservations = guestReservationsStr ? JSON.parse(guestReservationsStr) : {}
      const guestMeetupIds = Object.keys(guestReservations)

      const orParts = [
        `creator_id.eq.${user?.id}`,
        `joined_players.cs.{${user?.id}}`
      ]
      if (guestMeetupIds.length > 0) {
        orParts.push(`id.in.(${guestMeetupIds.join(',')})`)
      }

      try {
        // Fetch all meetups where user is creator, member, or guest
        const { data: meetupsData, error: meetupsError } = await supabase
          .from('meetups')
          .select('*, users:users!meetups_creator_id_fkey (*), meetup_games(game_id, winner_user_id, winner_guest_id, games(*)), meetup_guests:meetup_guests!meetup_guests_meetup_id_fkey (id, guest_name)')
          .or(orParts.join(','))
          .order('date', { ascending: false })

        if (meetupsError) throw meetupsError

        const fetchedMeetups = (meetupsData || []).map((m: any) => {
          const mg = m.meetup_games || []
          const mGames = mg.map((item: any) => {
            if (!item.games) return null
            return {
              ...item.games,
              winner_user_id: item.winner_user_id,
              winner_guest_id: item.winner_guest_id
            }
          }).filter(Boolean) as Game[]
          return {
            ...m,
            games: mGames
          }
        }) as Meetup[]

        setMeetups(fetchedMeetups)

        if (fetchedMeetups.length > 0) {
          const meetupIds = fetchedMeetups.map(m => m.id)

          // Fetch messages for all these meetups
          const { data: messagesData, error: messagesError } = await supabase
            .from('meetup_messages')
            .select('*')
            .in('meetup_id', meetupIds)
            .order('created_at', { ascending: true })

          if (messagesError) throw messagesError
          setAllMessages((messagesData as MeetupMessage[]) || [])

          // Set active meetup if specified in URL, otherwise default to first meetup on desktop
          if (urlMeetupId && meetupIds.includes(urlMeetupId)) {
            setActiveMeetupId(urlMeetupId)
            markAsRead(urlMeetupId)
          } else if (window.innerWidth >= 768 && !activeMeetupId) {
            setActiveMeetupId(fetchedMeetups[0].id)
            markAsRead(fetchedMeetups[0].id)
          }
        }
      } catch (err: any) {
        console.error("Error loading chat conversations:", err)
        setErrorMsg(err.message || 'Error al obtener tus salas de chat.')
      } finally {
        setLoading(false)
      }
    }

    loadChatsData()
  }, [user, urlMeetupId, markAsRead])

  // Realtime subscription for new messages
  useEffect(() => {
    if (meetups.length === 0) return

    const meetupIds = meetups.map(m => m.id)
    
    // Subscribe to all changes in meetup_messages
    const channel = supabase
      .channel('chats_page_global_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meetup_messages'
        },
        (payload) => {
          const newMsg = payload.new as MeetupMessage
          if (meetupIds.includes(newMsg.meetup_id)) {
            setAllMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })

            // If this message belongs to the currently active chat, mark as read immediately
            if (activeMeetupId === newMsg.meetup_id) {
              markAsRead(activeMeetupId)
            } else {
              // Dispatch custom event to update badges in AppShell
              window.dispatchEvent(new Event('chat_read_update'))
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meetups, activeMeetupId, markAsRead])

  // Scroll to bottom when messages or active meetup change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages, activeMeetupId])

  // Change active meetup
  const handleSelectMeetup = (mId: string) => {
    setActiveMeetupId(mId)
    setSearchParams({ id: mId })
    markAsRead(mId)
  }

  // Back to list (Mobile view reset)
  const handleBackToList = () => {
    setActiveMeetupId(null)
    setSearchParams({})
  }

  // Get reservation info for a meetup
  const getReservation = (mId: string) => {
    const guestReservationsStr = localStorage.getItem('boardgame_social_guest_reservations')
    const guestReservations = guestReservationsStr ? JSON.parse(guestReservationsStr) : {}
    return guestReservations[mId] || null
  }

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeMeetupId || !messageText.trim() || !user) return

    const trimmed = messageText.trim()
    setMessageText('')
    setSending(true)

    // Check if we are joined as guest
    const guestRes = getReservation(activeMeetupId)
    const activeMeetup = meetups.find(m => m.id === activeMeetupId)
    if (!activeMeetup) {
      setSending(false)
      return
    }

    let user_id: string | null = user.id
    let guest_id: string | null = null
    let sender_name = user.user_metadata?.username || user.email?.split('@')[0] || 'Tú'
    let avatar_url = user.user_metadata?.avatar_url || null

    if (guestRes) {
      user_id = null
      guest_id = guestRes.id
      sender_name = guestRes.name
      avatar_url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guestRes.name)}`
    }

    try {
      const { error } = await supabase
        .from('meetup_messages')
        .insert({
          meetup_id: activeMeetupId,
          user_id,
          guest_id,
          sender_name,
          avatar_url,
          content: trimmed
        })

      if (error) throw error
      markAsRead(activeMeetupId)
    } catch (err: any) {
      console.error("Error sending message:", err)
      setErrorMsg(err.message || 'Error al enviar el mensaje.')
    } finally {
      setSending(false)
    }
  }

  // Render variables
  const activeMeetup = meetups.find(m => m.id === activeMeetupId)
  const activeGame = activeMeetup?.games 
    ? (Array.isArray(activeMeetup.games) ? activeMeetup.games[0] : activeMeetup.games) as Game
    : null
  
  const activeChatMessages = allMessages.filter(m => m.meetup_id === activeMeetupId)

  // Format message timestamps
  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateLabel = (isoString: string) => {
    const d = new Date(isoString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Hoy'
    if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  if (loading && meetups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando tus mensajes...</p>
      </div>
    )
  }

  return (
    <section className="h-full flex-1 min-h-0 w-full md:w-full md:mx-auto md:mt-0 max-w-5xl flex flex-col md:flex-row border-x-0 border-y-0 md:border md:border-border/30 bg-card/95 md:bg-card/65 backdrop-blur-2xl rounded-none md:rounded-2xl overflow-hidden shadow-none md:shadow-2xl relative">
      
      {/* ── Left conversations list ────────────────────────── */}
      <div className={`w-full md:w-80 md:min-w-[20rem] md:max-w-[20rem] md:shrink-0 border-r border-border/40 flex flex-col bg-card/40 h-full ${
        activeMeetupId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-border/30 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Chats
          </h1>
          <Tag variant="secondary">
            {meetups.length} {meetups.length === 1 ? 'partida' : 'partidas'}
          </Tag>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/20 custom-scrollbar">
          {meetups.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-bold">No estás en ninguna sala de chat.</p>
              <p className="text-xs text-muted-foreground/85 leading-normal">
                Únete a una partida activa en el tablero para poder coordinar los detalles del evento con el resto de asistentes.
              </p>
              <Button onClick={() => navigate('/')} className="rounded-xl font-bold text-xs mt-3 h-8">
                Ir al Tablero
              </Button>
            </div>
          ) : (
            meetups.map((m) => {
              const mGame = m.games ? (Array.isArray(m.games) ? m.games[0] : m.games) as Game : null
              const mMessages = allMessages.filter(msg => msg.meetup_id === m.id)
              const lastMsg = mMessages[mMessages.length - 1]
              
              // Calculate unread count
              const lastReadStr = readTimestamps[m.id] || ''
              const lastRead = lastReadStr ? new Date(lastReadStr).getTime() : 0
              const unreadCount = mMessages.filter(msg => {
                const isMyMessage = msg.user_id === user?.id || (msg.guest_id && msg.guest_id === getReservation(m.id)?.id)
                return !isMyMessage && new Date(msg.created_at).getTime() > lastRead
              }).length

              const isActive = activeMeetupId === m.id

              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMeetup(m.id)}
                  className={`p-4 flex items-center justify-between gap-3.5 cursor-pointer transition-colors duration-200 text-left select-none border-l-4 ${
                    isActive 
                      ? 'bg-primary/10 border-l-primary' 
                      : 'hover:bg-muted/40 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Game cover thumbnail */}
                    <div className="w-11 h-11 rounded-lg bg-background border border-border/30 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                      {mGame?.image_url ? (
                        <img src={mGame.image_url} alt={mGame.title} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-[10px] font-black text-muted-foreground uppercase">{m.game_name?.slice(0, 3) || 'JUE'}</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-black text-foreground truncate">{m.title}</p>
                      <p className={`text-[10px] truncate ${unreadCount > 0 ? 'text-foreground font-black' : 'text-muted-foreground font-medium'}`}>
                        {lastMsg ? (
                          <>
                            <span className="text-primary font-bold">{lastMsg.sender_name}:</span> {lastMsg.content}
                          </>
                        ) : (
                          'No hay mensajes aún.'
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right side Stack: Timestamp & Badge */}
                  <div className="flex flex-col items-end justify-between shrink-0 h-9 text-right">
                    {lastMsg ? (
                      <span className="text-[9px] font-bold text-muted-foreground">
                        {formatTime(lastMsg.created_at)}
                      </span>
                    ) : (
                      <div className="h-3" />
                    )}
                    {unreadCount > 0 ? (
                      <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] font-black shadow-sm shadow-primary/30 shrink-0 aspect-square">
                        {unreadCount}
                      </span>
                    ) : (
                      <div className="h-5" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Right chat window ─────────────────────────────── */}
      <div className={`flex-1 flex flex-col bg-card/10 relative min-w-0 ${
        !activeMeetupId ? 'hidden md:flex' : 'flex'
      }`}>
        {activeMeetup ? (
          <>
            {/* Header toolbar */}
            <div className="p-4 border-b border-border/30 flex items-center justify-between gap-3 bg-card/30">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <Button 
                  onClick={handleBackToList}
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden p-0 rounded-full w-8 h-8 flex items-center justify-center hover:bg-muted shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </Button>

                {/* Clickable info/link area that goes to details page */}
                <div 
                  onClick={() => navigate(`/tablero/${activeMeetup.id}`)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group/info"
                  title="Ver Ficha de Partida"
                >
                  <div className="w-9 h-9 rounded-lg bg-background border border-border/30 overflow-hidden shrink-0 flex items-center justify-center p-0.5 group-hover/info:border-primary/50 transition-colors shadow-sm">
                    {activeGame?.image_url ? (
                      <img src={activeGame.image_url} alt={activeGame.title} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-[8px] font-black text-muted-foreground uppercase">{activeMeetup.game_name?.slice(0, 3) || 'JUE'}</div>
                    )}
                  </div>

                  <div className="min-w-0 text-left flex-1">
                    <h2 className="text-sm md:text-base font-black text-foreground truncate flex items-center gap-1.5 group-hover/info:text-primary transition-colors">
                      <span className="truncate">{activeMeetup.title}</span>
                      <Info className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 group-hover/info:text-primary transition-colors" />
                    </h2>
                    <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-0.5 truncate">
                      <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                      {new Date(activeMeetup.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-xs font-semibold text-destructive text-center">
                {errorMsg}
              </div>
            )}

            {/* Message window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-950/5 dark:bg-black/15">
              {activeChatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/60 space-y-2 p-6">
                  <MessageSquare className="w-12 h-12 opacity-25" />
                  <p className="text-xs font-bold">La sala de chat está vacía.</p>
                  <p className="text-[10px] text-muted-foreground max-w-[200px]">¡Sé el primero en enviar un mensaje para romper el hielo!</p>
                </div>
              ) : (
                activeChatMessages.map((msg, idx) => {
                  const isMyMessage = msg.user_id === user?.id || (msg.guest_id && msg.guest_id === getReservation(activeMeetupId || '')?.id)
                  
                  // Group separator
                  const prevMsg = idx > 0 ? activeChatMessages[idx - 1] : null
                  const showDateLabel = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()

                  return (
                    <div key={msg.id} className="space-y-3">
                      {showDateLabel && (
                        <div className="flex justify-center select-none py-1.5">
                          <span className="bg-background/80 border border-border/30 rounded-full px-3 py-0.5 text-[8.5px] font-black text-muted-foreground shadow-sm uppercase tracking-wider">
                            {formatDateLabel(msg.created_at)}
                          </span>
                        </div>
                      )}

                      <div className={`flex gap-2.5 max-w-[85%] ${isMyMessage ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                        {/* Avatar */}
                        {!isMyMessage && (
                          <Avatar className="w-7 h-7 border border-border shrink-0 mt-0.5 shadow-sm">
                            <AvatarImage src={msg.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">
                              {msg.sender_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className="space-y-1 max-w-full min-w-0">
                          {/* Sender name label (only for others) */}
                          {!isMyMessage && (
                            <p className="text-[9.5px] font-black text-primary text-left tracking-wide px-1.5 uppercase truncate" title={msg.sender_name}>
                              {msg.sender_name} {msg.guest_id && <span className="text-[7.5px] text-muted-foreground lowercase font-medium">(invitado)</span>}
                            </p>
                          )}

                          {/* Bubble */}
                          <div className={`p-3 rounded-2xl shadow-sm text-xs text-left leading-relaxed text-black dark:text-white ${
                            isMyMessage 
                              ? 'bg-primary/15 rounded-tr-none' 
                              : 'bg-card rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap break-words font-medium">{msg.content}</p>
                          </div>

                          {/* Time below bubble */}
                          <span className={`text-[8.5px] block font-bold text-muted-foreground/75 px-1.5 ${
                            isMyMessage ? 'text-right' : 'text-left'
                          }`}>
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              {activeChatMessages.length > 0 && <div ref={chatEndRef} />}
            </div>

            {/* Input area form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border/30 flex gap-2 items-center bg-card/30">
              <Input
                type="text"
                placeholder="Escribe tu mensaje..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                maxLength={400}
                className="flex-1 h-10 text-xs font-medium"
              />
              <Button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="rounded-xl w-10 h-10 p-0 flex items-center justify-center shrink-0 cursor-pointer shadow-sm shadow-primary/25 hover:shadow-primary/45 transition-all"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/50 space-y-3 p-8">
            <MessageSquare className="w-16 h-16 opacity-15" />
            <h3 className="text-sm font-black">Ningún Chat Seleccionado</h3>
            <p className="text-xs text-muted-foreground/85 max-w-[240px] leading-normal">
              Selecciona una conversación del panel de la izquierda para ver y participar en el chat de la partida.
            </p>
          </div>
        )}
      </div>

    </section>
  )
}

export default ChatsPage;
