import React from 'react'
import { Calendar, Crown, Camera, Trash2, ChevronRight, Dices, Users } from 'lucide-react'
import { Card } from '../../ui/card'
import { Button } from '../../ui/button'
import { GroupMeetup } from '../../../hooks/useGroupHub'
import { useTranslation } from 'react-i18next'

interface MatchChronicleCardProps {
  match: GroupMeetup
  formattedDate: string
  canDelete: boolean
  onClick: () => void
  onDelete: () => void
}

export const MatchChronicleCard: React.FC<MatchChronicleCardProps> = ({
  match,
  formattedDate,
  canDelete,
  onClick,
  onDelete,
}) => {
  const { t } = useTranslation()
  const scores = match.playerScores || []

  // Check if scores have genuine positive point values
  const hasNumericScores = scores.some(
    (s) => typeof s.score === 'number' && !isNaN(s.score) && s.score > 0
  )

  // Order players: if scores exist, sort descending. Otherwise, put the winner first.
  const orderedPlayers = React.useMemo(() => {
    if (hasNumericScores) {
      return [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    }
    if (match.winnerName) {
      const winnerNameClean = match.winnerName.trim().toLowerCase()
      const winner = scores.find((s) => s.name.trim().toLowerCase() === winnerNameClean)
      const others = scores.filter((s) => s.name.trim().toLowerCase() !== winnerNameClean)
      return winner ? [winner, ...others] : scores
    }
    return scores
  }, [scores, hasNumericScores, match.winnerName])

  const rawWinnerScore = Number(match.winnerScore)
  const hasValidWinnerScore = Boolean(
    hasNumericScores &&
    match.winnerScore !== undefined &&
    match.winnerScore !== null &&
    !isNaN(rawWinnerScore) &&
    rawWinnerScore > 0
  )

  const playerCount = Math.max(match.joined_players?.length || 0, scores.length, 1)

  return (
    <Card
      spotlight
      onClick={onClick}
      className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-150 ease-out cursor-pointer flex flex-col justify-between gap-3.5 group active:scale-[0.99] select-none"
    >
      {/* 1. Header: Cover Artwork, Title, Neutral Date & Metadata, Actions */}
      <div className="flex items-start gap-3.5">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted/80 border border-border/30 shrink-0 shadow-xs">
          {match.gameImg ? (
            <img
              src={match.gameImg}
              alt={match.gameTitle || match.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
              <Dices className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-black text-sm sm:text-base text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
              {match.gameTitle || match.title}
            </h4>

            <div className="flex items-center gap-1 shrink-0">
              {canDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer h-7 w-7"
                  title={t('meetup.cancelTable', 'Eliminar')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Clean Neutral Date Line - No emerald clash with gold */}
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
            <span className="flex items-center gap-1 text-muted-foreground/90 font-semibold">
              <Calendar className="w-3 h-3 text-muted-foreground/60 shrink-0" />
              <span>{formattedDate}</span>
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="truncate">{match.is_online ? 'Online' : match.location || match.city || 'Presencial'}</span>
          </p>
        </div>
      </div>

      {/* 2. Unified Player Roster Strip (Zero duplication, luminous gold victor) */}
      {orderedPlayers.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {orderedPlayers.slice(0, 5).map((p, idx) => {
            const isWinner =
              p.isWinner ||
              (match.winnerName && p.name.trim().toLowerCase() === match.winnerName.trim().toLowerCase()) ||
              (hasNumericScores && idx === 0)
            const showScore = hasNumericScores && typeof p.score === 'number' && p.score > 0

            return (
              <span
                key={`${p.name}-${idx}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-colors ${
                  isWinner
                    ? 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#D97706]/35 font-bold shadow-xs'
                    : 'bg-muted/40 text-muted-foreground border border-border/30 font-medium'
                }`}
              >
                {isWinner && <Crown className="w-3 h-3 text-[#D97706] dark:text-[#FBBF24] fill-current shrink-0" />}
                <span className="truncate max-w-[90px]">{p.name}</span>
                {showScore && (
                  <span className="font-mono-tabular text-xs font-black tracking-tight text-foreground">
                    {p.score}
                  </span>
                )}
              </span>
            )
          })}
          {orderedPlayers.length > 5 && (
            <span className="text-[11px] text-muted-foreground font-bold px-1 font-mono-tabular">
              +{orderedPlayers.length - 5}
            </span>
          )}
        </div>
      ) : match.winnerName ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#D97706]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#D97706]/35 text-xs font-bold self-start shadow-xs">
          <Crown className="w-3 h-3 text-[#D97706] dark:text-[#FBBF24] fill-current shrink-0" />
          <span>{match.winnerName}</span>
          {hasValidWinnerScore && (
            <span className="font-mono-tabular text-[11px] font-black">({rawWinnerScore} pts)</span>
          )}
        </div>
      ) : null}

      {/* 3. Footer: Accurate players count and photo tag */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span>{playerCount} {playerCount === 1 ? 'jugador' : 'jugadores'}</span>
          </span>

          {match.boardPhotoUrl && (
            <span className="flex items-center gap-1 text-primary font-semibold">
              <Camera className="w-3.5 h-3.5" />
              <span>Foto</span>
            </span>
          )}
        </div>

        <span className="text-xs font-bold text-foreground/70 group-hover:text-primary transition-colors">
          {t('common.view', 'Ver detalle')}
        </span>
      </div>
    </Card>
  )
}
