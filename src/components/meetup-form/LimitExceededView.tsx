import { useNavigate } from 'react-router-dom'
import { Laptop } from 'lucide-react'
import { Button } from '../ui/button'
import { PremiumUpgradeModal } from '../PremiumUpgradeModal'
import { useTranslation } from 'react-i18next'

interface LimitExceededViewProps {
  limit: number
  isPremiumUser: boolean
  isUpgradeModalOpen: boolean
  setIsUpgradeModalOpen: (open: boolean) => void
  setIsPremiumUser: (premium: boolean) => void
}

export function LimitExceededView({
  limit,
  isPremiumUser,
  isUpgradeModalOpen,
  setIsUpgradeModalOpen,
  setIsPremiumUser
}: LimitExceededViewProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="text-center py-10 px-4 space-y-5">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive border border-destructive/20 animate-pulse">
        <Laptop className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-black text-foreground">{t('create.limitTitle')}</h3>
        <p className="text-xs text-muted-foreground leading-normal max-w-sm mx-auto">
          {t('create.limitDesc', { limit })}
        </p>
      </div>
      <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => navigate('/')}>
          {t('meetup.backToBoard')}
        </Button>
        {!isPremiumUser && (
          <>
            <Button type="button" variant="premium" size="sm" onClick={() => setIsUpgradeModalOpen(true)}>
              {t('create.upgradePro')}
            </Button>
            <PremiumUpgradeModal
              isOpen={isUpgradeModalOpen}
              onClose={() => setIsUpgradeModalOpen(false)}
              onSuccess={() => setIsPremiumUser(true)}
            />
          </>
        )}
      </div>
    </div>
  )
}
