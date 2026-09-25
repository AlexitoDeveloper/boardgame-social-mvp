import React from 'react'
import { cn } from '../../lib/utils'

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  badgeText?: string
  showBadge?: boolean
  glow?: boolean
}

const sizeMap = {
  xs: { icon: 'w-6 h-6', text: 'text-sm', badge: 'text-xs px-1.5 py-0.5' },
  sm: { icon: 'w-8 h-8', text: 'text-base', badge: 'text-xs px-1.5 py-0.5' },
  md: { icon: 'w-10 h-10', text: 'text-lg', badge: 'text-xs px-2 py-0.5' },
  lg: { icon: 'w-12 h-12', text: 'text-xl', badge: 'text-xs px-2 py-0.5' },
  xl: { icon: 'w-16 h-16', text: 'text-2xl', badge: 'text-sm px-2.5 py-1' },
}

export function BrandLogoIcon({
  className,
  glow = true,
  alt = 'LudiClub Logo',
}: {
  className?: string
  glow?: boolean
  alt?: string
}) {
  return (
    <div
      className={cn(
        'relative shrink-0 select-none flex items-center justify-center bg-transparent',
        glow,
        className
      )}
    >
      <img
        src="/brand/app-logo-transparent.png"
        alt={alt}
        className="w-full h-full object-contain"
        loading="eager"
      />
    </div>
  )
}

export function BrandLogo({
  size = 'md',
  showText = true,
  showBadge = false,
  badgeText = '',
  glow = true,
  className,
  ...props
}: BrandLogoProps) {
  const currentSize = sizeMap[size]

  return (
    <div className={cn('inline-flex items-center gap-3', className)} {...props}>
      <BrandLogoIcon className={currentSize.icon} glow={glow} />

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-2">
            <span className={cn('font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent', currentSize.text)}>
              Ludiclub
            </span>
            {showBadge && badgeText && (
              <span className={cn('font-semibold rounded-full bg-primary/15 text-primary border border-primary/20 uppercase tracking-wider', currentSize.badge)}>
                {badgeText}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-muted-foreground mt-0.5">
            Tu Club de Juegos de Mesa
          </span>
        </div>
      )}
    </div>
  )
}
