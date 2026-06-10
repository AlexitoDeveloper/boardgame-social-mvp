import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'
import { MOCK_MEETUPS } from '../lib/mockData'
import { MapPin, CalendarDays, Users, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'

const MotionDiv = motion.div

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVars = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function RadarPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [meetups, setMeetups] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    async function fetchMeetups() {
      try {
        const { data, error } = await supabase
          .from('meetups')
          .select(`*, users (*), games (*)`)
          .order('date', { ascending: true })

        if (error) {
          console.error("Error fetching meetups:", error)
          setMeetups(MOCK_MEETUPS)
        } else {
          setMeetups(data?.length ? data : MOCK_MEETUPS)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setMeetups(MOCK_MEETUPS)
      } finally {
        setLoading(false)
      }
    }

    fetchMeetups()
  }, [])

  const handleJoinLeave = async (meetup) => {
    if (!user) {
      navigate('/auth')
      return
    }

    const userId = user.id
    const isJoined = meetup.joined_players?.includes(userId)
    const isCreator = meetup.creator_id === userId

    if (isCreator) return // El creador no puede salirse de su meetup

    let updatedPlayers = []
    if (isJoined) {
      updatedPlayers = meetup.joined_players.filter(id => id !== userId)
    } else {
      if ((meetup.joined_players?.length || 0) >= meetup.max_players) return
      updatedPlayers = [...(meetup.joined_players || []), userId]
    }

    setUpdatingId(meetup.id)
    try {
      const { error } = await supabase
        .from('meetups')
        .update({ joined_players: updatedPlayers })
        .eq('id', meetup.id)

      if (error) throw error

      setMeetups(prev => prev.map(m => m.id === meetup.id ? { ...m, joined_players: updatedPlayers } : m))
    } catch (err) {
      console.error("Error al actualizar asistencia:", err)
    } finally {
      setUpdatingId(null)
    }
  }

  const renderJoinButton = (meetup) => {
    if (!user) {
      return (
        <Button 
          onClick={() => navigate('/auth')} 
          variant="default" 
          size="sm" 
          className="flex-1 rounded-xl font-bold text-xs h-9 shadow-md shadow-primary/10 transition-all"
        >
          Apuntarse
        </Button>
      )
    }

    const userId = user.id
    const isJoined = meetup.joined_players?.includes(userId)
    const isCreator = meetup.creator_id === userId
    const isFull = (meetup.joined_players?.length || 0) >= meetup.max_players
    const isLoading = updatingId === meetup.id

    if (isCreator) {
      return (
        <Button 
          disabled 
          variant="secondary" 
          size="sm" 
          className="flex-1 rounded-xl font-bold text-xs h-9 bg-primary/10 text-primary opacity-80"
        >
          Organizador
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
          onClick={() => handleJoinLeave(meetup)} 
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
        onClick={() => handleJoinLeave(meetup)} 
        variant="default" 
        size="sm" 
        className="flex-1 rounded-xl font-bold text-xs h-9 shadow-md shadow-primary/15 transition-all hover:bg-primary/95"
      >
        Apuntarse
      </Button>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Buscando partidas en tu radar...</p>
      </div>
    )
  }

  return (
    <section className="space-y-6 pb-20 p-4 max-w-xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Radar Local</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Descubre partidas y reuniones cerca de ti.
          </p>
        </div>
        <Link to="/radar/new">
          <Button className="rounded-xl font-bold shadow-md shadow-primary/20 flex items-center gap-1.5 h-10 hover:shadow-primary/40 transition-all">
            Organizar Partida
          </Button>
        </Link>
      </div>

      {meetups.length === 0 ? (
        <div className="text-center py-20 px-4 bg-muted/20 rounded-2xl border border-dashed border-border/60">
          <p className="text-muted-foreground text-lg mb-1">No hay partidas en el radar aún.</p>
          <p className="text-sm text-foreground/60">¡Sé el primero en organizar una!</p>
        </div>
      ) : (
        <MotionDiv variants={containerVars} initial="hidden" animate="show" className="space-y-5">
          {meetups.map(meetup => (
            <MotionDiv key={meetup.id} variants={itemVars}>
              <Card className="overflow-hidden bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 group flex flex-col sm:flex-row border border-border/40">
                {/* Game Image Sidebar */}
                <div className="w-full sm:w-28 h-40 sm:h-auto relative overflow-hidden flex-shrink-0 bg-muted/30 border-b sm:border-b-0 sm:border-r border-border/20 flex items-center justify-center">
                  {meetup.games?.image_url ? (
                    <img 
                      src={meetup.games.image_url} 
                      alt={meetup.games?.title || 'Juego'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/60 bg-primary/5 font-extrabold text-[11px] uppercase tracking-wider p-2 text-center">
                      {meetup.games?.title || meetup.game_name || 'Sin Portada'}
                    </div>
                  )}
                  {/* Floating Game title overlay */}
                  <div className="absolute top-2 left-2 bg-background/95 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase text-primary border border-primary/20 tracking-wide shadow-sm max-w-[90%] truncate">
                    {meetup.games?.title || meetup.game_name || 'Juego'}
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="flex-1 flex flex-col justify-between p-4 sm:p-5">
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-extrabold leading-tight tracking-tight text-card-foreground">
                        {meetup.title || 'Partida de Juego de Mesa'}
                      </CardTitle>
                      
                      <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-primary" />
                          {new Date(meetup.date || meetup.created_at).toLocaleDateString('es-ES', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {meetup.location || 'Ubicación por definir'}
                        </span>
                      </CardDescription>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2">{meetup.description || 'Sin descripción adicional.'}</p>
                    
                    {/* Joined players info */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border border-background shadow-sm">
                          <AvatarImage src={meetup.users?.avatar_url} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {meetup.users?.username?.slice(0,2)?.toUpperCase() || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Organiza <span className="font-semibold text-foreground">{meetup.users?.username || 'anónimo'}</span>
                        </span>
                      </div>

                      {/* Player spots badge */}
                      <div className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1.5 border border-primary/20">
                        <Users className="w-3 h-3" />
                        {meetup.joined_players?.length || 0} / {meetup.max_players} plazas
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions footer */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl font-semibold border-border/50 text-xs h-9 transition-colors hover:bg-muted/80">
                      Ver Detalles
                    </Button>
                    {renderJoinButton(meetup)}
                  </div>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </MotionDiv>
      )}
    </section>
  )
}
