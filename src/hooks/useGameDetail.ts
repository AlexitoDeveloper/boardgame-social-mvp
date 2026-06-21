import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Game, UserProfile, Meetup } from '../types'
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

export function useGameDetail(bggIdStr: string | undefined) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [baseGame, setBaseGame] = useState<Game | null>(null)
  const [expansions, setExpansions] = useState<Game[]>([])
  
  // Real-time Community Stats
  const [playsCount, setPlaysCount] = useState(0)
  const [winnersLog, setWinnersLog] = useState<GameWinner[]>([])
  const [owners, setOwners] = useState<GameOwner[]>([])
  const [upcomingMeetups, setUpcomingMeetups] = useState<Meetup[]>([])
  
  // Personal Collection Status
  const [isInCollection, setIsInCollection] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUserCity, setCurrentUserCity] = useState<string | null>(null)

  const bggId = bggIdStr ? parseInt(bggIdStr, 10) : NaN

  const fetchGameDetails = useCallback(async () => {
    if (isNaN(bggId)) {
      setError('ID de juego inválido')
      setLoading(false)
      return
    }

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
        setWinnersLog([
          { name: 'alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', wins: 3 },
          { name: 'tester2', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tester', wins: 1 }
        ])
        setOwners([
          { user_id: 'mock-u1', username: 'boardgamer_alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', city: 'Madrid' },
          { user_id: 'mock-u2', username: 'meeple_sara', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara', city: 'Barcelona' }
        ])
        setUpcomingMeetups([
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
        ])
        setIsInCollection(false)
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

      setGame(gameData as Game)

      if (gameData) {
        const castGame = gameData as Game;
        
        // 3. Fetch Base Game if it is an expansion
        if (castGame.is_expansion && castGame.bgg_base_game_id) {
          const { data: baseData } = await supabase
            .from('games')
            .select('*')
            .eq('bgg_id', castGame.bgg_base_game_id)
            .maybeSingle()
          setBaseGame(baseData as Game || null)
        } else {
          setBaseGame(null)
        }

        // 4. Fetch Expansions if it is a base game
        const { data: expansionsData } = await supabase
          .from('games')
          .select('*')
          .eq('bgg_base_game_id', castGame.bgg_id)
        setExpansions(expansionsData as Game[] || [])

        // 5. Fetch total Plays count
        const { count: playCount, error: countError } = await supabase
          .from('meetup_games')
          .select('*', { count: 'exact', head: true })
          .eq('game_id', bggId)
        
        if (!countError) {
          setPlaysCount(playCount || 0)
        }

        // 6. Fetch winners log
        const { data: winnersData, error: winnersError } = await supabase
          .from('meetup_games')
          .select(`
            winner_user_id,
            winner_guest_id,
            winner_user:users (username, avatar_url),
            winner_guest:meetup_guests (guest_name)
          `)
          .eq('game_id', bggId)
          .or('winner_user_id.not.is.null,winner_guest_id.not.is.null')

        if (!winnersError && winnersData) {
          const groupedWinners: Record<string, { wins: number; avatar_url: string | null }> = {}
          winnersData.forEach((row: any) => {
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
          
          const sortedWinners = Object.entries(groupedWinners)
            .map(([name, stats]) => ({
              name,
              avatar_url: stats.avatar_url,
              wins: stats.wins
            }))
            .sort((a, b) => b.wins - a.wins)

          setWinnersLog(sortedWinners)
        }

        // 7. Fetch game owners (ludoteca local)
        try {
          const { data: collData, error: collError } = await supabase
            .from('user_collection')
            .select('user_id, users:users (username, avatar_url, city)')
            .eq('game_id', bggId)

          if (!collError && collData) {
            const mappedOwners = collData
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
              .filter((o): o is GameOwner => !!o)
            setOwners(mappedOwners)
          }
        } catch (err) {
          console.warn("Could not query user_collection (it might not exist yet):", err)
          setOwners([])
        }

        // 8. Fetch personal collection status & current user profile city
        if (user) {
          try {
            const [ownRes, userRes] = await Promise.all([
              supabase
                .from('user_collection')
                .select('*')
                .eq('user_id', user.id)
                .eq('game_id', bggId)
                .maybeSingle(),
              supabase
                .from('users')
                .select('city')
                .eq('id', user.id)
                .maybeSingle()
            ])
            setIsInCollection(!!ownRes.data)
            if (userRes.data) {
              setCurrentUserCity(userRes.data.city || null)
            }
          } catch {
            setIsInCollection(false)
          }
        }

        // 9. Fetch upcoming meetups for this game
        try {
          const { data: mGamesData, error: mGamesError } = await supabase
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

          if (!mGamesError && mGamesData) {
            const formattedMeetups: Meetup[] = mGamesData
              .map((row: any) => {
                const m = row.meetup
                if (!m) return null
                return {
                  ...m,
                  users: m.users ? { id: m.creator_id, username: m.users.username, avatar_url: m.users.avatar_url } : null
                }
              })
              .filter((m): m is Meetup => !!m)
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            setUpcomingMeetups(formattedMeetups)
          } else {
            setUpcomingMeetups([])
          }
        } catch (mErr) {
          console.warn("Could not load upcoming meetups for game page:", mErr)
          setUpcomingMeetups([])
        }
      }
    } catch (err: any) {
      console.error('Error fetching game details:', err)
      setError(err.message || 'Error al cargar los detalles del juego')
    } finally {
      setLoading(false)
    }
  }, [bggId, user])

  const toggleCollection = async () => {
    if (!user) {
      setError('Debes iniciar sesión para editar tu ludoteca')
      return
    }
    if (isNaN(bggId) || !game) return

    setActionLoading(true)
    setError(null)

    if (USE_MOCKS) {
      setIsInCollection(prev => !prev)
      setActionLoading(false)
      return
    }

    try {
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
      } else {
        const { error: insErr } = await supabase
          .from('user_collection')
          .insert({ user_id: user.id, game_id: bggId })
        
        if (insErr) throw insErr
        setIsInCollection(true)
        
        // Add self to local owners array
        try {
          const { data: selfProf } = await supabase
            .from('users')
            .select('username, avatar_url, city')
            .eq('id', user.id)
            .single()
            
          if (selfProf) {
            setOwners(prev => [
              ...prev,
              {
                user_id: user.id,
                username: selfProf.username,
                avatar_url: selfProf.avatar_url,
                city: selfProf.city || null
              }
            ])
          }
        } catch (profileErr) {
          console.warn("Could not load self profile to append to owners list:", profileErr)
        }
      }
    } catch (err: any) {
      console.error('Error toggling collection status:', err)
      setError(err.message || 'No se pudo actualizar tu ludoteca')
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    fetchGameDetails()
  }, [fetchGameDetails])

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
