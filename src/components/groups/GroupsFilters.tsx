import { FC } from 'react'
import { Search, X, Layers, ShieldCheck, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Chip } from '../ui/chip'

export type GroupFilterMode = 'all' | 'created' | 'large'

interface GroupsFiltersProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  filterMode: GroupFilterMode
  onFilterChange: (mode: GroupFilterMode) => void
  totalFiltered: number
}

export const GroupsFilters: FC<GroupsFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterMode,
  onFilterChange,
  totalFiltered,
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label={t('groups.searchPlaceholder', 'Buscar grupo por nombre o descripción...')}
          placeholder={t('groups.searchPlaceholder', 'Buscar grupo por nombre o descripción...')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-9 h-10 rounded-xl bg-card/60 border-border/50 focus:bg-card transition-colors"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-muted text-muted-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <Chip
          size="sm"
          selected={filterMode === 'all'}
          onClick={() => onFilterChange('all')}
          icon={Layers}
          badge={<span className="text-xs opacity-75 font-mono-tabular">{totalFiltered}</span>}
        >
          Todos
        </Chip>

        <Chip
          size="sm"
          selected={filterMode === 'created'}
          onClick={() => onFilterChange('created')}
          icon={ShieldCheck}
        >
          Mis Grupos
        </Chip>

        <Chip
          size="sm"
          selected={filterMode === 'large'}
          onClick={() => onFilterChange('large')}
          icon={Users}
        >
          Más de 3 miembros
        </Chip>
      </div>
    </div>
  )
}
