import React from 'react'
import { Calendar, Crown, Image as ImageIcon, Trash2, ChevronRight, Dices } from 'lucide-react'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { GroupMeetup } from '../../../hooks/useGroupHub'
import { useTranslation } from 'react-i18next'

interface MatchLedgerRowProps {
  match: GroupMeetup
  formattedDate: string
  canDelete: boolean
  onClick: () => void
  onDelete: () => void
}

export const MatchLedgerRow: React.FC<MatchLedgerRowProps> = ({
  match,
  formattedDate,
  canDelete,
  onClick,
  onDelete,
}) => {
  const { t } = useTranslation()
  const scores = match.playerScores || []

  return (
    <div
      onClick={onClick}
      className="p-3.5 sm:p-4 rounded-2xl border border-border/35 bg-card/65 hover:bg-card hover:border-primary/40 transition-all duration-150 ease-out cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
    >
      {/* Left: Thumbnail & Title Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted/80 border border-border/30 shrink-0 flex items-center justify-center">
          {match.gameImg ? (
            <img
              src={match.gameImg}
              alt={match.gameTitle || match.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-out"
            />
          ) : (
            <Dices className="w-6 h-6 text-muted-foreground/40" />
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-black text-sm text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
              {match.gameTitle || match.title}
            </h4>
            {match.boardPhotoUrl && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                <ImageIcon className="w-2.5 h-2.5" />
                <span>{t('meetup.photo', 'Foto')}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
            <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>{formattedDate}</span>
          </p>
        </div>
      </div>

      {/* Center/Right: Scores Ribbon & Victor Highlight */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 shrink-0">
        {match.winnerName ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs font-black text-amber-500 shrink-0">
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="truncate max-w-[110px]">{match.winnerName}</span>
            {match.winnerScore !== undefined && match.winnerScore !== null && (
              <span className="font-mono text-xs">({match.winnerScore} pts)</span>
            )}
          </div>
        ) : (
          <Badge variant="secondary" size="sm">
            {t('common.finished', 'Finalizada')}
          </Badge>
        )}

        {/* Tabular Score Chips */}
        {scores.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {scores.slice(0, 3).map((s, idx) => (
              <span
                key={`${s.name}-${idx}`}
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                  s.isWinner ? 'bg-amber-500/15 text-amber-500' : 'bg-muted/60 text-muted-foreground'
                }`}
              >
                {s.score}
              </span>
            ))}
            {scores.length > 3 && (
              <span className="text-[10px] text-muted-foreground font-bold">+{scores.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1">
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
              title={t('meetup.cancelTable', 'Eliminar')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  )
}
