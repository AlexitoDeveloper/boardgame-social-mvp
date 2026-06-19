import { Search as SearchIcon, Globe, Users, Brain, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

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

  const clearFilters = () => {
    onSearchChange('')
    onPlayerFilterChange('')
    onComplexityFilterChange('')
    onSpanishOnlyChange(false)
  }

  return (
    <div className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/20 py-4 mb-6 space-y-4">
      {/* Search Input Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título de juego..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/40 hover:bg-muted/65 focus:bg-background border border-border/40 focus:border-primary rounded-xl text-sm transition-all outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-destructive/40 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer font-bold shrink-0 self-end md:self-center"
            >
              Limpiar Filtros
              <X className="h-3 w-3" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
        {/* Player filter pills */}
        <div className="flex items-center gap-2 bg-muted/20 border border-border/30 rounded-xl p-1 shrink-0">
          <span className="text-muted-foreground px-2 flex items-center gap-1 shrink-0">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>Jugadores:</span>
          </span>
          <div className="flex gap-1">
            {['', '1', '2', '3-4', '5+'].map((val) => (
              <button
                key={val}
                onClick={() => onPlayerFilterChange(val)}
                className={cn(
                  'px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-200 select-none font-bold',
                  playerFilter === val
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-black'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {val === '' ? 'Todos' : val}
              </button>
            ))}
          </div>
        </div>

        {/* Complexity filter pills */}
        <div className="flex items-center gap-2 bg-muted/20 border border-border/30 rounded-xl p-1 shrink-0">
          <span className="text-muted-foreground px-2 flex items-center gap-1 shrink-0">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span>Peso/Complejidad:</span>
          </span>
          <div className="flex gap-1">
            {[
              { key: '', label: 'Todos' },
              { key: 'familiar', label: 'Familiar (≤2.2)' },
              { key: 'medio', label: 'Medio (2.2-3.5)' },
              { key: 'experto', label: 'Experto (>3.5)' }
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => onComplexityFilterChange(opt.key)}
                className={cn(
                  'px-2.5 py-1 rounded-lg cursor-pointer transition-all duration-200 select-none font-bold',
                  complexityFilter === opt.key
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-black'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spanish Toggle */}
        <button
          onClick={() => onSpanishOnlyChange(!spanishOnly)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer font-bold select-none text-xs',
            spanishOnly
              ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/5'
              : 'border-border/40 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
          )}
        >
          <Globe className={cn('h-3.5 w-3.5 transition-transform duration-300', spanishOnly && 'rotate-12')} />
          <span>Solo en Español</span>
        </button>
      </div>
    </div>
  )
}
export default ExploreHeader;
