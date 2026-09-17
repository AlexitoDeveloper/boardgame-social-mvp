import { useState, useEffect, useMemo, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { useAuth } from '../lib/authContext'
import { useTranslation } from 'react-i18next'
import { tableAudio } from '../lib/tableAudio'
import {
  SimpleGame,
  isGameExpansion,
  fetchPlayGamesPool,
} from '../lib/playLibraryService'

export type { SimpleGame }
export { isGameExpansion }

export type ComplexityLevel = 'any' | 'light' | 'medium' | 'heavy'

export function usePlayDecisionEngine() {
  const { user } = useAuth()
  const { t } = useTranslation()

  // Filter States
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<string>('any')
  const [selectedComplexity, setSelectedComplexity] = useState<ComplexityLevel>('any')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('personal')
  const [onlyUnplayed, setOnlyUnplayed] = useState<boolean>(false)

  // Library games pool
  const [gamesPool, setGamesPool] = useState<SimpleGame[]>([])
  const [loadingGames, setLoadingGames] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Decision outcome & roulette state
  const [suggestedGame, setSuggestedGame] = useState<SimpleGame | null>(null)
  const [spinningGame, setSpinningGame] = useState<SimpleGame | null>(null)
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
        if (selectedPlayers === 1) {
          if (minP > 1) return false
        } else if (selectedPlayers === 6) {
          if (maxP < 6) return false
        } else {
          if (selectedPlayers < minP || selectedPlayers > maxP) return false
        }
      }

      if (selectedDuration !== 'any') {
        const time = game.playing_time || 45
        if (selectedDuration === 'quick' && time > 35) return false
        if (selectedDuration === 'medium' && (time < 30 || time > 75)) return false
        if (selectedDuration === 'long' && (time < 60 || time > 120)) return false
        if (selectedDuration === 'afternoon' && time < 90) return false
      }

      if (selectedComplexity !== 'any') {
        const c = typeof game.complexity === 'number' && game.complexity > 0 ? game.complexity : 2.5
        if (selectedComplexity === 'light' && c > 2.2) return false
        if (selectedComplexity === 'medium' && (c <= 2.2 || c > 3.3)) return false
        if (selectedComplexity === 'heavy' && c <= 3.3) return false
      }

      return true
    })
  }, [gamesPool, selectedPlayers, selectedDuration, selectedComplexity, onlyUnplayed])

  // Available expansions in the pool for the currently suggested game
  const availableExpansionsForSuggested = useMemo(() => {
    const target = suggestedGame || spinningGame
    if (!target) return []
    return gamesPool.filter((g) => {
      if (!isGameExpansion(g)) return false
      if (g.bgg_base_game_id && g.bgg_base_game_id === target.bgg_id) return true
      const gTitle = (g.title || '').toLowerCase()
      const sTitle = (target.title || '').toLowerCase()
      return gTitle.startsWith(sTitle) || gTitle.includes(sTitle)
    })
  }, [suggestedGame, spinningGame, gamesPool])

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedPlayers(null)
    setSelectedDuration('any')
    setSelectedComplexity('any')
    setOnlyUnplayed(false)
    setSpinError(null)
  }, [])

  // Smooth inertial mechanical roulette spin with WebAudio and confetti
  const spinRoulette = useCallback(() => {
    setSpinError(null)
    if (filteredGames.length === 0) {
      setSpinError(t('play.noGamesFound'))
      return
    }

    setIsSpinning(true)
    tableAudio.playDiceRoll()

    const winnerIdx = Math.floor(Math.random() * filteredGames.length)
    const winner = filteredGames[winnerIdx]

    // Step delays simulating mechanical deceleration
    const delays = [50, 55, 65, 80, 100, 130, 170, 220, 290, 380]
    let step = 0

    const executeStep = () => {
      step++
      if (step < delays.length) {
        const randomIdx = Math.floor(Math.random() * filteredGames.length)
        setSpinningGame(filteredGames[randomIdx])
        setTimeout(executeStep, delays[step])
      } else {
        setSuggestedGame(winner)
        setSpinningGame(null)
        setIsSpinning(false)
        tableAudio.playTurnBell()
        try {
          confetti({
            particleCount: 50,
            spread: 65,
            origin: { y: 0.65 },
            colors: ['#10B981', '#3B82F6', '#EC4899', '#F59E0B'],
          })
        } catch {}
      }
    }

    // Set first preview immediately
    setSpinningGame(filteredGames[Math.floor(Math.random() * filteredGames.length)])
    setTimeout(executeStep, delays[0])
  }, [filteredGames, t])

  return {
    selectedPlayers,
    selectedDuration,
    selectedComplexity,
    selectedGroupId,
    onlyUnplayed,
    gamesPool,
    filteredGames,
    loadingGames,
    suggestedGame,
    spinningGame,
    isSpinning,
    spinError,
    availableExpansionsForSuggested,
    setSelectedPlayers,
    setSelectedDuration,
    setSelectedComplexity,
    setSelectedGroupId,
    setOnlyUnplayed,
    setSuggestedGame,
    resetFilters,
    spinRoulette,
    refreshGames: () => setRefreshTrigger(v => v + 1),
  }
}
