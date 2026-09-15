import { useState, useRef, useEffect, FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { X, Dices, RotateCcw, Trophy, Users } from 'lucide-react'
import { Button } from '../ui/button'
import { MeepleColor } from '../../types'

interface TouchPoint {
  id: number
  x: number
  y: number
  color: MeepleColor
}

interface PlayerOption {
  id: string
  name: string
  avatarUrl?: string | null
}

interface FirstPlayerSelectorProps {
  isOpen: boolean
  onClose: () => void
  attendees?: PlayerOption[]
  onSelectFirstPlayer?: (playerId: string | null, playerName: string) => void
}

const PALETTE_COLORS: MeepleColor[] = ['red', 'blue', 'yellow', 'green', 'purple', 'orange']

const COLOR_MAP: Record<MeepleColor, { bg: string; ring: string; border: string }> = {
  red: { bg: 'bg-red-500', ring: 'ring-red-400', border: 'border-red-400' },
  blue: { bg: 'bg-blue-500', ring: 'ring-blue-400', border: 'border-blue-400' },
  yellow: { bg: 'bg-amber-400', ring: 'ring-amber-300', border: 'border-amber-300' },
  green: { bg: 'bg-emerald-500', ring: 'ring-emerald-400', border: 'border-emerald-400' },
  purple: { bg: 'bg-purple-500', ring: 'ring-purple-400', border: 'border-purple-400' },
  orange: { bg: 'bg-orange-500', ring: 'ring-orange-400', border: 'border-orange-400' },
}

export const FirstPlayerSelector: FC<FirstPlayerSelectorProps> = ({
  isOpen,
  onClose,
  attendees = [],
  onSelectFirstPlayer,
}) => {
  const [touches, setTouches] = useState<TouchPoint[]>([])
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownProgress, setCountdownProgress] = useState(0)
  const [winnerTouch, setWinnerTouch] = useState<TouchPoint | null>(null)
  const [winnerPlayer, setWinnerPlayer] = useState<PlayerOption | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const countdownIntervalRef = useRef<number | null>(null)

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setTouches([])
      setIsCountingDown(false)
      setCountdownProgress(0)
      setWinnerTouch(null)
      setWinnerPlayer(null)
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current)
      }
    }
  }, [isOpen])

  // Allow closing via Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle countdown when touches are active
  useEffect(() => {
    if (winnerTouch || winnerPlayer) return

    if (touches.length >= 2) {
      setIsCountingDown(true)
      const durationMs = 2200
      const stepMs = 50
      let elapsed = 0

      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current)
      }

      countdownIntervalRef.current = window.setInterval(() => {
        elapsed += stepMs
        const progress = Math.min(100, (elapsed / durationMs) * 100)
        setCountdownProgress(progress)

        if (elapsed >= durationMs) {
          if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current)
          }

          // Pick winner touch
          setTouches((currentTouches) => {
            if (currentTouches.length === 0) return currentTouches
            const winnerIdx = Math.floor(Math.random() * currentTouches.length)
            const chosen = currentTouches[winnerIdx]
            setWinnerTouch(chosen)

            // Vibrate if available on mobile
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate([60, 40, 120])
            }

            confetti({
              particleCount: 50,
              spread: 60,
              origin: { x: chosen.x / window.innerWidth, y: chosen.y / window.innerHeight },
              colors: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'],
            })

            onSelectFirstPlayer?.(null, `Jugador (${chosen.color.toUpperCase()})`)
            return currentTouches
          })
          setIsCountingDown(false)
        }
      }, stepMs)
    } else {
      setIsCountingDown(false)
      setCountdownProgress(0)
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current)
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current)
      }
    }
  }, [touches.length, winnerTouch, winnerPlayer, onSelectFirstPlayer])

  // Multitouch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (winnerTouch || winnerPlayer) return
    
    // Ignore touches on interactive elements (buttons, close icon, etc.)
    const target = e.target as HTMLElement | null
    if (target && target.closest('button, a, input, [role="button"]')) {
      return
    }

    e.preventDefault()

    const newTouches: TouchPoint[] = []
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i]
      const color = PALETTE_COLORS[i % PALETTE_COLORS.length]
      newTouches.push({
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
        color,
      })
    }
    setTouches(newTouches)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (winnerTouch || winnerPlayer) return
    e.preventDefault()

    setTouches((prev) => {
      return prev.map((item) => {
        for (let i = 0; i < e.touches.length; i++) {
          const t = e.touches[i]
          if (t.identifier === item.id) {
            return { ...item, x: t.clientX, y: t.clientY }
          }
        }
        return item
      })
    })
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (winnerTouch || winnerPlayer) return
    e.preventDefault()

    const activeIds = new Set<number>()
    for (let i = 0; i < e.touches.length; i++) {
      activeIds.add(e.touches[i].identifier)
    }
    setTouches((prev) => prev.filter((item) => activeIds.has(item.id)))
  }

  // Desktop / Accessible Random Roll
  const handleRandomAttendee = () => {
    if (attendees.length === 0) return
    const chosen = attendees[Math.floor(Math.random() * attendees.length)]
    setWinnerPlayer(chosen)

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 60, 100])
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'],
    })

    onSelectFirstPlayer?.(chosen.id, chosen.name)
  }

  const resetSelection = () => {
    setWinnerTouch(null)
    setWinnerPlayer(null)
    setTouches([])
    setIsCountingDown(false)
    setCountdownProgress(0)
  }

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="fixed inset-0 z-50 bg-slate-950/95 text-white flex flex-col justify-between overflow-hidden touch-none select-none backdrop-blur-xl"
    >
      {/* Top Header Controls */}
      <div
        className="flex items-center justify-between p-4 z-20"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onTouchCancel={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Dices className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight">Primer Jugador</h2>
            <p className="text-[11px] text-muted-foreground font-medium">
              {touches.length === 0 ? 'Colocad los dedos sobre la pantalla' : `${touches.length} dedos en mesa`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(winnerTouch || winnerPlayer) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetSelection}
              className="h-8 text-xs font-bold gap-1 rounded-xl bg-slate-900 border-white/20 text-white hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Repetir</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            aria-label="Cerrar selector"
            className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Touch Rings Rendering Area */}
      <div className="absolute inset-0 pointer-events-none">
        {touches.map((t) => {
          const isWinner = winnerTouch?.id === t.id
          const styling = COLOR_MAP[t.color]

          return (
            <div
              key={t.id}
              style={{ left: `${t.x}px`, top: `${t.y}px` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 flex items-center justify-center pointer-events-none"
            >
              {/* Outer pulsing ring */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{
                  scale: isWinner ? [1, 1.4, 1.2] : isCountingDown ? [1, 1.18, 1] : 1,
                  opacity: isWinner ? 1 : 0.8,
                }}
                transition={{
                  repeat: isWinner ? 0 : Infinity,
                  duration: isCountingDown ? 0.6 : 1.2,
                  ease: 'easeInOut',
                }}
                className={`absolute inset-0 rounded-full border-2 ${styling.border} ring-4 ${styling.ring}/30 pointer-events-none`}
              />

              {/* Inner disc directly in the center */}
              <motion.div
                initial={{ scale: 0.2 }}
                animate={{ scale: isWinner ? 1.4 : 1 }}
                className={`w-14 h-14 rounded-full ${styling.bg} shadow-lg flex items-center justify-center text-white font-black text-xs border border-white/40 pointer-events-none relative z-10`}
              >
                {isWinner ? <Trophy className="w-6 h-6 text-white" /> : '•'}
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Center Guidance / Countdown / Winner Card */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
        <AnimatePresence mode="wait">
          {winnerPlayer ? (
            <motion.div
              key="player-winner"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className="bg-slate-900/90 border border-emerald-500/40 p-6 rounded-3xl max-w-xs w-full shadow-2xl backdrop-blur-md pointer-events-auto space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Primer Jugador</span>
                <h3 className="text-xl font-black text-white">{winnerPlayer.name}</h3>
                <p className="text-xs text-muted-foreground font-medium">¡Comienza la partida!</p>
              </div>
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="w-full font-black text-xs h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
              >
                Confirmar
              </Button>
            </motion.div>
          ) : winnerTouch ? (
            <motion.div
              key="touch-winner"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className="bg-slate-900/90 border border-emerald-500/40 p-6 rounded-3xl max-w-xs w-full shadow-2xl backdrop-blur-md pointer-events-auto space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Primer Jugador</span>
                <h3 className="text-lg font-black text-white capitalize">
                  Dedo {winnerTouch.color}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">¡Tu turno de abrir mesa!</p>
              </div>
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="w-full font-black text-xs h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
              >
                Confirmar
              </Button>
            </motion.div>
          ) : isCountingDown ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 animate-pulse">
                Mantened los dedos fijos...
              </span>
              <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto border border-white/10">
                <div
                  style={{ width: `${countdownProgress}%` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-75"
                />
              </div>
            </motion.div>
          ) : touches.length === 1 ? (
            <motion.div
              key="one-touch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground text-xs font-semibold"
            >
              Se necesita al menos otro jugador tocando la pantalla
            </motion.div>
          ) : (
            <motion.div
              key="instruction"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 max-w-xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white/40">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">Pon un dedo en la pantalla</p>
              <p className="text-xs text-muted-foreground">
                Cada participante apoya su dedo. Tras 2 segundos el sistema elegirá al azar quién inicia la partida.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Accessible / Desktop Bar */}
      <div
        className="p-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 bg-slate-950/80 backdrop-blur-md"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        onTouchCancel={(e) => e.stopPropagation()}
      >
        <span className="text-[11px] text-muted-foreground font-medium">
          ¿En ordenador o sin táctil?
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {attendees.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomAttendee}
              className="flex-1 sm:flex-initial h-9 text-xs font-bold gap-1.5 rounded-xl border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
            >
              <Dices className="w-4 h-4 text-emerald-400" />
              <span>Sortear entre la mesa ({attendees.length})</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
