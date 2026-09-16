import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { USE_MOCKS } from '../lib/config'
import { getMockMeetupsForList } from '../lib/mockData'

export function useTableHub() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<any | null>(null)
  const [lastFinishedSession, setLastFinishedSession] = useState<any | null>(null)
  const [userCollectionCount, setUserCollectionCount] = useState<number>(0)

  useEffect(() => {
    let isCancelled = false

    async function loadTableHubData() {
      setLoading(true)
      try {
        if (USE_MOCKS || !user?.id) {
          // Fallback mocks
          const mockMeetups = getMockMeetupsForList()
          const active = mockMeetups.find(m => !m.completed) || mockMeetups[0]
          const finished = mockMeetups.find(m => m.completed) || null
          
          if (!isCancelled) {
            setActiveSession(active)
            setLastFinishedSession(finished)
          }
        } else {
          // 1. Fetch active session or last finished session
          const { data: userMeetups } = await supabase
            .from('meetups')
            .select('*, games:meetup_games(game_id, games(*))')
            .or(`creator_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(3)

          if (userMeetups && userMeetups.length > 0 && !isCancelled) {
            const active = userMeetups.find(m => !m.completed)
            const finished = userMeetups.find(m => m.completed)
            setActiveSession(active || null)
            setLastFinishedSession(finished || null)
          }

          // 2. Fetch user's collection count
          const { count } = await supabase
            .from('user_collection')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (count !== null && !isCancelled) {
            setUserCollectionCount(count)
          }
        }
      } catch (err) {
        console.error('Error loading table hub:', err)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    loadTableHubData()
    return () => { isCancelled = true }
  }, [user?.id])

  return {
    loading,
    activeSession,
    lastFinishedSession,
    userCollectionCount,
    user
  }
}
