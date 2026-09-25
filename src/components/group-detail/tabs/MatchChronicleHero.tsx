import React from 'react'
import { Crown, Calendar, Camera, ArrowRight, Dices, MapPin, Globe, Sparkles } from 'lucide-react'
import { Card } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { GroupMeetup } from '../../../hooks/useGroupHub'
import { MatchScoreSpreadBar } from './MatchScoreSpreadBar'

interface MatchChronicleHeroProps {
  match: GroupMeetup
  formattedDate: string
  onClick: () => void
}

export const MatchChronicleHero: React.FC<MatchChronicleHeroProps> = ({
  match,
  formattedDate,
  onClick,
}) => {
  const scores = match.playerScores || []
  const sortedScores = [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const marginOfVictory =
    sortedScores.length >= 2
      ? (sortedScores[0].score || 0) - (sortedScores[1].score || 0)
      : null

  return (
    <Card
      onClick={onClick}
      className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-card via-card/95 to-amber-500/5 p-5 sm:p-6 shadow-xl shadow-amber-500/5 transition-all duration-200 hover:border-amber-500/50 cursor-pointer group select-none"
    >
      {/* Ambient Artwork Backglow */}
      {match.gameImg && (
        <div
          className="absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-15 blur-3xl pointer-events-none transition-opacity duration-300 group-hover:opacity-25"
          style={{ backgroundImage: `url(${match.gameImg})`, backgroundSize: 'cover' }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 space-y-4">
        {/* Top Header Tag */}
        <div className="flex items-center justify-between gap-3">
          <Badge variant="warning" size="sm" className="font-black gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Última Partida Registrada</span>
          </Badge>

          <span className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{formattedDate}</span>
          </span>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Cover Artwork with Table Photo Overlay */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-muted/80 border border-border/40 shrink-0 shadow-md">
            {match.gameImg ? (
              <img
                src={match.gameImg}
                alt={match.gameTitle || match.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                <Dices className="w-10 h-10" />
              </div>
            )}
            {match.boardPhotoUrl && (
              <div className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/70 backdrop-blur-xs text-amber-400">
                <Camera className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Details & Victor Callout */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black font-display text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                {match.gameTitle || match.title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                {match.is_online ? (
                  <span className="flex items-center gap-1 text-sky-400 font-semibold">
                    <Globe className="w-3 h-3" />
                    <span>Mesa Online</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground font-semibold">
                    <MapPin className="w-3 h-3" />
                    <span>{match.location || match.city || 'Presencial'}</span>
                  </span>
                )}
                <span>•</span>
                <span className="font-bold text-foreground/80">{scores.length || match.joined_players?.length || 0} jugadores</span>
              </p>
            </div>

            {/* Victor Spotlight Ribbon */}
            {match.winnerName && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500">
                <Crown className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                <span className="text-xs font-black">
                  Victoria de <span className="underline decoration-amber-500/40">{match.winnerName}</span>
                </span>
                {match.winnerScore !== undefined && match.winnerScore !== null && (
                  <span className="font-mono text-xs font-black ml-1">({match.winnerScore} pts)</span>
                )}
                {marginOfVictory !== null && marginOfVictory > 0 && (
                  <span className="text-xs font-bold text-muted-foreground ml-1 hidden sm:inline">
                    (+{marginOfVictory} de margen)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0 self-end md:self-center">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
              className="w-full md:w-auto rounded-xl font-bold text-xs h-10 px-4 gap-2 shadow-sm cursor-pointer"
            >
              <span>Ver Acta Detallada</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Proportional Score Spread Bar */}
        {scores.length > 0 && (
          <div className="pt-2 border-t border-border/20">
            <MatchScoreSpreadBar scores={scores} />
          </div>
        )}
      </div>
    </Card>
  )
}
