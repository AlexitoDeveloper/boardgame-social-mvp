import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Game } from '../types'
import { USE_MOCKS } from '../lib/config'

// Mock data fallbacks for community rankings
const MOCK_COMMUNITY_RANKINGS = [
  {
    id: 'mock-r1',
    user_id: 'mock-u1',
    title: 'Mis Euros Favoritos',
    mode: 'tier',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      username: 'boardgamer_alex',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    }
  },
  {
    id: 'mock-r2',
    user_id: 'mock-u3',
    title: 'Wargames Imprescindibles',
    mode: 'top10',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      username: 'hex_and_counter',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter'
    }
  },
  {
    id: 'mock-r3',
    user_id: 'mock-u2',
    title: 'Party Games Divertidos',
    mode: 'tier',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      username: 'meeple_sara',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara'
    }
  }
]

// Helper function to fetch most played games with robust fallback mechanism
async function fetchMostPlayedGames(timeLimitIso: string | null): Promise<Game[]> {
  try {
    if (USE_MOCKS) {
      throw new Error('Using mock mode')
    }

    const { data, error } = await supabase.rpc('get_most_played_games', { p_time_limit_iso: timeLimitIso })
    if (error) throw error
    return (data || []) as Game[]
  } catch (err) {
    // Return BGG top rank games as absolute fallback
    try {
      const { data } = await supabase
        .from('games')
        .select('*')
        .not('bgg_rank', 'is', null)
        .order('bgg_rank', { ascending: true })
        .limit(10)
      return (data || []) as Game[]
    } catch {
      return []
    }
  }
}

export function useExploreGames(
  search: string,
  playerFilter: string,
  complexityFilter: string,
  spanishOnly: boolean
) {
  const [loadingCarousels, setLoadingCarousels] = useState(true)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carousel categories state
  const [novedades, setNovedades] = useState<Game[]>([])
  const [paraDos, setParaDos] = useState<Game[]>([])
  const [classics, setClassics] = useState<Game[]>([])
  const [top10, setTop10] = useState<Game[]>([])
  const [top10Month, setTop10Month] = useState<Game[]>([])
  const [communityRankings, setCommunityRankings] = useState<any[]>([])

  // Search grid results state
  const [searchResults, setSearchResults] = useState<Game[]>([])

  const isFiltering = !!(search.trim() || playerFilter || complexityFilter || spanishOnly)

  // 1. Fetch idle carousels data once on mount
  useEffect(() => {
    async function fetchCarousels() {
      setLoadingCarousels(true)
      setError(null)
      try {
        // novedades Query: year_published DESC, has_spanish_edition = true
        const novedadesQuery = supabase
          .from('games')
          .select('*')
          .eq('has_spanish_edition', true)
          .order('year_published', { ascending: false })
          .limit(15)

        // paraDos Query: min_players <= 2, max_players >= 2
        const paraDosQuery = supabase
          .from('games')
          .select('*')
          .lte('min_players', 2)
          .gte('max_players', 2)
          .order('bgg_rank', { ascending: true, nullsFirst: false })
          .limit(15)

        // classics Query: rating_geek DESC
        const classicsQuery = supabase
          .from('games')
          .select('*')
          .not('rating_geek', 'is', null)
          .order('rating_geek', { ascending: false })
          .limit(15)

        // communityRankings Query
        let commRankingsData: any[] = []
        if (!USE_MOCKS) {
          try {
            const { data, error: comError } = await supabase
              .from('user_rankings')
              .select('id, title, mode, user_id, created_at, user:users (username, avatar_url)')
              .order('created_at', { ascending: false })
              .limit(10)
            if (comError) throw comError
            commRankingsData = data || []
          } catch (err) {
            console.warn('Could not query user_rankings from DB, falling back to mocks:', err)
            commRankingsData = MOCK_COMMUNITY_RANKINGS
          }
        } else {
          commRankingsData = MOCK_COMMUNITY_RANKINGS
        }

        // Run other queries in parallel
        const [novRes, dosRes, claRes] = await Promise.all([
          novedadesQuery,
          paraDosQuery,
          classicsQuery
        ])

        if (novRes.error) throw novRes.error
        if (dosRes.error) throw dosRes.error
        if (claRes.error) throw claRes.error

        // Fetch Top 10 Week and Month dynamically
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        const [weekRes, monthRes] = await Promise.all([
          fetchMostPlayedGames(oneWeekAgo),
          fetchMostPlayedGames(oneMonthAgo)
        ])

        setNovedades(novRes.data || [])
        setParaDos(dosRes.data || [])
        setClassics(claRes.data || [])
        setTop10(weekRes || [])
        setTop10Month(monthRes || [])
        setCommunityRankings(commRankingsData)
      } catch (err: any) {
        console.error('Error fetching carousels:', err)
        setError(err.message || 'Error al cargar carruseles')
      } finally {
        setLoadingCarousels(false)
      }
    }

    fetchCarousels()
  }, [])

  // 2. Fetch filtered query with debounce for text search and filter pills
  const fetchFilteredGames = useCallback(async () => {
    setLoadingSearch(true)
    setError(null)
    try {
      let query = supabase.from('games').select('*')

      if (search.trim()) {
        query = query.or(`title.ilike.%${search.trim()}%,title_es.ilike.%${search.trim()}%`)
      }

      if (spanishOnly) {
        query = query.eq('has_spanish_edition', true)
      }

      if (playerFilter) {
        if (playerFilter === '1') {
          query = query.lte('min_players', 1).gte('max_players', 1)
        } else if (playerFilter === '2') {
          query = query.lte('min_players', 2).gte('max_players', 2)
        } else if (playerFilter === '3-4') {
          query = query.or('and(min_players.lte.3,max_players.gte.3),and(min_players.lte.4,max_players.gte.4)')
        } else if (playerFilter === '5+') {
          query = query.gte('max_players', 5)
        }
      }

      if (complexityFilter) {
        if (complexityFilter === 'familiar') {
          query = query.lte('complexity', 2.2)
        } else if (complexityFilter === 'medio') {
          query = query.gt('complexity', 2.2).lte('complexity', 3.5)
        } else if (complexityFilter === 'experto') {
          query = query.gt('complexity', 3.5)
        }
      }

      // Order by rank first, then geek rating
      query = query.order('bgg_rank', { ascending: true, nullsFirst: false }).limit(40)

      const { data, error: fetchErr } = await query
      if (fetchErr) throw fetchErr

      setSearchResults(data || [])
    } catch (err: any) {
      console.error('Error fetching search results:', err)
      setError(err.message || 'Error en la búsqueda')
    } finally {
      setLoadingSearch(false)
    }
  }, [search, playerFilter, complexityFilter, spanishOnly])

  useEffect(() => {
    if (isFiltering) {
      const handler = setTimeout(() => {
        fetchFilteredGames()
      }, 300) // 300ms debounce
      return () => clearTimeout(handler)
    } else {
      setSearchResults([])
    }
  }, [isFiltering, fetchFilteredGames])

  return {
    loadingCarousels,
    loadingSearch,
    error,
    novedades,
    paraDos,
    classics,
    top10,
    top10Month,
    communityRankings,
    searchResults,
    isFiltering
  }
}
export default useExploreGames;
