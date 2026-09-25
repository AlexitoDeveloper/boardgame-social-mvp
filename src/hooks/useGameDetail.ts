import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Game, Meetup } from '../types'
import { useAuth } from '../lib/authContext'
import { USE_MOCKS } from '../lib/config'
import { MOCK_BGG_GAMES } from '../lib/mockData'

export interface GameWinner {
  name: string;
  avatar_url: string | null;
  wins: number;
}

export interface GameOwner {
  user_id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
}

interface CachedGameDetail {
  game: Game;
  baseGame: Game | null;
  expansions: Game[];
  playsCount: number;
  winnersLog: GameWinner[];
  owners: GameOwner[];
  upcomingMeetups: Meetup[];
  isInCollection: boolean;
  currentUserCity: string | null;
  timestamp: number;
}

const gameDetailCache = new Map<string, CachedGameDetail>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function useGameDetail(bggIdStr: string | undefined) {
  const { user } = useAuth()
  const bggId = bggIdStr ? parseInt(bggIdStr, 10) : NaN
  const cacheKey = !isNaN(bggId) ? `${bggId}_${user?.id || 'anon'}` : null
  const cachedData = cacheKey ? gameDetailCache.get(cacheKey) : null
  const isCacheFresh = cachedData ? (Date.now() - cachedData.timestamp < CACHE_TTL_MS) : false

  const [loading, setLoading] = useState(!isCacheFresh)
  const [error, setError] = useState<string | null>(null)
  const [game, setGame] = useState<Game | null>(() => (isCacheFresh && cachedData ? cachedData.game : null))
  const [baseGame, setBaseGame] = useState<Game | null>(() => (isCacheFresh && cachedData ? cachedData.baseGame : null))
  const [expansions, setExpansions] = useState<Game[]>(() => (isCacheFresh && cachedData ? cachedData.expansions : []))
  
  // Real-time Community Stats
  const [playsCount, setPlaysCount] = useState<number>(() => (isCacheFresh && cachedData ? cachedData.playsCount : 0))
  const [winnersLog, setWinnersLog] = useState<GameWinner[]>(() => (isCacheFresh && cachedData ? cachedData.winnersLog : []))
  const [owners, setOwners] = useState<GameOwner[]>(() => (isCacheFresh && cachedData ? cachedData.owners : []))
  const [upcomingMeetups, setUpcomingMeetups] = useState<Meetup[]>(() => (isCacheFresh && cachedData ? cachedData.upcomingMeetups : []))
  
  // Personal Collection Status
  const [isInCollection, setIsInCollection] = useState<boolean>(() => (isCacheFresh && cachedData ? cachedData.isInCollection : false))
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUserCity, setCurrentUserCity] = useState<string | null>(() => (isCacheFresh && cachedData ? cachedData.currentUserCity : null))

  const fetchGameDetails = useCallback(async () => {
    if (isNaN(bggId)) {
      setError('ID de juego inválido')
      setLoading(false)
      return
    }

    const currentKey = `${bggId}_${user?.id || 'anon'}`
    const existingCache = gameDetailCache.get(currentKey)
    if (existingCache && Date.now() - existingCache.timestamp < CACHE_TTL_MS) {
      setGame(existingCache.game)
      setBaseGame(existingCache.baseGame)
      setExpansions(existingCache.expansions)
      setPlaysCount(existingCache.playsCount)
      setWinnersLog(existingCache.winnersLog)
      setOwners(existingCache.owners)
      setUpcomingMeetups(existingCache.upcomingMeetups)
      setIsInCollection(existingCache.isInCollection)
      setCurrentUserCity(existingCache.currentUserCity)
      setLoading(false)
      return
    }

    // If changing game or first load without cache, show skeleton
    setLoading(true)
    setError(null)

    if (USE_MOCKS) {
      // Mock Implementation
      const mockGame = MOCK_BGG_GAMES.find(g => Number(g.bgg_id) === bggId)
      if (mockGame) {
        const gameData: Game = {
          bgg_id: Number(mockGame.bgg_id),
          title: mockGame.name,
          title_es: mockGame.name === 'Dixit' ? 'Dixit (Edición Española)' : mockGame.name,
          year_published: mockGame.year ? Number(mockGame.year) : 2020,
          image_url: mockGame.image_url || null,
          min_players: mockGame.min_players ? Number(mockGame.min_players) : 2,
          max_players: mockGame.max_players ? Number(mockGame.max_players) : 4,
          playing_time: mockGame.playing_time ? Number(mockGame.playing_time) : 60,
          complexity: 2.5,
          rating_average: 8.0,
          rating_geek: 7.8,
          bgg_rank: 45,
          has_spanish_edition: true,
          publisher: 'Publisher Int',
          es_publisher: 'Asmodee'
        }
        setGame(gameData)
        setPlaysCount(4)
        const mockWinners = [
          { name: 'alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', wins: 3 },
          { name: 'tester2', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tester', wins: 1 }
        ]
        setWinnersLog(mockWinners)
        const mockOwners = [
          { user_id: 'mock-u1', username: 'boardgamer_alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', city: 'Madrid' },
          { user_id: 'mock-u2', username: 'meeple_sara', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara', city: 'Barcelona' }
        ]
        setOwners(mockOwners)
        const mockMeetups = [
          {
            id: 'mock-m1',
            creator_id: 'mock-u1',
            title: 'Quedada Dixit y Party Games',
            description: 'Vente a echar unas risas jugando a Dixit y otros juegos ligeros. Apto para novatos.',
            city: 'Madrid',
            location: 'Epic Board Game Café',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            max_players: 6,
            joined_players: ['mock-u1', 'mock-u2'],
            users: {
              id: 'mock-u1',
              username: 'boardgamer_alex',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
            }
          },
          {
            id: 'mock-m2',
            creator_id: 'mock-u3',
            title: 'Dixit competitivo nocturno',
            description: 'Partida seria de Dixit para jugadores experimentados que les encanten las pistas complejas.',
            city: 'Madrid',
            location: 'Calle de Alcalá 140',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            max_players: 4,
            joined_players: ['mock-u3'],
            users: {
              id: 'mock-u3',
              username: 'hex_and_counter',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter'
            }
          }
        ]
        setUpcomingMeetups(mockMeetups)
        const mockProfileId = user?.id || 'mock-u1'
        const mockKey = `ludiclub_mock_collection_${mockProfileId}`
        let inColl = false
        try {
          const stored = localStorage.getItem(mockKey) || localStorage.getItem(`boardgame_social_mock_collection_${mockProfileId}`)
          const list = stored ? JSON.parse(stored) : []
          inColl = list.some((g: any) => g.bgg_id === bggId)
        } catch {
          inColl = false
        }
        setIsInCollection(inColl)

        gameDetailCache.set(currentKey, {
          game: gameData,
          baseGame: null,
          expansions: [],
          playsCount: 4,
          winnersLog: mockWinners,
          owners: mockOwners,
          upcomingMeetups: mockMeetups,
          isInCollection: inColl,
          currentUserCity: 'Madrid',
          timestamp: Date.now()
        })
      } else {
        setError('Juego no encontrado')
      }
      setLoading(false)
      return
    }

    try {
      // 1. Fetch game from local DB
      let { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('bgg_id', bggId)
        .maybeSingle()

      if (gameError) throw gameError

      // 2. Fallback: Ingest game if not present in DB
      if (!gameData) {
        console.log(`[Game Detail] Game ${bggId} not in DB, triggering auto-ingest...`)
        const { data: ingestData, error: ingestError } = await supabase.functions.invoke('bgg-ingest', {
          body: { action: 'ingest', bggIds: [bggId] }
        })

        if (ingestError) throw ingestError

        if (ingestData && ingestData.success && ingestData.games && ingestData.games.length > 0) {
          gameData = ingestData.games[0]
        } else {
          throw new Error('No se pudo encontrar el juego en BoardGameGeek.')
        }
      }

      const castGame = gameData as Game
      setGame(castGame)
      // Instant display: unblock UI skeleton immediately now that primary game is loaded!
      setLoading(false)

      // 3. Concurrently fetch all secondary details in parallel
      const [
        baseResult,
        expansionsResult,
        playsResult,
        winnersResult,
        ownersResult,
        userStatusResult,
        meetupsResult
      ] = await Promise.allSettled([
        // Base Game (if expansion)
        castGame.is_expansion && castGame.bgg_base_game_id
          ? supabase.from('games').select('*').eq('bgg_id', castGame.bgg_base_game_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        // Expansions (if base game)
        !castGame.is_expansion
          ? supabase.from('games').select('*').eq('bgg_base_game_id', castGame.bgg_id)
          : Promise.resolve({ data: [], error: null }),

        // Plays count
        supabase
          .from('meetup_games')
          .select('*', { count: 'exact', head: true })
          .eq('game_id', bggId),

        // Winners log
        supabase
          .from('meetup_games')
          .select(`
            winner_user_id,
            winner_guest_id,
            winner_user:users (username, avatar_url),
            winner_guest:meetup_guests (guest_name)
          `)
          .eq('game_id', bggId)
          .or('winner_user_id.not.is.null,winner_guest_id.not.is.null'),

        // Owners (local ludoteca)
        supabase
          .from('user_collection')
          .select('user_id, users:users (username, avatar_url, city)')
          .eq('game_id', bggId),

        // User personal collection status & city
        user?.id
          ? Promise.all([
              supabase.from('user_collection').select('user_id').eq('user_id', user.id).eq('game_id', bggId).maybeSingle(),
              supabase.from('users').select('city').eq('id', user.id).maybeSingle()
            ])
          : Promise.resolve([{ data: null }, { data: null }]),

        // Upcoming meetups
        supabase
          .from('meetup_games')
          .select(`
            meetup:meetups!inner (
              id,
              creator_id,
              title,
              description,
              date,
              location,
              city,
              max_players,
              joined_players,
              completed,
              is_online,
              platform,
              users:users!meetups_creator_id_fkey (
                username,
                avatar_url
              )
            )
          `)
          .eq('game_id', bggId)
          .eq('meetups.completed', false)
          .gte('meetups.date', new Date().toISOString())
      ])

      // Parse base game
      let resolvedBaseGame: Game | null = null
      if (baseResult.status === 'fulfilled') {
        const val = baseResult.value as any
        if (val?.data) resolvedBaseGame = val.data as Game
      }
      setBaseGame(resolvedBaseGame)

      // Parse expansions
      let resolvedExpansions: Game[] = []
      if (expansionsResult.status === 'fulfilled') {
        const val = expansionsResult.value as any
        if (val?.data && Array.isArray(val.data)) resolvedExpansions = val.data as Game[]
      }
      setExpansions(resolvedExpansions)

      // Parse plays count
      let resolvedPlaysCount = 0
      if (playsResult.status === 'fulfilled') {
        const val = playsResult.value as any
        if (val?.count != null) resolvedPlaysCount = val.count
      }
      setPlaysCount(resolvedPlaysCount)

      // Parse winners log
      let resolvedWinners: GameWinner[] = []
      if (winnersResult.status === 'fulfilled') {
        const val = winnersResult.value as any
        if (!val?.error && val?.data) {
          const groupedWinners: Record<string, { wins: number; avatar_url: string | null }> = {}
          val.data.forEach((row: any) => {
            let name = ''
            let avatar: string | null = null
            if (row.winner_user) {
              name = row.winner_user.username
              avatar = row.winner_user.avatar_url
            } else if (row.winner_guest) {
              name = row.winner_guest.guest_name + ' (Invitado)'
            }
            if (name) {
              if (!groupedWinners[name]) {
                groupedWinners[name] = { wins: 0, avatar_url: avatar }
              }
              groupedWinners[name].wins += 1
            }
          })
          resolvedWinners = Object.entries(groupedWinners)
            .map(([name, stats]) => ({
              name,
              avatar_url: stats.avatar_url,
              wins: stats.wins
            }))
            .sort((a, b) => b.wins - a.wins)
        }
      }
      setWinnersLog(resolvedWinners)

      // Parse owners
      let resolvedOwners: GameOwner[] = []
      if (ownersResult.status === 'fulfilled') {
        const val = ownersResult.value as any
        if (!val?.error && val?.data) {
          resolvedOwners = val.data
            .map((row: any) => {
              if (row.users) {
                return {
                  user_id: row.user_id,
                  username: row.users.username,
                  avatar_url: row.users.avatar_url,
                  city: row.users.city || null
                }
              }
              return null
            })
            .filter((o: any): o is GameOwner => !!o)
        }
      }
      setOwners(resolvedOwners)

      // Parse current user collection & city
      let resolvedInCollection = false
      let resolvedCity: string | null = null
      if (userStatusResult.status === 'fulfilled') {
        const val = userStatusResult.value as any
        if (Array.isArray(val)) {
          const [ownRes, userRes] = val
          resolvedInCollection = !!ownRes?.data
          resolvedCity = userRes?.data?.city || null
        }
      }
      setIsInCollection(resolvedInCollection)
      setCurrentUserCity(resolvedCity)

      // Parse upcoming meetups
      let resolvedMeetups: Meetup[] = []
      if (meetupsResult.status === 'fulfilled') {
        const val = meetupsResult.value as any
        if (!val?.error && val?.data) {
          resolvedMeetups = val.data
            .map((row: any) => {
              const m = row.meetup
              if (!m) return null
              return {
                ...m,
                users: m.users ? { id: m.creator_id, username: m.users.username, avatar_url: m.users.avatar_url } : null
              }
            })
            .filter((m: any): m is Meetup => !!m)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        }
      }
      setUpcomingMeetups(resolvedMeetups)

      // Populate cache for instantaneous subsequent visits
      gameDetailCache.set(currentKey, {
        game: castGame,
        baseGame: resolvedBaseGame,
        expansions: resolvedExpansions,
        playsCount: resolvedPlaysCount,
        winnersLog: resolvedWinners,
        owners: resolvedOwners,
        upcomingMeetups: resolvedMeetups,
        isInCollection: resolvedInCollection,
        currentUserCity: resolvedCity,
        timestamp: Date.now()
      })
    } catch (err: any) {
      console.error('Error fetching game details:', err)
      setError(err.message || 'Error al cargar los detalles del juego')
      setLoading(false)
    }
  }, [bggId, user?.id])

  const toggleCollection = async (): Promise<{ success: boolean; added?: boolean; error?: string }> => {
    if (isNaN(bggId) || !game) return { success: false }

    setActionLoading(true)
    setError(null)

    if (USE_MOCKS) {
      const nextState = !isInCollection
      setIsInCollection(nextState)
      setActionLoading(false)
      const mockProfileId = user?.id || 'mock-u1'
      const mockKey = `ludiclub_mock_collection_${mockProfileId}`
      try {
        const stored = localStorage.getItem(mockKey) || localStorage.getItem(`boardgame_social_mock_collection_${mockProfileId}`)
        let list = stored ? JSON.parse(stored) : []
        if (nextState) {
          if (!list.some((g: any) => g.bgg_id === game.bgg_id)) {
            list.push(game)
          }
        } else {
          list = list.filter((g: any) => g.bgg_id !== bggId)
        }
        localStorage.setItem(mockKey, JSON.stringify(list))
      } catch (err) {
        console.warn('Could not update mock collection localStorage', err)
      }
      const cKey = `${bggId}_${mockProfileId}`
      const cached = gameDetailCache.get(cKey)
      if (cached) {
        cached.isInCollection = nextState
      }
      window.dispatchEvent(new Event('collection_update'))
      return { success: true, added: nextState }
    }

    if (!user) {
      setActionLoading(false)
      const errMsg = 'Debes iniciar sesión para editar tu ludoteca'
      setError(errMsg)
      return { success: false, error: errMsg }
    }

    try {
      const cKey = `${bggId}_${user.id}`
      if (isInCollection) {
        const { error: delErr } = await supabase
          .from('user_collection')
          .delete()
          .eq('user_id', user.id)
          .eq('game_id', bggId)
        
        if (delErr) throw delErr
        setIsInCollection(false)
        
        // Remove self from local owners array
        setOwners(prev => prev.filter(o => o.user_id !== user.id))
        const cached = gameDetailCache.get(cKey)
        if (cached) {
          cached.isInCollection = false
          cached.owners = cached.owners.filter(o => o.user_id !== user.id)
        }
        return { success: true, added: false }
      } else {
        const { error: insErr } = await supabase
          .from('user_collection')
          .insert({ user_id: user.id, game_id: bggId })
        
        if (insErr) throw insErr
        setIsInCollection(true)
        
        // Add self to local owners array
        let newOwner: GameOwner | null = null
        try {
          const { data: selfProf } = await supabase
            .from('users')
            .select('username, avatar_url, city')
            .eq('id', user.id)
            .single()
            
          if (selfProf) {
            newOwner = {
              user_id: user.id,
              username: selfProf.username,
              avatar_url: selfProf.avatar_url,
              city: selfProf.city || null
            }
            setOwners(prev => [
              ...prev.filter(o => o.user_id !== user.id),
              newOwner!
            ])
          }
        } catch (profileErr) {
          console.warn("Could not load self profile to append to owners list:", profileErr)
        }

        const cached = gameDetailCache.get(cKey)
        if (cached) {
          cached.isInCollection = true
          if (newOwner) {
            cached.owners = [...cached.owners.filter(o => o.user_id !== user.id), newOwner]
          }
        }

        return { success: true, added: true }
      }
    } catch (err: any) {
      console.error('Error toggling collection status:', err)
      const message = err.message || 'No se pudo actualizar tu ludoteca'
      setError(message)
      return { success: false, error: message }
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    fetchGameDetails()

    const handleCollectionUpdate = () => {
      if (USE_MOCKS) {
        const mockProfileId = user?.id || 'mock-u1'
        const mockKey = `ludiclub_mock_collection_${mockProfileId}`
        try {
          const stored = localStorage.getItem(mockKey) || localStorage.getItem(`boardgame_social_mock_collection_${mockProfileId}`)
          const list = stored ? JSON.parse(stored) : []
          setIsInCollection(list.some((g: any) => g.bgg_id === bggId))
        } catch {}
      }
    }

    window.addEventListener('collection_update', handleCollectionUpdate)
    return () => {
      window.removeEventListener('collection_update', handleCollectionUpdate)
    }
  }, [fetchGameDetails, bggId, user?.id])

  return {
    loading,
    error,
    game,
    baseGame,
    expansions,
    playsCount,
    winnersLog,
    owners,
    isInCollection,
    actionLoading,
    toggleCollection,
    currentUserCity,
    upcomingMeetups,
    setError
  }
}
