import { useState, useEffect, useRef } from 'react'
import { Timer, Play, Pause, RotateCcw, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { FilterChip } from '../ui/chip'
import { tableAudio } from '../../lib/tableAudio'

interface TurnTimerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TurnTimerModal({ open, onOpenChange }: TurnTimerModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(60) // in seconds
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [turnCount, setTurnCount] = useState<number>(1)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset when duration changes
  const handleSelectDuration = (seconds: number) => {
    setSelectedDuration(seconds)
    setTimeLeft(seconds)
    setIsRunning(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            setIsRunning(false)
            tableAudio.playTurnBell()
            return 0
          }
          if (prev <= 6 && prev > 1) {
            tableAudio.playUrgentTick()
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const handleNextTurn = () => {
    tableAudio.playTurnBell()
    setTimeLeft(selectedDuration)
    setIsRunning(true)
    setTurnCount(prev => prev + 1)
  }

  const handleReset = () => {
    setTimeLeft(selectedDuration)
    setIsRunning(false)
    setTurnCount(1)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  const progressPercent = (timeLeft / selectedDuration) * 100

  const isLowTime = timeLeft <= 10 && timeLeft > 0
  const isTimeUp = timeLeft === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Timer className="w-6 h-6 text-amber-400" />
            Reloj de Turno Digital
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Control de tiempo para agilizar turnos y evitar el análisis-parálisis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Duration Presets */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[30, 45, 60, 90, 120, 180].map(sec => (
              <FilterChip
                key={sec}
                selected={selectedDuration === sec}
                onClick={() => handleSelectDuration(sec)}
                variant={selectedDuration === sec ? 'primary' : 'default'}
                size="sm"
                className="font-bold text-xs"
              >
                {sec < 60 ? `${sec}s` : `${sec / 60}m`}
              </FilterChip>
            ))}
          </div>

          {/* Large Countdown Display */}
          <div className={`p-6 rounded-3xl border-2 text-center transition-all ${
            isTimeUp
              ? 'bg-rose-500/20 border-rose-500/60 shadow-xl shadow-rose-500/10 animate-pulse'
              : isLowTime
              ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10 animate-bounce'
              : 'bg-muted/20 border-border/40'
          }`}>
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Turno #{turnCount}
            </span>
            <div className={`text-6xl font-black tracking-tight font-mono my-2 ${
              isTimeUp ? 'text-rose-500' : isLowTime ? 'text-amber-400' : 'text-foreground'
            }`}>
              {formattedTime}
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden mt-3 border border-border/30">
              <div
                className={`h-full transition-all duration-1000 ${
                  isTimeUp ? 'bg-rose-500' : isLowTime ? 'bg-amber-400' : 'bg-primary'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <Button
              onClick={handleNextTurn}
              size="lg"
              className="w-full font-black text-sm rounded-2xl shadow-xl shadow-primary/20 h-12"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Paso Turno (Reiniciar reloj)
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 font-bold rounded-xl"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-1.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1.5 fill-current" /> Reanudar
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={handleReset}
                className="font-bold rounded-xl text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reiniciar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


