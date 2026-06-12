import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Trash2, ArrowLeftRight, Sparkles, Plus, Loader2, Download } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Game } from '../../types'
import { Tier } from '../../hooks/useTops'

interface TierGameItemProps {
  game: Game;
  tierId: string;
  handleDragStart: (e: React.DragEvent, gameId: number, source: string) => void;
  returnTierGameToPool: (tierId: string, game: Game) => void;
}

function TierGameItem({
  game,
  tierId,
  handleDragStart,
  returnTierGameToPool,
}: TierGameItemProps) {
  const [hasError, setHasError] = useState(false)
  const proxiedUrl = game.image_url ? `https://images.weserv.nl/?url=${encodeURIComponent(game.image_url)}&w=150&h=150&fit=cover` : null

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, game.bgg_id, tierId)}
      onClick={(e) => {
        e.stopPropagation()
        returnTierGameToPool(tierId, game)
      }}
      className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden border border-white/10 shadow-md bg-zinc-900 hover:border-destructive hover:scale-95 transition-all cursor-grab active:cursor-grabbing"
    >
      {proxiedUrl && !hasError ? (
        <img 
          src={proxiedUrl} 
          alt={game.title} 
          className="w-full h-full object-cover group-hover:opacity-35 transition-opacity" 
          crossOrigin="anonymous"
          onError={() => setHasError(true)}
        />
      ) : null}
      
      {/* Falls back to text title if image fails or is missing */}
      {!proxiedUrl || hasError ? (
        <div className="absolute inset-0 flex items-center justify-center p-1.5 text-[8px] sm:text-[10px] font-bold text-center text-white bg-black/70 transition-colors line-clamp-3 leading-tight">
          {game.title}
        </div>
      ) : (
        /* Hover cover showing trash icon and label instead of name covering it */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Trash2 className="w-4 h-4 text-white drop-shadow" />
          <span className="text-[7px] uppercase font-bold text-white tracking-widest mt-0.5">Quitar</span>
        </div>
      )}
    </div>
  )
}

interface Top10GameItemProps {
  game: Game;
  idx: number;
  handleDragStart: (e: React.DragEvent, gameId: number, source: string) => void;
  returnTop10GameToPool: (index: number) => void;
}

