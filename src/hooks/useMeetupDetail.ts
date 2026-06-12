import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MOCK_MEETUPS, MOCK_BGG_GAMES } from '../lib/mockData'
import { User } from '@supabase/supabase-js'
import { Meetup, UserProfile, Game } from '../types'

// Helper to get mock attendees lists for mock data
const getMockAttendees = (meetupId: string): UserProfile[] => {
  const mockUsers: UserProfile[] = [
    { id: 'mock-u1', username: 'boardgamer_alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: 'mock-u2', username: 'meeple_sara', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara' },
    { id: 'mock-u3', username: 'hex_and_counter', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter' },
    { id: 'mock-u4', username: 'ludo_valen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valen' },
  ]

  if (meetupId === 'mock-m1') {
    return [mockUsers[0], mockUsers[1], mockUsers[2], mockUsers[3]]
  } else if (meetupId === 'mock-m2') {
    return [mockUsers[2], mockUsers[0]]
  } else if (meetupId === 'mock-m3') {
    return [mockUsers[1], mockUsers[0]]
  }
  return [mockUsers[0]]
}

export function useMeetupDetail(id: string | undefined, user: User | null) {
  const navigate = useNavigate()
  
  const [meetup, setMeetup] = useState<Meetup | null>(null)
  const [attendees, setAttendees] = useState<UserProfile[]>([])
  const [gameInfo, setGameInfo] = useState<Game | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [joining, setJoining] = useState<boolean>(false)
  const [canceling, setCanceling] = useState<boolean>(false)
  const [copySuccess, setCopySuccess] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string>('')

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load meetup details (mock or real)
  useEffect(() => {
    async function loadMeetupDetails() {
      if (!id) return
      setLoading(true)
      setErrorMsg('')
      
      const isMock = id.startsWith('mock-')
      
      if (isMock) {
        // Find in mock meetups
        const foundMock = MOCK_MEETUPS.find(m => m.id === id)

        if (!foundMock) {
          setErrorMsg('No se encontró la partida en los datos de demostración.')
          setLoading(false)
          return
        }

        // Find game metadata in mock game catalogue
        const foundGame = MOCK_BGG_GAMES.find(g => g.name === foundMock.game_name) || {
          bgg_id: '13',
          name: foundMock.game_name || 'Juego de mesa',
          year: 2020,
          image_url: null,
          min_players: 2,
          max_players: 4,
          playing_time: 60
        }

        const mockMaxPlayers = id === 'mock-m1' ? 4 : id === 'mock-m2' ? 2 : 6
        const mockAttendees = getMockAttendees(id)
        const mockJoinedPlayers = mockAttendees.map(a => a.id)

        const formattedMock: Meetup = {
          id: foundMock.id,
          title: foundMock.title,
          description: foundMock.description || '',
          date: foundMock.date,
          location: foundMock.location,
          city: 'Madrid', // valor por defecto para mock
          max_players: mockMaxPlayers,
          joined_players: mockJoinedPlayers,
          games: {
            bgg_id: Number(foundGame.bgg_id),
            title: foundGame.name,
            year_published: foundGame.year,
            image_url: foundGame.image_url,
            min_players: foundGame.min_players || 2,
            max_players: foundGame.max_players || 4,
            playing_time: foundGame.playing_time || 60
          },
          users: {
            id: foundMock.users?.username === 'boardgamer_alex' ? 'mock-u1' : 'mock-u2',
            username: foundMock.users?.username || 'anónimo',
            avatar_url: foundMock.users?.avatar_url || null
          },
          creator_id: id === 'mock-m1' ? 'mock-u1' : id === 'mock-m2' ? 'mock-u3' : 'mock-u2',
          game_id: Number(foundGame.bgg_id)
        }

        setMeetup(formattedMock)
        setAttendees(mockAttendees)
        
        // Handle raw games cache as array or single object
        const mockRawGame = formattedMock.games
        const mockParsedGame = Array.isArray(mockRawGame) ? mockRawGame[0] : mockRawGame
        setGameInfo(mockParsedGame || null)
        setLoading(false)
      } else {
        // Query from Supabase
        try {
          const { data, error } = await supabase
            .from('meetups')
            .select('*, users(*), games(*)')
            .eq('id', id)
            .single()

          if (error) throw error
          if (!data) throw new Error('Partida no encontrada.')

          setMeetup(data as Meetup)
          
          // Handle raw games join result as array or single object
          const dbRawGame = data.games
          const dbParsedGame = Array.isArray(dbRawGame) ? dbRawGame[0] : dbRawGame
          setGameInfo((dbParsedGame as Game) || null)

          // Fetch attendees profiles
          if (data.joined_players && data.joined_players.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('users')
              .select('id, username, avatar_url')
              .in('id', data.joined_players)

            if (!profilesError && profiles) {
              // Sort profiles so creator/organizer is first
              const sorted = [...profiles].sort((a, b) => {
                if (a.id === data.creator_id) return -1
                if (b.id === data.creator_id) return 1
                return 0
              })
              setAttendees(sorted as UserProfile[])
            }
          }
        } catch (err: any) {
          console.error("Error loading meetup detail:", err)
          setErrorMsg(err.message || 'Error al obtener los detalles de la partida.')
        } finally {
          setLoading(false)
        }
      }
    }

    loadMeetupDetails()
  }, [id])

  // Countdown timer calculations
  useEffect(() => {
    if (!meetup?.date) return

    function updateCountdown() {
      if (!meetup?.date) return
      const eventDate = new Date(meetup.date).getTime()
      const now = new Date().getTime()
      const difference = eventDate - now

      if (difference <= 0) {
        setTimeLeft('¡El evento ya ha comenzado!')
        if (timerRef.current) clearInterval(timerRef.current)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      let parts = []
      if (days > 0) parts.push(`${days}d`)
      if (hours > 0 || days > 0) parts.push(`${hours}h`)
      parts.push(`${minutes}m`)
      parts.push(`${seconds}s`)

      setTimeLeft(`Empieza en: ${parts.join(' ')}`)
    }

    updateCountdown()
    timerRef.current = setInterval(updateCountdown, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [meetup?.date])

  // Handle Share button click
  const handleShare = async () => {
    const url = window.location.href
    const title = meetup?.title || 'Partida de Juego de Mesa'
    const text = `¡Únete a mi partida de ${gameInfo?.title || meetup?.game_name || 'juego de mesa'}!`

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        })
        return
      } catch (err: any) {
        console.log('Web Share API dismissed or failed:', err)
        if (err?.name === 'AbortError') {
          return
        }
      }
    }

    // Attempt copying to clipboard
    let copySuccessful = false

    // 1. Try modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url)
        copySuccessful = true
      } catch (err) {
        console.warn('Modern Clipboard API failed, trying fallback:', err)
      }
    }

    // 2. Try legacy fallback if modern API failed or was not available
    if (!copySuccessful) {
      try {
        const textArea = document.createElement("textarea")
        textArea.value = url
        textArea.style.position = "fixed"
        textArea.style.top = "0"
        textArea.style.left = "-9999px"
        textArea.style.width = "2em"
        textArea.style.height = "2em"
        textArea.style.padding = "0"
        textArea.style.border = "none"
        textArea.style.outline = "none"
        textArea.style.boxShadow = "none"
        textArea.style.background = "transparent"
        textArea.setAttribute('readonly', '')
        document.body.appendChild(textArea)
        
        textArea.focus()
        textArea.select()

        if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
          textArea.contentEditable = 'true'
          textArea.readOnly = false
          const range = document.createRange()
          range.selectNodeContents(textArea)
          const selection = window.getSelection()
          if (selection) {
            selection.removeAllRanges()
            selection.addRange(range)
          }
          textArea.setSelectionRange(0, 999999)
        } else {
          textArea.setSelectionRange(0, 99999)
        }
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        if (successful) {
          copySuccessful = true
        }
      } catch (err) {
        console.error('Fallback copy method failed:', err)
      }
    }

    if (copySuccessful) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // Handle Join / Leave meetup actions
  const handleJoinLeave = async () => {
    if (!user) {
      navigate('/auth')
      return
    }

    if (!meetup) return

    const isMock = id && id.startsWith('mock-')
    const userId = user.id
    const isJoined = meetup.joined_players?.includes(userId)
    const isCreator = meetup.creator_id === userId

    if (isCreator) return

    setJoining(true)

    if (isMock) {
      setTimeout(() => {
        let updatedPlayers: string[] = []
        let updatedAttendees: UserProfile[] = []

        const currentUserObj: UserProfile = {
          id: userId,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'Tú',
          avatar_url: user.user_metadata?.avatar_url || null
        }

        if (isJoined) {
          updatedPlayers = meetup.joined_players.filter(uid => uid !== userId)
          updatedAttendees = attendees.filter(a => a.id !== userId)
        } else {
          if (meetup.joined_players.length >= meetup.max_players) {
            setJoining(false)
            return
          }
          updatedPlayers = [...meetup.joined_players, userId]
          updatedAttendees = [...attendees, currentUserObj]
        }

        setMeetup(prev => prev ? ({ ...prev, joined_players: updatedPlayers }) : null)
        setAttendees(updatedAttendees)
        setJoining(false)
      }, 500)
    } else {
      let updatedPlayers: string[] = []
      if (isJoined) {
        updatedPlayers = meetup.joined_players.filter(uid => uid !== userId)
      } else {
        if ((meetup.joined_players?.length || 0) >= meetup.max_players) {
          setJoining(false)
          return
        }
        updatedPlayers = [...(meetup.joined_players || []), userId]
      }

      try {
        const { error: updateError } = await supabase
          .from('meetups')
          .update({ joined_players: updatedPlayers })
          .eq('id', meetup.id)

        if (updateError) throw updateError

        const { data: profiles, error: profilesError } = await supabase
          .from('users')
          .select('id, username, avatar_url')
          .in('id', updatedPlayers)

        if (profilesError) throw profilesError

        setMeetup(prev => prev ? ({ ...prev, joined_players: updatedPlayers }) : null)
        
        const sorted = [...(profiles || [])].sort((a, b) => {
          if (a.id === meetup.creator_id) return -1
          if (b.id === meetup.creator_id) return 1
          return 0
        })
        setAttendees(sorted as UserProfile[])
      } catch (err) {
        console.error('Error joining/leaving meetup:', err)
      } finally {
        setJoining(false)
      }
    }
  }

  // Handle Cancel (delete) meetup
  const handleCancelMeetup = async () => {
    if (!user || !id) return
    const isMock = id.startsWith('mock-')
    setCanceling(true)

    if (isMock) {
      setTimeout(() => {
        setCanceling(false)
        navigate('/')
      }, 500)
    } else {
      try {
        const { error } = await supabase
          .from('meetups')
          .delete()
          .eq('id', id)

        if (error) throw error
        navigate('/')
      } catch (err) {
        console.error('Error deleting meetup:', err)
        setErrorMsg('No se pudo cancelar la partida.')
        setCanceling(false)
      }
    }
  }

  return {
    meetup,
    attendees,
    gameInfo,
    loading,
    joining,
    canceling,
    copySuccess,
    timeLeft,
    errorMsg,
    handleShare,
    handleJoinLeave,
    handleCancelMeetup
  }
}
