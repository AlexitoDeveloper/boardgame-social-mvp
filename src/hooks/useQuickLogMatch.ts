import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { USE_MOCKS } from '../lib/config'
import { Game, Meetup, PlayerScore } from '../types'

export interface QuickLogAttendee {
  id: string
  name: string
  avatarUrl?: string | null
  isGuest?: boolean
}

export interface GroupMemberInput {
  user_id: string
  username: string
  avatar_url?: string | null
}

export type WinnerMode = 'player' | 'coop' | 'draw'

interface UseQuickLogMatchProps {
  groupId?: string
  groupMembers?: GroupMemberInput[]
  groupGames?: Game[]
  isOpen: boolean
  onSuccess?: (meetup: Meetup, scores: PlayerScore[]) => void
}

export function useQuickLogMatch({
  groupId,
  groupMembers = [],
  groupGames = [],
  isOpen,
  onSuccess,
}: UseQuickLogMatchProps) {
  const { t } = useTranslation()
  const { user } = useAuth()

  // Match ID generated up front for photos & records
  const [meetupId, setMeetupId] = useState<string>(() => crypto.randomUUID())

  // Game selection
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [gameSearchQuery, setGameSearchQuery] = useState('')
  const [catalogSearchResults, setCatalogSearchResults] = useState<Game[]>([])
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false)

  // Attendees & Guests
  const [attendees, setAttendees] = useState<QuickLogAttendee[]>([])
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<Set<string>>(new Set())
  const [newGuestName, setNewGuestName] = useState('')

  // Winner & Scores
  const [winnerMode, setWinnerMode] = useState<WinnerMode>('player')
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, string>>({})

  // Board photo
  const [boardPhotoUrl, setBoardPhotoUrl] = useState<string | null>(null)

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize/reset state when modal opens
  useEffect(() => {
    if (!isOpen) return

    setMeetupId(crypto.randomUUID())
    setSelectedGame(null)
    setGameSearchQuery('')
    setCatalogSearchResults([])
    setWinnerMode('player')
    setWinnerId(null)
    setScores({})
    setBoardPhotoUrl(null)
    setSubmitError(null)
    setNewGuestName('')

    if (groupMembers && groupMembers.length > 0) {
      // Group mode: Populate from group members
      const initialAttendees: QuickLogAttendee[] = groupMembers.map((m) => ({
        id: m.user_id,
        name: m.username,
        avatarUrl: m.avatar_url,
        isGuest: false,
      }))
      setAttendees(initialAttendees)
      // By default select all group members (or up to 6)
      const initialSelected = new Set(initialAttendees.slice(0, 8).map((a) => a.id))
      if (user?.id) initialSelected.add(user.id)
      setSelectedAttendeeIds(initialSelected)
    } else {
      // Casual / Solo mode: Start with current user
      const currentUserAttendee: QuickLogAttendee = {
        id: user?.id || 'current-user',
        name: user?.user_metadata?.username || 'Tú',
        avatarUrl: user?.user_metadata?.avatar_url || null,
        isGuest: false,
      }
      setAttendees([currentUserAttendee])
      setSelectedAttendeeIds(new Set([currentUserAttendee.id]))
    }
  }, [isOpen, groupId, groupMembers, user?.id, user?.user_metadata])

  // Catalog search with debounce
  useEffect(() => {
    const query = gameSearchQuery.trim()
    if (!query) {
      setCatalogSearchResults([])
      setIsSearchingCatalog(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingCatalog(true)
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .or(`title.ilike.%${query}%,title_es.ilike.%${query}%`)
          .order('year_published', { ascending: false, nullsFirst: false })
          .limit(10)

        if (!error && data) {
          setCatalogSearchResults(data as Game[])
        }
      } catch (err) {
        console.error('Error searching games catalog:', err)
      } finally {
        setIsSearchingCatalog(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [gameSearchQuery])

  // Filtered group games for autocomplete
  const filteredGroupGames = useMemo(() => {
    const query = gameSearchQuery.trim().toLowerCase()
    if (!query) return groupGames.slice(0, 8)
    return groupGames
      .filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          (g.title_es && g.title_es.toLowerCase().includes(query))
      )
      .slice(0, 8)
  }, [groupGames, gameSearchQuery])

  // Toggle attendee inclusion
  const toggleAttendee = useCallback((id: string) => {
    setSelectedAttendeeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Add guest player
  const addGuest = useCallback(() => {
    const trimmed = newGuestName.trim()
    if (!trimmed) return

    const newGuest: QuickLogAttendee = {
      id: crypto.randomUUID(),
      name: trimmed,
      avatarUrl: null,
      isGuest: true,
    }

    setAttendees((prev) => [...prev, newGuest])
    setSelectedAttendeeIds((prev) => new Set(prev).add(newGuest.id))
    setNewGuestName('')
  }, [newGuestName])

  // Remove guest player
  const removeGuest = useCallback((id: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id))
    setSelectedAttendeeIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setScores((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setWinnerId((prev) => (prev === id ? null : prev))
  }, [])

  // Active attendees (only those currently selected)
  const activeAttendees = useMemo(() => {
    return attendees.filter((a) => selectedAttendeeIds.has(a.id))
  }, [attendees, selectedAttendeeIds])

  // Update player score
  const setPlayerScore = useCallback((attendeeId: string, val: string) => {
    setScores((prev) => ({
      ...prev,
      [attendeeId]: val,
    }))
  }, [])

  // Direct Supabase Save Handler
  const handleSaveMatch = async () => {
    setSubmitError(null)

    if (!selectedGame) {
      setSubmitError(t('quickLog.errorNoGame'))
      return
    }

    if (activeAttendees.length === 0) {
      setSubmitError(t('quickLog.errorNoAttendees'))
      return
    }

    if (winnerMode === 'player' && !winnerId) {
      setSubmitError(t('quickLog.errorNoWinner'))
      return
    }

    setIsSubmitting(true)

    try {
      const currentUserId = user?.id
      if (!currentUserId && !USE_MOCKS) {
        throw new Error(t('quickLog.errorAuth'))
      }

      const registeredAttendees = activeAttendees.filter((a) => !a.isGuest)
      const guestAttendees = activeAttendees.filter((a) => a.isGuest)

      const registeredIds = registeredAttendees.map((a) => a.id)
      const guestIds = guestAttendees.map((a) => a.id)

      const winnerAttendee = activeAttendees.find((a) => a.id === winnerId)
      const winnerIsGuest = !!winnerAttendee?.isGuest

      // Build player scores list
      const playerScores: PlayerScore[] = activeAttendees.map((a) => {
        const rawScore = scores[a.id]
        const numScore = rawScore !== undefined && rawScore !== '' ? Number(rawScore) || 0 : 0
        const isWinner =
          winnerMode === 'coop'
            ? true
            : winnerMode === 'draw'
            ? true
            : winnerId === a.id

        return {
          userId: a.isGuest ? undefined : a.id,
          guestId: a.isGuest ? a.id : undefined,
          name: a.name,
          score: numScore,
          meepleColor: 'yellow',
          isWinner,
        }
      })

      const winnerScoreVal =
        winnerId && scores[winnerId] !== undefined && scores[winnerId] !== ''
          ? `${scores[winnerId]} ${t('quickLog.pointsAbbr')}`
          : null

      const matchDate = new Date().toISOString()
      const gameTitle = selectedGame.title_es || selectedGame.title

      if (USE_MOCKS) {
        // Mock fallback
        const mockMeetup: Meetup = {
          id: meetupId,
          creator_id: currentUserId || 'mock-user',
          group_id: groupId || null,
          game_id: selectedGame.bgg_id,
          title: gameTitle,
          description:
            winnerMode === 'coop'
              ? t('quickLog.coopMatchDesc')
              : winnerMode === 'draw'
              ? t('quickLog.drawMatchDesc')
              : t('quickLog.registeredMatchDesc'),
          city: 'Presencial',
          location: 'Mesa privada',
          date: matchDate,
          max_players: Math.max(activeAttendees.length, 2),
          joined_players: registeredIds.length > 0 ? registeredIds : [currentUserId || 'u1'],
          attended_players: registeredIds,
          attended_guests: guestIds,
          completed: true,
          board_photo_url: boardPhotoUrl,
          player_scores: playerScores,
          games: [
            {
              ...selectedGame,
              winner_user_id: winnerMode === 'player' && !winnerIsGuest ? winnerId : null,
              winner_guest_id: winnerMode === 'player' && winnerIsGuest ? winnerId : null,
              winner_score:
                winnerMode === 'coop'
                  ? t('quickLog.coopScore')
                  : winnerMode === 'draw'
                  ? t('quickLog.drawScore')
                  : winnerScoreVal,
            },
          ],
        }

        onSuccess?.(mockMeetup, playerScores)
        setIsSubmitting(false)
        return
      }

      // 1. Insert guests if any
      if (guestAttendees.length > 0) {
        const guestRows = guestAttendees.map((g) => ({
          id: g.id,
          meetup_id: meetupId,
          guest_name: g.name,
        }))
        const { error: guestError } = await supabase.from('meetup_guests').insert(guestRows)
        if (guestError) {
          console.warn('Non-fatal error inserting meetup_guests:', guestError)
        }
      }

      // 2. Insert meetup record
      const joinedList = registeredIds.length > 0 ? registeredIds : [currentUserId!]
      const { error: meetupError } = await supabase.from('meetups').insert({
        id: meetupId,
        creator_id: currentUserId,
        group_id: groupId || null,
        title: gameTitle,
        description:
          winnerMode === 'coop'
            ? t('quickLog.coopMatchDesc')
            : winnerMode === 'draw'
            ? t('quickLog.drawMatchDesc')
            : t('quickLog.registeredMatchDesc'),
        city: 'Presencial',
        location: 'Mesa privada',
        date: matchDate,
        max_players: Math.max(activeAttendees.length, 2),
        joined_players: joinedList,
        attended_players: registeredIds,
        attended_guests: guestIds,
        completed: true,
        board_photo_url: boardPhotoUrl,
        player_scores: playerScores,
      })

      if (meetupError) throw meetupError

      // 3. Insert meetup_games record
      const { error: gameError } = await supabase.from('meetup_games').insert({
        meetup_id: meetupId,
        game_id: selectedGame.bgg_id,
        winner_user_id: winnerMode === 'player' && !winnerIsGuest ? winnerId : null,
        winner_guest_id: winnerMode === 'player' && winnerIsGuest ? winnerId : null,
        winner_score:
          winnerMode === 'coop'
            ? t('quickLog.coopScore')
            : winnerMode === 'draw'
            ? t('quickLog.drawScore')
            : winnerScoreVal,
      })

      if (gameError) throw gameError

      // 4. Best-effort insert into meetup_attendees if table exists
      try {
        const attendeeRows = activeAttendees.map((a) => ({
          meetup_id: meetupId,
          user_id: a.isGuest ? null : a.id,
          guest_id: a.isGuest ? a.id : null,
          created_at: matchDate,
        }))
        await supabase.from('meetup_attendees').insert(attendeeRows)
      } catch {
        // Gracefully ignore if meetup_attendees table does not exist
      }

      // 5. Construct final Meetup object for Victory Card
      const finalizedMeetup: Meetup = {
        id: meetupId,
        creator_id: currentUserId!,
        group_id: groupId || null,
        game_id: selectedGame.bgg_id,
        title: gameTitle,
        description:
          winnerMode === 'coop'
            ? t('quickLog.coopMatchDesc')
            : winnerMode === 'draw'
            ? t('quickLog.drawMatchDesc')
            : t('quickLog.registeredMatchDesc'),
        city: 'Presencial',
        location: 'Mesa privada',
        date: matchDate,
        max_players: Math.max(activeAttendees.length, 2),
        joined_players: joinedList,
        attended_players: registeredIds,
        attended_guests: guestIds,
        completed: true,
        board_photo_url: boardPhotoUrl,
        player_scores: playerScores,
        games: [
          {
            ...selectedGame,
            winner_user_id: winnerMode === 'player' && !winnerIsGuest ? winnerId : null,
            winner_guest_id: winnerMode === 'player' && winnerIsGuest ? winnerId : null,
            winner_score:
              winnerMode === 'coop'
                ? t('quickLog.coopScore')
                : winnerMode === 'draw'
                ? t('quickLog.drawScore')
                : winnerScoreVal,
          },
        ],
      }

      onSuccess?.(finalizedMeetup, playerScores)
    } catch (err: any) {
      console.error('Error saving quick match:', err)
      setSubmitError(err.message || t('quickLog.errorGeneric'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    meetupId,
    selectedGame,
    setSelectedGame,
    gameSearchQuery,
    setGameSearchQuery,
    filteredGroupGames,
    catalogSearchResults,
    isSearchingCatalog,
    attendees,
    selectedAttendeeIds,
    toggleAttendee,
    activeAttendees,
    newGuestName,
    setNewGuestName,
    addGuest,
    removeGuest,
    winnerMode,
    setWinnerMode,
    winnerId,
    setWinnerId,
    scores,
    setPlayerScore,
    boardPhotoUrl,
    setBoardPhotoUrl,
    isSubmitting,
    submitError,
    handleSaveMatch,
  }
}
