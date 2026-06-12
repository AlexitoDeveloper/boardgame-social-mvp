import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Game } from '../types'
import { MOCK_BGG_GAMES } from '../lib/mockData'
import { toPng } from 'html-to-image'

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
  const exportAreaRef = useRef<HTMLDivElement>(null)

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
      }
    } catch (err: any) {
      console.error('Error buscando juegos:', err)
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

    setPool(prev => [...prev, game])
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
      if (t.id === tierId) {
        if (t.games.some(g => g.bgg_id === selectedGameForPlacement.bgg_id)) return t
        return { ...t, games: [...t.games, selectedGameForPlacement] }
      }
      return t
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
    setPool(prev => [...prev, game])
  }

  // Place selected game to a Top 10 Slot
  const placeInTop10 = (index: number) => {
    if (!selectedGameForPlacement) return

    const existingGame = top10[index]

    setTop10(prev => {
      const next = [...prev]
      next[index] = selectedGameForPlacement
      return next
    })

    removeFromPool(selectedGameForPlacement.bgg_id)

    if (existingGame) {
      setPool(prev => [...prev, existingGame])
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

    setPool(prev => [...prev, game])
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
        if (t.id === tierId) {
          if (t.games.some(g => g.bgg_id === draggedBggId)) return t
          return { ...t, games: [...t.games, gameToPlace!] }
        }
        return t
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
        const next = [...prev]
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
    setErrorMsg('')

    try {
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
    exportAreaRef,
    handleSearch,
    addToPool,
    removeFromPool,
    selectGame,
    placeInTier,
    returnTierGameToPool,
    placeInTop10,
    returnTop10GameToPool,
    editTierName,
    handleClearAll,
    handleExportImage,
    handleDragStart,
    handleDropOnTier,
    handleDropOnTop10,
    handleDropOnPool,
  }
}
