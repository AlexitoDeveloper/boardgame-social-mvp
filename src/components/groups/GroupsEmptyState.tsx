import { FC } from 'react'
import { Users, Plus, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

interface GroupsEmptyStateProps {
  onJoinClick: () => void
  onCreateClick: () => void
}

export const GroupsEmptyState: FC<GroupsEmptyStateProps> = ({
  onJoinClick,
  onCreateClick,
}) => {
  const { t } = useTranslation()

  return (
    <div className="text-center py-16 px-6 border border-border/50 rounded-3xl bg-card/50 max-w-lg mx-auto space-y-5 shadow-xs">
      <div
        aria-hidden="true"
        className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs"
      >
        <Users className="h-8 w-8" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-foreground font-black text-xl font-display tracking-tight">
          {t('groups.noGroupsTitle')}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {t('groups.noGroupsDesc')}
        </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
        <Button
          onClick={onJoinClick}
          variant="outline"
          className="cursor-pointer font-bold rounded-xl h-10 px-4 border-border/60 hover:bg-muted/60"
        >
          <QrCode className="h-4 w-4 mr-1.5 text-muted-foreground" aria-hidden="true" />
          <span>{t('groups.joinWithCode')}</span>
        </Button>
        <Button
          onClick={onCreateClick}
          className="cursor-pointer font-bold rounded-xl h-10 px-4 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          <span>{t('groups.createFirstGroup')}</span>
        </Button>
      </div>
    </div>
  )
}
