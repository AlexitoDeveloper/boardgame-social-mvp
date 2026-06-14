import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MOCK_MEETUPS, MOCK_BGG_GAMES } from '../lib/mockData'
import { User } from '@supabase/supabase-js'
import { Meetup, UserProfile, Game } from '../types'
import { USE_MOCKS } from '../lib/config'

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
  const [guestReservation, setGuestReservation] = useState<{ id: string, name: string } | null>(null)

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
      
      // Read local guest reservation if any
      const localReservations = localStorage.getItem('boardgame_social_guest_reservations')
      if (localReservations) {
        const parsed = JSON.parse(localReservations)
        if (parsed[id]) {
          setGuestReservation(parsed[id])
        } else {
          setGuestReservation(null)
        }
      } else {
        setGuestReservation(null)
      }

      const isMock = USE_MOCKS && id.startsWith('mock-')
      
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
        
        // Get mock guests from local storage
        const mockGuestsKey = 'boardgame_social_mock_guests'
        const allMockGuestsStr = localStorage.getItem(mockGuestsKey)
        const allMockGuests = allMockGuestsStr ? JSON.parse(allMockGuestsStr) : {}
        const meetupMockGuests = allMockGuests[id] || []
        const formattedMockGuests = meetupMockGuests.map((g: any) => ({
          id: g.id,
          username: g.guest_name,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(g.guest_name)}`,
          is_guest: true
        }))

        // Check for completed mock meetups in localStorage
        const completedMockKey = 'boardgame_social_mock_completed_meetups'
        const completedMockStr = localStorage.getItem(completedMockKey)
        const completedMockData = completedMockStr ? JSON.parse(completedMockStr) : {}
        const thisMeetupCompleted = completedMockData[id] || null

        const mockAttendees = getMockAttendees(id)
        const combinedMockAttendees = [...mockAttendees, ...formattedMockGuests]
        const mockJoinedPlayers = combinedMockAttendees.map(a => a.id)

        const formattedMock: Meetup = {
          id: foundMock.id,
          title: foundMock.title,
          description: foundMock.description || '',
          date: foundMock.date,
          location: foundMock.is_online ? null : foundMock.location,
          city: foundMock.is_online ? null : 'Madrid', // valor por defecto para mock
          max_players: mockMaxPlayers,
          joined_players: mockJoinedPlayers,
          games: [{
            bgg_id: Number(foundGame.bgg_id),
            title: foundMock.game_name,
            year_published: foundGame.year,
            image_url: foundGame.image_url,
            min_players: foundGame.min_players || 2,
            max_players: foundGame.max_players || 4,
            playing_time: foundGame.playing_time || 60,
            winner_user_id: (() => {
              if (!thisMeetupCompleted || !thisMeetupCompleted.game_winners) return null
              const winnerId = thisMeetupCompleted.game_winners[Number(foundGame.bgg_id)]
              if (!winnerId) return null
              const isGuest = combinedMockAttendees.find(a => a.id === winnerId)?.is_guest
              return isGuest ? null : winnerId
            })(),
            winner_guest_id: (() => {
              if (!thisMeetupCompleted || !thisMeetupCompleted.game_winners) return null
              const winnerId = thisMeetupCompleted.game_winners[Number(foundGame.bgg_id)]
              if (!winnerId) return null
              const isGuest = combinedMockAttendees.find(a => a.id === winnerId)?.is_guest
              return isGuest ? winnerId : null
            })()
          }],
          users: {
            id: foundMock.users?.username === 'boardgamer_alex' ? 'mock-u1' : 'mock-u2',
            username: foundMock.users?.username || 'anónimo',
            avatar_url: foundMock.users?.avatar_url || null
          },
          creator_id: id === 'mock-m1' ? 'mock-u1' : id === 'mock-m2' ? 'mock-u3' : 'mock-u2',
          game_id: Number(foundGame.bgg_id),
          completed: thisMeetupCompleted ? thisMeetupCompleted.completed : false,
          attended_players: thisMeetupCompleted ? thisMeetupCompleted.attended_players : [],
          attended_guests: thisMeetupCompleted ? thisMeetupCompleted.attended_guests : [],
          is_online: foundMock.is_online || false,
          platform: foundMock.platform || null,
          voice_link: foundMock.voice_link || null
        }

        setMeetup(formattedMock)
        setAttendees(combinedMockAttendees)
        
        setLoading(false)
      } else {
        // Query from Supabase
        try {
           const { data, error } = await supabase
            .from('meetups')
            .select('*, users:users!meetups_creator_id_fkey(*), meetup_games(game_id, winner_user_id, winner_guest_id, games(*))')
            .eq('id', id)
            .single()

          if (error) throw error
          if (!data) throw new Error('Partida no encontrada.')

          const mg = data.meetup_games || []
          const mGames = mg.map((item: any) => {
            if (!item.games) return null
            return {
              ...item.games,
              winner_user_id: item.winner_user_id,
              winner_guest_id: item.winner_guest_id
            }
          }).filter(Boolean) as Game[]
          
          const formattedMeetup: Meetup = {
            ...data,
            games: mGames
          }

          setMeetup(formattedMeetup)

          let sortedRegistered: UserProfile[] = []

          // Fetch attendees profiles
          if (data.joined_players && data.joined_players.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
              .from('users')
              .select('id, username, avatar_url')
              .in('id', data.joined_players)

            if (!profilesError && profiles) {
              // Sort profiles so creator/organizer is first
              sortedRegistered = [...profiles].sort((a, b) => {
                if (a.id === data.creator_id) return -1
                if (b.id === data.creator_id) return 1
                return 0
              })
            }
          }

          // Fetch guests profiles
          const { data: guests } = await supabase
            .from('meetup_guests')
            .select('id, guest_name, created_at')
            .eq('meetup_id', id)

          const guestProfiles: UserProfile[] = (guests || []).map(g => ({
            id: g.id,
            username: g.guest_name,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(g.guest_name)}`,
            is_guest: true
          }))

          setAttendees([...sortedRegistered, ...guestProfiles])
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
    const mainGameName = meetup?.games?.[0]?.title || meetup?.game_name || 'juego de mesa'
    const text = `¡Únete a mi partida de ${mainGameName}!`

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

    const isMock = USE_MOCKS && id && id.startsWith('mock-')
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
          if (attendees.length >= meetup.max_players) {
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
        if (attendees.length >= meetup.max_players) {
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

        // Also fetch guests profiles to avoid wiping them out
        const { data: guests } = await supabase
          .from('meetup_guests')
          .select('id, guest_name, created_at')
          .eq('meetup_id', meetup.id)

        const guestProfiles: UserProfile[] = (guests || []).map(g => ({
          id: g.id,
          username: g.guest_name,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(g.guest_name)}`,
          is_guest: true
        }))

        setMeetup(prev => prev ? ({ ...prev, joined_players: updatedPlayers }) : null)
        
        const sorted = [...(profiles || [])].sort((a, b) => {
          if (a.id === meetup.creator_id) return -1
          if (b.id === meetup.creator_id) return 1
          return 0
        })
        setAttendees([...sorted, ...guestProfiles])
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
    const isMock = USE_MOCKS && id.startsWith('mock-')
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

  // Handle Join as guest (shadow user)
  const handleJoinAsGuest = async (guestName: string) => {
    if (!id || !meetup) return
    
    // Check if space is available
    if (attendees.length >= meetup.max_players) {
      setErrorMsg('La mesa ya está llena.')
      return
    }

    setJoining(true)
    const isMock = USE_MOCKS && id.startsWith('mock-')

    if (isMock) {
      setTimeout(() => {
        const guestId = `mock-guest-${Date.now()}`
        
        // Save to reservations in localStorage
        const localReservations = localStorage.getItem('boardgame_social_guest_reservations')
        const reservations = localReservations ? JSON.parse(localReservations) : {}
        reservations[id] = { id: guestId, name: guestName }
        localStorage.setItem('boardgame_social_guest_reservations', JSON.stringify(reservations))

        // Save to mock guests list in localStorage
        const mockGuestsKey = 'boardgame_social_mock_guests'
        const allMockGuestsStr = localStorage.getItem(mockGuestsKey)
        const allMockGuests = allMockGuestsStr ? JSON.parse(allMockGuestsStr) : {}
        if (!allMockGuests[id]) allMockGuests[id] = []
        allMockGuests[id].push({ id: guestId, guest_name: guestName })
        localStorage.setItem(mockGuestsKey, JSON.stringify(allMockGuests))

        setGuestReservation({ id: guestId, name: guestName })
        
        const newGuest: UserProfile = {
          id: guestId,
          username: guestName,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guestName)}`,
          is_guest: true
        }

        setAttendees(prev => [...prev, newGuest])
        setJoining(false)
      }, 500)
    } else {
      try {
        const { data, error } = await supabase
          .from('meetup_guests')
          .insert({ meetup_id: id, guest_name: guestName })
          .select()
          .single()

        if (error) throw error
        if (!data) throw new Error('No se pudo registrar el invitado shadow.')

        // Save to reservations in localStorage
        const localReservations = localStorage.getItem('boardgame_social_guest_reservations')
        const reservations = localReservations ? JSON.parse(localReservations) : {}
        reservations[id] = { id: data.id, name: guestName }
        localStorage.setItem('boardgame_social_guest_reservations', JSON.stringify(reservations))

        setGuestReservation({ id: data.id, name: guestName })

        const newGuest: UserProfile = {
          id: data.id,
          username: guestName,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(guestName)}`,
          is_guest: true
        }

        setAttendees(prev => [...prev, newGuest])
      } catch (err: any) {
        console.error('Error joining as guest:', err)
        setErrorMsg('Error al unirse como invitado.')
      } finally {
        setJoining(false)
      }
    }
  }

  // Handle Leave as guest (shadow user)
  const handleLeaveAsGuest = async () => {
    if (!id || !meetup) return

    const localReservations = localStorage.getItem('boardgame_social_guest_reservations')
    if (!localReservations) return
    const reservations = JSON.parse(localReservations)
    const reservation = reservations[id]
    if (!reservation) return

    setJoining(true)
    const isMock = USE_MOCKS && id.startsWith('mock-')

    if (isMock) {
      setTimeout(() => {
        // Remove from reservations in localStorage
        delete reservations[id]
        localStorage.setItem('boardgame_social_guest_reservations', JSON.stringify(reservations))

        // Remove from mock guests in localStorage
        const mockGuestsKey = 'boardgame_social_mock_guests'
        const allMockGuestsStr = localStorage.getItem(mockGuestsKey)
        const allMockGuests = allMockGuestsStr ? JSON.parse(allMockGuestsStr) : {}
        if (allMockGuests[id]) {
          allMockGuests[id] = allMockGuests[id].filter((g: any) => g.id !== reservation.id)
          localStorage.setItem(mockGuestsKey, JSON.stringify(allMockGuests))
        }

        setAttendees(prev => prev.filter(a => a.id !== reservation.id))
        setGuestReservation(null)
        setJoining(false)
      }, 500)
    } else {
      try {
        const { error } = await supabase
          .from('meetup_guests')
          .delete()
          .eq('id', reservation.id)

        if (error) throw error

        // Remove from reservations in localStorage
        delete reservations[id]
        localStorage.setItem('boardgame_social_guest_reservations', JSON.stringify(reservations))

        setAttendees(prev => prev.filter(a => a.id !== reservation.id))
        setGuestReservation(null)
      } catch (err: any) {
        console.error('Error leaving as guest:', err)
        setErrorMsg('Error al abandonar la mesa.')
      } finally {
        setJoining(false)
      }
    }
  }

  // Handle Complete Meetup (Close Match and Save stats)
  const handleCompleteMeetup = async (
    gameWinners: Record<number, string | null>, // map of game bgg_id to winnerId
    attendedPlayerIds: string[],
    attendedGuestIds: string[]
  ) => {
    if (!id || !meetup) return
    const isMock = USE_MOCKS && id.startsWith('mock-')

    if (isMock) {
      const completedMockKey = 'boardgame_social_mock_completed_meetups'
      const completedMockStr = localStorage.getItem(completedMockKey)
      const completedMockData = completedMockStr ? JSON.parse(completedMockStr) : {}

      completedMockData[id] = {
        completed: true,
        game_winners: gameWinners,
        attended_players: attendedPlayerIds,
        attended_guests: attendedGuestIds
      }

      localStorage.setItem(completedMockKey, JSON.stringify(completedMockData))

      setMeetup(prev => {
        if (!prev) return null
        const updatedGames = (prev.games || []).map(g => {
          const wId = gameWinners[g.bgg_id]
          const isGuest = attendees.find(a => a.id === wId)?.is_guest
          return {
            ...g,
            winner_user_id: wId && !isGuest ? wId : null,
            winner_guest_id: wId && isGuest ? wId : null
          }
        })
        return {
          ...prev,
          completed: true,
          games: updatedGames,
          attended_players: attendedPlayerIds,
          attended_guests: attendedGuestIds
        }
      })
    } else {
      try {
        // 1. Update the meetup status to completed and register attendance
        const { error: meetupError } = await supabase
          .from('meetups')
          .update({
            completed: true,
            attended_players: attendedPlayerIds,
            attended_guests: attendedGuestIds
          })
          .eq('id', id)

        if (meetupError) throw meetupError

        // 2. Update each game's winner in meetup_games
        for (const [bggIdStr, wId] of Object.entries(gameWinners)) {
          const bggId = Number(bggIdStr)
          let winnerUserId: string | null = null
          let winnerGuestId: string | null = null

          if (wId) {
            const isGuest = attendees.find(a => a.id === wId)?.is_guest
            if (isGuest) {
              winnerGuestId = wId
            } else {
              winnerUserId = wId
            }
          }

          const { error: relError } = await supabase
            .from('meetup_games')
            .update({
              winner_user_id: winnerUserId,
              winner_guest_id: winnerGuestId
            })
            .eq('meetup_id', id)
            .eq('game_id', bggId)

          if (relError) throw relError
        }

        // 3. Update local state
        setMeetup(prev => {
          if (!prev) return null
          const updatedGames = (prev.games || []).map(g => {
            const wId = gameWinners[g.bgg_id]
            const isGuest = attendees.find(a => a.id === wId)?.is_guest
            return {
              ...g,
              winner_user_id: wId && !isGuest ? wId : null,
              winner_guest_id: wId && isGuest ? wId : null
            }
          })
          return {
            ...prev,
            completed: true,
            games: updatedGames,
            attended_players: attendedPlayerIds,
            attended_guests: attendedGuestIds
          }
        })
      } catch (err: any) {
        console.error('Error completing meetup:', err)
        setErrorMsg('Error al cerrar la partida.')
      }
    }
  }

  return {
    meetup,
    attendees,
    loading,
    joining,
    canceling,
    copySuccess,
    timeLeft,
    errorMsg,
    handleShare,
    handleJoinLeave,
    handleCancelMeetup,
    guestReservation,
    handleJoinAsGuest,
    handleLeaveAsGuest,
    handleCompleteMeetup
  }
}
