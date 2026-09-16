import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { LiveScoreTracker } from '../session/LiveScoreTracker'
import { Trophy } from 'lucide-react'

interface LiveScoreModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendees?: { id: string; name: string; avatarUrl?: string | null }[]
}

const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Jugador 1' },
  { id: 'p2', name: 'Jugador 2' },
  { id: 'p3', name: 'Jugador 3' },
  { id: 'p4', name: 'Jugador 4' },
]

export function LiveScoreModal({ open, onOpenChange, attendees }: LiveScoreModalProps) {
  const activeAttendees = attendees && attendees.length > 0 ? attendees : DEFAULT_PLAYERS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-4 sm:p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Trophy className="w-5 h-5 text-amber-400" />
            Marcador de Puntos en Vivo
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Anota y suma los puntos ronda por ronda para cada jugador de la mesa.
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
