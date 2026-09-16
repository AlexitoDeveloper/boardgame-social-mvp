import { motion } from 'framer-motion'
import { Flame, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { Card, CardContent } from '../../ui/card'
import { WinStreakRecord } from '../../../types'

interface GroupWinStreaksProps {
  streaks: WinStreakRecord[];
}

export function GroupWinStreaks({ streaks }: GroupWinStreaksProps) {
  const { t } = useTranslation()

  if (!streaks || streaks.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </motion.div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {t('groups.winStreaksTitle')}
          </h3>
        </div>
        <Badge variant="outline" className="border-orange-500/30 text-orange-400 bg-orange-500/10 text-xs font-mono">
          <Zap className="w-3 h-3 mr-1" />
          {t('groups.onFire')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {streaks.map((streak) => (
          <Card
            key={streak.userId}
            className="border-orange-500/20 bg-gradient-to-r from-orange-950/20 via-card/50 to-card/30 overflow-hidden relative"
          >
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <Avatar className="w-11 h-11 border-2 border-orange-500/50 shadow-md ring-2 ring-orange-500/20">
                    <AvatarImage src={streak.avatarUrl || ''} alt={streak.username} />
                    <AvatarFallback className="bg-orange-950 text-orange-300 font-bold">
                      {streak.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-orange-500 text-white rounded-full p-0.5 shadow"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    <Flame className="w-3.5 h-3.5 fill-white" />
                  </motion.div>
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">
                    {streak.username}
                  </p>
                  <p className="text-xs text-orange-300/80 font-medium">
                    {t('groups.consecutiveWins', { count: streak.streakCount })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="font-mono text-2xl font-black text-orange-400 flex items-center gap-0.5">
                  <span>{streak.streakCount}</span>
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                </div>
                <span className="text-xs uppercase font-bold text-muted-foreground">
                  {t('groups.streakLabel')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
