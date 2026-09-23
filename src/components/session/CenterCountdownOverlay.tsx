import { useEffect, useState, FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface CenterCountdownOverlayProps {
  isCountingDown: boolean
  progress?: number // optional for backwards compatibility
  touchCount: number
}

export const CenterCountdownOverlay: FC<CenterCountdownOverlayProps> = ({
  isCountingDown,
  touchCount,
}) => {
  const { t } = useTranslation()
  const [secondsRemaining, setSecondsRemaining] = useState(3)
  const [started, setStarted] = useState(false)

  // Step seconds countdown (3 -> 2 -> 1) and trigger CSS ring transition
  useEffect(() => {
    if (!isCountingDown) {
      setSecondsRemaining(3)
      setStarted(false)
      return
    }

    const raf = requestAnimationFrame(() => setStarted(true))
    const timer = setInterval(() => {
      setSecondsRemaining((s) => Math.max(1, s - 1))
    }, 730)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(timer)
    }
  }, [isCountingDown])

  // Haptic pulse on second tick
  useEffect(() => {
    if (isCountingDown && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20)
      } catch {}
    }
  }, [secondsRemaining, isCountingDown])

  if (!isCountingDown || touchCount < 2) return null

  // Circle SVG dimensions
  const size = 140
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-30 select-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative flex items-center justify-center"
      >
        {/* Glowing backdrop circle */}
        <div className="absolute w-36 h-36 rounded-full bg-emerald-500/15 blur-xl animate-pulse" />

        {/* Circular Progress Ring */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={started ? 0 : circumference}
            strokeLinecap="round"
            fill="rgba(10, 15, 29, 0.85)"
            style={{ transitionDuration: '2200ms' }}
            className="transition-[stroke-dashoffset] ease-linear"
          />
        </svg>

        {/* Big Animated Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={secondsRemaining}
              initial={{ scale: 0.4, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.4, opacity: 0, y: -5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="text-5xl font-black text-emerald-400 font-mono-tabular drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            >
              {secondsRemaining}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Reassurance text for players */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 mt-4 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 backdrop-blur-md shadow-lg"
      >
        {t('tableHub.firstPlayer.holdFingers', '¡Mantened los dedos en la pantalla!')}
      </motion.p>
    </div>
  )
}
