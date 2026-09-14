import { FC, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { useTableSound } from '../../hooks/useTableSound'
import { MeepleColor } from '../../types'

export interface MeepleTokenProps extends HTMLAttributes<HTMLDivElement> {
  color?: MeepleColor
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isSelected?: boolean
  label?: string | number
  showShadow?: boolean
  onClick?: () => void
  disabled?: boolean
}

const colorStyles: Record<MeepleColor, { fill: string; border: string; glow: string; text: string }> = {
  red: {
    fill: 'bg-meeple-red text-white',
    border: 'border-red-400/40 shadow-red-500/20',
    glow: 'ring-red-500/40',
    text: 'text-meeple-red',
  },
  blue: {
    fill: 'bg-meeple-blue text-white',
    border: 'border-blue-400/40 shadow-blue-500/20',
    glow: 'ring-blue-500/40',
    text: 'text-meeple-blue',
  },
  yellow: {
    fill: 'bg-meeple-yellow text-slate-950',
    border: 'border-amber-300/60 shadow-amber-500/25',
    glow: 'ring-amber-400/50',
    text: 'text-amber-500',
  },
  green: {
    fill: 'bg-meeple-green text-white',
    border: 'border-emerald-400/40 shadow-emerald-500/20',
    glow: 'ring-emerald-500/40',
    text: 'text-meeple-green',
  },
  purple: {
    fill: 'bg-meeple-purple text-white',
    border: 'border-purple-400/40 shadow-purple-500/20',
    glow: 'ring-purple-500/40',
    text: 'text-meeple-purple',
  },
  orange: {
    fill: 'bg-meeple-orange text-white',
    border: 'border-orange-400/40 shadow-orange-500/20',
    glow: 'ring-orange-500/40',
    text: 'text-meeple-orange',
  },
}

const sizeConfig = {
  xs: { box: 'w-6 h-6', icon: 'w-3.5 h-3.5', font: 'text-[9px]' },
  sm: { box: 'w-8 h-8', icon: 'w-4 h-4', font: 'text-[10px]' },
  md: { box: 'w-10 h-10', icon: 'w-5 h-5', font: 'text-xs' },
  lg: { box: 'w-12 h-12', icon: 'w-6 h-6', font: 'text-sm' },
  xl: { box: 'w-16 h-16', icon: 'w-8 h-8', font: 'text-base' },
}

/** Standard board game Meeple SVG silhouette */
export const MeepleSvg: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn('shrink-0 fill-current', className)}
    aria-hidden="true"
    focusable="false"
  >
    {/* Canonical Carcassonne / Tabletop meeple path */}
    <path d="M 50 4 C 41.5 4 35 11 35 19 C 35 25.5 39.5 31 45.5 33 C 34 37 20 44 14 49 C 10 52 11 58 16 60 C 23 63 33 58 35 55 L 35 68 C 35 72 26 84 21 91 C 18 95 21 98 26 98 L 44 98 C 47 98 48 94 48 88 L 48 76 C 48 74 52 74 52 76 L 52 88 C 52 94 53 98 56 98 L 74 98 C 79 98 82 95 79 91 C 74 84 65 72 65 68 L 65 55 C 67 58 77 63 84 60 C 89 58 90 52 86 49 C 80 44 66 37 54.5 33 C 60.5 31 65 25.5 65 19 C 65 11 58.5 4 50 4 Z" />
  </svg>
)

export const MeepleToken: FC<MeepleTokenProps> = ({
  color = 'green',
  size = 'md',
  isSelected = false,
  label,
  showShadow = true,
  onClick,
  disabled = false,
  className,
  ...rest
}) => {
  const { playClack } = useTableSound()
  const styling = colorStyles[color]
  const sz = sizeConfig[size]

  const handleClick = () => {
    if (disabled) return
    playClack()
    onClick?.()
  }

  return (
    <motion.div
      whileHover={disabled ? undefined : { scale: 1.05, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.94, y: 1 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl transition-all select-none',
        sz.box,
        styling.fill,
        'border',
        styling.border,
        showShadow && 'shadow-md',
        isSelected && cn('ring-2 ring-offset-2 ring-offset-background', styling.glow),
        disabled && 'opacity-40 pointer-events-none cursor-not-allowed',
        onClick && 'cursor-pointer active:shadow-sm',
        className
      )}
      {...(rest as any)}
    >
      <MeepleSvg className={sz.icon} />
      {label !== undefined && (
        <span
          className={cn(
            'absolute -bottom-1 -right-1 px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center font-black leading-none bg-background/90 text-foreground border border-border/60 shadow-xs',
            sz.font
          )}
        >
          {label}
        </span>
      )}
    </motion.div>
  )
}
