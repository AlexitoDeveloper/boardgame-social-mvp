import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getMockMeetupsForList } from '../lib/mockData'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { MeetupCard } from '../components/MeetupCard'
import { Game, Meetup } from '../types'
import { USE_MOCKS } from '../lib/config'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

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
  const ITEMS_PER_PAGE = 10
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Pagination & Infinite Scroll States
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersectionObserver(sentinelRef, { threshold: 0.1 })

  const fetchMeetups = async (pageNum: number, isInitial: boolean) => {
    if (isInitial) {
      setInitialLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const from = pageNum * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

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

        const pageData = activeMocks.slice(from, to + 1)
        setMeetups(prev => isInitial ? pageData : [...prev, ...pageData])
        setHasMore(activeMocks.length > from + pageData.length)
        return
      }

      const { data, error } = await supabase
        .from('meetups')
        .select(`*, users:users!meetups_creator_id_fkey (*), meetup_games(game_id, winner_user_id, winner_guest_id, games(*)), meetup_guests:meetup_guests!meetup_guests_meetup_id_fkey (id, guest_name)`)
        .eq('completed', false) // only active/open meetups
        .gte('date', new Date().toISOString()) // filter out past events
        .order('date', { ascending: true }) // closest future events first
        .range(from, to)

      if (error) {
        console.error("Error fetching meetups:", error)
        setHasMore(false)
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

        setMeetups(prev => isInitial ? formatted : [...prev, ...formatted])
        setHasMore(formatted.length === ITEMS_PER_PAGE)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setHasMore(false)
    } finally {
      setInitialLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchMeetups(page, page === 0)
  }, [page])

  useEffect(() => {
    if (isIntersecting && hasMore && !loadingMore && !initialLoading) {
      setPage(prev => prev + 1)
    }
  }, [isIntersecting, hasMore, loadingMore, initialLoading])

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

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
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
          <Button size="sm" icon={Plus} label="Abrir Mesa" className="cursor-pointer" />
        </Link>
      </div>

      {/* Mobile Floating Action Button (FAB) for opening tables */}
      <Link 
        to="/tablero/new" 
        className="sm:hidden fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] right-4 z-40"
      >
        <Button 
          size="icon"
          icon={Plus}
          className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-200 border-0"
        />
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

      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      )}
      {!hasMore && meetups.length > 0 && (
        <div className="text-center text-xs font-bold text-muted-foreground py-6 select-none">
          No hay más partidas en el tablero.
        </div>
      )}
      <div ref={sentinelRef} className="h-4 w-full" />
    </section>
  )
}
export default RadarPage;
