import { Users, Brain, Globe } from 'lucide-react'
import { FilterChip } from '../ui/chip'
import { useTranslation } from 'react-i18next'

interface ExploreFilterDrawerProps {
  playerFilter: string;
  onPlayerFilterChange: (val: string) => void;
  complexityFilter: string;
  onComplexityFilterChange: (val: string) => void;
  spanishOnly: boolean;
  onSpanishOnlyChange: (val: boolean) => void;
}

export function ExploreFilterDrawer({
  playerFilter,
  onPlayerFilterChange,
  complexityFilter,
  onComplexityFilterChange,
  spanishOnly,
  onSpanishOnlyChange,
}: ExploreFilterDrawerProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 text-xs">
      {/* Player filter group */}
      <div className="flex flex-col gap-1.5 bg-muted/20 border border-border/30 rounded-2xl p-2.5 flex-1 w-full sm:min-w-[280px] min-w-0">
        <span className="text-muted-foreground px-1 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider select-none">
          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>{t('explore.playersFilter')}</span>
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {['', '1', '2', '3-4', '5+'].map((val) => (
            <FilterChip
              key={val}
              onClick={() => onPlayerFilterChange(val)}
              selected={playerFilter === val}
              size="default"
              className="w-full min-h-[44px] sm:min-h-[40px] text-xs cursor-pointer"
            >
              {val === '' ? t('explore.all') : val}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Complexity filter group with semantic colors */}
      <div className="flex flex-col gap-1.5 bg-muted/20 border border-border/30 rounded-2xl p-2.5 flex-1 w-full sm:min-w-[280px] min-w-0">
        <span className="text-muted-foreground px-1 flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider select-none">
          <Brain className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>{t('explore.complexityFilter')}</span>
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { key: '', label: t('explore.all') },
            { key: 'familiar', label: t('explore.familiar') },
            { key: 'medio', label: t('explore.medium') },
            { key: 'experto', label: t('explore.expert') },
          ].map((opt) => (
            <FilterChip
              key={opt.key}
              onClick={() => onComplexityFilterChange(opt.key)}
              selected={complexityFilter === opt.key}
              size="default"
              className="w-full min-h-[44px] sm:min-h-[40px] text-xs cursor-pointer"
            >
              {opt.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Spanish Toggle */}
      <div className="flex-1 sm:flex-initial w-full sm:min-w-0 flex items-end min-w-0">
        <FilterChip
          onClick={() => onSpanishOnlyChange(!spanishOnly)}
          selected={spanishOnly}
          size="default"
          icon={Globe}
          className="w-full sm:w-auto h-12 sm:h-11 px-4 min-h-[48px] sm:min-h-[44px] cursor-pointer"
        >
          <span>{t('explore.spanishOnly')}</span>
        </FilterChip>
      </div>
    </div>
  )
}

export default ExploreFilterDrawer;
