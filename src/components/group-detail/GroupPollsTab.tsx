import { Plus, Calendar, Crown, Sparkles, Check } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { OptimizedImage } from '../ui/OptimizedImage'
import { GroupPoll } from '../../hooks/useGroupDetail'
import { User } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'
import { useGameLocale } from '../../hooks/useGameLocale'

interface GroupPollsTabProps {
  polls: GroupPoll[];
  isAdmin: boolean;
  user: User | null;
  formatMeetupDate: (dateStr: string) => string;
  triggerConfirm: (
    title: string,
    message: string,
    onConfirm: () => Promise<void> | void,
    confirmText?: string,
    isDestructive?: boolean
  ) => void;
  closePoll: (pollId: string) => Promise<void>;
  voteGame: (pollId: string, gameId: number) => Promise<void>;
  setActionError: (err: string | null) => void;
  openNewPollModal: () => void;
  onCreateMeetupRedirect: (pollTitle: string, gameId: number, gameTitle: string) => void;
}

export function GroupPollsTab({
  polls,
  isAdmin,
  user,
  formatMeetupDate,
  triggerConfirm,
  closePoll,
  voteGame,
  setActionError,
  openNewPollModal,
  onCreateMeetupRedirect
}: GroupPollsTabProps) {
  const { t } = useTranslation()
  const { getGameTitle } = useGameLocale()
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header / Create Poll */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground">{t('groups.pollsTitle')}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t('groups.pollsSubtitle')}</p>
        </div>

        {isAdmin && (
          <Button
            onClick={openNewPollModal}
            className="rounded-xl flex items-center gap-1.5 font-bold text-xs h-9 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{t('groups.newPoll')}</span>
          </Button>
        )}
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-muted/15 max-w-md mx-auto space-y-3">
          <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground font-bold text-sm">{t('groups.noPolls')}</p>
          <p className="text-xs text-foreground/50 px-6 max-w-sm mx-auto leading-normal">
            {t('groups.noPollsDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            // Find winning option(s) if closed
            let winningGameIds: number[] = []
            if (poll.status === 'closed') {
              let maxVotes = 0
              poll.options.forEach(opt => {
                if (opt.votes.length > maxVotes) {
                  maxVotes = opt.votes.length
                  winningGameIds = [opt.game_id]
                } else if (opt.votes.length === maxVotes && maxVotes > 0) {
                  winningGameIds.push(opt.game_id)
                }
              })
            }

            return (
              <Card key={poll.id} className="p-5 border-border/30 bg-card/65 rounded-2xl shadow-sm relative overflow-hidden flex flex-col space-y-4">
                {/* Poll Title & Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/20 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-black tracking-tight text-foreground">
                        {poll.title}
                      </h4>
                      <Badge variant={poll.status === 'open' ? 'success' : 'secondary'}>
                        {poll.status === 'open' ? t('groups.active') : t('groups.closed')}
                      </Badge>
                    </div>
                    {poll.description && (
                      <p className="text-xs text-muted-foreground leading-normal max-w-2xl">{poll.description}</p>
                    )}
                    {poll.meetup_date && (
                      <div className="flex items-center gap-1.5 text-xs text-primary font-bold mt-1 bg-primary/10 dark:bg-primary/20 px-2.5 py-1 rounded-lg w-fit">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{t('groups.proposedDate', { date: formatMeetupDate(poll.meetup_date) })}</span>
                      </div>
                    )}
                  </div>

                  {/* Poll action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {poll.status === 'open' && isAdmin && (
                      <Button
                        onClick={() => {
                          triggerConfirm(
                            t('groups.closePollConfirmTitle'),
                            t('groups.closePollConfirmDesc'),
                            async () => {
                              setActionError(null)
                              try {
                                await closePoll(poll.id)
                              } catch (err: any) {
                                setActionError(err.message || 'Error.')
                              }
                            },
                            t('groups.closePoll'),
                            false
                          )
                        }}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-[10px] font-black uppercase tracking-wider h-8 cursor-pointer"
                      >
                        {t('groups.closePoll')}
                      </Button>
                    )}

                    {poll.status === 'closed' && (
                      <div className="flex items-center gap-1.5">
                        {winningGameIds.length > 0 ? (
                          <Button
                            onClick={() => {
                              const firstWinner = poll.options.find(o => o.game_id === winningGameIds[0])?.game
                              const winnerTitle = firstWinner ? getGameTitle(firstWinner) : 'Juego Ganador'
                              onCreateMeetupRedirect(poll.title, winningGameIds[0], winnerTitle)
                            }}
                            size="sm"
                            className="rounded-xl text-[10px] font-black uppercase tracking-wider h-8 shadow-sm flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>{t('groups.createTable')}</span>
                          </Button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-extrabold uppercase">{t('groups.noWinners')}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Nominated Candidates options */}
                <div className="space-y-3.5">
                  {poll.options.map((opt) => {
                    const hasVoted = opt.votes.some(v => v.user_id === user?.id)
                    const totalVotes = opt.votes.length
                    const isWinner = winningGameIds.includes(opt.game_id)

                    // Calculate relative percentage
                    const totalPollVotes = poll.options.reduce((a, b) => a + b.votes.length, 0)
                    const percentage = totalPollVotes > 0 ? (totalVotes / totalPollVotes) * 100 : 0

                    return (
                      <div
                        key={opt.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all gap-4 relative overflow-hidden ${
                          isWinner
                            ? 'bg-amber-500/5 border-amber-500/30'
                            : 'bg-background/45 border-border/20'
                        }`}
                      >
                        {/* Background vote filling bar */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 pointer-events-none rounded-l-xl transition-all duration-500 ${
                            isWinner ? 'bg-amber-500/10' : 'bg-primary/10'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />

                        {/* Game Cover & name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0 z-10">
                          <OptimizedImage
                            src={opt.game.image_url}
                            alt={opt.game.title}
                            widthSize={80}
                            heightSize={80}
                            className="w-10 h-10 rounded-lg border border-border/30 shrink-0 bg-muted/20"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-sm text-foreground truncate block max-w-[250px]">
                                {getGameTitle(opt.game)}
                              </span>
                              {isWinner && (
                                <Badge variant="warning" className="text-[8px] px-1.5 py-0.5">
                                  <Crown className="h-2 w-2 fill-amber-500" /> {t('groups.winner')}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                {totalVotes} {totalVotes === 1 ? t('groups.vote_one') : t('groups.vote_other')}
                              </span>
                              {totalVotes > 0 && (
                                <>
                                  <span className="text-muted-foreground/30 text-[9px]">•</span>
                                  {/* Avatars row */}
                                  <div className="flex -space-x-1.5">
                                    {opt.votes.map((v, idx) => (
                                      <Avatar key={idx} className="w-4 h-4 border border-card shrink-0">
                                        <AvatarImage src={v.avatar_url || undefined} />
                                        <AvatarFallback className="text-[6px] bg-muted font-bold">
                                          {v.username.slice(0, 1).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vote action button */}
                        {poll.status === 'open' && (
                          <Button
                            onClick={() => voteGame(poll.id, opt.game_id)}
                            variant={hasVoted ? 'default' : 'outline'}
                            size="sm"
                            className={`rounded-xl font-bold text-[11px] h-8 px-4 z-10 shrink-0 flex items-center gap-1 cursor-pointer transition-all ${
                              hasVoted
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                                : 'text-foreground border-border/80 hover:bg-muted/40'
                            }`}
                          >
                            {hasVoted ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>{t('groups.voted')}</span>
                              </>
                            ) : (
                              <span>{t('groups.vote')}</span>
                            )}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
