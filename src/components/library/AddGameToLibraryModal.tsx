import { FC, useState, useEffect } from 'react'
import { Search, Plus, Check, Loader2, Globe, Dices, PenTool, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Game } from '../../types'
import { supabase } from '../../lib/supabaseClient'
import { ManualGameForm } from './ManualGameForm'
import { cn } from '../../lib/utils'

interface AddGameToLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  userCollectionGameIds: number[]
  onAddGame: (game: Game) => Promise<void>
  isGroupContext?: boolean
}

export const AddGameToLibraryModal: FC<AddGameToLibraryModalProps> = ({
  isOpen,
  onClose,
  userCollectionGameIds,
  onAddGame,
  isGroupContext = false,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isBggSearching, setIsBggSearching] = useState(false)
  const [addingIds, setAddingIds] = useState<Record<number, boolean>>({})
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({})

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setIsSearching(false)
      setIsBggSearching(false)
      setActiveTab('search')
      setAddedIds({})
    }
  }, [isOpen])

  // Search local database as user types
  useEffect(() => {
    if (!isOpen || activeTab !== 'search') return

    const trimmed = searchQuery.trim()
    if (!trimmed) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .or(`title.ilike.%${trimmed}%,title_es.ilike.%${trimmed}%`)
          .order('year_published', { ascending: false, nullsFirst: false })
          .limit(20)

        if (!error && data) {
          setSearchResults(data as Game[])
        }
      } catch (err) {
        console.error('Error searching catalog:', err)
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery, isOpen, activeTab])

  const handleSearchBgg = async () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    setIsBggSearching(true)
    try {
      const { data, error } = await supabase.functions.invoke('bgg-ingest', {
        body: { action: 'search', query: trimmed },
      })

      if (!error && data && data.results) {
        const bggGames: Game[] = data.results.map((item: any) => ({
          bgg_id: item.bgg_id,
          title: item.title,
          year_published: item.year_published,
          is_expansion: item.is_expansion,
          image_url: null,
          isFromBgg: true,
        }))
        setSearchResults((prev) => {
          const ids = new Set(prev.map((g) => g.bgg_id))
          const newBgg = bggGames.filter((g) => !ids.has(g.bgg_id))
          return [...prev, ...newBgg]
        })
      }
    } catch (err) {
      console.error('Error searching BGG:', err)
    } finally {
      setIsBggSearching(false)
    }
  }

  const handleAdd = async (game: Game) => {
    setAddingIds((prev) => ({ ...prev, [game.bgg_id]: true }))
    try {
      await onAddGame(game)
      setAddedIds((prev) => ({ ...prev, [game.bgg_id]: true }))
    } catch (err) {
      console.error('Error adding game:', err)
    } finally {
      setAddingIds((prev) => ({ ...prev, [game.bgg_id]: false }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full p-5 sm:p-6 bg-card border border-border/40 shadow-2xl rounded-3xl overflow-hidden space-y-4">
        <DialogHeader className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider w-fit">
            <Dices className="w-3.5 h-3.5" />
            <span>{isGroupContext ? 'Ludoteca del Grupo' : 'Mi Ludoteca'}</span>
          </div>
          <DialogTitle className="text-xl font-black text-foreground tracking-tight">
            Añadir Juego a la Ludoteca
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            {isGroupContext
              ? 'El juego se guardará en tu ludoteca personal y estará disponible para este grupo.'
              : 'Busca en el catálogo, en BGG o añade manualmente cualquier juego a tu colección.'}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-muted/40 p-1 border border-border/30 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('search')}
            className={cn(
              'flex-1 h-8 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer',
              activeTab === 'search'
                ? 'bg-card text-foreground shadow-xs hover:bg-card'
                : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar catálogo</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('manual')}
            className={cn(
              'flex-1 h-8 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer',
              activeTab === 'manual'
                ? 'bg-card text-foreground shadow-xs hover:bg-card'
                : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            )}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Crear manual</span>
          </Button>
        </div>

        {activeTab === 'search' ? (
          <div className="space-y-3">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                autoFocus
                placeholder="Escribe el nombre del juego (ej. Catan, Carcassonne...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 rounded-xl h-10 text-xs"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
              )}
            </div>

            {/* Results container */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {searchResults.length > 0 ? (
                searchResults.map((game) => {
                  const isInCollection =
                    userCollectionGameIds.includes(game.bgg_id) || addedIds[game.bgg_id]
                  const isAdding = addingIds[game.bgg_id]

                  return (
                    <div
                      key={game.bgg_id}
                      className="p-2.5 rounded-2xl bg-card/70 border border-border/40 hover:border-primary/30 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {game.image_url ? (
                          <img
                            src={game.image_url}
                            alt={game.title}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border/20 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Dices className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {game.title_es || game.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                            {game.year_published && <span>{game.year_published}</span>}
                            {game.min_players && (
                              <span>
                                {game.min_players}-{game.max_players || game.min_players} jug.
                              </span>
                            )}
                            {game.isFromBgg && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                BGG
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isInCollection ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" />
                            <span>En ludoteca</span>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            disabled={isAdding}
                            onClick={() => handleAdd(game)}
                            className="rounded-xl font-bold text-xs h-8 px-3 cursor-pointer"
                          >
                            {isAdding ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 mr-1" />
                            )}
                            <span>Añadir</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : searchQuery.trim() && !isSearching ? (
                <div className="p-4 text-center space-y-2 border border-dashed border-border/40 rounded-2xl bg-muted/10">
                  <p className="text-xs text-muted-foreground font-semibold">
                    No se encontraron coincidencias en el catálogo local.
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center space-y-2 text-muted-foreground/60 select-none">
                  <Sparkles className="w-6 h-6 mx-auto opacity-40" />
                  <p className="text-xs font-semibold">
                    Escribe el nombre de un juego para buscarlo en el catálogo
                  </p>
                </div>
              )}
            </div>

            {/* BGG Search Option */}
            {searchQuery.trim().length >= 2 && (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBggSearching}
                  onClick={handleSearchBgg}
                  className="w-full rounded-xl text-xs font-bold gap-1.5 h-9 border-border/40 hover:border-primary/50 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {isBggSearching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span>Buscar "{searchQuery.trim()}" en BoardGameGeek</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ManualGameForm onAddGame={onAddGame} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
