import { Swords, Dices } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { UserStats } from '../../hooks/useProfile'
import { useTranslation } from 'react-i18next'

interface StatsDashboardProps {
  stats: UserStats;
}

// Custom SVG Circular Gauge Component for high-end gaming dashboard look
function CircularProgress({ 
  value, 
  colorClass, 
  size = 64, 
  strokeWidth = 6 
}: { 
  value: number; 
  colorClass: string; 
  size?: number; 
  strokeWidth?: number 
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0 select-none" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Track circle */}
        <circle
          className="text-muted-foreground/15 stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-black text-foreground tracking-tighter">{value}%</span>
      </div>
    </div>
  )
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const { t } = useTranslation()
  const getKarmaInfo = (val: number) => {
    if (val >= 90) return { color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10', circleColor: 'text-emerald-500', label: t('profile.statsKarmaReliable') }
    if (val >= 70) return { color: 'text-amber-500 border-amber-500/20 bg-amber-500/10', circleColor: 'text-amber-500', label: t('profile.statsKarmaFrequent') }
    return { color: 'text-destructive border-destructive/20 bg-destructive/10', circleColor: 'text-destructive', label: t('profile.statsKarmaAbsent') }
  }

  const karmaInfo = getKarmaInfo(stats.karma)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Win Rate Card */}
      <Card className="glass-panel border-border/30 shadow-lg relative overflow-hidden group rounded-2xl hover:border-rose-500/30 hover:shadow-rose-500/5 transition-all duration-300">
        <div className="absolute -right-3 -bottom-5 opacity-10 dark:opacity-[0.06] group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none">
          <Swords className="w-28 h-28 text-rose-500 stroke-[1.25] rotate-12" />
        </div>
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 min-w-0 text-left">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">{t('profile.statsWinRate')}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight text-foreground">{stats.winRate}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold leading-normal truncate">
              {t('profile.statsWinRateDetail', { won: stats.won, played: stats.played })}
            </p>
          </div>
          
          <div className="drop-shadow-[0_0_8px_rgba(244,63,94,0.25)] shrink-0">
            <CircularProgress 
              value={stats.winRate} 
              colorClass="text-rose-500" 
              size={64}
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Card */}
      <Card className="glass-panel border-border/30 shadow-lg relative overflow-hidden group rounded-2xl hover:border-emerald-500/30 hover:shadow-emerald-500/5 transition-all duration-300">
        <div className="absolute -right-3 -bottom-5 opacity-10 dark:opacity-[0.06] group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none">
          <Dices className="w-28 h-28 text-emerald-500 stroke-[1.25] -rotate-12" />
        </div>
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 min-w-0 text-left">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">{t('profile.statsAttendance')}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight text-foreground">{stats.karma}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold leading-normal truncate">
              {t('profile.statsAttendanceDetail', { played: stats.played, missed: stats.missed })}
            </p>
          </div>
          
          <div className={`drop-shadow-[0_0_8px_rgba(${karmaInfo.circleColor === 'text-emerald-500' ? '16,185,129' : '239,68,68'},0.25)] shrink-0`}>
            <CircularProgress 
              value={stats.karma} 
              colorClass={karmaInfo.circleColor} 
              size={64}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
