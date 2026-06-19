import { useState, useEffect } from 'react'
import { Search as SearchIcon, Globe, Users, Brain, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface ExploreHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  playerFilter: string;
  onPlayerFilterChange: (val: string) => void;
  complexityFilter: string;
  onComplexityFilterChange: (val: string) => void;
  spanishOnly: boolean;
  onSpanishOnlyChange: (val: boolean) => void;
}

export function ExploreHeader({
  search,
  onSearchChange,
  playerFilter,
  onPlayerFilterChange,
  complexityFilter,
  onComplexityFilterChange,
  spanishOnly,
  onSpanishOnlyChange,
}: ExploreHeaderProps) {
  const hasActiveFilters = search || playerFilter || complexityFilter || spanishOnly;

  const [isScrolled, setIsScrolled] = useState(false)
  const [showFiltersWhenScrolled, setShowFiltersWhenScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-expand if scrolled back to top
  useEffect(() => {
    if (!isScrolled) {
      setShowFiltersWhenScrolled(false)
    }
  }, [isScrolled])

  const activeFiltersCount = [
    playerFilter ? 1 : 0,
    complexityFilter ? 1 : 0,
    spanishOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = () => {
    onSearchChange('')
    onPlayerFilterChange('')
    onComplexityFilterChange('')
    onSpanishOnlyChange(false)
  }

  const showFilters = !isScrolled || showFiltersWhenScrolled;

  return (
    <div className={cn(
      "sticky top-0 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/20 transition-all duration-300",
      isScrolled ? "py-2 mb-3 shadow-md shadow-black/5" : "py-4 mb-6"
    )}>
      {/* Search Input Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between w-full">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar por título de juego..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <Button
              onClick={() => onSearchChange('')}
              variant="ghost"
              size="icon"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Buttons Row (Clear Filters & Expand Filters Toggles) */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Button
                  onClick={clearFilters}
                  variant="destructive"
                  size="sm"
                  className="h-9 sm:h-9 rounded-xl font-bold cursor-pointer text-xs px-3.5 flex items-center gap-1.5"
                >
                  <span className="hidden xs:inline">Limpiar</span>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {isScrolled && (
            <Button
              onClick={() => setShowFiltersWhenScrolled(v => !v)}
              variant={showFiltersWhenScrolled || activeFiltersCount > 0 ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 h-9 sm:h-9 px-3 border border-border/60 cursor-pointer transition-all"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-foreground text-primary text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border border-primary/10">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Filters Row container with animation */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 text-xs">
        {/* Player filter group */}
        <div className="flex flex-col gap-1.5 bg-muted/20 border border-border/30 rounded-2xl p-2.5 flex-1 w-full sm:min-w-[280px] min-w-0">
          <span className="text-muted-foreground px-1 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider select-none">
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Jugadores</span>
          </span>
          <div className="grid grid-cols-5 gap-1">
            {['', '1', '2', '3-4', '5+'].map((val) => (
              <Button
                key={val}
                onClick={() => onPlayerFilterChange(val)}
                variant={playerFilter === val ? 'default' : 'ghost'}
                size="sm"
                className="w-full h-8 text-[11px] sm:text-xs font-bold rounded-lg px-1 truncate cursor-pointer"
              >
                {val === '' ? 'Todos' : val}
              </Button>
            ))}
          </div>
        </div>

        {/* Complexity filter group */}
        <div className="flex flex-col gap-1.5 bg-muted/20 border border-border/30 rounded-2xl p-2.5 flex-1 w-full sm:min-w-[280px] min-w-0">
          <span className="text-muted-foreground px-1 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider select-none">
            <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Complejidad</span>
          </span>
          <div className="grid grid-cols-4 gap-1">
            {[
              { key: '', label: 'Todos' },
              { key: 'familiar', label: 'Familiar' },
              { key: 'medio', label: 'Medio' },
              { key: 'experto', label: 'Experto' }
            ].map((opt) => (
              <Button
                key={opt.key}
                onClick={() => onComplexityFilterChange(opt.key)}
                variant={complexityFilter === opt.key ? 'default' : 'ghost'}
                size="sm"
                className="w-full h-8 text-[11px] sm:text-xs font-bold rounded-lg px-1 truncate cursor-pointer"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Spanish Toggle */}
        <div className="flex-1 sm:flex-initial w-full sm:min-w-0 flex items-end min-w-0">
          <Button
            onClick={() => onSpanishOnlyChange(!spanishOnly)}
            variant={spanishOnly ? 'default' : 'outline'}
            className={cn(
              'h-11 sm:h-11 flex items-center justify-center gap-1.5 font-bold rounded-2xl w-full sm:w-auto px-4 cursor-pointer text-xs transition-all border border-border/60',
              spanishOnly && 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
            )}
          >
            <Globe className={cn('h-3.5 w-3.5 transition-transform duration-300', spanishOnly && 'rotate-12')} />
            <span>Solo en Español</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
</div>
  )
}
export default ExploreHeader;
