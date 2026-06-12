import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Download, Trash2, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Game } from '../../types'
import { Tier } from '../../hooks/useTops'
import { Command, CommandInput, CommandList, CommandItem } from '../ui/command'

interface TopsSidebarProps {
  mode: 'tier' | 'top10';
  setMode: (mode: 'tier' | 'top10') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Game[];
  setSearchResults: (results: Game[]) => void;
  isSearching: boolean;
  handleSearch: (e?: React.FormEvent) => void;
  errorMsg: string;
  addToPool: (game: Game) => void;
  pool: Game[];
  selectedGameForPlacement: Game | null;
  selectGame: (game: Game) => void;
  removeFromPool: (bggId: number) => void;
  handleClearAll: () => void;
  tiers: Tier[];
  top10: (Game | null)[];
  placeInTier: (tierId: string) => void;
  placeInTop10: (index: number) => void;
  setSelectedGameForPlacement: (game: Game | null) => void;
  handleDragStart: (e: React.DragEvent, gameId: number, source: string) => void;
  handleDropOnPool: (draggedBggId: number, source: string) => void;
}

export function TopsSidebar({
  mode,
  setMode,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  isSearching,
  handleSearch,
  errorMsg,
  addToPool,
  pool,
  selectedGameForPlacement,
  selectGame,
  removeFromPool,
  handleClearAll,
  tiers,
  top10,
  placeInTier,
  placeInTop10,
  setSelectedGameForPlacement,
  handleDragStart,
  handleDropOnPool,
}: TopsSidebarProps) {
  return (
    <div className="space-y-4">
      
      {/* 1. Top Section: Search and settings grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        
        {/* Search Card */}
        <Card className="lg:col-span-2 relative z-20 border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-bold flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> Añadir Juegos
            </CardTitle>
            <CardDescription className="text-xs">
              Busca y añade juegos del catálogo a tu bandeja de preparación.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative animate-fade-in">
            <div className="relative">
              {/* Click-away overlay to close search results when clicking outside */}
              {searchResults.length > 0 && (
                <div 
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setSearchResults([])}
                />
              )}

              <Command shouldFilter={false} className="overflow-visible bg-transparent border-0 shadow-none">
                <div className="relative border border-border/50 rounded-xl bg-background/50 overflow-hidden flex items-center pr-3">
                  <div className="flex-1">
                    <CommandInput 
                      placeholder="Ej. Catan, Brass, Carcassonne..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      className="h-10 text-xs border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground bg-transparent"
                    />
                  </div>
                  {isSearching && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
                  )}
                </div>

                {/* Search Results absolute dropdown overlay */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-50 left-0 right-0 top-full mt-1.5 w-full shadow-2xl"
                    >
                      <div className="border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden">
                        <CommandList className="max-h-60 custom-scrollbar divide-y divide-zinc-800/40">
                          {searchResults.map((game) => {
                            const isAdded = pool.some(g => g.bgg_id === game.bgg_id) || 
                                            tiers.some(t => t.games.some(g => g.bgg_id === game.bgg_id)) || 
                                            top10.some(g => g?.bgg_id === game.bgg_id)
                            return (
                              <CommandItem
                                key={game.bgg_id} 
                                className={`p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer text-foreground hover:bg-white/5 hover:text-white data-[selected=true]:bg-white/5 data-[selected=true]:text-white ${
                                  isAdded ? 'opacity-50 cursor-default bg-emerald-500/5 hover:bg-emerald-500/5' : ''
                                }`}
                                onSelect={() => !isAdded && addToPool(game)}
                              >
                                <div className="flex items-center gap-3 min-w-0 pointer-events-none">
                                  {game.image_url ? (
                                    <img src={game.image_url} alt={game.title} className="w-10 h-10 rounded object-cover shadow-sm shrink-0" />
                                  ) : (
                                    <div className="w-10 h-10 rounded bg-muted/60 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 font-extrabold">?</div>
                                  )}
                                  <span className="font-semibold text-sm truncate block text-left">
                                    {game.title}
                                    <span className="text-xs font-normal text-muted-foreground block mt-0.5">
                                      {game.year_published || 'Año desc.'}
                                    </span>
                                  </span>
                                </div>
                                
                                {isAdded && (
                                  <div className="text-emerald-400 shrink-0 select-none mr-2 pointer-events-none">
                                    <Check className="w-5 h-5" />
                                  </div>
                                )}
                              </CommandItem>
                            )
                          })}
                        </CommandList>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Command>
            </div>

            {/* Show error */}
            {errorMsg && (
              <div className="text-[11px] text-destructive bg-destructive/10 border border-destructive/20 px-2 py-1.5 rounded-lg font-semibold">
                {errorMsg}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration Card */}
        <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-bold">Tipo de Ranking</CardTitle>
            <CardDescription className="text-xs">Elige la estructura de tu lista.</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
              <Button 
                size="sm" 
                variant={mode === 'tier' ? 'default' : 'ghost'} 
                onClick={() => { setMode('tier'); setSelectedGameForPlacement(null) }}
                className="rounded-lg font-bold text-xs cursor-pointer"
              >
                Tier List
              </Button>
              <Button 
                size="sm" 
                variant={mode === 'top10' ? 'default' : 'ghost'} 
                onClick={() => { setMode('top10'); setSelectedGameForPlacement(null) }}
                className="rounded-lg font-bold text-xs cursor-pointer"
              >
                Top 10 List
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 2. Preparation Area Shelf (Bandeja de Preparación) - Horizontal scroll */}
      <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-md font-bold">Bandeja de Preparación</CardTitle>
            <CardDescription className="text-xs">Juegos listos para colocar. Toca uno y luego selecciona dónde colocarlo en el ranking.</CardDescription>
          </div>
          {pool.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              className="h-8 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="pb-3">
          {pool.length === 0 ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const draggedBggId = Number(e.dataTransfer.getData('text/plain'))
                const source = e.dataTransfer.getData('source')
                handleDropOnPool(draggedBggId, source)
              }}
              className="text-center py-6 border border-dashed border-border/40 rounded-xl bg-background/20 text-muted-foreground text-xs font-semibold"
            >
              Busca y añade juegos para empezar a ordenarlos.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Horizontal scrollable track for pool games */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const draggedBggId = Number(e.dataTransfer.getData('text/plain'))
                  const source = e.dataTransfer.getData('source')
                  handleDropOnPool(draggedBggId, source)
                }}
                className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent min-h-[72px] border border-transparent rounded-lg"
              >
                {pool.map((game) => {
                  const isSelected = selectedGameForPlacement?.bgg_id === game.bgg_id
                  return (
                    <div
                      key={game.bgg_id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, game.bgg_id, 'pool')}
                      onClick={() => selectGame(game)}
                      className={`group relative w-14 h-14 rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing select-none transition-all flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? 'border-primary shadow-md shadow-primary/45 ring-2 ring-primary bg-primary/20 scale-105' 
                          : 'border-border/60 hover:border-primary bg-zinc-900/50 hover:scale-95'
                      }`}
                    >
                      {game.image_url ? (
                        <img src={game.image_url} alt={game.title} className="w-full h-full object-cover pointer-events-none" />
                      ) : (
                        <div className="absolute inset-0 bg-muted/40 text-[9px] font-bold text-center flex items-center justify-center p-0.5 line-clamp-2">
                          {game.title}
                        </div>
                      )}
                      
                      {/* Selected Check overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center text-primary pointer-events-none">
                          <Check className="w-5 h-5 drop-shadow" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Explicit placement toolbar for selected game */}
              <AnimatePresence>
                {selectedGameForPlacement && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 border border-primary/20 rounded-xl bg-primary/5 flex flex-col gap-2.5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-border/20 pb-2">
                      <span className="font-semibold text-foreground truncate max-w-[170px]">
                        Colocar: <span className="text-primary font-extrabold">{selectedGameForPlacement.title}</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFromPool(selectedGameForPlacement.bgg_id)}
                        className="h-6 text-[10px] text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer px-2"
                      >
                        Quitar de la bandeja
                      </Button>
                    </div>
                    
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-muted-foreground font-semibold">Selecciona su fila o posición o toca directamente un recuadro parpadeante en el ranking de abajo:</p>
                      <div className="flex flex-wrap gap-1">
                        {mode === 'tier' ? (
                          tiers.map(t => (
                            <Button
                              key={t.id}
                              size="sm"
                              variant="secondary"
                              className="h-7 px-2 text-[10px] font-extrabold hover:bg-primary hover:text-primary-foreground border border-border/60 rounded-md cursor-pointer"
                              onClick={() => placeInTier(t.id)}
                            >
                              {t.name}
                            </Button>
                          ))
                        ) : (
                          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <Button
                              key={num}
                              size="sm"
                              variant="secondary"
                              className="h-7 w-7 p-0 text-[10px] font-extrabold hover:bg-primary hover:text-primary-foreground border border-border/60 rounded-md cursor-pointer"
                              onClick={() => placeInTop10(num - 1)}
                            >
                              #{num}
                            </Button>
                          ))
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[10px] text-muted-foreground hover:bg-muted ml-auto rounded-md cursor-pointer"
                          onClick={() => setSelectedGameForPlacement(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
