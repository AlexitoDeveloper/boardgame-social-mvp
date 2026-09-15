import { FC, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Trophy, Check, ArrowRight, RotateCcw } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { CandidateVoteCard } from './CandidateVoteCard'
import { useTranslation } from 'react-i18next'

export interface VotingGame {
  bgg_id: number
  title: string
  title_es?: string | null
  image_url?: string | null
  min_players?: number | null
  max_players?: number | null
  playing_time?: number | null
}

interface ExpressVotingModalProps {
  isOpen: boolean
  onClose: () => void
  candidates: VotingGame[]
  onGameSelected: (game: VotingGame) => void
}

export const ExpressVotingModal: FC<ExpressVotingModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onGameSelected,
}) => {
  const { t, i18n } = useTranslation()

  // Up to 5 pool games
  const pool = useMemo(() => candidates.slice(0, 5), [candidates])

  const [votes, setVotes] = useState<Record<number, number>>({})
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [isFinished, setIsFinished] = useState(false)
  const [winningGame, setWinningGame] = useState<VotingGame | null>(null)

  const totalVotes = useMemo(
    () => Object.values(votes).reduce((acc, curr) => acc + curr, 0),
    [votes]
  )

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setVotes({})
      setSecondsLeft(30)
      setIsFinished(false)
      setWinningGame(null)
    }
  }, [isOpen])

  // 30s Countdown timer
  useEffect(() => {
    if (!isOpen || isFinished) return
    if (secondsLeft <= 0) {
      handleFinishVoting()
      return
    }

    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [isOpen, isFinished, secondsLeft])

  const handleVote = (bggId: number) => {
    if (isFinished) return
    if ('vibrate' in navigator) {
      navigator.vibrate(15)
    }
    setVotes((prev) => ({
      ...prev,
      [bggId]: (prev[bggId] || 0) + 1,
    }))
  }

  const handleUnvote = (bggId: number) => {
    if (isFinished) return
    setVotes((prev) => {
      const current = prev[bggId] || 0
      if (current <= 1) {
        const copy = { ...prev }
        delete copy[bggId]
        return copy
      }
      return {
        ...prev,
        [bggId]: current - 1,
      }
    })
  }

  const handleFinishVoting = () => {
    setIsFinished(true)

    // Determine winner
    let maxVotes = -1
    let winner: VotingGame = pool[0]
    pool.forEach((g) => {
      const v = votes[g.bgg_id] || 0
      if (v > maxVotes) {
        maxVotes = v
        winner = g
      }
    })

    setWinningGame(winner)

    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'],
      })
    } catch {}
  }

  const handleRestart = () => {
    setVotes({})
    setSecondsLeft(30)
    setIsFinished(false)
    setWinningGame(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-full p-5 sm:p-6 bg-card border border-border/40 shadow-2xl rounded-3xl overflow-hidden">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wider">
              <Timer className="w-3.5 h-3.5" />
              <span>{t('play.expressVoting', 'Votación Exprés')}</span>
            </div>
            {!isFinished && totalVotes > 0 && (
              <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full">
                {totalVotes} {totalVotes === 1 ? 'voto total' : 'votos totales'}
              </span>
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-display flex items-center justify-between">
            <span>{t('play.votePrompt', '¡A votar en la mesa!')}</span>
            {!isFinished && (
              <span className="text-base font-mono-tabular font-black text-primary px-3 py-1 rounded-xl bg-primary/10 border border-primary/20">
                {secondsLeft}s
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            {!isFinished
              ? t(
                  'play.voteInstructions',
                  'Toca tus juegos favoritos para votar. Puedes pulsar de nuevo o usar el botón menos para desmarcar.'
                )
              : t('play.voteResultDesc', '¡Votación cerrada! Este ha sido el juego elegido por el grupo.')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        {!isFinished && (
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: '100%' }}
              animate={{ width: `${(secondsLeft / 30) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        )}

        {/* Candidate Cards Grid */}
        <div className="py-2 space-y-2 max-h-[360px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {!isFinished ? (
              pool.map((game, idx) => {
                const count = votes[game.bgg_id] || 0
                const displayTitle =
                  i18n.language === 'es' && game.title_es ? game.title_es : game.title

                return (
                  <CandidateVoteCard
                    key={game.bgg_id}
                    game={game}
                    index={idx}
                    votes={count}
                    displayTitle={displayTitle}
                    onVote={handleVote}
                    onUnvote={handleUnvote}
                  />
                )
              })
            ) : winningGame ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-primary/10 border border-primary/30 text-center space-y-4"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
                  <Trophy className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                    {t('play.winnerBadge', '¡Juego Seleccionado!')}
                  </span>
                  <h3 className="text-xl font-black text-foreground">
                    {i18n.language === 'es' && winningGame.title_es
                      ? winningGame.title_es
                      : winningGame.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {votes[winningGame.bgg_id] || 0}{' '}
                    {(votes[winningGame.bgg_id] || 0) === 1 ? 'voto en la mesa' : 'votos en la mesa'}
                  </p>
                </div>

                {winningGame.image_url && (
                  <img
                    src={winningGame.image_url}
                    alt={winningGame.title}
                    className="w-24 h-24 mx-auto rounded-2xl object-cover shadow-md border border-border/20"
                  />
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-border/20">
          {!isFinished ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-xl font-bold text-xs"
              >
                {t('common.cancel', 'Cancelar')}
              </Button>
              <Button
                onClick={handleFinishVoting}
                size="sm"
                className="rounded-xl font-bold text-xs px-5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                {t('play.finishEarly', 'Cerrar Votación')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                className="rounded-xl font-bold text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                {t('play.voteAgain', 'Votar otra vez')}
              </Button>
              <Button
                onClick={() => winningGame && onGameSelected(winningGame)}
                size="sm"
                className="rounded-xl font-bold text-xs px-5 shadow-sm"
              >
                <span>{t('play.startTable', 'Abrir mesa ahora')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
