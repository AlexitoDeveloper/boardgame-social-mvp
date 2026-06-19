import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Game } from '../types'
import { MOCK_BGG_GAMES } from '../lib/mockData'
import { toPng } from 'html-to-image'
import { USE_MOCKS } from '../lib/config'
import { useAuth } from '../lib/authContext'

export interface Tier {
  id: string;
  name: string;
  color: string;
  textColor: string;
  games: Game[];
}

const DEFAULT_TIERS: Tier[] = [
  { id: 'S', name: 'S', color: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white', textColor: 'text-white', games: [] },
  { id: 'A', name: 'A', color: 'bg-gradient-to-br from-orange-500 to-amber-500 text-white', textColor: 'text-white', games: [] },
  { id: 'B', name: 'B', color: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white', textColor: 'text-white', games: [] },
  { id: 'C', name: 'C', color: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white', textColor: 'text-white', games: [] },
  { id: 'D', name: 'D', color: 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white', textColor: 'text-white', games: [] },
]

export function useTops() {
  const [mode, setMode] = useState<'tier' | 'top10'>('tier')
  const [rankingTitle, setRankingTitle] = useState('Mi Ranking de Juegos')
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Layout Data States
  const [pool, setPool] = useState<Game[]>([])
  const [selectedGameForPlacement, setSelectedGameForPlacement] = useState<Game | null>(null)
  
  // Tier List state
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS)
  
  // Top 10 state: array of 10 elements, either Game or null
  const [top10, setTop10] = useState<(Game | null)[]>(Array(10).fill(null))

  // Debounced search on type
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Export State
  const [exporting, setExporting] = useState(false)
  const [isExportingCanvas, setIsExportingCanvas] = useState(false)
  const exportAreaRef = useRef<HTMLDivElement>(null)

  // Save to Profile State
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const { user } = useAuth()

  // Premium / Pro States
  const [isPremium, setIsPremiumState] = useState<boolean>(() => {
    return localStorage.getItem('bgs_pro_simulated') === 'true'
  })

  useEffect(() => {
    async function checkPremiumStatus() {
      if (USE_MOCKS) {
        setIsPremiumState(localStorage.getItem('bgs_pro_simulated') === 'true')
        return
      }
      if (!user) {
        setIsPremiumState(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_premium')
          .eq('id', user.id)
          .single()
        
        if (error) throw error
        setIsPremiumState(!!data?.is_premium)
      } catch (err) {
        console.warn("Error retrieving premium status from DB, using localStorage simulation:", err)
        setIsPremiumState(localStorage.getItem('bgs_pro_simulated') === 'true')
      }
    }
    checkPremiumStatus()
  }, [user])

  const setIsPremium = async (val: boolean) => {
    localStorage.setItem('bgs_pro_simulated', String(val))
    setIsPremiumState(val)

    if (user && !USE_MOCKS) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ is_premium: val })
          .eq('id', user.id)
        if (error) throw error
      } catch (err) {
        console.error("Could not persist is_premium status to users table:", err)
      }
    }
  }

  const [showWatermark, setShowWatermark] = useState(true)
  const [customWatermark, setCustomWatermark] = useState('')
  const [selectedBg, setSelectedBg] = useState('default')
  const [aspectRatio, setAspectRatio] = useState<'standard' | 'square' | 'story' | 'landscape'>('standard')

  // Database search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setErrorMsg('')
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .ilike('title', `%${searchQuery}%`)
        .order('year_published', { ascending: false, nullsFirst: false })
        .limit(15)

      if (error) throw error

      if (data && data.length > 0) {
        setSearchResults(data as Game[])
      } else {
        if (USE_MOCKS) {
          // Fallback to searching mock games locally if table is empty or offline
          const filteredMock = MOCK_BGG_GAMES.filter(g =>
            g.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(g => ({
            bgg_id: Number(g.bgg_id),
            title: g.name,
            year_published: g.year,
            image_url: g.image_url.startsWith('/') ? null : g.image_url
          }))
          setSearchResults(filteredMock)
          if (filteredMock.length === 0) {
            setErrorMsg('No se encontraron juegos con ese título.')
          }
        } else {
          setErrorMsg('No se encontraron juegos con ese título.')
        }
      }
    } catch (err: any) {
      console.error('Error buscando juegos:', err)
      if (USE_MOCKS) {
        // Fallback search
        const filteredMock = MOCK_BGG_GAMES.filter(g =>
          g.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(g => ({
          bgg_id: Number(g.bgg_id),
          title: g.name,
          year_published: g.year,
          image_url: g.image_url.startsWith('/') ? null : g.image_url
        }))
        setSearchResults(filteredMock)
      } else {
        setErrorMsg('Error al buscar juegos en el catálogo.')
      }
    } finally {
      setIsSearching(false)
    }
  }

  // Add game from search results to pool
  const addToPool = (game: Game) => {
    const isInPool = pool.some(g => g.bgg_id === game.bgg_id)
    const isInTiers = tiers.some(t => t.games.some(g => g.bgg_id === game.bgg_id))
    const isInTop10 = top10.some(g => g?.bgg_id === game.bgg_id)

    if (isInPool || isInTiers || isInTop10) {
      setErrorMsg(`"${game.title}" ya está añadido a tu lista.`)
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }

    setPool(prev => {
      if (prev.some(g => g.bgg_id === game.bgg_id)) return prev
      return [...prev, game]
    })
  }

  // Remove game from pool
  const removeFromPool = (bggId: number) => {
    setPool(prev => prev.filter(g => g.bgg_id !== bggId))
    if (selectedGameForPlacement?.bgg_id === bggId) {
      setSelectedGameForPlacement(null)
    }
  }

  // Select game from pool to prepare placing it
  const selectGame = (game: Game) => {
    if (selectedGameForPlacement?.bgg_id === game.bgg_id) {
      setSelectedGameForPlacement(null)
    } else {
      setSelectedGameForPlacement(game)
    }
  }

  // Place selected game to a Tier Row
  const placeInTier = (tierId: string) => {
    if (!selectedGameForPlacement) return

    setTiers(prev => prev.map(t => {
      const cleanGames = t.games.filter(g => g.bgg_id !== selectedGameForPlacement.bgg_id)
      if (t.id === tierId) {
        return { ...t, games: [...cleanGames, selectedGameForPlacement] }
      }
      return { ...t, games: cleanGames }
    }))

    removeFromPool(selectedGameForPlacement.bgg_id)
    setSelectedGameForPlacement(null)
  }

  // Remove game from Tier List and send it back to pool
  const returnTierGameToPool = (tierId: string, game: Game) => {
    setTiers(prev => prev.map(t => {
      if (t.id === tierId) {
        return { ...t, games: t.games.filter(g => g.bgg_id !== game.bgg_id) }
      }
      return t
    }))
    setPool(prev => {
      if (prev.some(g => g.bgg_id === game.bgg_id)) return prev
      return [...prev, game]
    })
  }

  // Place selected game to a Top 10 Slot
  const placeInTop10 = (index: number) => {
    if (!selectedGameForPlacement) return

    const existingGame = top10[index]

    setTop10(prev => {
      const next = prev.map(g => g?.bgg_id === selectedGameForPlacement.bgg_id ? null : g)
      next[index] = selectedGameForPlacement
      return next
    })

    removeFromPool(selectedGameForPlacement.bgg_id)

    if (existingGame) {
      setPool(prev => {
        if (prev.some(g => g.bgg_id === existingGame.bgg_id)) return prev
        return [...prev, existingGame]
      })
    }

    setSelectedGameForPlacement(null)
  }

  // Remove game from Top 10 Slot and send it back to pool
  const returnTop10GameToPool = (index: number) => {
    const game = top10[index]
    if (!game) return

    setTop10(prev => {
      const next = [...prev]
      next[index] = null
      return next
    })

    setPool(prev => {
      if (prev.some(g => g.bgg_id === game.bgg_id)) return prev
      return [...prev, game]
    })
  }

  // Edit Tier Row Name
  const editTierName = (tierId: string, newName: string) => {
    setTiers(prev => prev.map(t => t.id === tierId ? { ...t, name: newName } : t))
  }

  // Clear everything
  const handleClearAll = () => {
    setPool([])
    setSelectedGameForPlacement(null)
    setTiers(prev => prev.map(t => ({ ...t, games: [] })))
    setTop10(Array(10).fill(null))
  }

  // Clear only the preparation pool
  const handleClearPool = () => {
    setPool([])
    setSelectedGameForPlacement(null)
  }

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, gameId: number, source: string) => {
    e.dataTransfer.setData('text/plain', gameId.toString())
    e.dataTransfer.setData('source', source)
  }

  const handleDropOnTier = (tierId: string, draggedBggId: number, source: string) => {
    let gameToPlace: Game | null = null

    if (source === 'pool') {
      gameToPlace = pool.find(g => g.bgg_id === draggedBggId) || null
      if (gameToPlace) {
        removeFromPool(draggedBggId)
      }
    } else if (source.startsWith('top10-')) {
      const sourceIdx = Number(source.replace('top10-', ''))
      gameToPlace = top10[sourceIdx]
      if (gameToPlace) {
        setTop10(prev => {
          const next = [...prev]
          next[sourceIdx] = null
          return next
        })
      }
    } else {
      // Dragged from another tier
      for (const t of tiers) {
        if (t.id === source) {
          gameToPlace = t.games.find(g => g.bgg_id === draggedBggId) || null
          if (gameToPlace) {
            setTiers(prev => prev.map(pt => pt.id === t.id ? { ...pt, games: pt.games.filter(g => g.bgg_id !== draggedBggId) } : pt))
          }
          break
        }
      }
    }

    if (gameToPlace) {
      setTiers(prev => prev.map(t => {
        const cleanGames = t.games.filter(g => g.bgg_id !== gameToPlace!.bgg_id)
        if (t.id === tierId) {
          return { ...t, games: [...cleanGames, gameToPlace!] }
        }
        return { ...t, games: cleanGames }
      }))
    }
  }

  const handleDropOnTop10 = (targetIdx: number, draggedBggId: number, source: string) => {
    let gameToPlace: Game | null = null

    if (source === 'pool') {
      gameToPlace = pool.find(g => g.bgg_id === draggedBggId) || null
      if (gameToPlace) {
        removeFromPool(draggedBggId)
      }
    } else if (source.startsWith('top10-')) {
      const sourceIdx = Number(source.replace('top10-', ''))
      gameToPlace = top10[sourceIdx]
      if (gameToPlace) {
        setTop10(prev => {
          const next = [...prev]
          next[sourceIdx] = null
          return next
        })
      }
    } else {
      // Dragged from a tier
      for (const t of tiers) {
        if (t.id === source) {
          gameToPlace = t.games.find(g => g.bgg_id === draggedBggId) || null
          if (gameToPlace) {
            setTiers(prev => prev.map(pt => pt.id === t.id ? { ...pt, games: pt.games.filter(g => g.bgg_id !== draggedBggId) } : pt))
          }
          break
        }
      }
    }

    if (gameToPlace) {
      const existingGame = top10[targetIdx]
      setTop10(prev => {
        const next = prev.map(g => g?.bgg_id === gameToPlace!.bgg_id ? null : g)
        next[targetIdx] = gameToPlace
        return next
      })
      if (existingGame) {
        setPool(prev => {
          if (prev.some(g => g.bgg_id === existingGame.bgg_id)) return prev
          return [...prev, existingGame]
        })
      }
    }
  }

  const handleDropOnPool = (draggedBggId: number, source: string) => {
    if (source === 'pool') return

    let gameToReturn: Game | null = null

    if (source.startsWith('top10-')) {
      const sourceIdx = Number(source.replace('top10-', ''))
      gameToReturn = top10[sourceIdx]
      if (gameToReturn) {
        setTop10(prev => {
          const next = [...prev]
          next[sourceIdx] = null
          return next
        })
      }
    } else {
      // Dragged from a tier
      for (const t of tiers) {
        if (t.id === source) {
          gameToReturn = t.games.find(g => g.bgg_id === draggedBggId) || null
          if (gameToReturn) {
            setTiers(prev => prev.map(pt => pt.id === t.id ? { ...pt, games: pt.games.filter(g => g.bgg_id !== draggedBggId) } : pt))
          }
          break
        }
      }
    }

    if (gameToReturn) {
      setPool(prev => {
        if (prev.some(g => g.bgg_id === draggedBggId)) return prev
        return [...prev, gameToReturn!]
      })
    }
  }

  // Generate and export image
  const handleExportImage = async () => {
    if (!exportAreaRef.current) return
    setExporting(true)
    setIsExportingCanvas(true)
    setErrorMsg('')

    try {
      // Wait 150ms for DOM layout update (especially on mobile)
      await new Promise(resolve => setTimeout(resolve, 150))

      const dataUrl = await toPng(exportAreaRef.current, {
        quality: 0.95,
        pixelRatio: 3,
        backgroundColor: '#030712',
        cacheBust: true,
        includeQueryParams: true,
        style: {
          margin: '0',
          transform: 'none',
        },
      })

      const filename = `${rankingTitle.replace(/\s+/g, '-').toLowerCase() || 'ranking'}.png`

      if (navigator.share && navigator.canShare) {
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], filename, { type: 'image/png' })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: rankingTitle,
            text: '¡Mira mi ranking de juegos de mesa creado en Boardgame Social!',
          })
          return
        }
      }

      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (err: any) {
      console.error('Error generating image:', err)
      setErrorMsg('No se pudo generar la imagen. Asegúrate de que las imágenes se carguen correctamente.')
    } finally {
      setExporting(false)
      setIsExportingCanvas(false)
    }
  }

  // Save ranking design to Supabase or localStorage fallback
  const handleSaveToProfile = async () => {
    // 1. Get current auth user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setErrorMsg('Inicia sesión para poder guardar rankings en tu perfil.')
      setTimeout(() => setErrorMsg(''), 4000)
      return
    }

    setSaving(true)
    setErrorMsg('')
    setSaveSuccess(false)

    // 2. Build payload
    const payload = {
      user_id: user.id,
      title: rankingTitle,
      mode,
      data: {
        tiers: mode === 'tier' ? tiers : [],
        top10: mode === 'top10' ? top10 : [],
        selectedBg,
        aspectRatio
      }
    }

    try {
      // 3. Try to save to Supabase user_rankings table
      const { error } = await supabase
        .from('user_rankings')
        .insert(payload)

      // Always update localStorage for fast retrieval & offline fallback
      const localKey = `boardgame_social_saved_rankings_${user.id}`
      const existingStr = localStorage.getItem(localKey)
      const existing = existingStr ? JSON.parse(existingStr) : []
      const newLocalItem = {
        id: Math.random().toString(36).substring(2, 9),
        ...payload,
        created_at: new Date().toISOString()
      }
      localStorage.setItem(localKey, JSON.stringify([newLocalItem, ...existing]))

      if (error) {
        console.warn("Could not save to Supabase table 'user_rankings', fell back to localStorage:", error)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      console.error("Error saving ranking:", err)
      setErrorMsg('No se pudo guardar el ranking en tu perfil.')
      setTimeout(() => setErrorMsg(''), 4000)
    } finally {
      setSaving(false)
    }
  }

  return {
    mode,
    setMode,
    rankingTitle,
    setRankingTitle,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    errorMsg,
    setErrorMsg,
    pool,
    selectedGameForPlacement,
    setSelectedGameForPlacement,
    tiers,
    top10,
    exporting,
    isExportingCanvas,
    exportAreaRef,
    isPremium,
    setIsPremium,
    showWatermark,
    setShowWatermark,
    customWatermark,
    setCustomWatermark,
    selectedBg,
    setSelectedBg,
    aspectRatio,
    setAspectRatio,
    saving,
    saveSuccess,
    handleSaveToProfile,
    addToPool,
    removeFromPool,
    selectGame,
    placeInTier,
    returnTierGameToPool,
    placeInTop10,
    returnTop10GameToPool,
    editTierName,
    handleClearAll,
    handleClearPool,
    handleExportImage,
    handleDragStart,
    handleDropOnTier,
    handleDropOnTop10,
    handleDropOnPool,
  }
}
