import React from 'react'

interface PlayerScore {
  name: string
  score: number
  meepleColor?: string
  isWinner?: boolean
}

interface MatchScoreboardStripProps {
  scores: PlayerScore[]
}

export const MatchScoreboardStrip: React.FC<MatchScoreboardStripProps> = ({ scores }) => {
  if (!scores || scores.length === 0) return null

  // Sort by score descending to display positions accurately
  const sorted = [...scores].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-0.5">
        <span>Marcador final</span>
        <span>Posiciones</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {sorted.map((p, idx) => {
          const isGold = idx === 0 || p.isWinner
          const isSilver = idx === 1
          const isBronze = idx === 2

          return (
            <div
              key={`${p.name}-${idx}`}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs transition-colors ${
                isGold
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-black shadow-xs'
                  : isSilver
                  ? 'bg-muted/60 border-border/40 text-foreground font-bold'
                  : isBronze
                  ? 'bg-muted/40 border-border/30 text-foreground/80 font-bold'
                  : 'bg-muted/20 border-border/20 text-muted-foreground font-semibold'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] opacity-70 font-mono font-black">
                  {idx + 1}º
                </span>
                <span className="truncate max-w-[70px] text-xs">
                  {p.name}
                </span>
              </div>
              <span className="font-mono text-xs font-black tracking-tight shrink-0 ml-1">
                {p.score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
