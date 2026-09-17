import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { LiveScoreTracker } from '../session/LiveScoreTracker'
import { Trophy } from 'lucide-react'

interface LiveScoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendees?: { id: string; name: string; avatarUrl?: string | null }[]
}

export function LiveScoreModal({ open, onOpenChange, attendees }: LiveScoreModalProps) {
  const { t } = useTranslation()

  const defaultPlayers = [
    { id: 'p1', name: t('tableHub.liveScoreModal.defaultPlayer', { index: 1 }) },
    { id: 'p2', name: t('tableHub.liveScoreModal.defaultPlayer', { index: 2 }) },
    { id: 'p3', name: t('tableHub.liveScoreModal.defaultPlayer', { index: 3 }) },
    { id: 'p4', name: t('tableHub.liveScoreModal.defaultPlayer', { index: 4 }) },
  ]

  const activeAttendees = attendees && attendees.length > 0 ? attendees : defaultPlayers

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-4 sm:p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Trophy className="w-5 h-5 text-amber-400" />
            {t('tableHub.liveScoreModal.title')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('tableHub.liveScoreModal.desc')}
          </DialogDescription>
        </DialogHeader>

        <LiveScoreTracker
          attendees={activeAttendees}
          isEditable={true}
        />
      </DialogContent>
    </Dialog>
  )
}
