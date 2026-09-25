import React from 'react'

interface PlayerScore {
  name: string
  score: number
  meepleColor?: string
  isWinner?: boolean
}

interface MatchScoreSpreadBarProps {
  scores: PlayerScore[]
}

const PLAYER_ACCENT_COLORS = [
  'bg-amber-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-indigo-500',
]

export const MatchScoreSpreadBar: React.FC<MatchScoreSpreadBarProps> = ({ scores }) => {
  if (!scores || scores.length === 0) return null

  const sorted = [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  const highestScore = Math.max(...sorted.map((s) => s.score || 0), 1)

  return (
    <div className="space-y-2 pt-2">
      {/* Relative Performance Bars (BG Stats / Sports Analytics Pattern) */}
      <div className="space-y-1.5">
        {sorted.map((p, idx) => {
          const percentage = Math.max(12, Math.round(((p.score || 0) / highestScore) * 100))
          const isVictor = idx === 0 || p.isWinner
          const barColor = isVictor
            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
            : PLAYER_ACCENT_COLORS[idx % PLAYER_ACCENT_COLORS.length]

          return (
            <div key={`${p.name}-${idx}`} className="flex items-center gap-2.5 text-xs">
              <span className={`w-18 sm:w-22 truncate font-bold text-left ${isVictor ? 'text-foreground' : 'text-muted-foreground'}`}>
                {p.name}
              </span>

              <div className="flex-1 h-3 rounded-full bg-muted/40 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out-custom ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className={`w-12 text-right font-mono font-black text-xs ${isVictor ? 'text-amber-500 font-extrabold' : 'text-muted-foreground'}`}>
                {p.score} <span className="text-xs font-normal text-muted-foreground/70">pts</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
