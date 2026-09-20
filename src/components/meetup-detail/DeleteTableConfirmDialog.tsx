import React from 'react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'

interface DeleteTableConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: () => void
  isDeleting: boolean
  tableTitle?: string
}

export const DeleteTableConfirmDialog: React.FC<DeleteTableConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting,
  tableTitle,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-destructive/30 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-2 text-left">
          <div className="w-11 h-11 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-1">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <DialogTitle className="text-lg font-black font-display tracking-tight text-foreground">
            {t('meetup.deleteDialogTitle', '¿Eliminar esta mesa definitivamente?')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {tableTitle ? (
              <span className="block mb-1 font-bold text-foreground font-display">
                "{tableTitle}"
              </span>
            ) : null}
            {t(
              'meetup.deleteDialogDesc',
              'Se borrarán todas las puntuaciones, fotos de mesa y mensajes de chat vinculados a esta partida. Esta acción no se puede deshacer.'
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl font-bold text-xs h-11 sm:h-10 w-full sm:w-auto"
          >
            {t('common.cancel', 'Volver')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="rounded-xl font-bold text-xs h-11 sm:h-10 gap-1.5 w-full sm:w-auto shadow-sm"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>{t('meetup.yesDeleteTable', 'Eliminar Mesa Definitivamente')}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
