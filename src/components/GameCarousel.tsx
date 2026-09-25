import { useRef, useState, useEffect, useCallback, memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Game } from '../types'
import { GameCoverCard } from './GameCoverCard'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface GameCarouselProps {
  games: Game[];
  title: string;
  variant?: 'default' | 'top10';
}

export const GameCarousel = memo(function GameCarousel({ 
  games, 
  title, 
  variant = 'default',
}: GameCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(games.length > 3)

  const checkScrollLimits = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const hasLeft = el.scrollLeft > 15
    const hasRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 15
    setShowLeftArrow(hasLeft)
    setShowRightArrow(hasRight)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Run limits check on mount and after layout paints
    checkScrollLimits()
    const t1 = setTimeout(checkScrollLimits, 150)
    const t2 = setTimeout(checkScrollLimits, 600)

    const isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (!isDesktop) {
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }

    let rafId: number | null = null
    const onScroll = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => {
        checkScrollLimits()
        rafId = null
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    const ro = new ResizeObserver(() => {
      checkScrollLimits()
    })
    ro.observe(el)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      ro.disconnect()
    }
  }, [games, checkScrollLimits])

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current
    if (!el) return
    const cardStep = variant === 'top10' ? 260 : 196
    const step = Math.max(Math.floor((el.clientWidth * 0.75) / cardStep) * cardStep, cardStep * 2)
    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth'
    })
  }

  if (!games || games.length === 0) return null;

  return (
    <div className="space-y-2 relative group/carousel py-1">
      {/* Title */}
      <h3 className="text-lg font-black font-display tracking-tight text-foreground px-1">{title}</h3>

      {/* Outer Wrapper */}
      <div className="relative w-full">
        {/* Scroll Container: snap on mobile, smooth scroll without snap conflict on desktop */}
        <div
          ref={containerRef}
          className="w-full max-w-full min-w-0 flex gap-4 overflow-x-auto pb-4 pt-4 px-1.5 snap-x snap-proximity md:snap-none scroll-smooth no-scrollbar -mt-2 overscroll-x-contain"
        >
          {games.map((game, index) => {
            if (variant === 'top10') {
              const isOne = index === 0;
              const isTen = index === 9;
              
              const rankStr = String(index + 1);

              const leftClass = isTen
                ? "left-[-12px] sm:left-[-14px] md:left-[-8px]"
                : isOne
                  ? "left-[20px] sm:left-[22px] md:left-[30px]"
                  : "left-[12px] sm:left-[15px] md:left-[22px]";

              return (
                 <div 
                  key={game.bgg_id} 
                  className="snap-start shrink-0 relative flex items-end pl-16 sm:pl-20 md:pl-24 select-none w-[200px] sm:w-[245px] md:w-[275px] pb-4"
                >
                  <span 
                    className={`absolute ${leftClass} text-[120px] sm:text-[150px] md:text-[180px] bottom-[22px] sm:bottom-[26px] md:bottom-[30px] font-black leading-none select-none z-0 [text-shadow:0_2px_8px_rgba(0,0,0,0.5)] flex font-sans pointer-events-none`}
                  >
                    {rankStr.split('').map((char, charIdx) => (
                      <span
                        key={charIdx}
                        className={charIdx > 0 ? "relative ml-[-0.18em] sm:ml-[-0.22em] md:ml-[-0.25em] z-10 font-sans font-black" : "relative z-0 font-sans font-black"}
                        style={{
                          WebkitTextStroke: '2.5px hsl(var(--foreground))',
                          color: 'hsl(var(--background))',
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                  <div className="relative z-10 w-[130px] sm:w-[150px] md:w-[170px]">
                    <GameCoverCard game={game} />
                  </div>
                </div>
              )
            }
            return (
              <div 
                key={game.bgg_id} 
                className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-[180px]"
              >
                <GameCoverCard game={game} />
              </div>
            )
          })}
        </div>

        {/* Left Arrow Button (Wrapped to isolate vertical centering from active transform) */}
        <div
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-50 hidden md:flex transition-opacity duration-150",
            !showLeftArrow && "opacity-0 pointer-events-none"
          )}
        >
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              scroll('left')
            }}
            variant="secondary"
            size="icon"
            className="h-11 w-11 rounded-full shadow-2xl bg-card/95 hover:bg-card border border-border/80 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-100 pointer-events-auto [&_svg]:size-5 !translate-y-0 active:!translate-y-0"
            aria-label="Scroll left"
            icon={ChevronLeft}
          />
        </div>

        {/* Right Arrow Button (Wrapped to isolate vertical centering from active transform) */}
        <div
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-50 hidden md:flex transition-opacity duration-150",
            !showRightArrow && "opacity-0 pointer-events-none"
          )}
        >
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              scroll('right')
            }}
            variant="secondary"
            size="icon"
            className="h-11 w-11 rounded-full shadow-2xl bg-card/95 hover:bg-card border border-border/80 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-100 pointer-events-auto [&_svg]:size-5 !translate-y-0 active:!translate-y-0"
            aria-label="Scroll right"
            icon={ChevronRight}
          />
        </div>
      </div>
    </div>
  )
})

export default GameCarousel;
