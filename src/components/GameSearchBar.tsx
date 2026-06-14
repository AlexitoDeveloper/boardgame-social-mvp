import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Check, X } from 'lucide-react'
import { Command, CommandInput, CommandList, CommandItem } from './ui/command'
import { useClickOutside } from '../hooks/useClickOutside'
import { Game } from '../types'

const MotionDiv = motion.div;

interface GameSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  games: Game[];
  setGames: (games: Game[]) => void;
  isSearching: boolean;
  onSelectGame: (game: Game) => void;
  placeholder?: string;
  isGameDisabled?: (game: Game) => boolean;
  closeOnSelect?: boolean;
  onSearchBgg?: () => void;
  isShowingBggResults?: boolean;
  isImporting?: boolean;
}

export function GameSearchBar({
  searchQuery,
  setSearchQuery,
  games,
  setGames,
  isSearching,
  onSelectGame,
  placeholder = "Buscar juego...",
  isGameDisabled,
  closeOnSelect = true,
  onSearchBgg,
  isShowingBggResults = false,
  isImporting = false
}: GameSearchBarProps) {
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    searchContainerRef,
    () => setGames([]),
    games.length > 0
  )

  return (
    <div ref={searchContainerRef} className="relative z-20 w-full">
      <Command shouldFilter={false} className="overflow-visible bg-transparent border-0 shadow-none">
        <div className="relative border border-border/50 rounded-xl bg-background/50 overflow-hidden flex items-center pr-3">
          <div className="flex-1">
            <CommandInput 
              placeholder={isImporting ? "Importando juego..." : placeholder} 
              value={searchQuery}
              onValueChange={setSearchQuery}
              disabled={isImporting}
              className="h-10 text-xs border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground bg-transparent w-full"
            />
          </div>
          {(isSearching || isImporting) && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0 mr-1.5" />
          )}
          {searchQuery && !isImporting && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setGames([])
              }}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {(games.length > 0 || (onSearchBgg && !isShowingBggResults && searchQuery.trim().length > 0)) && (
            <MotionDiv 
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 left-0 right-0 top-full mt-1.5 w-full shadow-2xl"
            >
              <div className="border border-border bg-card rounded-xl overflow-hidden shadow-2xl">
                <CommandList className="max-h-72 custom-scrollbar divide-y divide-border/40">
                  {games.map(g => {
                    const isDisabled = isGameDisabled ? isGameDisabled(g) : false
                    return (
                      <CommandItem 
                        key={g.bgg_id} 
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors text-foreground hover:bg-muted hover:text-foreground data-[selected=true]:bg-muted data-[selected=true]:text-foreground ${
                          isDisabled ? 'opacity-50 cursor-default bg-emerald-500/5 hover:bg-emerald-500/5' : ''
                        }`}
                        onSelect={() => {
                          if (!isDisabled && !isImporting) {
                            onSelectGame(g)
                            if (closeOnSelect) {
                              setGames([]) // Clear list to close dropdown
                            }
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 pointer-events-none min-w-0 flex-1">
                          {g.image_url ? (
                            <img src={g.image_url} alt={g.title} className="w-10 h-10 rounded object-cover shadow-sm shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted/60 flex items-center justify-center text-xs font-extrabold text-muted-foreground shrink-0">?</div>
                          )}
                          <span className="font-semibold text-sm text-left truncate block">
                            {g.title} 
                            <span className="text-xs font-normal text-muted-foreground block mt-0.5">
                              {g.year_published || g.year || 'Año desc.'}
                              {g.is_expansion && (
                                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-black uppercase text-purple-500 bg-purple-500/10 border border-purple-500/20 rounded-md">
                                  Expansión
                                </span>
                              )}
                              {g.isFromBgg && (
                                <span className="ml-2 px-1.5 py-0.5 text-[9px] font-black uppercase text-primary bg-primary/10 border border-primary/20 rounded-md">
                                  BGG
                                </span>
                              )}
                            </span>
                          </span>
                        </div>
                        {isDisabled && (
                          <div className="text-emerald-400 shrink-0 select-none mr-2 pointer-events-none">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </CommandItem>
                    )
                  })}
                  
                  {onSearchBgg && !isShowingBggResults && searchQuery.trim().length > 0 && (
                    <CommandItem
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-primary/10 text-primary hover:text-primary-foreground font-bold data-[selected=true]:bg-primary/10"
                      onSelect={() => {
                        if (!isImporting) {
                          onSearchBgg();
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold text-sm">
                          🔍
                        </div>
                        <span className="text-xs text-left truncate block font-extrabold text-primary">
                          ¿No encuentras el juego?
                          <span className="text-muted-foreground font-normal block mt-0.5">
                            Buscar "{searchQuery}" en BoardGameGeek
                          </span>
                        </span>
                      </div>
                    </CommandItem>
                  )}
                </CommandList>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      </Command>
    </div>
  )
}

export default GameSearchBar;