function Top10GameItem({
  game,
  idx,
  handleDragStart,
  returnTop10GameToPool,
}: Top10GameItemProps) {
  const [hasError, setHasError] = useState(false)
  const proxiedUrl = game.image_url ? `https://images.weserv.nl/?url=${encodeURIComponent(game.image_url)}&w=100&h=100&fit=cover` : null

  return (
    <div 
      draggable
      onDragStart={(e) => handleDragStart(e, game.bgg_id, `top10-${idx}`)}
      onClick={(e) => {
        e.stopPropagation()
        returnTop10GameToPool(idx)
      }}
      className="flex-1 flex items-center justify-between min-w-0 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded overflow-hidden border border-white/10 bg-zinc-900 shrink-0 relative flex items-center justify-center">
          {proxiedUrl && !hasError ? (
            <img 
              src={proxiedUrl} 
              alt={game.title} 
              className="w-full h-full object-cover" 
              crossOrigin="anonymous"
              onError={() => setHasError(true)}
            />
          ) : (
            <span className="text-[8px] font-bold text-center text-zinc-400 p-0.5 line-clamp-2 leading-tight">
              {game.title}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-zinc-100 truncate">{game.title}</p>
          <p className="text-xs text-zinc-500">{game.year_published || 'Año desc.'}</p>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/20 transition-all cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          returnTop10GameToPool(idx)
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

interface TopsCanvasProps {
  exportAreaRef: React.RefObject<HTMLDivElement | null>;
  mode: 'tier' | 'top10';
  rankingTitle: string;
  setRankingTitle: (title: string) => void;
  tiers: Tier[];
  top10: (Game | null)[];
  selectedGameForPlacement: Game | null;
  placeInTier: (tierId: string) => void;
  returnTierGameToPool: (tierId: string, game: Game) => void;
  placeInTop10: (index: number) => void;
  returnTop10GameToPool: (index: number) => void;
  editTierName: (tierId: string, newName: string) => void;
  handleDragStart: (e: React.DragEvent, gameId: number, source: string) => void;
  handleDropOnTier: (tierId: string, draggedBggId: number, source: string) => void;
  handleDropOnTop10: (targetIdx: number, draggedBggId: number, source: string) => void;
  handleExportImage: () => void;
  exporting: boolean;
  pool: Game[];
}

export function TopsCanvas({
  exportAreaRef,
  mode,
  rankingTitle,
  setRankingTitle,
  tiers,
  top10,
  selectedGameForPlacement,
  placeInTier,
  returnTierGameToPool,
  placeInTop10,
  returnTop10GameToPool,
  editTierName,
  handleDragStart,
  handleDropOnTier,
  handleDropOnTop10,
  handleExportImage,
  exporting,
  pool,
}: TopsCanvasProps) {
  const hasGames = mode === 'tier'
    ? tiers.some(t => t.games.length > 0)
    : top10.some(g => g !== null)

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground/80 flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" /> Diseña tu lista
        </h2>
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <div className="hidden sm:flex text-xs text-muted-foreground items-center gap-1">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Arrastra o haz clic para colocar</span>
          </div>
          <Button
            size="sm"
            onClick={handleExportImage}
            disabled={exporting || !hasGames}
            className="font-bold shadow-md shadow-primary/10 transition-all hover:shadow-primary/20 flex items-center gap-1.5 cursor-pointer h-9 px-3 text-xs"
          >
            {exporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Imagen</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Exportable Area */}
      <div 
        ref={exportAreaRef} 
        id="export-ranking-area" 
        className="border border-primary/20 rounded-2xl p-6 bg-gradient-to-br from-[#141b29] via-[#0e121b] to-[#0a362e] shadow-2xl relative overflow-hidden space-y-6 flex flex-col justify-between min-h-[420px]"
      >
        {/* Ambient Background decoration inside image */}
        <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-gradient-to-br from-primary/20 to-teal-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-teal-500/20 to-emerald-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Header Branding info inside Image */}
        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3.5">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={rankingTitle}
              onChange={(e) => setRankingTitle(e.target.value)}
              placeholder="Dale un título a tu ranking..."
              className="text-xl font-extrabold tracking-tight text-white border-b-2 border-transparent hover:border-b-white/10 focus:border-b-primary focus:ring-0 focus:outline-none bg-transparent px-2 py-1 w-full transition-colors truncate rounded-none"
            />
          </div>
          <p className="text-xs font-extrabold text-primary tracking-widest uppercase flex items-center gap-1.5 drop-shadow-sm shrink-0 select-none">
            <Trophy className="w-3.5 h-3.5 text-primary" /> boardgamesocial.app
          </p>
        </div>

        {/* Content Renders based on Mode */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {mode === 'tier' ? (
              <motion.div 
                key="tier-view" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 bg-zinc-800/90 shadow-2xl"
              >
                {tiers.map((tier) => (
                  <div key={tier.id} className="flex min-h-[96px]">
                    
                    {/* Tier Label Box */}
                    <div className={`w-24 sm:w-28 flex flex-col items-center justify-center p-3 text-center border-r border-white/10 select-none ${tier.color} shrink-0`}>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => editTierName(tier.id, e.target.value)}
                        className="w-full text-center font-extrabold text-sm sm:text-base bg-transparent border-0 focus:ring-0 p-0 text-inherit placeholder-current/40 uppercase tracking-wider"
                      />
                    </div>

                    {/* Tier Content Drop Zone */}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const draggedBggId = Number(e.dataTransfer.getData('text/plain'))
                        const source = e.dataTransfer.getData('source')
                        handleDropOnTier(tier.id, draggedBggId, source)
                      }}
                      className="flex-1 p-3 flex flex-wrap gap-2.5 items-center transition-colors"
                    >
                      {tier.games.length === 0 ? (
                        selectedGameForPlacement ? (
                          <button
                            onClick={() => placeInTier(tier.id)}
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-primary cursor-pointer animate-pulse shrink-0"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        ) : null
                      ) : (
                        <>
                          {tier.games.map((g) => (
                            <TierGameItem
                              key={g.bgg_id}
                              game={g}
                              tierId={tier.id}
                              handleDragStart={handleDragStart}
                              returnTierGameToPool={returnTierGameToPool}
                            />
                          ))}
                          {selectedGameForPlacement && (
                            <button
                              onClick={() => placeInTier(tier.id)}
                              className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 flex items-center justify-center text-primary cursor-pointer animate-pulse shrink-0"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="top10-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {top10.map((game, idx) => {
                  const isPlaceable = !!selectedGameForPlacement
                  return (
                    <div 
                      key={idx}
                      onClick={() => isPlaceable && placeInTop10(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const draggedBggId = Number(e.dataTransfer.getData('text/plain'))
                        const source = e.dataTransfer.getData('source')
                        handleDropOnTop10(idx, draggedBggId, source)
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        game 
                          ? isPlaceable
                            ? 'bg-emerald-950/25 border-dashed border-primary/50 hover:bg-primary/10 cursor-pointer group animate-pulse'
                            : 'bg-white/5 border-white/10 hover:border-destructive hover:bg-destructive/10 cursor-pointer group' 
                          : isPlaceable
                            ? 'border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 cursor-pointer animate-pulse'
                            : 'border-white/5 bg-white/5'
                      }`}
                    >
                      {/* Number badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm border ${
                        game 
                          ? 'bg-primary/20 border-primary/30 text-primary' 
                          : isPlaceable 
                            ? 'bg-primary/20 border-primary/30 text-primary' 
                            : 'bg-black/40 border-white/5 text-zinc-400'
                      }`}>
                        {idx + 1}
                      </div>

                      {/* Cover / Placeholder */}
                      {game ? (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <Top10GameItem
                            game={game}
                            idx={idx}
                            handleDragStart={handleDragStart}
                            returnTop10GameToPool={returnTop10GameToPool}
                          />
                          {isPlaceable && (
                            <span className="text-[10px] font-extrabold text-primary uppercase mr-2 tracking-wider animate-pulse shrink-0">
                              Reemplazar
                            </span>
                          )}
                        </div>
                      ) : (
                        isPlaceable && (
                          <div className="text-xs font-medium select-none flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5 text-primary shrink-0" />
                          </div>
                        )
                      )}
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom branding footer */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-[10px] text-zinc-300 select-none">
          <span>Abre tu mesa en Boardgame Social</span>
          <span className="font-extrabold text-white">#BoardgameSocial</span>
        </div>

      </div>
    </div>
  )
}
