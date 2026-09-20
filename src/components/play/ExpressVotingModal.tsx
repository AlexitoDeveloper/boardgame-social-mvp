import { FC, useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Trophy, ArrowRight, RotateCcw, Users, Share2, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { CandidateVoteCard } from './CandidateVoteCard'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/authContext'
import { supabase } from '../../lib/supabaseClient'

export interface VotingGame {
  bgg_id: number
  title: string
  title_es?: string | null
  image_url?: string | null
  image_url_es?: string | null
  min_players?: number | null
  max_players?: number | null
  playing_time?: number | null
}

interface UserVote {
  userId: string
  userName: string
  bggId: number | null
}

interface ExpressVotingModalProps {
  isOpen: boolean
  onClose: () => void
  candidates: VotingGame[]
  roomId?: string
  onGameSelected: (game: VotingGame) => void
}

export const ExpressVotingModal: FC<ExpressVotingModalProps> = ({
  isOpen,
  onClose,
  candidates,
  roomId = 'mesa-activa',
  onGameSelected,
}) => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()

  // Up to 5 pool games
  const pool = useMemo(() => candidates.slice(0, 5), [candidates])

  // Persistent anonymous or authenticated identity for voting
  const currentUserId = useMemo(() => {
    if (user?.id) return user.id
    let guestId = sessionStorage.getItem('bg_voting_guest_id')
    if (!guestId) {
      guestId = `guest-${Math.random().toString(36).slice(2, 8)}`
      sessionStorage.setItem('bg_voting_guest_id', guestId)
    }
    return guestId
  }, [user?.id])

  const currentUserName = useMemo(() => {
    if (user?.user_metadata?.username) return user.user_metadata.username as string
    if (user?.email) return user.email.split('@')[0]
    let storedName = sessionStorage.getItem('bg_voting_guest_name')
    if (!storedName) {
      storedName = `${t('play.votingModal.guestPlayer')} ${currentUserId.slice(-3)}`
      sessionStorage.setItem('bg_voting_guest_name', storedName)
    }
    return storedName
  }, [user, currentUserId, t])

  // Map of userId -> UserVote
  const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({})
  const [myVote, setMyVote] = useState<number | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [isFinished, setIsFinished] = useState(false)
  const [winningGame, setWinningGame] = useState<VotingGame | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Realtime channel reference
  const channelRef = useRef<any>(null)

  // Calculate vote counts and list of voters per candidate
  const votesPerGame = useMemo(() => {
    const counts: Record<number, { count: number; voters: string[] }> = {}
    pool.forEach((g) => {
      counts[g.bgg_id] = { count: 0, voters: [] }
    })

    Object.values(userVotes).forEach((v) => {
      if (v.bggId && counts[v.bggId]) {
        counts[v.bggId].count += 1
        counts[v.bggId].voters.push(v.userName)
      }
    })

    return counts
  }, [pool, userVotes])

  const totalVotesCast = useMemo(() => {
    return Object.values(userVotes).filter((v) => v.bggId !== null).length
  }, [userVotes])

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setUserVotes({})
      setMyVote(null)
      setSecondsLeft(30)
      setIsFinished(false)
      setWinningGame(null)
    }
  }, [isOpen])

  // Supabase Realtime Channel Subscription
  useEffect(() => {
    if (!isOpen) return

    const channelName = `voting_session_${roomId}`
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'cast_vote' }, (payload) => {
        const { userId, userName, bggId } = payload.payload as UserVote
        if (!userId) return

        setUserVotes((prev) => {
          const next = { ...prev }
          if (bggId === null) {
            delete next[userId]
          } else {
            next[userId] = { userId, userName, bggId }
          }
          return next
        })
      })
      .on('broadcast', { event: 'request_sync' }, () => {
        // Broadcast our current votes to newcomers
        if (myVote !== null) {
          channel.send({
            type: 'broadcast',
            event: 'cast_vote',
            payload: {
              userId: currentUserId,
              userName: currentUserName,
              bggId: myVote,
            },
          })
        }
      })
      .on('broadcast', { event: 'finish_voting' }, (payload) => {
        const { winnerBggId } = payload.payload
        const winner = pool.find((g) => g.bgg_id === winnerBggId) || pool[0]
        handleFinishVoting(winner)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Request sync from other participants in the room
          channel.send({
            type: 'broadcast',
            event: 'request_sync',
            payload: { userId: currentUserId },
          })
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [isOpen, roomId, currentUserId, currentUserName, myVote, pool])

  // Countdown timer (30s)
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

  // Handle individual toggle vote (1 persona = 1 voto)
  const handleToggleVote = (bggId: number) => {
    if (isFinished) return

    const nextVote = myVote === bggId ? null : bggId
    setMyVote(nextVote)

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(20)
    }

    // Update local state immediately
    setUserVotes((prev) => {
      const next = { ...prev }
      if (nextVote === null) {
        delete next[currentUserId]
      } else {
        next[currentUserId] = {
          userId: currentUserId,
          userName: currentUserName,
          bggId: nextVote,
        }
      }
      return next
    })

    // Broadcast vote to all other devices in the room
    channelRef.current?.send({
      type: 'broadcast',
      event: 'cast_vote',
      payload: {
        userId: currentUserId,
        userName: currentUserName,
        bggId: nextVote,
      },
    })
  }

  const handleFinishVoting = (forcedWinner?: VotingGame) => {
    setIsFinished(true)

    let winner = forcedWinner
    if (!winner) {
      let maxVotes = -1
      winner = pool[0]
      pool.forEach((g) => {
        const v = votesPerGame[g.bgg_id]?.count || 0
        if (v > maxVotes) {
          maxVotes = v
          winner = g
        }
      })

      // Broadcast finish to other devices
      channelRef.current?.send({
        type: 'broadcast',
        event: 'finish_voting',
        payload: { winnerBggId: winner.bgg_id },
      })
    }

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

  const handleShareRoom = async () => {
    const baseUrl = `${window.location.origin}/jugar`
    const shareUrl = `${baseUrl}?votingRoom=${encodeURIComponent(roomId)}`
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const progressPct = Math.max(0, Math.min(100, (secondsLeft / 30) * 100))

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-[94%] sm:w-full p-0 rounded-3xl overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="p-5 sm:p-6 border-b border-border/30 bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
                <Timer className="w-5 h-5 text-emerald-400" />
                <span>{t('play.votingModal.title')}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium">
                {t('play.votingModal.subtitle')}
              </DialogDescription>
            </div>

            {!isFinished && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleShareRoom}
                  className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1 cursor-pointer border-border/40"
                  title={t('play.votingModal.shareLinkTitle')}
                  aria-label={copiedLink ? t('play.votingModal.linkCopied') : t('play.votingModal.share')}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedLink ? t('play.votingModal.linkCopied') : t('play.votingModal.share')}</span>
                </Button>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/60 border border-border/40 font-mono font-black text-xs text-foreground">
                  <span className={secondsLeft <= 5 ? 'text-destructive animate-pulse' : 'text-emerald-400'}>
                    {secondsLeft}s
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {!isFinished && (
            <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden mt-4">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                initial={{ width: '100%' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ ease: 'linear', duration: 0.3 }}
              />
            </div>
          )}
        </DialogHeader>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[68vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {isFinished && winningGame ? (
              /* Winner Reveal State */
              <motion.div
                key="winner"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-6 space-y-5"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <Trophy className="w-8 h-8 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase font-black tracking-widest text-emerald-400">
                    {t('play.votingModal.majorityWinner')}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">
                    {i18n.language === 'es' && winningGame.title_es
                      ? winningGame.title_es
                      : winningGame.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t('play.votingModal.winnerVotes', { count: votesPerGame[winningGame.bgg_id]?.count || 0, total: totalVotesCast })}
                  </p>
                </div>

                {(winningGame.image_url_es || winningGame.image_url) && (
                  <div className="w-36 h-36 mx-auto rounded-2xl overflow-hidden border border-border/40 shadow-xl relative group">
                    <img
                      src={(winningGame.image_url_es || winningGame.image_url) || undefined}
                      alt={winningGame.title_es || winningGame.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-sm mx-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFinished(false)
                      setUserVotes({})
                      setMyVote(null)
                      setSecondsLeft(30)
                      setWinningGame(null)
                    }}
                    className="h-11 px-4 rounded-xl font-bold text-xs gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('play.votingModal.voteAgain')}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="default"
                    onClick={() => onGameSelected(winningGame)}
                    className="flex-1 h-11 rounded-xl font-bold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md"
                  >
                    <span>{t('play.votingModal.openTableWithGame')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* Active Voting List */
              <motion.div
                key="active-voting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {totalVotesCast === 1 ? t('play.votingModal.onePersonVoted') : t('play.votingModal.peopleVoted', { count: totalVotesCast })}
                  </span>
                  <span className="font-semibold text-xs">
                    {myVote ? t('play.votingModal.voteCastHint') : t('play.votingModal.chooseGameHint')}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {pool.map((game, idx) => {
                    const info = votesPerGame[game.bgg_id] || { count: 0, voters: [] }
                    const displayTitle =
                      i18n.language === 'es' && game.title_es ? game.title_es : game.title

                    return (
                      <CandidateVoteCard
                        key={game.bgg_id}
                        game={game}
                        index={idx}
                        voteCount={info.count}
                        voters={info.voters}
                        hasMyVote={myVote === game.bgg_id}
                        displayTitle={displayTitle}
                        disabled={isFinished}
                        onToggleVote={handleToggleVote}
                      />
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!isFinished && (
          <div className="p-4 border-t border-border/30 bg-muted/10 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground font-medium truncate">
              {t('play.votingModal.votingAs')} <strong className="text-foreground">{currentUserName}</strong>
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 px-3 rounded-xl text-xs font-bold"
              >
                {t('common.cancel')}
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => handleFinishVoting()}
                disabled={totalVotesCast === 0}
                className="h-9 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                {t('play.votingModal.closeVotingNow')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
