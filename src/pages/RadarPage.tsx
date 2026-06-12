import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { getMockMeetupsForList } from '../lib/mockData'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { MeetupCard } from '../components/MeetupCard'
import { Meetup } from '../types'

const MotionDiv = motion.div

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVars = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
} as const

export function RadarPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMeetups() {
      try {
        const { data, error } = await supabase
          .from('meetups')
          .select(`*, users (*), games (*), meetup_guests (id, guest_name)`)
          .gte('date', new Date().toISOString()) // filter out past events
          .order('date', { ascending: true }) // closest future events first

        if (error) {
          console.error("Error fetching meetups:", error)
          setMeetups(getMockMeetupsForList())
        } else {
          setMeetups(data?.length ? (data as Meetup[]) : [])
        }
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMeetups()
  }, [])

  const handleJoinLeave = async (meetup: Meetup) => {
    if (!user) {
      navigate('/auth')
      return
    }

    const userId = user.id
    const isJoined = meetup.joined_players?.includes(userId)
    const isCreator = meetup.creator_id === userId

    if (isCreator) return // El creador no puede salirse de su meetup

    let updatedPlayers: string[] = []
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Buscando partidas en el tablero...</p>
      </div>
    )
  }

  return (
    <section className="space-y-6 pb-20 p-4 max-w-xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tablero</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Descubre partidas y mesas de juego cerca de ti.
          </p>
        </div>
        <Link to="/tablero/new">
          <Button className="rounded-xl font-bold shadow-sm flex items-center gap-1.5 h-10 cursor-pointer">
            <Plus className="w-4 h-4" /> Abrir Mesa
          </Button>
        </Link>
      </div>

      {meetups.length === 0 ? (
        <div className="text-center py-20 px-4 bg-muted/20 rounded-2xl border border-dashed border-border/60">
          <p className="text-muted-foreground text-lg mb-1">No hay partidas en el tablero aún.</p>
          <p className="text-sm text-foreground/60">¡Sé el primero en abrir una mesa!</p>
        </div>
      ) : (
        <MotionDiv variants={containerVars} initial="hidden" animate="show" className="space-y-5">
          {meetups.map(meetup => (
            <MotionDiv key={meetup.id} variants={itemVars}>
              <MeetupCard
                meetup={meetup}
                user={user}
                updatingId={updatingId}
                onJoinLeave={handleJoinLeave}
                onNavigate={navigate}
              />
            </MotionDiv>
          ))}
        </MotionDiv>
      )}
    </section>
  )
}
export default RadarPage;
