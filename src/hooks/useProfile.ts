import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Meetup, UserProfile, Game } from '../types'
import { getMockMeetupsForList } from '../lib/mockData'
import { USE_MOCKS } from '../lib/config'

export interface UserStats {
  played: number;
  won: number;
  winRate: number;
  karma: number;
  missed: number;
}

export interface UseProfileProps {
  profileId: string;
  currentUserId?: string;
}

const MOCK_PROFILES: Record<string, UserProfile> = {
  'mock-u1': { id: 'mock-u1', username: 'boardgamer_alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', city: 'Madrid' },
  'mock-u2': { id: 'mock-u2', username: 'meeple_sara', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara', city: 'Barcelona' },
  'mock-u3': { id: 'mock-u3', username: 'hex_and_counter', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter', city: 'Bilbao' },
  'mock-u4': { id: 'mock-u4', username: 'ludo_valen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valen', city: 'Valencia' },
}

const MOCK_RANKINGS: Record<string, any[]> = {
  'mock-u1': [
    {
      id: 'mock-r1',
      user_id: 'mock-u1',
      title: 'Mis Euros Favoritos',
      mode: 'tier',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      data: {
        tiers: [
          { id: 'S', name: 'S', color: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white', textColor: 'text-white', games: [
            { bgg_id: 224517, title: 'Brass: Birmingham', year_published: 2018, image_url: 'https://cf.geekdo-images.com/x3zxztFbRYCgssNZ55ZMnw__micro/img/QDuQwi75tL54enp_8_93K3s97d0=/fit-in/64x64/filters:strip_icc()/pic3490053.jpg' }
          ] },
          { id: 'A', name: 'A', color: 'bg-gradient-to-br from-orange-500 to-amber-500 text-white', textColor: 'text-white', games: [
            { bgg_id: 167791, title: 'Terraforming Mars', year_published: 2016, image_url: 'https://cf.geekdo-images.com/yLZJCDgC7y0uJUWSpFd58A__micro/img/z7A4g4dG6NqH2fT0zJc2j6m9V-g=/fit-in/64x64/filters:strip_icc()/pic3536616.png' }
          ] },
          { id: 'B', name: 'B', color: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white', textColor: 'text-white', games: [] },
          { id: 'C', name: 'C', color: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white', textColor: 'text-white', games: [] },
          { id: 'D', name: 'D', color: 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white', textColor: 'text-white', games: [] },
        ],
        top10: [],
        selectedBg: 'cyberpunk',
        aspectRatio: 'standard'
      }
    }
  ]
}

export function useProfile({ profileId, currentUserId }: UseProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [stats, setStats] = useState<UserStats>({ played: 0, won: 0, winRate: 0, karma: 100, missed: 0 })
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Saved Rankings State
  const [savedRankings, setSavedRankings] = useState<any[]>([])
  const [loadingRankings, setLoadingRankings] = useState(true)

  // Collection State
  const [collectionGames, setCollectionGames] = useState<Game[]>([])
  const [loadingCollection, setLoadingCollection] = useState(false)

  // Action States
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const [importingCollection, setImportingCollection] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null)

  const isMock = USE_MOCKS && profileId.startsWith('mock-')

  const calculateStats = useCallback((userMeetups: Meetup[], userId: string) => {
    const completed = userMeetups.filter(m => m.completed)
    const attended = completed.filter(m => m.attended_players?.includes(userId))
    const missed = completed.filter(m => !m.attended_players?.includes(userId))

    let totalPlayedGames = 0
    let totalWonGames = 0

    attended.forEach(m => {
      const games = m.games || []
      if (games.length === 0) {
        totalPlayedGames += 1
      } else {
        totalPlayedGames += games.length
        games.forEach(g => {
          if (g.winner_user_id === userId) {
            totalWonGames += 1
          }
        })
      }
    })

    const winRate = totalPlayedGames > 0 ? Math.round((totalWonGames / totalPlayedGames) * 100) : 0
    const karma = completed.length > 0 ? Math.round((attended.length / completed.length) * 100) : 100

    setStats({
      played: totalPlayedGames,
      won: totalWonGames,
      winRate,
      karma,
      missed: missed.length
    })
  }, [])

  const loadCollection = useCallback(async () => {
    if (!profileId) return
    setLoadingCollection(true)
    
    if (isMock) {
      const mockCollectionKey = `boardgame_social_mock_collection_${profileId}`
      const cached = localStorage.getItem(mockCollectionKey)
      if (cached) {
        setCollectionGames(JSON.parse(cached))
      } else {
        if (profileId === 'mock-u1') {
          const initialMockGames = [
            { bgg_id: 224517, title: 'Brass: Birmingham', year_published: 2018, image_url: 'https://cf.geekdo-images.com/x3zxztFbRYCgssNZ55ZMnw__micro/img/QDuQwi75tL54enp_8_93K3s97d0=/fit-in/64x64/filters:strip_icc()/pic3490053.jpg' },
            { bgg_id: 167791, title: 'Terraforming Mars', year_published: 2016, image_url: 'https://cf.geekdo-images.com/yLZJCDgC7y0uJUWSpFd58A__micro/img/z7A4g4dG6NqH2fT0zJc2j6m9V-g=/fit-in/64x64/filters:strip_icc()/pic3536616.png' }
          ]
          localStorage.setItem(mockCollectionKey, JSON.stringify(initialMockGames))
          setCollectionGames(initialMockGames as any)
        } else {
          setCollectionGames([])
        }
      }
      setLoadingCollection(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_collection')
        .select('game_id, games (*)')
        .eq('user_id', profileId)

      if (error) throw error

      if (data) {
        const games = data
          .map((row: any) => row.games)
          .filter(Boolean) as Game[]
        setCollectionGames(games)
      }
    } catch (err) {
      console.error('Error loading collection:', err)
    } finally {
      setLoadingCollection(false)
    }
  }, [profileId, isMock])

  const loadProfileData = useCallback(async () => {
    if (!profileId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMsg('')

    // 1. Fetch Rankings
    setLoadingRankings(true)
    if (isMock) {
      setSavedRankings(MOCK_RANKINGS[profileId] || [])
      setLoadingRankings(false)
    } else {
      try {
        const { data: rankData, error: rankError } = await supabase
          .from('user_rankings')
          .select('*')
          .eq('user_id', profileId)
          .order('created_at', { ascending: false })

        if (rankError) throw rankError
        setSavedRankings(rankData || [])
      } catch (err) {
        console.warn("Error querying user_rankings from Supabase, loading from localStorage:", err)
        const localKey = `boardgame_social_saved_rankings_${profileId}`
        const localStr = localStorage.getItem(localKey)
        if (localStr) {
          try {
            setSavedRankings(JSON.parse(localStr))
          } catch {
            setSavedRankings([])
          }
        } else {
          setSavedRankings([])
        }
      } finally {
        setLoadingRankings(false)
      }
    }

    // 2. Fetch Profile and Meetups
    if (isMock) {
      const localMockStr = localStorage.getItem(`boardgame_social_mock_profile_${profileId}`)
      const mockProf = localMockStr ? JSON.parse(localMockStr) : MOCK_PROFILES[profileId]
      if (!mockProf) {
        setErrorMsg('No se encontró el perfil de demostración.')
        setLoading(false)
        return
      }

      setProfile(mockProf)

      const allMocks = getMockMeetupsForList()
      const completedMockKey = 'boardgame_social_mock_completed_meetups'
      const completedMockStr = localStorage.getItem(completedMockKey)
      const completedMockData = completedMockStr ? JSON.parse(completedMockStr) : {}

      const userMockMeetups = allMocks
        .map(m => {
          const completedInfo = completedMockData[m.id]
          if (completedInfo) {
            return {
              ...m,
              completed: completedInfo.completed,
              winner_user_id: completedInfo.winner_user_id,
              winner_guest_id: completedInfo.winner_guest_id,
              attended_players: completedInfo.attended_players,
              attended_guests: completedInfo.attended_guests
            }
          }
          return m
        })
        .filter(m => m.joined_players?.includes(profileId))

      setMeetups(userMockMeetups)
      calculateStats(userMockMeetups, profileId)
      setLoading(false)
    } else {
      try {
        const { data: profData, error: profError } = await supabase
          .from('users')
          .select('*')
          .eq('id', profileId)
          .single()

        if (profError) throw profError
        setProfile(profData as UserProfile)

        const { data: meetupsData, error: meetupsError } = await supabase
          .from('meetups')
          .select('*, meetup_games(game_id, winner_user_id, winner_guest_id, games(*)), users:users!meetups_creator_id_fkey(*)')
          .contains('joined_players', [profileId])

        if (meetupsError) throw meetupsError
        
        const formatted = (meetupsData || []).map((m: any) => {
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
        
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_user_stats', { p_user_id: profileId })

        if (statsError) throw statsError

        if (statsData && statsData.length > 0) {
          const s = statsData[0]
          setStats({
            played: s.played || 0,
            won: s.won || 0,
            winRate: s.win_rate || 0,
            karma: s.karma !== undefined && s.karma !== null ? s.karma : 100,
            missed: s.missed || 0
          })
        } else {
          setStats({ played: 0, won: 0, winRate: 0, karma: 100, missed: 0 })
        }
      } catch (err: any) {
        console.error("Error loading profile:", err)
        setErrorMsg(err.message || 'Error al obtener el perfil de usuario.')
      } finally {
        setLoading(false)
      }
    }
  }, [profileId, isMock, calculateStats])

  useEffect(() => {
    loadProfileData()
    loadCollection()

    const handleProfileUpdate = () => {
      loadProfileData()
    }
    window.addEventListener('profile_update', handleProfileUpdate)
    return () => {
      window.removeEventListener('profile_update', handleProfileUpdate)
    }
  }, [loadProfileData, loadCollection])

  const saveProfile = async (username: string, city: string, avatarUrl: string) => {
    if (!username.trim() || !profile) return
    setSavingProfile(true)

    if (isMock) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const updated: UserProfile = {
            ...profile,
            username: username.trim(),
            city: city.trim() || null,
            avatar_url: avatarUrl.trim() || null
          }
          setProfile(updated)
          localStorage.setItem(`boardgame_social_mock_profile_${profileId}`, JSON.stringify(updated))
          MOCK_PROFILES[profileId] = updated
          window.dispatchEvent(new Event('profile_update'))
          setSavingProfile(false)
          resolve()
        }, 600)
      })
    } else {
      try {
        if (!currentUserId) throw new Error('Usuario no autenticado.')

        const { error: dbError } = await supabase
          .from('users')
          .update({
            username: username.trim(),
            city: city.trim() || null,
            avatar_url: avatarUrl.trim() || null
          })
          .eq('id', currentUserId)

        if (dbError) throw dbError

        const { error: authError } = await supabase.auth.updateUser({
          data: {
            username: username.trim(),
            avatar_url: avatarUrl.trim() || null
          }
        })

        if (authError) throw authError

        const updated: UserProfile = {
          ...profile,
          username: username.trim(),
          city: city.trim() || null,
          avatar_url: avatarUrl.trim() || null
        }
        setProfile(updated)
        window.dispatchEvent(new Event('profile_update'))
      } catch (err: any) {
        console.error('Error updating profile:', err)
        throw err;
      } finally {
        setSavingProfile(false)
      }
    }
  }

  const importBggCollection = async (bggUsername: string) => {
    if (!bggUsername.trim()) return
    setImportingCollection(true)
    setImportError('')
    setImportSuccessCount(null)

    if (isMock) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const dixitGame = { bgg_id: 37111, title: 'Dixit', year_published: 2008, image_url: 'https://cf.geekdo-images.com/39A865b4-B6BE-4b82-9022-7935E5B9FE6C.png' }
          const catanGame = { bgg_id: 13, title: 'Catan', year_published: 1995, image_url: 'https://cf.geekdo-images.com/40B7E05C-CC71-460B-A5DF-F2803CE10599.png' }
          
          setCollectionGames(prev => {
            const updated = [...prev]
            if (!updated.some(g => g.bgg_id === dixitGame.bgg_id)) updated.push(dixitGame as any)
            if (!updated.some(g => g.bgg_id === catanGame.bgg_id)) updated.push(catanGame as any)
            localStorage.setItem(`boardgame_social_mock_collection_${profileId}`, JSON.stringify(updated))
            return updated
          })
          setImportSuccessCount(2)
          setImportingCollection(false)
          resolve()
        }, 1500)
      })
    }

    try {
      const { data, error } = await supabase.functions.invoke('bgg-ingest', {
        body: {
          action: 'import-collection',
          username: bggUsername.trim(),
          userId: currentUserId
        }
      })

      if (error) throw error

      if (data && data.success) {
        setImportSuccessCount(data.imported || 0)
        await loadCollection()
      } else {
        throw new Error(data?.error || 'No se pudo completar la importación.')
      }
    } catch (err: any) {
      console.error('Error importing collection from BGG:', err)
      setImportError(err.message || 'Error al conectar con la API de BoardGameGeek.')
      throw err;
    } finally {
      setImportingCollection(false)
    }
  }

  const removeFromCollection = async (bggId: number) => {
    if (isMock) {
      setCollectionGames(prev => {
        const updated = prev.filter(g => g.bgg_id !== bggId)
        localStorage.setItem(`boardgame_social_mock_collection_${profileId}`, JSON.stringify(updated))
        return updated
      })
      return
    }

    try {
      const { error } = await supabase
        .from('user_collection')
        .delete()
        .eq('user_id', currentUserId)
        .eq('game_id', bggId)

      if (error) throw error
      setCollectionGames(prev => prev.filter(g => g.bgg_id !== bggId))
    } catch (err) {
      console.error('Error removing game from collection:', err)
      throw err;
    }
  }

  const deleteRanking = async (rankingId: string) => {
    try {
      const { error } = await supabase
        .from('user_rankings')
        .delete()
        .eq('id', rankingId)

      if (error) console.warn("Supabase delete failed, relying on localStorage fallback delete:", error)

      const localKey = `boardgame_social_saved_rankings_${profileId}`
      const localStr = localStorage.getItem(localKey)
      if (localStr) {
        try {
          const list = JSON.parse(localStr) as any[]
          const updated = list.filter(item => item.id !== rankingId)
          localStorage.setItem(localKey, JSON.stringify(updated))
        } catch (err) {
          console.error("Error updating localStorage list:", err)
        }
      }

      setSavedRankings(prev => prev.filter(r => r.id !== rankingId))
    } catch (err) {
      console.error("Error deleting ranking:", err)
      throw err;
    }
  }

  return {
    profile,
    setProfile,
    meetups,
    stats,
    loading,
    errorMsg,
    savedRankings,
    loadingRankings,
    collectionGames,
    loadingCollection,
    savingProfile,
    uploadingFile,
    setUploadingFile,
    saveProfile,
    importingCollection,
    importError,
    setImportError,
    importSuccessCount,
    setImportSuccessCount,
    importBggCollection,
    removeFromCollection,
    deleteRanking,
    refresh: loadProfileData
  }
}
