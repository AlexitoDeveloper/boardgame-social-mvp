import { FC } from 'react'
import { BggSyncModal } from '../library/BggSyncModal'

export interface ImportBggModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  importingCollection?: boolean
  importError?: string
  setImportError?: (err: string) => void
  importSuccessCount?: number | null
  setImportSuccessCount?: (count: number | null) => void
  onImport?: (bggUsername: string) => Promise<void>
}

export const ImportBggModal: FC<ImportBggModalProps> = ({
  isOpen,
  onOpenChange,
  onImport,
}) => {
  return (
    <BggSyncModal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      variant="sync"
      onImport={onImport}
    />
  )
}

export default ImportBggModal
