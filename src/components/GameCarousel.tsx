import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Game } from '../types'
import { GameCoverCard } from './GameCoverCard'

interface GameCarouselProps {
  games: Game[];
  title: string;
  variant?: 'default' | 'top10';
}

export function GameCarousel({ games, title, variant = 'default' }: GameCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScrollLimits = () => {
    const el = containerRef.current
    if (!el) return
    setShowLeftArrow(el.scrollLeft > 5)
    // Add a tolerance buffer of 5px for subpixel rendering
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 5)
  }

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.addEventListener('scroll', checkScrollLimits)
      // Check on mount/resize
      checkScrollLimits()
      window.addEventListener('resize', checkScrollLimits)
    }
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScrollLimits)
      }
      window.removeEventListener('resize', checkScrollLimits)
    }
  }, [games])

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current
    if (!el) return
    const scrollAmount = el.clientWidth * 0.75
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  if (!games || games.length === 0) return null;

  return (
    <div className="space-y-2 relative group/carousel py-1">
      {/* Title */}
      <h3 className="text-lg font-black tracking-tight px-1 text-foreground">{title}</h3>

      {/* Outer Wrapper */}
      <div className="relative w-full">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-background/80 dark:bg-black/60 text-foreground dark:text-white p-2 rounded-full cursor-pointer transition-all duration-200 hidden md:flex items-center justify-center border border-border dark:border-white/10 hover:bg-background dark:hover:bg-black/80 hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-background/80 dark:bg-black/60 text-foreground dark:text-white p-2 rounded-full cursor-pointer transition-all duration-200 hidden md:flex items-center justify-center border border-border dark:border-white/10 hover:bg-background dark:hover:bg-black/80 hover:scale-110 active:scale-95 shadow-md backdrop-blur-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={containerRef}
          className="w-full max-w-full min-w-0 flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {games.map((game, index) => {
            if (variant === 'top10') {
              const isOne = index === 0;
              const isTen = index === 9;
              
              const rankStr = String(index + 1);

              const leftClass = isTen
                ? "left-[-16px] sm:left-[-24px] md:left-[-28px]"
                : isOne
                  ? "left-[20px] sm:left-[18px] md:left-[16px]"
                  : "left-[12px] sm:left-[10px] md:left-[8px]";

              return (
                 <div 
                  key={game.bgg_id} 
                  className="snap-start shrink-0 relative flex items-end pl-16 sm:pl-20 md:pl-24 select-none w-[200px] sm:w-[245px] md:w-[275px] pb-4"
                >
                  <span 
                    className={`absolute ${leftClass} text-[120px] sm:text-[150px] md:text-[180px] bottom-[22px] sm:bottom-[26px] md:bottom-[30px] font-black leading-none select-none z-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-all duration-200 flex font-inter`}
                  >
                    {rankStr.split('').map((char, charIdx) => (
                      <span
                        key={charIdx}
                        className={charIdx > 0 ? "relative ml-[-0.18em] sm:ml-[-0.22em] md:ml-[-0.25em] z-10" : "relative z-0"}
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
      </div>
    </div>
  )
}
export default GameCarousel;
