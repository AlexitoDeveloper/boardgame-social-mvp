import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Game } from '../types'
import { GameCoverCard } from './GameCoverCard'

interface GameCarouselProps {
  games: Game[];
  title: string;
}

export function GameCarousel({ games, title }: GameCarouselProps) {
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
    <div className="space-y-3 relative group/carousel py-2">
      {/* Title */}
      <h3 className="text-lg font-black tracking-tight px-1 text-foreground">{title}</h3>

      {/* Outer Wrapper */}
      <div className="relative w-full">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/85 text-white p-2 rounded-full cursor-pointer transition-all duration-200 hidden md:flex items-center justify-center border border-white/10 hover:scale-105 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/85 text-white p-2 rounded-full cursor-pointer transition-all duration-200 hidden md:flex items-center justify-center border border-white/10 hover:scale-105 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
          }}
        >
          {/* Hide webkit scrollbars inline since we want it completely hidden */}
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {games.map((game) => (
            <div 
              key={game.bgg_id} 
              className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-[180px]"
            >
              <GameCoverCard game={game} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default GameCarousel;
