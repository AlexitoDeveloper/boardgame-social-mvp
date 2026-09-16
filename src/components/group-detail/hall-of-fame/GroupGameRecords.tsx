import { Award, Calendar, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { Badge } from '../../ui/badge'
import { Card, CardContent } from '../../ui/card'
import { GameRecord } from '../../../types'

interface GroupGameRecordsProps {
  records: GameRecord[];
}

export function GroupGameRecords({ records }: GroupGameRecordsProps) {
  const { t } = useTranslation()

  if (!records || records.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {t('groups.gameRecords')}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {records.length} {t('groups.recordsCount')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.map((record) => (
          <Card
            key={record.gameId}
            className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-card/50 to-card/20 overflow-hidden hover:border-amber-500/40 transition-colors"
          >
            <CardContent className="p-3.5 space-y-3">
              <div className="flex items-center gap-3">
                {/* Game Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-secondary/50 overflow-hidden flex-shrink-0 border border-border/50">
                  {record.gameImage ? (
                    <img
                      src={record.gameImage}
                      alt={record.gameTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Award className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-foreground truncate">
                    {record.gameTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-1.5 py-0 font-bold gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {t('groups.recordLabel')}
                    </Badge>
                  </div>
                </div>

                {/* Big Score Display */}
                <div className="text-right">
                  <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-tight">
                    {record.highScore}
                  </div>
                  <div className="text-xs uppercase font-bold text-muted-foreground">
                    {t('groups.pointsShort')}
                  </div>
                </div>
              </div>

              {/* Record Holder Info Footer */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Avatar className="w-5 h-5 border border-border">
                    <AvatarImage src={record.holderAvatar || ''} alt={record.holderName} />
                    <AvatarFallback className="text-xs font-bold">
                      {record.holderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-foreground truncate max-w-[110px]">
                    {record.holderName}
                  </span>
                </div>

                {record.date && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{record.date.slice(0, 10)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
