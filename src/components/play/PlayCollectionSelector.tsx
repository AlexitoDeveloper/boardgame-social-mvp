import { FC } from 'react'
import { Dices, Download, PackageCheck } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { FilterChip } from '../ui/chip'
import { Skeleton } from '../ui/skeleton'
import { useTranslation } from 'react-i18next'

interface PlayCollectionSelectorProps {
  selectedGroupId: string
  onSelectGroupId: (id: string) => void
  groups: Array<{ id: string; name: string; member_count?: number }>
  loadingGames: boolean
  filteredCount: number
  onOpenSyncModal: () => void
  onlyUnplayed: boolean
  onToggleOnlyUnplayed: () => void
}

export const PlayCollectionSelector: FC<PlayCollectionSelectorProps> = ({
  selectedGroupId,
  onSelectGroupId,
  groups,
  loadingGames,
  filteredCount,
  onOpenSyncModal,
  onlyUnplayed,
  onToggleOnlyUnplayed,
}) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-3 relative z-10">
      {/* Collection Source Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Dices className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
          <span>{t('play.groupFilterLabel')}</span>
        </label>

        <Select value={selectedGroupId} onValueChange={onSelectGroupId}>
          <SelectTrigger className="w-full h-11 rounded-2xl border border-input bg-card/90 px-3.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs">
            <SelectValue placeholder={t('play.allMyGames')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">{t('play.allMyGames')}</SelectItem>
            {groups.map((grp) => (
              <SelectItem key={grp.id} value={grp.id}>
                {grp.name} ({grp.member_count || 1})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-between pt-1">
          {loadingGames ? (
            <Skeleton className="h-4 w-28 rounded-md" />
          ) : (
            <p className="text-xs text-muted-foreground font-semibold font-mono-tabular">
              {filteredCount === 1 ? t('play.oneGameAvailable') : t('play.gamesAvailable', { count: filteredCount })}
            </p>
          )}

          {selectedGroupId === 'personal' && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onOpenSyncModal}
              className="h-7 px-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>{t('profile.collection.syncButton')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Shelf of Shame Toggle */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/20">
        <FilterChip
          selected={onlyUnplayed}
          size="default"
          onClick={onToggleOnlyUnplayed}
          icon={PackageCheck}
          badge={
            onlyUnplayed ? (
              <span className="px-1.5 py-0.5 rounded-md bg-purple-500/25 text-purple-700 dark:text-purple-300 text-xs font-black uppercase">
                {t('play.active')}
              </span>
            ) : undefined
          }
          className="h-10 px-3.5"
        >
          <span>{t('play.shelfOfShame')}</span>
        </FilterChip>

        <p className="text-xs text-muted-foreground font-medium">
          {onlyUnplayed
            ? t('play.unplayedFilterActive')
            : t('play.allLibraryIncluded')}
        </p>
      </div>
    </div>
  )
}
