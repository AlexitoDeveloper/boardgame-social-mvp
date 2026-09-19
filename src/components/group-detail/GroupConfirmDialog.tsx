import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'

interface GroupConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export const GroupConfirmDialog: React.FC<GroupConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  isDestructive = false,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm bg-card border-border/50 rounded-[24px] p-6 shadow-2xl text-left gap-4">
        <DialogHeader className="border-b border-border/25 pb-2">
          <DialogTitle className="text-lg font-black tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" size="default" onClick={onClose}>
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            variant={isDestructive ? 'destructive' : 'default'}
            size="default"
          >
            {confirmText || t('groups.confirmText', 'Confirmar')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
