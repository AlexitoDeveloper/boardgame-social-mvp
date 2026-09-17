import { useState, useEffect } from 'react'
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useTranslation } from 'react-i18next'
import { ExploreFilterDrawer } from './explore/ExploreFilterDrawer'
import { ExploreHeaderSkeleton } from './explore/ExploreHeaderSkeleton'

export { ExploreHeaderSkeleton }

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
  const { t } = useTranslation()
  const hasActiveFilters = search || playerFilter || complexityFilter || spanishOnly;

  const [isScrolled, setIsScrolled] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <div className={cn(
      "sticky top-[-2px] z-30 w-auto -mx-4 px-4 md:-mx-8 md:px-8 bg-background border-b border-border/20 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-4 transition-shadow duration-200",
      isScrolled && "shadow-md shadow-black/5"
    )}>
      {/* Search Input Row */}
      <div className="flex items-center gap-2.5 w-full">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <SearchIcon 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" 
            strokeWidth={2}
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder={t('explore.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-11 text-sm rounded-xl"
          />
          {search && (
            <Button
              onClick={() => onSearchChange('')}
              variant="ghost"
              size="icon-sm"
              aria-label={t('explore.clearSearch', 'Limpiar búsqueda')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground h-8 w-8 min-h-[32px] min-w-[32px]"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Action Buttons Row */}
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
                  size="default"
                  className="gap-1.5 h-11 px-3.5 rounded-xl"
                  aria-label={t('explore.clear', 'Limpiar filtros')}
                >
                  <span className="hidden xs:inline">{t('explore.clear')}</span>
                  <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={() => setShowFilters(v => !v)}
            variant={showFilters ? 'secondary' : 'outline'}
            size="default"
            className="gap-2 shrink-0 h-11 px-4 rounded-xl"
            aria-label={showFilters ? t('explore.hideFilters', 'Ocultar filtros') : t('explore.filters', 'Filtros')}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span className="hidden sm:inline">{t('explore.filters')}</span>
            {activeFiltersCount > 0 && (
              <span className="text-xs font-black rounded-full h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>
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
            <ExploreFilterDrawer
              playerFilter={playerFilter}
              onPlayerFilterChange={onPlayerFilterChange}
              complexityFilter={complexityFilter}
              onComplexityFilterChange={onComplexityFilterChange}
              spanishOnly={spanishOnly}
              onSpanishOnlyChange={onSpanishOnlyChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExploreHeader;
