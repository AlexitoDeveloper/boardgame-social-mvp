import React from 'react'
import { Dices, Calendar, ArrowRight, Image as ImageIcon, Crown, Trash2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { GroupMeetup } from '../../hooks/useGroupHub'
import { useTranslation } from 'react-i18next'

interface GroupPastMatchCardProps {
  match: GroupMeetup
  formattedDate: string
  canDelete: boolean
  onClick: () => void
  onDelete: () => void
}

export const GroupPastMatchCard: React.FC<GroupPastMatchCardProps> = ({
  match,
  formattedDate,
  canDelete,
  onClick,
  onDelete,
}) => {
  const { t } = useTranslation()
  const scores = match.playerScores || []
  const hasScores = scores.length > 0

  return (
    <Card
      onClick={onClick}
      className="p-4 rounded-2xl bg-card/75 hover:bg-card border-border/40 hover:border-primary/40 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-3 group"
    >
      {/* Header: Game cover, title and date */}
      <div className="flex items-start gap-3.5">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/60 border border-border/30 shrink-0 flex items-center justify-center">
          {match.gameImg ? (
            <img
              src={match.gameImg}
              alt={match.gameTitle || match.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Dices className="w-6 h-6 text-muted-foreground/40" />
          )}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <h4 className="font-extrabold font-display tracking-tight text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {match.gameTitle || match.title}
            </h4>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                {t('common.finished', 'Finalizada')}
              </Badge>
              {canDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  title={t('meetup.cancelTable', 'Eliminar Mesa')}
                  aria-label={t('meetup.cancelTable', 'Eliminar Mesa')}
                  className="h-9 w-9 min-h-[36px] min-w-[36px] text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl p-0 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
            <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
            <span>{formattedDate}</span>
          </p>

          {/* Winner Pill */}
          {match.winnerName && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-black text-emerald-400">
              <Crown className="w-3 h-3 text-amber-400 fill-current" />
              <span className="truncate">
                {match.winnerName}
                {match.winnerScore ? ` (${match.winnerScore})` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scores summary or Board Photo indicator */}
      {hasScores && (
        <div className="pt-2 border-t border-border/20 flex flex-wrap items-center gap-1.5 text-xs">
          {scores.slice(0, 4).map((p, idx) => (
            <span
              key={`${p.name}-${idx}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono-tabular font-bold ${
                p.isWinner
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-muted/40 text-muted-foreground'
              }`}
            >
              <span className="truncate max-w-[80px]">{p.name}:</span>
              <span>{p.score}</span>
            </span>
          ))}
          {scores.length > 4 && (
            <span className="text-[10px] text-muted-foreground font-bold">
              +{scores.length - 4} más
            </span>
          )}
        </div>
      )}

      {/* Footer details & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-semibold">
          {match.boardPhotoUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] text-primary">
              <ImageIcon className="w-3 h-3" />
              <span>{t('meetup.photo', 'Foto')}</span>
            </span>
          )}
          <span>
            {(match.joined_players?.length || scores.length || 0)}{' '}
            {t('common.players', 'jugadores')}
          </span>
        </div>

        <span className="font-bold text-primary flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform">
          {t('common.view', 'Ver')} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Card>
  )
}
