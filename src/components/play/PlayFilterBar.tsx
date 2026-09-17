import { FC } from 'react'
import { Users, Clock, RotateCcw } from 'lucide-react'
import { FilterChip } from '../ui/chip'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'

interface PlayFilterBarProps {
  selectedPlayers: number | null
  onSelectPlayers: (players: number | null) => void
  selectedDuration: string
  onSelectDuration: (duration: string) => void
  onResetFilters: () => void
  hasActiveFilters: boolean
}

export const PlayFilterBar: FC<PlayFilterBarProps> = ({
  selectedPlayers,
  onSelectPlayers,
  selectedDuration,
  onSelectDuration,
  onResetFilters,
  hasActiveFilters,
}) => {
  const { t } = useTranslation()

  const playerOptions = [2, 3, 4, 5, 6]
  const durationOptions = [
    { id: 'any', label: t('play.anyTime') },
    { id: 'quick', label: t('play.quickTime') },
    { id: 'medium', label: t('play.mediumTime') },
    { id: 'long', label: t('play.longTime') },
    { id: 'afternoon', label: t('play.afternoonTime', 'Tarde entera (120m+)') },
  ]

  return (
    <div className="space-y-4 relative z-10">
      {/* Player Count Filter Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            <span>{t('play.playersLabel')}</span>
          </label>
          {selectedPlayers !== null && (
            <span className="text-xs font-semibold text-primary font-mono-tabular">
              {selectedPlayers === 6 ? '6+ jugadores' : `${selectedPlayers} jugadores`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none touch-pan-x">
          <FilterChip
            selected={selectedPlayers === null}
            size="default"
            onClick={() => onSelectPlayers(null)}
            className="min-w-[48px] h-10 px-3 shrink-0"
          >
            <span>{t('play.anyTime', 'Todos')}</span>
          </FilterChip>

          {playerOptions.map((count) => {
            const isSelected = selectedPlayers === count
            const label = count === 6 ? '6+' : String(count)
            return (
              <FilterChip
                key={count}
                selected={isSelected}
                size="default"
                onClick={() => onSelectPlayers(isSelected ? null : count)}
                className="min-w-[48px] h-10 px-3.5 shrink-0 font-mono-tabular"
              >
                <span>{label} {label === '6+' ? 'jug' : 'jug.'}</span>
              </FilterChip>
            )
          })}
        </div>
      </div>

      {/* Duration Filter Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
            <span>{t('play.durationLabel')}</span>
          </label>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onResetFilters}
              className="text-xs font-bold text-muted-foreground hover:text-foreground h-6 px-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>{t('ranking.reset', 'Reiniciar')}</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none touch-pan-x">
          {durationOptions.map((opt) => (
            <FilterChip
              key={opt.id}
              selected={selectedDuration === opt.id}
              size="default"
              onClick={() => onSelectDuration(opt.id)}
              className="h-10 px-3.5 shrink-0 font-mono-tabular"
            >
              <span>{opt.label}</span>
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  )
}
