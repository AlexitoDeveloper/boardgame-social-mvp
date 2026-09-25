import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Game } from '../types'
import { USE_MOCKS } from '../lib/config'

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function seedShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let m = shuffled.length, t, i;
  while (m) {
    i = Math.floor(pseudoRandom(seed + m) * m--);
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }
  return shuffled;
}

function getDayOfYearSeed(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

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

const CAROUSEL_FIELDS = 'bgg_id, title, title_es, publisher, es_publisher, has_spanish_edition, year_published, image_url, image_url_es, min_players, max_players, playing_time, is_expansion, bgg_rank, rating_geek, rating_average, complexity'

interface ExploreCarouselData {
  novedades: Game[];
  paraDos: Game[];
  classics: Game[];
  fastGames: Game[];
  heavyGames: Game[];
  partyGames: Game[];
  top10: Game[];
  top10Month: Game[];
  communityRankings: any[];
  featuredGame: Game | null;
}

let exploreCache: { timestamp: number; data: ExploreCarouselData } | null = null
const EXPLORE_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Helper function to fetch community rankings
async function fetchCommunityRankings(): Promise<any[]> {
  if (USE_MOCKS) return MOCK_COMMUNITY_RANKINGS
  try {
    const { data, error } = await supabase
      .from('user_rankings')
      .select('id, title, mode, user_id, created_at, user:users (username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Could not query user_rankings from DB, falling back to mocks:', err)
    return MOCK_COMMUNITY_RANKINGS
  }
}

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
        .select(CAROUSEL_FIELDS)
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
  const [loadingCarousels, setLoadingCarousels] = useState(() => {
    // If cache is fresh, don't show skeleton
    return !(exploreCache && Date.now() - exploreCache.timestamp < EXPLORE_CACHE_TTL_MS)
  })
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carousel categories state (hydrated from cache if available)
  const [novedades, setNovedades] = useState<Game[]>(() => exploreCache?.data.novedades || [])
  const [paraDos, setParaDos] = useState<Game[]>(() => exploreCache?.data.paraDos || [])
  const [classics, setClassics] = useState<Game[]>(() => exploreCache?.data.classics || [])
  const [fastGames, setFastGames] = useState<Game[]>(() => exploreCache?.data.fastGames || [])
  const [heavyGames, setHeavyGames] = useState<Game[]>(() => exploreCache?.data.heavyGames || [])
  const [partyGames, setPartyGames] = useState<Game[]>(() => exploreCache?.data.partyGames || [])
  const [top10, setTop10] = useState<Game[]>(() => exploreCache?.data.top10 || [])
  const [top10Month, setTop10Month] = useState<Game[]>(() => exploreCache?.data.top10Month || [])
  const [communityRankings, setCommunityRankings] = useState<any[]>(() => exploreCache?.data.communityRankings || [])
  const [featuredGame, setFeaturedGame] = useState<Game | null>(() => exploreCache?.data.featuredGame || null)
  const [activeMeetups] = useState<any[]>([])

  // Search grid results state
  const [searchResults, setSearchResults] = useState<Game[]>([])

  const isFiltering = !!(search.trim() || playerFilter || complexityFilter || spanishOnly)

  // 1. Fetch idle carousels data once on mount (single parallel round-trip)
  useEffect(() => {
    // If cache is valid, skip network fetch entirely
    if (exploreCache && Date.now() - exploreCache.timestamp < EXPLORE_CACHE_TTL_MS) {
      setLoadingCarousels(false)
      return
    }

    async function fetchCarousels() {
      setLoadingCarousels(true)
      setError(null)
      try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

        // Execute all 9 category & ranking queries concurrently in a single network round-trip
        const [
          novRes,
          dosRes,
          claRes,
          fastRes,
          heavyRes,
          partyRes,
          commRankingsData,
          weekRes,
          monthRes
        ] = await Promise.all([
          // novedades
          supabase
            .from('games')
            .select(CAROUSEL_FIELDS)
            .eq('has_spanish_edition', true)
            .order('year_published', { ascending: false })
            .limit(20),
          // paraDos
          supabase
            .from('games')
            .select(CAROUSEL_FIELDS)
            .lte('min_players', 2)
            .gte('max_players', 2)
            .order('bgg_rank', { ascending: true, nullsFirst: false })
            .limit(20),
          // classics
          supabase
            .from('games')
            .select(CAROUSEL_FIELDS)
            .not('rating_geek', 'is', null)
            .order('rating_geek', { ascending: false })
            .limit(20),
          // fastGames (<= 35 min)
          supabase
            .from('games')
            .select(CAROUSEL_FIELDS)
            .lte('playing_time', 35)
            .gt('playing_time', 0)
            .not('rating_geek', 'is', null)
            .order('rating_geek', { ascending: false })
            .limit(20),
          // heavyGames (complexity >= 3.2)
          supabase
            .from('games')
            .select(CAROUSEL_FIELDS)
            .gte('complexity', 3.2)
            .not('rating_geek', 'is', null)
            .order('rating_geek', { ascending: false })
            .limit(20),
          // partyGames (max_players >= 6)
          supabase
            .from('games')
            .select(CAROUSEL_FIELDS)
            .gte('max_players', 6)
            .not('rating_geek', 'is', null)
            .order('rating_geek', { ascending: false })
            .limit(20),
          // community rankings
          fetchCommunityRankings(),
          // top 10 week & month
          fetchMostPlayedGames(oneWeekAgo),
          fetchMostPlayedGames(oneMonthAgo)
        ])

        if (novRes.error) throw novRes.error
        if (dosRes.error) throw dosRes.error
        if (claRes.error) throw claRes.error

        // Daily seeds
        const daySeed = getDayOfYearSeed()

        // 1. Recommended Game of the Day (select from classics pool)
        let recommendedOfTheDay: Game | null = null
        if (claRes.data && claRes.data.length > 0) {
          const featuredPool = claRes.data.slice(0, 15)
          recommendedOfTheDay = (featuredPool[daySeed % featuredPool.length] as Game) || null
        }

        // 2. Shuffle categories deterministically using daily seed
        const shuffledNovedades = seedShuffle((novRes.data || []) as Game[], daySeed).slice(0, 15)
        const shuffledParaDos = seedShuffle((dosRes.data || []) as Game[], daySeed + 1).slice(0, 15)
        const shuffledClassics = seedShuffle((claRes.data || []) as Game[], daySeed + 2).slice(0, 15)
        const shuffledFast = seedShuffle((fastRes.data || []) as Game[], daySeed + 3).slice(0, 15)
        const shuffledHeavy = seedShuffle((heavyRes.data || []) as Game[], daySeed + 4).slice(0, 15)
        const shuffledParty = seedShuffle((partyRes.data || []) as Game[], daySeed + 5).slice(0, 15)
        const weekGames = weekRes || []
        const monthGames = monthRes || []

        const cachePayload: ExploreCarouselData = {
          novedades: shuffledNovedades,
          paraDos: shuffledParaDos,
          classics: shuffledClassics,
          fastGames: shuffledFast,
          heavyGames: shuffledHeavy,
          partyGames: shuffledParty,
          top10: weekGames,
          top10Month: monthGames,
          communityRankings: commRankingsData,
          featuredGame: recommendedOfTheDay
        }

        // Save to cache
        exploreCache = {
          timestamp: Date.now(),
          data: cachePayload
        }

        setNovedades(shuffledNovedades)
        setParaDos(shuffledParaDos)
        setClassics(shuffledClassics)
        setFastGames(shuffledFast)
        setHeavyGames(shuffledHeavy)
        setPartyGames(shuffledParty)
        setTop10(weekGames)
        setTop10Month(monthGames)
        setCommunityRankings(commRankingsData)
        setFeaturedGame(recommendedOfTheDay)
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

  // Track previous search to only debounce when typing text
  const prevSearchRef = useRef(search)

  useEffect(() => {
    if (isFiltering) {
      setLoadingSearch(true)
      const isTextTyping = prevSearchRef.current !== search
      prevSearchRef.current = search

      const delay = isTextTyping ? 300 : 0
      const handler = setTimeout(() => {
        fetchFilteredGames()
      }, delay)
      return () => clearTimeout(handler)
    } else {
      prevSearchRef.current = search
      setSearchResults([])
      setLoadingSearch(false)
    }
  }, [isFiltering, search, fetchFilteredGames])

  return {
    loadingCarousels,
    loadingSearch,
    error,
    novedades,
    paraDos,
    classics,
    fastGames,
    heavyGames,
    partyGames,
    top10,
    top10Month,
    communityRankings,
    searchResults,
    isFiltering,
    featuredGame,
    activeMeetups
  }
}
export default useExploreGames;
