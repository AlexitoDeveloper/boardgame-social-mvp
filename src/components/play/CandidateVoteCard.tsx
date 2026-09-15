import { FC } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, Dices, Check } from 'lucide-react'
import { VotingGame } from './ExpressVotingModal'
import { cn } from '../../lib/utils'

interface CandidateVoteCardProps {
  game: VotingGame
  index: number
  voteCount: number
  voters?: string[]
  hasMyVote: boolean
  displayTitle: string
  disabled?: boolean
  onToggleVote: (bggId: number) => void
}

export const CandidateVoteCard: FC<CandidateVoteCardProps> = ({
  game,
  index,
  voteCount,
  voters = [],
  hasMyVote,
  displayTitle,
  disabled = false,
  onToggleVote,
}) => {
  const handleClick = () => {
    if (disabled) return
    onToggleVote(game.bgg_id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      onClick={handleClick}
      className={cn(
        'p-3 rounded-2xl border transition-all select-none active:scale-[0.99] group relative overflow-hidden',
        disabled ? 'cursor-default' : 'cursor-pointer',
        hasMyVote
          ? 'bg-emerald-500/10 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
          : voteCount > 0
            ? 'bg-card/90 border-border/70 hover:border-primary/40'
            : 'bg-card/60 border-border/40 hover:border-primary/40 hover:bg-card'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={displayTitle}
            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-border/20 shadow-xs"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Dices className="w-5 h-5" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <h4
            className={cn(
              'text-xs sm:text-sm font-bold truncate transition-colors',
              hasMyVote ? 'text-emerald-400' : 'text-foreground group-hover:text-primary'
            )}
          >
            {displayTitle}
          </h4>
          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-primary" />
              {game.min_players || 2}-{game.max_players || 5} jug.
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              {game.playing_time || 45} min
            </span>
          </div>
        </div>

        {/* Vote Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={cn(
              'h-8 px-3 rounded-xl font-mono font-black text-xs flex items-center gap-1.5 transition-all shadow-xs border',
              hasMyVote
                ? 'bg-emerald-500 text-white border-emerald-400'
                : voteCount > 0
                  ? 'bg-muted/80 text-foreground border-border/50'
                  : 'bg-muted/40 text-muted-foreground border-border/30 group-hover:border-primary/30'
            )}
          >
            {hasMyVote && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{voteCount}</span>
            <span className="text-[10px] font-bold opacity-80 uppercase">
              {voteCount === 1 ? 'voto' : 'votos'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time voters names list */}
      {voters.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/20 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Votado por:
          </span>
          {voters.map((voter, idx) => (
            <span
              key={idx}
              className="text-[10.5px] font-bold px-2 py-0.5 rounded-lg bg-background/80 border border-border/40 text-foreground/90"
            >
              {voter}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
