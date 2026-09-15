import { motion } from 'framer-motion'
import { Crown, Medal, Trophy, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { Card, CardContent } from '../../ui/card'
import { HallOfFameMember } from '../../../types'

interface GroupPodiumProps {
  members: HallOfFameMember[];
}

export function GroupPodium({ members }: GroupPodiumProps) {
  const { t } = useTranslation()

  if (!members || members.length === 0) {
    return null
  }

  const first = members[0]
  const second = members.length > 1 ? members[1] : null
  const third = members.length > 2 ? members[2] : null
  const rest = members.slice(3)

  return (
    <div className="space-y-6">
      {/* Visual Podium Stage */}
      <div className="relative pt-6 pb-2 px-2 bg-gradient-to-b from-card/80 to-card/30 rounded-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            {t('groups.podiumTitle')}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {t('groups.podiumSubtitle')}
          </p>
        </div>

        {/* Podium Pillars */}
        <div className="flex items-end justify-center gap-2 sm:gap-4 max-w-md mx-auto pt-4">
          {/* 2nd Place (Silver) */}
          {second ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', damping: 15 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-2">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-slate-300 shadow-md ring-2 ring-slate-300/20">
                  <AvatarImage src={second.avatarUrl || ''} alt={second.username} />
                  <AvatarFallback className="bg-slate-800 text-slate-200 font-bold">
                    {second.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-1 bg-slate-300 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shadow">
                  2
                </div>
              </div>
              <p className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[85px] text-center">
                {second.username}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                  {second.wins} {t('common.wins')}
                </Badge>
              </div>
              {/* Podium Block 2 */}
              <div className="w-full mt-3 h-20 sm:h-24 rounded-t-xl bg-gradient-to-t from-slate-800/80 to-slate-700/50 border-t-2 border-x border-slate-400/30 flex flex-col items-center justify-center">
                <Medal className="w-5 h-5 text-slate-300 mb-1 opacity-70" />
                <span className="font-mono text-xs font-semibold text-slate-300">
                  {second.winRate}% {t('groups.rateShort')}
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1" />
          )}

          {/* 1st Place (Gold - Center) */}
          {first && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, type: 'spring', damping: 15 }}
              className="flex-1 flex flex-col items-center -mt-4 z-10"
            >
              <div className="relative mb-2">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                  <Crown className="w-6 h-6 fill-amber-400/20" />
                </div>
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-amber-400 shadow-xl ring-4 ring-amber-400/25">
                  <AvatarImage src={first.avatarUrl || ''} alt={first.username} />
                  <AvatarFallback className="bg-amber-950 text-amber-300 font-bold text-lg">
                    {first.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-1 bg-amber-400 text-amber-950 rounded-full w-6 h-6 flex items-center justify-center font-black text-xs shadow-md">
                  1
                </div>
              </div>
              <p className="font-extrabold text-sm sm:text-base text-foreground truncate max-w-[100px] text-center">
                {first.username}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="default" className="bg-amber-500/20 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] px-2 py-0 font-mono font-bold">
                  {first.wins} {t('common.wins')}
                </Badge>
              </div>
              {/* Podium Block 1 */}
              <div className="w-full mt-3 h-28 sm:h-32 rounded-t-xl bg-gradient-to-t from-amber-950/60 to-amber-900/30 border-t-2 border-x border-amber-500/40 flex flex-col items-center justify-center shadow-inner">
                <Trophy className="w-6 h-6 text-amber-400 mb-1" />
                <span className="font-mono text-xs font-bold text-amber-300">
                  {first.winRate}% {t('groups.rateShort')}
                </span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place (Bronze) */}
          {third ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: 'spring', damping: 15 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-2">
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-amber-700 shadow-md ring-2 ring-amber-700/20">
                  <AvatarImage src={third.avatarUrl || ''} alt={third.username} />
                  <AvatarFallback className="bg-amber-950/80 text-amber-600 font-bold">
                    {third.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-1 bg-amber-700 text-amber-100 rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shadow">
                  3
                </div>
              </div>
              <p className="font-bold text-xs sm:text-sm text-foreground truncate max-w-[85px] text-center">
                {third.username}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                  {third.wins} {t('common.wins')}
                </Badge>
              </div>
              {/* Podium Block 3 */}
              <div className="w-full mt-3 h-16 sm:h-20 rounded-t-xl bg-gradient-to-t from-amber-950/50 to-amber-900/20 border-t-2 border-x border-amber-800/30 flex flex-col items-center justify-center">
                <Medal className="w-4 h-4 text-amber-600 mb-1 opacity-70" />
                <span className="font-mono text-xs font-semibold text-amber-600">
                  {third.winRate}% {t('groups.rateShort')}
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>

      {/* Rest of Leaderboard (Positions 4+) */}
      {rest.length > 0 && (
        <Card className="border-border/50 bg-card/40">
          <CardContent className="p-3 divide-y divide-border/40">
            {rest.map((member, idx) => (
              <div key={member.userId} className="flex items-center justify-between py-2.5 px-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center font-mono text-xs font-bold text-muted-foreground">
                    {idx + 4}
                  </span>
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={member.avatarUrl || ''} alt={member.username} />
                    <AvatarFallback className="text-xs">
                      <User className="w-3.5 h-3.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {member.username}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {member.totalPlayed} {t('groups.gamesShort')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {member.wins} {t('groups.winsShort')}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground w-12 text-right">
                    {member.winRate}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
