import { FC } from 'react'
import { BggSyncModal } from '../library/BggSyncModal'

export interface BggOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const BggOnboardingModal: FC<BggOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  return (
    <BggSyncModal
      isOpen={isOpen}
      onClose={onClose}
      variant="onboarding"
      onSuccess={onSuccess}
    />
  )
}

export default BggOnboardingModal
