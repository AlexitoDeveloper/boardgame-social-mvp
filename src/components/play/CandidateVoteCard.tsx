import { FC } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, Dices, Plus, Minus } from 'lucide-react'
import { VotingGame } from './ExpressVotingModal'
import { MeepleSvg } from '../ui/MeepleToken'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface CandidateVoteCardProps {
  game: VotingGame
  index: number
  votes: number
  displayTitle: string
  onVote: (bggId: number) => void
  onUnvote: (bggId: number) => void
}

export const CandidateVoteCard: FC<CandidateVoteCardProps> = ({
  game,
  index,
  votes,
  displayTitle,
  onVote,
  onUnvote,
}) => {
  const isVoted = votes > 0

  const handleCardClick = () => {
    if (votes === 0) {
      onVote(game.bgg_id)
    } else if (votes === 1) {
      onUnvote(game.bgg_id)
    } else {
      onVote(game.bgg_id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      onClick={handleCardClick}
      className={cn(
        'p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none active:scale-[0.99] group relative overflow-hidden',
        isVoted
          ? 'bg-primary/10 border-primary/60 shadow-xs ring-1 ring-primary/30'
          : 'bg-card/70 border-border/40 hover:border-primary/40 hover:bg-card'
      )}
    >
      {/* Thumbnail */}
      {game.image_url ? (
        <img
          src={game.image_url}
          alt={displayTitle}
          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-border/20 shadow-xs"
        />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Dices className="w-5 h-5" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <h4
          className={cn(
            'text-xs sm:text-sm font-bold truncate transition-colors',
            isVoted ? 'text-primary' : 'text-foreground group-hover:text-primary'
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

      {/* Controls & Counter */}
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {isVoted && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onUnvote(game.bgg_id)}
            title="Quitar voto"
            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
        )}

        <Button
          type="button"
          variant={isVoted ? 'default' : 'outline'}
          size="sm"
          onClick={() => onVote(game.bgg_id)}
          className={cn(
            'h-7 px-2.5 rounded-xl font-black text-xs font-mono-tabular gap-1 shadow-xs',
            !isVoted && 'text-muted-foreground hover:text-primary'
          )}
        >
          <MeepleSvg className={cn('w-3.5 h-3.5', isVoted ? 'text-primary-foreground' : 'text-primary')} />
          <span>{votes}</span>
          {!isVoted && <Plus className="w-3 h-3 opacity-60" />}
        </Button>
      </div>
    </motion.div>
  )
}
