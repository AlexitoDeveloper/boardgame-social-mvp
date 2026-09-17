import { FC, useState } from 'react'
import { Crown, Timer, Sparkles } from 'lucide-react'
import { FirstPlayerPickerModal } from './FirstPlayerPickerModal'
import { TurnTimerModal } from './TurnTimerModal'
import { Badge } from '../ui/badge'

export const PlayCompanionBar: FC = () => {
  const [showPicker, setShowPicker] = useState(false)
  const [showTimer, setShowTimer] = useState(false)

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/70 text-muted-foreground border border-border/40 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span>Asistente en Vivo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-display">
            Herramientas para tu Mesa
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl">
            Utilidades táctiles para dinamizar turnos, evitar parálisis por análisis y resolver el primer jugador en persona.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* First Player Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowPicker(true)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowPicker(true)}
            className="p-5 rounded-3xl glass-panel border border-border/40 hover:border-amber-500/40 bg-card/60 hover:bg-amber-500/5 transition-all cursor-pointer shadow-md group flex items-start gap-4 active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Crown className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-foreground group-hover:text-amber-500 transition-colors">
                  ¿Quién Empieza?
                </h3>
                <Badge variant="secondary" size="sm" className="font-mono-tabular text-amber-500 bg-amber-500/10 border-amber-500/20">
                  Ruleta 2-6p
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Gira la corona digital para determinar al azar el jugador inicial de la partida.
              </p>
            </div>
          </div>

          {/* Turn Timer Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowTimer(true)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setShowTimer(true)}
            className="p-5 rounded-3xl glass-panel border border-border/40 hover:border-primary/40 bg-card/60 hover:bg-primary/5 transition-all cursor-pointer shadow-md group flex items-start gap-4 active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Timer className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  Temporizador Anti-AP
                </h3>
                <Badge variant="secondary" size="sm" className="font-mono-tabular text-primary bg-primary/10 border-primary/20">
                  Audio 30s-120s
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Pon ritmo a la partida con avisos sonoros de tiempo límite por turno.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FirstPlayerPickerModal isOpen={showPicker} onClose={() => setShowPicker(false)} />
      <TurnTimerModal isOpen={showTimer} onClose={() => setShowTimer(false)} />
    </>
  )
}
