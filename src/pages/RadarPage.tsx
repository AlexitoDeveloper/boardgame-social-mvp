import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { getMockMeetupsForList } from '../lib/mockData'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { MeetupCard } from '../components/MeetupCard'
import { Game, Meetup } from '../types'
import { USE_MOCKS } from '../lib/config'

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
        if (USE_MOCKS) {
          const allMocks = getMockMeetupsForList()
          // Filter out completed mock meetups
          const completedMockKey = 'boardgame_social_mock_completed_meetups'
          const completedMockStr = localStorage.getItem(completedMockKey)
          const completedMockData = completedMockStr ? JSON.parse(completedMockStr) : {}
          const activeMocks = allMocks.map(m => {
            const completedInfo = completedMockData[m.id]
            if (completedInfo) {
              return { 
                ...m, 
                completed: completedInfo.completed,
                attended_players: completedInfo.attended_players,
                attended_guests: completedInfo.attended_guests
              }
            }
            return m
          }).filter(m => !m.completed)

          setMeetups(activeMocks)
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('meetups')
          .select(`*, users:users!meetups_creator_id_fkey (*), meetup_games(game_id, winner_user_id, winner_guest_id, games(*)), meetup_guests:meetup_guests!meetup_guests_meetup_id_fkey (id, guest_name)`)
          .eq('completed', false) // only active/open meetups
          .gte('date', new Date().toISOString()) // filter out past events
          .order('date', { ascending: true }) // closest future events first

        if (error) {
          console.error("Error fetching meetups:", error)
          setMeetups([])
        } else {
          const formatted = (data || []).map((m: any) => {
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
          })
          setMeetups(formatted as Meetup[])
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
    <section className="space-y-6 pb-20 p-4 max-w-xl mx-auto relative">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tablero</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Descubre partidas y mesas de juego cerca de ti.
          </p>
        </div>
        <Link to="/tablero/new" className="hidden sm:inline-block">
          <Button className="rounded-xl font-bold shadow-sm flex items-center gap-1.5 h-10 cursor-pointer">
            <Plus className="w-4 h-4" /> Abrir Mesa
          </Button>
        </Link>
      </div>

      {/* Mobile Floating Action Button (FAB) for opening tables */}
      <Link 
        to="/tablero/new" 
        className="sm:hidden fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-40"
      >
        <Button 
          className="rounded-full shadow-lg shadow-primary/20 w-14 h-14 p-0 flex items-center justify-center bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all duration-200 border-0"
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </Link>

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
