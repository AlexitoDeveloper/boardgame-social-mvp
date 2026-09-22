import { ArrowLeft, Edit, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

interface ProfileHeaderProps {
  isOwnProfile: boolean;
  isOwnProfileEditable: boolean;
  onEditClick: () => void;
  onSettingsClick: () => void;
}

export function ProfileHeader({
  isOwnProfile,
  isOwnProfileEditable,
  onEditClick,
  onSettingsClick,
}: ProfileHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="sticky top-[-2px] pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 z-30 flex items-center justify-between -mx-4 px-4 md:-mx-8 md:px-8 bg-background/85 backdrop-blur-md border-b border-border/20">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        icon={ArrowLeft}
        label={t('profile.back')}
        className="cursor-pointer"
      />
      <div className="flex items-center gap-2">
        {isOwnProfileEditable && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEditClick}
            icon={Edit}
            label={t('profile.editData')}
            className="cursor-pointer text-foreground"
          />
        )}
        {isOwnProfile && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSettingsClick}
            icon={Settings}
            aria-label={t('profile.settings', 'Ajustes y preferencias')}
            className="cursor-pointer text-foreground"
          />
        )}
      </div>
    </header>
  )
}
