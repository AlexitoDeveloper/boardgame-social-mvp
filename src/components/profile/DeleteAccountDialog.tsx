import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDeleteAccount } from '../../hooks/useDeleteAccount'

interface DeleteAccountDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const { t } = useTranslation()
  const { deleteAccount, isDeleting } = useDeleteAccount()
  const [confirmationInput, setConfirmationInput] = useState('')

  const requiredWord = 'ELIMINAR'
  const isConfirmed = confirmationInput.trim().toUpperCase() === requiredWord

  const handleDelete = async () => {
    if (!isConfirmed) return
    const success = await deleteAccount()
    if (success) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-amber/15 text-amber dark:text-amber-hover flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-foreground font-black">
            {t('settings.deleteAccountTitle', '¿Eliminar tu cuenta definitivamente?')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'settings.deleteAccountWarning',
              'Esta acción es completamente irreversible. Se eliminarán permanentemente tus datos de acceso, perfil, historial de partidas, colecciones de juegos y mensajes en chats.'
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-3">
          <Label htmlFor="confirm-delete" className="text-xs font-semibold">
            {t('settings.deleteConfirmPrompt', 'Para confirmar, escribe')} &quot;
            <span className="font-mono font-bold text-foreground">{requiredWord}</span>&quot;:
          </Label>
          <Input
            id="confirm-delete"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder={requiredWord}
            disabled={isDeleting}
            className="font-mono uppercase tracking-wider"
          />
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="default"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.deleting', 'Eliminando...')}
              </span>
            ) : (
              t('settings.confirmDeleteButton', 'Eliminar Definitivamente')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
