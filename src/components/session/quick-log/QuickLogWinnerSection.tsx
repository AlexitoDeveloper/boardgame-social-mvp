import { FC } from 'react'
import { Crown, Trophy, Handshake, Scale } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Input } from '../../ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar'
import { QuickLogAttendee, WinnerMode } from '../../../hooks/useQuickLogMatch'
import { cn } from '../../../lib/utils'

interface QuickLogWinnerSectionProps {
  activeAttendees: QuickLogAttendee[]
  winnerMode: WinnerMode
  setWinnerMode: (mode: WinnerMode) => void
  winnerId: string | null
  setWinnerId: (id: string | null) => void
  scores: Record<string, string>
  setPlayerScore: (attendeeId: string, val: string) => void
}

export const QuickLogWinnerSection: FC<QuickLogWinnerSectionProps> = ({
  activeAttendees,
  winnerMode,
  setWinnerMode,
  winnerId,
  setWinnerId,
  scores,
  setPlayerScore,
}) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-muted-foreground">
            {t('quickLog.resultsSection')}
          </span>
        </div>
      </div>

      {/* Outcome Mode Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          size="sm"
          variant={winnerMode === 'player' ? 'default' : 'outline'}
          onClick={() => setWinnerMode('player')}
          icon={Crown}
        >
          <span>{t('quickLog.singleWinner')}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant={winnerMode === 'coop' ? 'default' : 'outline'}
          onClick={() => {
            setWinnerMode('coop')
            setWinnerId(null)
          }}
          icon={Handshake}
        >
          <span>{t('quickLog.coopVictory')}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant={winnerMode === 'draw' ? 'default' : 'outline'}
          onClick={() => {
            setWinnerMode('draw')
            setWinnerId(null)
          }}
          icon={Scale}
        >
          <span>{t('quickLog.draw')}</span>
        </Button>
      </div>

      {/* Active Attendees with 1-Tap Winner Selection & Optional Score Inputs */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-muted-foreground">
          {winnerMode === 'player'
            ? t('quickLog.selectWinnerHint')
            : t('quickLog.optionalScoresHint')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeAttendees.map((attendee) => {
            const isWinner = winnerMode === 'player' && winnerId === attendee.id
            const initials = attendee.name.slice(0, 2).toUpperCase()

            return (
              <div
                key={attendee.id}
                role={winnerMode === 'player' ? 'button' : undefined}
                tabIndex={winnerMode === 'player' ? 0 : undefined}
                aria-pressed={winnerMode === 'player' ? isWinner : undefined}
                onClick={() => {
                  if (winnerMode === 'player') {
                    setWinnerId(attendee.id)
                  }
                }}
                onKeyDown={(e) => {
                  if (winnerMode === 'player' && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    setWinnerId(attendee.id)
                  }
                }}
                className={cn(
                  'p-2 rounded-xl border flex items-center justify-between gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  winnerMode === 'player' && 'cursor-pointer select-none active:scale-[0.99]',
                  isWinner
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-border/30 bg-card/40 hover:bg-card/80'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-6 h-6 shrink-0 border border-primary/20">
                    <AvatarImage src={attendee.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-black">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="text-xs font-bold text-foreground truncate max-w-[90px]">
                      {attendee.name}
                    </span>
                    {attendee.isGuest && (
                      <Badge variant="outline" className="text-xs px-1 py-0 leading-tight text-muted-foreground border-border/50">
                        {t('common.guest', 'Invitado')}
                      </Badge>
                    )}
                  </div>

                  {isWinner && (
                    <Crown className="w-4 h-4 text-amber fill-amber shrink-0 drop-shadow-xs" />
                  )}
                </div>

                {/* Score Input */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Input
                    tabular
                    type="number"
                    inputMode="numeric"
                    placeholder={t('quickLog.pointsAbbr')}
                    aria-label={`${attendee.name} ${t('quickLog.optionalScoresHint')}`}
                    value={scores[attendee.id] ?? ''}
                    onChange={(e) => setPlayerScore(attendee.id, e.target.value)}
                    className="w-16 h-7 text-xs text-center font-mono-tabular font-black rounded-lg"
                  />
                  <span className="text-xs text-muted-foreground font-semibold">{t('quickLog.pointsAbbr')}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
