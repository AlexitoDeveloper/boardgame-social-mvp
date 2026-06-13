import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Trash2, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Game } from '../../types'
import { Tier } from '../../hooks/useTops'
import { GameSearchBar } from '../GameSearchBar'

interface TopsSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Game[];
  setSearchResults: (results: Game[]) => void;
  isSearching: boolean;
  errorMsg: string;
  addToPool: (game: Game) => void;
  pool: Game[];
  selectedGameForPlacement: Game | null;
  selectGame: (game: Game) => void;
  removeFromPool: (bggId: number) => void;
  handleClearPool: () => void;
  tiers: Tier[];
  top10: (Game | null)[];
  placeInTier: (tierId: string) => void;
  placeInTop10: (index: number) => void;
  setSelectedGameForPlacement: (game: Game | null) => void;
  handleDragStart: (e: React.DragEvent, gameId: number, source: string) => void;
  handleDropOnPool: (draggedBggId: number, source: string) => void;
  mode: 'tier' | 'top10';
}

export function TopsSearchSection({
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  isSearching,
  errorMsg,
  addToPool,
  pool,
  selectedGameForPlacement,
  selectGame,
  removeFromPool,
  handleClearPool,
  tiers,
  top10,
  placeInTier,
  placeInTop10,
  setSelectedGameForPlacement,
  handleDragStart,
  handleDropOnPool,
  mode,
}: TopsSearchSectionProps) {


  return (
    <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl overflow-visible relative z-20">
      <CardHeader className="pb-3">
        <CardTitle className="text-md font-bold flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" /> Buscador y Bandeja de Juegos
        </CardTitle>
        <CardDescription className="text-xs">
          Busca juegos para añadirlos a tu bandeja y colócalos arrastrándolos o haciendo clic en el ranking superior.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        <GameSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          games={searchResults}
          setGames={setSearchResults}
          isSearching={isSearching}
          placeholder="Ej. Catan, Brass, Carcassonne..."
          onSelectGame={addToPool}
          isGameDisabled={(game) => 
            pool.some(g => g.bgg_id === game.bgg_id) || 
            tiers.some(t => t.games.some(g => g.bgg_id === game.bgg_id)) || 
            top10.some(g => g?.bgg_id === game.bgg_id)
          }
        />

        {/* Show error */}
        {errorMsg && (
          <div className="text-[11px] text-destructive bg-destructive/10 border border-destructive/20 px-2 py-1.5 rounded-lg font-semibold animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Shelf (Bandeja de Preparación) directly below input inside same container */}
        <div className="pt-2 border-t border-border/20 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-foreground/80">Juegos en Bandeja ({pool.length})</span>
            {pool.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearPool}
                className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Vaciar
              </Button>
            )}
          </div>

          {pool.length === 0 ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const draggedBggId = Number(e.dataTransfer.getData('text/plain'))
                const source = e.dataTransfer.getData('source')
                handleDropOnPool(draggedBggId, source)
              }}
              className="text-center py-6 border border-dashed border-border/40 rounded-xl bg-background/25 text-muted-foreground text-xs font-semibold"
            >
              Los juegos añadidos aparecerán aquí.
            </div>
          ) : (
            <div className="space-y-3">
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
                        <img src={game.image_url} alt={game.title} className="w-full h-full object-cover pointer-events-none animate-fade-in" />
                      ) : (
                        <div className="absolute inset-0 bg-muted/40 text-[9px] font-bold text-center flex items-center justify-center p-0.5 line-clamp-2">
                          {game.title}
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center text-primary pointer-events-none">
                          <Check className="w-5 h-5 drop-shadow" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Placement Toolbar for Selected Game */}
              <AnimatePresence>
                {selectedGameForPlacement && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 border border-primary/20 rounded-xl bg-primary/5 flex flex-col gap-2.5 overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs border-b border-border/20 pb-2">
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        Colocar: <span className="text-primary font-extrabold">{selectedGameForPlacement.title}</span>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFromPool(selectedGameForPlacement.bgg_id)}
                        className="h-6 text-[10px] text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer px-2"
                      >
                        Quitar
                      </Button>
                    </div>
                    
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-zinc-400 font-semibold">Toca un botón de abajo o haz clic en su destino en el ranking de arriba:</p>
                      <div className="flex flex-wrap gap-1">
                        {mode === 'tier' ? (
                          tiers.map(t => (
                            <Button
                              key={t.id}
                              size="sm"
                              variant="secondary"
                              className="h-7 px-2.5 text-[10px] font-extrabold hover:bg-primary hover:text-primary-foreground border border-border/60 rounded-md cursor-pointer"
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
        </div>
      </CardContent>
    </Card>
  )
}
export default TopsSearchSection;
