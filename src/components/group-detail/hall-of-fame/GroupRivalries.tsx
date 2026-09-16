import { motion } from 'framer-motion'
import { Swords, Skull, Target, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { Card, CardContent } from '../../ui/card'
import { RivalryStat } from '../../../types'

interface GroupRivalriesProps {
  nemesis: RivalryStat | null;
  favoriteVictim: RivalryStat | null;
}

export function GroupRivalries({ nemesis, favoriteVictim }: GroupRivalriesProps) {
  const { t } = useTranslation()

  if (!nemesis && !favoriteVictim) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <Swords className="w-4 h-4 text-emerald-400" />
        </motion.div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          {t('groups.rivalriesTitle')}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nemesis Card */}
        {nemesis ? (
          <Card className="border-rose-500/20 bg-gradient-to-br from-rose-950/20 via-card/50 to-card/30 overflow-hidden relative group">
            <div className="absolute -right-6 -bottom-6 text-rose-500/10 pointer-events-none group-hover:scale-110 transition-transform">
              <Skull className="w-28 h-28" />
            </div>
            <CardContent className="p-4 relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="bg-rose-500/15 text-rose-400 border border-rose-500/30 gap-1 text-xs">
                  <Skull className="w-3 h-3" />
                  {t('groups.nemesis')}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  {nemesis.totalMatchesTogether} {t('groups.matchesTogether')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-rose-500/40 ring-2 ring-rose-500/20 shadow-md">
                  <AvatarImage src={nemesis.opponentAvatar || ''} alt={nemesis.opponentName} />
                  <AvatarFallback className="bg-rose-950 text-rose-300 font-bold">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm sm:text-base text-foreground truncate">
                    {nemesis.opponentName}
                  </p>
                  <p className="text-xs text-rose-300/80 font-medium">
                    {nemesis.count} {t('groups.lossesAgainstCount')}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('groups.nemesisDesc')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/30 bg-card/20 p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">{t('groups.noNemesisYet')}</p>
          </Card>
        )}

        {/* Favorite Victim Card */}
        {favoriteVictim ? (
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-card/50 to-card/30 overflow-hidden relative group">
            <div className="absolute -right-6 -bottom-6 text-emerald-500/10 pointer-events-none group-hover:scale-110 transition-transform">
              <Target className="w-28 h-28" />
            </div>
            <CardContent className="p-4 relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1 text-xs">
                  <Target className="w-3 h-3" />
                  {t('groups.favoriteVictim')}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  {favoriteVictim.totalMatchesTogether} {t('groups.matchesTogether')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-emerald-500/40 ring-2 ring-emerald-500/20 shadow-md">
                  <AvatarImage src={favoriteVictim.opponentAvatar || ''} alt={favoriteVictim.opponentName} />
                  <AvatarFallback className="bg-emerald-950 text-emerald-300 font-bold">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm sm:text-base text-foreground truncate">
                    {favoriteVictim.opponentName}
                  </p>
                  <p className="text-xs text-emerald-300/80 font-medium">
                    {favoriteVictim.count} {t('groups.winsAgainstCount')}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('groups.favoriteVictimDesc')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/30 bg-card/20 p-4 flex flex-col items-center justify-center text-center">
            <p className="text-xs text-muted-foreground">{t('groups.noVictimYet')}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
