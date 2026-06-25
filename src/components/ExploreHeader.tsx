import { useState, useEffect } from 'react'
import { Search as SearchIcon, Globe, Users, Brain, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useTranslation } from 'react-i18next'

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
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder={t('explore.searchPlaceholder')}
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
                  className="h-9 sm:h-9 rounded-xl font-bold cursor-pointer text-xs px-3 flex items-center gap-1.5"
                >
                  <span className="hidden xs:inline">{t('explore.clear')}</span>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={() => setShowFilters(v => !v)}
            variant={showFilters || activeFiltersCount > 0 ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer shrink-0 flex items-center gap-1.5 h-9"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('explore.filters')}</span>
            {activeFiltersCount > 0 && (
              <span className={cn(
                "text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border border-primary/10",
                showFilters || activeFiltersCount > 0
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary text-primary-foreground"
              )}>
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
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 text-xs">
              {/* Player filter group */}
              <div className="flex flex-col gap-1.5 bg-muted/20 border border-border/30 rounded-2xl p-2.5 flex-1 w-full sm:min-w-[280px] min-w-0">
                <span className="text-muted-foreground px-1 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider select-none">
                  <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{t('explore.playersFilter')}</span>
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
                      {val === '' ? t('explore.all') : val}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Complexity filter group */}
              <div className="flex flex-col gap-1.5 bg-muted/20 border border-border/30 rounded-2xl p-2.5 flex-1 w-full sm:min-w-[280px] min-w-0">
                <span className="text-muted-foreground px-1 flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider select-none">
                  <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{t('explore.complexityFilter')}</span>
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { key: '', label: t('explore.all') },
                    { key: 'familiar', label: t('explore.familiar') },
                    { key: 'medio', label: t('explore.medium') },
                    { key: 'experto', label: t('explore.expert') }
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
                  <span>{t('explore.spanishOnly')}</span>
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
