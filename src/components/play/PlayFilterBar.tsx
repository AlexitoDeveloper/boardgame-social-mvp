import { FC, useMemo } from 'react'
import { Users, Clock, RotateCcw, Brain, SlidersHorizontal } from 'lucide-react'
import { FilterChip } from '../ui/chip'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'
import { ComplexityLevel } from '../../hooks/usePlayDecisionEngine'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion'

interface PlayFilterBarProps {
  selectedPlayers: number | null
  onSelectPlayers: (players: number | null) => void
  selectedDuration: string
  onSelectDuration: (duration: string) => void
  selectedComplexity: ComplexityLevel
  onSelectComplexity: (complexity: ComplexityLevel) => void
  onResetFilters: () => void
  hasActiveFilters: boolean
}

export const PlayFilterBar: FC<PlayFilterBarProps> = ({
  selectedPlayers,
  onSelectPlayers,
  selectedDuration,
  onSelectDuration,
  selectedComplexity,
  onSelectComplexity,
  onResetFilters,
  hasActiveFilters,
}) => {
  const { t } = useTranslation()

  const playerOptions = [1, 2, 3, 4, 5, 6]
  const durationOptions = [
    { id: 'any', label: t('play.anyTime'), ariaLabel: t('play.filters.durationAnyAria') },
    { id: 'quick', label: t('play.quickTime'), ariaLabel: t('play.filters.durationQuickAria') },
    { id: 'medium', label: t('play.mediumTime'), ariaLabel: t('play.filters.durationMediumAria') },
    { id: 'long', label: t('play.longTime'), ariaLabel: t('play.filters.durationLongAria') },
    { id: 'afternoon', label: '120+ min', ariaLabel: t('play.filters.durationAfternoonAria') },
  ]

  const complexityOptions: Array<{ id: ComplexityLevel; label: string; shortLabel: string; ariaLabel: string }> = [
    { id: 'any', label: t('play.filters.complexityAll'), shortLabel: t('play.filters.complexityAll'), ariaLabel: t('play.filters.complexityAllAria') },
    { id: 'light', label: t('play.filters.complexityLight'), shortLabel: t('play.filters.complexityLightShort'), ariaLabel: t('play.filters.complexityLightAria') },
    { id: 'medium', label: t('play.filters.complexityMedium'), shortLabel: t('play.filters.complexityMediumShort'), ariaLabel: t('play.filters.complexityMediumAria') },
    { id: 'heavy', label: t('play.filters.complexityHeavy'), shortLabel: t('play.filters.complexityHeavyShort'), ariaLabel: t('play.filters.complexityHeavyAria') },
  ]

  // Dynamic summary pill shown when accordion is collapsed
  const activeSummary = useMemo(() => {
    if (!hasActiveFilters) return t('play.filters.allLibrary')

    const parts: string[] = []
    if (selectedPlayers !== null) {
      parts.push(selectedPlayers === 1 ? t('play.filters.onePlayer') : selectedPlayers === 6 ? t('play.filters.sixPlusPlayers') : t('play.filters.playersCount', { count: selectedPlayers }))
    }
    if (selectedDuration !== 'any') {
      const d = durationOptions.find(opt => opt.id === selectedDuration)
      if (d) parts.push(d.label)
    }
    if (selectedComplexity !== 'any') {
      const c = complexityOptions.find(opt => opt.id === selectedComplexity)
      if (c) parts.push(c.shortLabel)
    }

    return parts.join(' • ')
  }, [hasActiveFilters, selectedPlayers, selectedDuration, selectedComplexity, t])

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={hasActiveFilters ? 'filters' : undefined}
      className="w-full relative z-10"
    >
      <AccordionItem
        value="filters"
        className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md overflow-hidden shadow-xs"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/20 transition-colors">
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            </div>

            <div className="flex flex-col text-left min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {t('play.filters.title')}
                </span>
                {hasActiveFilters && (
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-black uppercase font-mono-tabular">
                    {t('play.filters.activeBadge')}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate font-medium">
                {activeSummary}
              </span>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-4 pt-2 pb-4 space-y-4 border-t border-border/20">
          {/* Header Action inside expanded view */}
          {hasActiveFilters && (
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                aria-label={t('play.filters.resetAria')}
                className="text-xs font-bold text-muted-foreground hover:text-foreground h-7 px-2.5 rounded-lg flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('play.filters.reset')}</span>
              </Button>
            </div>
          )}

          {/* 1. Players Filter Group */}
          <div role="group" aria-labelledby="filter-players-label" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span id="filter-players-label" className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>{t('play.filters.playersHeading')}</span>
              </span>
              {selectedPlayers !== null && (
                <span className="font-semibold text-primary font-mono-tabular">
                  {selectedPlayers === 1
                    ? t('play.filters.onePlayer')
                    : selectedPlayers === 6
                    ? t('play.filters.sixPlusPlayersFull')
                    : t('play.filters.playersCountFull', { count: selectedPlayers })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar touch-pan-x">
              <FilterChip
                selected={selectedPlayers === null}
                size="default"
                onClick={() => onSelectPlayers(null)}
                aria-label={t('play.filters.allPlayersAria')}
                className="h-9 min-w-[48px] px-3.5 text-xs font-bold shrink-0 touch-manipulation"
              >
                <span>{t('play.filters.allPlayers')}</span>
              </FilterChip>

              {playerOptions.map((count) => {
                const isSelected = selectedPlayers === count
                const label = count === 1 ? '1' : count === 6 ? '6+' : String(count)
                const aria = count === 1 ? t('play.filters.soloAria') : count === 6 ? t('play.filters.sixPlusAria') : t('play.filters.playersAria', { count })
                return (
                  <FilterChip
                    key={count}
                    selected={isSelected}
                    size="default"
                    onClick={() => onSelectPlayers(isSelected ? null : count)}
                    aria-label={aria}
                    className="h-9 min-w-[48px] px-3 text-xs font-bold shrink-0 font-mono-tabular touch-manipulation"
                  >
                    <span>{label}</span>
                  </FilterChip>
                )
              })}
            </div>
          </div>

          {/* 2. Duration Filter Group */}
          <div role="group" aria-labelledby="filter-duration-label" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span id="filter-duration-label" className="font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>{t('play.filters.durationHeading')}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar touch-pan-x">
              {durationOptions.map((opt) => (
                <FilterChip
                  key={opt.id}
                  selected={selectedDuration === opt.id}
                  size="default"
                  onClick={() => onSelectDuration(opt.id)}
                  aria-label={opt.ariaLabel}
                  className="h-9 min-w-[48px] px-3.5 text-xs font-bold shrink-0 font-mono-tabular touch-manipulation"
                >
                  <span>{opt.label}</span>
                </FilterChip>
              ))}
            </div>
          </div>

          {/* 3. Complexity Filter Group */}
          <div role="group" aria-labelledby="filter-complexity-label" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span id="filter-complexity-label" className="font-bold text-foreground flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>{t('play.filters.complexityHeading')}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar touch-pan-x">
              {complexityOptions.map((opt) => (
                <FilterChip
                  key={opt.id}
                  selected={selectedComplexity === opt.id}
                  size="default"
                  onClick={() => onSelectComplexity(opt.id)}
                  aria-label={opt.ariaLabel}
                  className="h-9 min-w-[48px] px-3.5 text-xs font-bold shrink-0 font-mono-tabular touch-manipulation"
                >
                  <span>{opt.label}</span>
                </FilterChip>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
