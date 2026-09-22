import { FC } from 'react'
import { Plus, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

interface GroupsHeaderProps {
  onJoinClick: () => void
  onCreateClick: () => void
}

export const GroupsHeader: FC<GroupsHeaderProps> = ({ onJoinClick, onCreateClick }) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-display">
          {t('groups.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('groups.subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          onClick={onJoinClick}
          variant="outline"
          className="cursor-pointer font-bold rounded-xl flex items-center gap-2 h-10 border-border/60 hover:bg-muted/60"
        >
          <QrCode className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>{t('groups.joinWithCode')}</span>
        </Button>

        <Button
          onClick={onCreateClick}
          className="cursor-pointer font-bold rounded-xl flex items-center gap-2 h-10 shadow-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{t('groups.createGroup')}</span>
        </Button>
      </div>
    </div>
  )
}
