import { useState } from 'react'
import { Crown, Dices, Trophy, Timer } from 'lucide-react'
import { Card } from '../ui/card'
import { FirstPlayerSelector } from '../session/FirstPlayerSelector'
import { LiveScoreModal } from './LiveScoreModal'
import { DiceRollerModal } from './DiceRollerModal'
import { TurnTimerModal } from './TurnTimerModal'

interface TableToolsBarProps {
  attendees?: { id: string; name: string; avatarUrl?: string | null }[]
}

export function TableToolsBar({ attendees }: TableToolsBarProps) {
  const [showFirstPlayer, setShowFirstPlayer] = useState(false)
  const [showLiveScore, setShowLiveScore] = useState(false)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [showTurnTimer, setShowTurnTimer] = useState(false)

  const tools = [
    {
      title: 'Primer Jugador',
      desc: 'Selector táctil con meeples',
      icon: Crown,
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
      onClick: () => setShowFirstPlayer(true),
    },
    {
      title: 'Marcador en Vivo',
      desc: 'Puntuación y podio en directo',
      icon: Trophy,
      color: 'text-primary bg-primary/15 border-primary/25',
      onClick: () => setShowLiveScore(true),
    },
    {
      title: 'Tirador de Dados',
      desc: '1d6, 2d6, d10, d20 con suma',
      icon: Dices,
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
      onClick: () => setShowDiceRoller(true),
    },
    {
      title: 'Reloj de Turno',
      desc: 'Temporizador anti-AP',
      icon: Timer,
      color: 'text-purple-400 bg-purple-500/15 border-purple-500/25',
      onClick: () => setShowTurnTimer(true),
    },
  ]

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <Dices className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
            Herramientas Prácticas de Mesa
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tools.map((tool, i) => (
            <Card
              key={i}
              onClick={tool.onClick}
              className="p-3.5 rounded-2xl border border-border/40 hover:border-primary/45 bg-card/60 backdrop-blur-md hover:bg-card/95 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:scale-[1.02] group flex flex-col justify-between h-full select-none"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${tool.color} mb-3 transition-transform group-hover:scale-110 shadow-sm`}>
                <tool.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors">
                  {tool.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 font-medium">
                  {tool.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 1. First Player Chwazi Touch Selector */}
      <FirstPlayerSelector
        isOpen={showFirstPlayer}
        onClose={() => setShowFirstPlayer(false)}
        attendees={attendees}
      />

      {/* 2. Live Score Tracker Modal */}
      <LiveScoreModal
        open={showLiveScore}
        onOpenChange={setShowLiveScore}
        attendees={attendees}
      />

      {/* 3. Dice Roller Modal */}
      <DiceRollerModal
        open={showDiceRoller}
        onOpenChange={setShowDiceRoller}
      />

      {/* 4. Turn Timer Modal */}
      <TurnTimerModal
        open={showTurnTimer}
        onOpenChange={setShowTurnTimer}
      />
    </>
  )
}
