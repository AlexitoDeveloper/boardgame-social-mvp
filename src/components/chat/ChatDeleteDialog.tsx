import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Meetup } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'

interface ChatDeleteDialogProps {
  meetup: Meetup | null
  userId: string | undefined
  onClose: () => void
  onHide: (meetupId: string) => void
  onDelete: (meetupId: string) => Promise<void>
}

export function ChatDeleteDialog({
  meetup,
  userId,
  onClose,
  onHide,
  onDelete
}: ChatDeleteDialogProps) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  if (!meetup) return null

  const isCreator = meetup.creator_id === userId
  const title = isCreator ? t('chats.deleteConfirmCreatorTitle') : t('chats.deleteConfirmTitle')
  const description = isCreator ? t('chats.deleteConfirmCreatorDesc') : t('chats.deleteConfirmDesc')
  const actionLabel = isCreator ? t('chats.deleteConfirmCreatorAction') : ''

  const handleHide = () => {
    onHide(meetup.id)
    onClose()
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(meetup.id)
      onClose()
    } catch (err) {
      console.error('Error deleting meetup:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={Boolean(meetup)} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-3xl border border-border/40 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 pt-3">
          <Button
            onClick={handleHide}
            disabled={loading}
            variant="secondary"
            className="w-full h-11 rounded-xl"
          >
            {t('chats.hideConversationButton')}
          </Button>

          {isCreator && actionLabel && (
            <Button
              onClick={handleDelete}
              disabled={loading}
              loading={loading}
              variant="destructive"
              className="w-full h-11 rounded-xl shadow-xs"
            >
              {actionLabel}
            </Button>
          )}

          <Button
            onClick={onClose}
            disabled={loading}
            variant="ghost"
            className="w-full h-10 text-muted-foreground"
          >
            {t('chats.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
