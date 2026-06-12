import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Trash2, Check, Crown, Sparkles, Eye, EyeOff, Image, Layout } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Game } from '../../types'
import { Tier } from '../../hooks/useTops'
import { Command, CommandInput, CommandList, CommandItem } from '../ui/command'
import { useClickOutside } from '../../hooks/useClickOutside'

interface TopsSidebarProps {
  mode: 'tier' | 'top10';
  setMode: (mode: 'tier' | 'top10') => void;
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
  
  // Premium properties
  isPremium: boolean;
  setIsPremium: (val: boolean) => void;
  showWatermark: boolean;
  setShowWatermark: (val: boolean) => void;
  customWatermark: string;
  setCustomWatermark: (val: string) => void;
  selectedBg: string;
  setSelectedBg: (val: string) => void;
  aspectRatio: 'standard' | 'square' | 'story' | 'landscape';
  setAspectRatio: (val: 'standard' | 'square' | 'story' | 'landscape') => void;
}

export function TopsSidebar({
  mode,
  setMode,
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
}: TopsSidebarProps) {
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    searchContainerRef,
    () => setSearchResults([]),
    searchResults.length > 0
  )

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
            <div ref={searchContainerRef} className="relative">
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
                      <div className="border border-border bg-card rounded-xl overflow-hidden shadow-2xl">
                        <CommandList className="max-h-60 custom-scrollbar divide-y divide-border/40">
                          {searchResults.map((game) => {
                            const isAdded = pool.some(g => g.bgg_id === game.bgg_id) || 
                                            tiers.some(t => t.games.some(g => g.bgg_id === game.bgg_id)) || 
                                            top10.some(g => g?.bgg_id === game.bgg_id)
                            return (
                              <CommandItem
                                key={game.bgg_id} 
                                className={`p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer text-foreground hover:bg-muted hover:text-foreground data-[selected=true]:bg-muted data-[selected=true]:text-foreground ${
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

        {/* Stack Configuration and Pro Controls Card in the 3rd Column */}
        <div className="flex flex-col gap-4">
          
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

          {/* Premium Pro Simulated Simulator & Options */}
          {!isPremium ? (
            <Card className="border-border/40 shadow-xl shadow-amber-500/5 bg-card/60 backdrop-blur-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-primary/5 opacity-70 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-extrabold flex items-center gap-1.5 text-amber-400">
                  <Crown className="w-4.5 h-4.5 animate-bounce shrink-0 text-amber-400" /> Generador PRO
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Exporta sin marcas de agua, fondos premium y ratios adaptados.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 relative z-10 space-y-2">
                <p className="text-[10px] text-zinc-300 leading-normal">
                  Desbloquea formatos listos para tus redes sociales (1:1, 9:16, 16:9).
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsPremium(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-primary hover:from-amber-600 hover:to-primary/95 text-white font-extrabold text-[10px] h-8 rounded-xl cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="w-3 h-3 mr-1" /> Activar PRO (Simulado)
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-500/20 shadow-xl shadow-amber-500/5 bg-card/60 backdrop-blur-2xl relative">
              <div className="absolute top-2.5 right-2.5 shrink-0 flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider select-none animate-pulse">
                <Crown className="w-2.5 h-2.5" /> PRO Activo
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-extrabold text-amber-400">Opciones PRO</CardTitle>
                <CardDescription className="text-[11px]">Ajustes de exportación avanzados.</CardDescription>
              </CardHeader>
              <CardContent className="pb-4 space-y-3">
                {/* 1. Ratio selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Layout className="w-3 h-3" /> Formato / Aspecto
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {(['standard', 'square', 'story', 'landscape'] as const).map((ratio) => {
                      const labels = {
                        standard: 'Fluido',
                        square: '1:1 (Post)',
                        story: '9:16 (Story)',
                        landscape: '16:9 (X)',
                      }
                      return (
                        <Button
                          key={ratio}
                          size="sm"
                          variant={aspectRatio === ratio ? 'default' : 'outline'}
                          onClick={() => setAspectRatio(ratio)}
                          className="text-[9px] font-extrabold h-7 rounded-lg cursor-pointer px-1 border-border/40"
                        >
                          {labels[ratio]}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Gradient background selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Image className="w-3 h-3" /> Fondo Premium
                  </label>
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {[
                      { id: 'default', class: 'from-[#141b29] via-[#0e121b] to-[#0a362e]', name: 'Jade' },
                      { id: 'sunset', class: 'from-indigo-950 via-purple-950 to-pink-900', name: 'Atardecer' },
                      { id: 'cyberpunk', class: 'from-slate-950 via-violet-950 to-indigo-900', name: 'Cyberpunk' },
                      { id: 'ocean', class: 'from-slate-950 via-sky-950 to-cyan-900', name: 'Océano' },
                      { id: 'volcanic', class: 'from-stone-950 via-stone-900 to-red-950', name: 'Volcánico' },
                      { id: 'midnight-gold', class: 'from-zinc-950 via-zinc-900 to-amber-950', name: 'Oro' },
                      { id: 'minimal', class: 'from-zinc-950 via-zinc-900 to-zinc-950', name: 'Carbono' }
                    ].map((bg) => {
                      const isSelected = selectedBg === bg.id
                      return (
                        <button
                          key={bg.id}
                          onClick={() => setSelectedBg(bg.id)}
                          title={bg.name}
                          className={`w-5 h-5 rounded-full bg-gradient-to-br ${bg.class} border transition-all relative flex items-center justify-center cursor-pointer ${
                            isSelected ? 'border-amber-400 scale-110 shadow shadow-amber-400/50 ring-1 ring-amber-400/50' : 'border-white/10 hover:scale-105'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-amber-400 font-extrabold drop-shadow" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Watermark settings */}
                <div className="space-y-2 border-t border-border/20 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1 select-none">
                      {showWatermark ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-muted-foreground" />} Marca de Agua
                    </label>
                    <button
                      onClick={() => setShowWatermark(!showWatermark)}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showWatermark ? 'bg-primary' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          showWatermark ? 'translate-x-3' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {showWatermark && (
                    <div className="space-y-1">
                      <Input
                        type="text"
                        placeholder="Firma (ej. @tuusuario)"
                        value={customWatermark}
                        onChange={(e) => setCustomWatermark(e.target.value)}
                        className="h-7 text-[10px] rounded-lg bg-background/30 border-border/30 focus:ring-amber-500 focus:border-amber-500 placeholder:text-muted-foreground py-1 px-2"
                      />
                    </div>
                  )}
                </div>

                {/* Revert link */}
                <div className="text-center pt-1.5 border-t border-border/20">
                  <button
                    onClick={() => {
                      setIsPremium(false)
                      setShowWatermark(true)
                      setCustomWatermark('')
                      setSelectedBg('default')
                      setAspectRatio('standard')
                    }}
                    className="text-[9.5px] font-extrabold text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    Desactivar Cuenta PRO
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

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
              onClick={handleClearPool}
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
