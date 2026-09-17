import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Game } from '../types'
import { GameCoverCard } from './GameCoverCard'
import { Button } from './ui/button'

interface GameCarouselProps {
  games: Game[];
  title: string;
  variant?: 'default' | 'top10';
}

export function GameCarousel({ 
  games, 
  title, 
  variant = 'default',
}: GameCarouselProps) {
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
      <h3 className="text-lg font-black font-display tracking-tight text-foreground px-1">{title}</h3>

      {/* Outer Wrapper */}
      <div className="relative w-full">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <Button
            onClick={() => scroll('left')}
            variant="secondary"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 bg-card/90 text-foreground p-0 rounded-full cursor-pointer transition-transform duration-200 hidden md:flex items-center justify-center border border-border/60 hover:scale-110 active:scale-95 shadow-xl backdrop-blur-md hover:bg-card"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </Button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <Button
            onClick={() => scroll('right')}
            variant="secondary"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 bg-card/90 text-foreground p-0 rounded-full cursor-pointer transition-transform duration-200 hidden md:flex items-center justify-center border border-border/60 hover:scale-110 active:scale-95 shadow-xl backdrop-blur-md hover:bg-card"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </Button>
        )}

        {/* Scroll Container */}
        <div
          ref={containerRef}
          className="w-full max-w-full min-w-0 flex gap-4 overflow-x-auto pb-4 pt-4 px-1.5 snap-x snap-mandatory scroll-smooth no-scrollbar -mt-2"
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
                    className={`absolute ${leftClass} text-[120px] sm:text-[150px] md:text-[180px] bottom-[22px] sm:bottom-[26px] md:bottom-[30px] font-black leading-none select-none z-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] transition-all duration-200 flex font-sans`}
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
      </div>
    </div>
  )
}
export default GameCarousel;
