import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Check } from 'lucide-react'
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
}

export function GameSearchBar({
  searchQuery,
  setSearchQuery,
  games,
  setGames,
  isSearching,
  onSelectGame,
  placeholder = "Buscar juego...",
  isGameDisabled
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
              placeholder={placeholder} 
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-10 text-xs border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground bg-transparent w-full"
            />
          </div>
          {isSearching && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground shrink-0" />
          )}
        </div>

        <AnimatePresence>
          {games.length > 0 && (
            <MotionDiv 
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-50 left-0 right-0 top-full mt-1.5 w-full shadow-2xl"
            >
              <div className="border border-border bg-card rounded-xl overflow-hidden shadow-2xl">
                <CommandList className="max-h-56 custom-scrollbar divide-y divide-border/40">
                  {games.map(g => {
                    const isDisabled = isGameDisabled ? isGameDisabled(g) : false
                    return (
                      <CommandItem 
                        key={g.bgg_id} 
                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors text-foreground hover:bg-muted hover:text-foreground data-[selected=true]:bg-muted data-[selected=true]:text-foreground ${
                          isDisabled ? 'opacity-50 cursor-default bg-emerald-500/5 hover:bg-emerald-500/5' : ''
                        }`}
                        onSelect={() => {
                          if (!isDisabled) {
                            onSelectGame(g)
                            setGames([]) // Clear list to close dropdown
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
                              {g.year_published || 'Año desc.'}
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
