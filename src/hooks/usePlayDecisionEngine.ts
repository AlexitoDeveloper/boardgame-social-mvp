import { useState, useEffect, useMemo, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { useAuth } from '../lib/authContext'
import { useTranslation } from 'react-i18next'
import {
  SimpleGame,
  isGameExpansion,
  fetchPlayGamesPool,
} from '../lib/playLibraryService'

export type { SimpleGame }
export { isGameExpansion }

export function usePlayDecisionEngine() {
  const { user } = useAuth()
  const { t } = useTranslation()

  // Filter States
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<string>('any')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('personal')
  const [onlyUnplayed, setOnlyUnplayed] = useState<boolean>(false)

  // Library games pool
  const [gamesPool, setGamesPool] = useState<SimpleGame[]>([])
  const [loadingGames, setLoadingGames] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Decision outcome & roulette state
  const [suggestedGame, setSuggestedGame] = useState<SimpleGame | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinError, setSpinError] = useState<string | null>(null)

  // Load games from personal collection or group library
  useEffect(() => {
    let isCancelled = false

    const loadGames = async () => {
      setLoadingGames(true)
      try {
        const loadedGames = await fetchPlayGamesPool(user?.id, selectedGroupId)
        if (!isCancelled) {
          setGamesPool(loadedGames)
        }
      } catch (err) {
        console.error('Error fetching games pool for PlayPage:', err)
      } finally {
        if (!isCancelled) setLoadingGames(false)
      }
    }

    loadGames()
    return () => { isCancelled = true }
  }, [user?.id, selectedGroupId, refreshTrigger])

  // Filtered games excluding expansions and applying user parameters
  const filteredGames = useMemo(() => {
    return gamesPool.filter((game) => {
      if (isGameExpansion(game)) return false
      if (onlyUnplayed && !game.is_unplayed) return false

      if (selectedPlayers !== null) {
        const minP = game.min_players || 1
        const maxP = game.max_players || 10
        if (selectedPlayers < minP || selectedPlayers > maxP) return false
      }

      if (selectedDuration !== 'any') {
        const time = game.playing_time || 45
        if (selectedDuration === 'quick' && time > 35) return false
        if (selectedDuration === 'medium' && (time < 30 || time > 75)) return false
        if (selectedDuration === 'long' && (time < 60 || time > 120)) return false
        if (selectedDuration === 'afternoon' && time < 90) return false
      }

      return true
    })
  }, [gamesPool, selectedPlayers, selectedDuration, onlyUnplayed])

  // Available expansions in the pool for the currently suggested game
  const availableExpansionsForSuggested = useMemo(() => {
    if (!suggestedGame) return []
    return gamesPool.filter((g) => {
      if (!isGameExpansion(g)) return false
      if (g.bgg_base_game_id && g.bgg_base_game_id === suggestedGame.bgg_id) return true
      const gTitle = (g.title || '').toLowerCase()
      const sTitle = (suggestedGame.title || '').toLowerCase()
      return gTitle.startsWith(sTitle) || gTitle.includes(sTitle)
    })
  }, [suggestedGame, gamesPool])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedPlayers(null)
    setSelectedDuration('any')
    setOnlyUnplayed(false)
    setSpinError(null)
  }, [])

  // Inertial mechanical roulette spin
  const spinRoulette = useCallback(() => {
    setSpinError(null)
    if (filteredGames.length === 0) {
      setSpinError(t('play.noGamesFound'))
      return
    }

    setIsSpinning(true)
    const delays = [40, 40, 45, 50, 55, 65, 75, 90, 110, 135, 170, 215, 270, 340, 430]
    let step = 0

    const executeStep = () => {
      const randomIdx = Math.floor(Math.random() * filteredGames.length)
      setSuggestedGame(filteredGames[randomIdx])

      step++
      if (step < delays.length) {
        setTimeout(executeStep, delays[step])
      } else {
        setIsSpinning(false)
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'],
          })
        } catch {}
      }
    }

    setTimeout(executeStep, delays[0])
  }, [filteredGames, t])

  return {
    selectedPlayers,
    selectedDuration,
    selectedGroupId,
    onlyUnplayed,
    gamesPool,
    filteredGames,
    loadingGames,
    suggestedGame,
    isSpinning,
    spinError,
    availableExpansionsForSuggested,
    setSelectedPlayers,
    setSelectedDuration,
    setSelectedGroupId,
    setOnlyUnplayed,
    setSuggestedGame,
    resetFilters,
    spinRoulette,
    refreshGames: () => setRefreshTrigger(v => v + 1),
  }
}
