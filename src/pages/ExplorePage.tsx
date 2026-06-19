import { useState } from 'react'
import { useExploreGames } from '../hooks/useExploreGames'
import { ExploreHeader } from '../components/ExploreHeader'
import { GameCarousel } from '../components/GameCarousel'
import { GameCoverCard } from '../components/GameCoverCard'
import { CommunityRankingCard } from '../components/CommunityRankingCard'
import { Library } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

export function ExplorePage() {
  const [search, setSearchChange] = useState('')
  const [playerFilter, setPlayerFilterChange] = useState('')
  const [complexityFilter, setComplexityFilterChange] = useState('')
  const [spanishOnly, setSpanishOnlyChange] = useState(false)

  const {
    loadingCarousels,
    loadingSearch,
    error,
    novedades,
    paraDos,
    classics,
    top10,
    top10Month,
    communityRankings,
    searchResults,
    isFiltering
  } = useExploreGames(search, playerFilter, complexityFilter, spanishOnly)

  // Skeleton loaders for grids
  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div 
          key={i} 
          className="aspect-[2/3] w-full rounded-xl bg-muted/40 animate-pulse border border-border/10" 
        />
      ))}
    </div>
  )

  // Skeleton loaders for carousels
  const renderSkeletonCarousel = (isTop10 = false) => (
    <div className="w-full max-w-full min-w-0 flex gap-4 overflow-x-hidden py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "aspect-[2/3] rounded-xl bg-muted/40 animate-pulse border border-border/10 shrink-0",
            isTop10 
              ? "w-[130px] sm:w-[150px] md:w-[170px] ml-12" 
              : "w-[140px] sm:w-[160px] md:w-[180px]"
          )}
        />
      ))}
    </div>
  )

  return (
    <section className="space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/75 bg-clip-text text-transparent">
          Explorar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Descubre tu próximo juego favorito, ediciones en español y los clásicos más jugados.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <ExploreHeader
        search={search}
        onSearchChange={setSearchChange}
        playerFilter={playerFilter}
        onPlayerFilterChange={setPlayerFilterChange}
        complexityFilter={complexityFilter}
        onComplexityFilterChange={setComplexityFilterChange}
        spanishOnly={spanishOnly}
        onSpanishOnlyChange={setSpanishOnlyChange}
      />

      {error && (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold">
          Hubo un problema al cargar los juegos: {error}
        </div>
      )}

      {/* Main View Transition Area */}
      <div className="min-h-[400px]">
        {isFiltering ? (
          /* Search Grid View */
          <div>
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
              Resultados de Búsqueda ({searchResults.length})
            </h2>

            {loadingSearch ? (
              renderSkeletonGrid()
            ) : searchResults.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-border/60 rounded-2xl bg-muted/10">
                <Library className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold text-base">No encontramos juegos que coincidan.</p>
                <p className="text-xs text-foreground/50 mt-1">Prueba a cambiar los filtros o tu búsqueda de texto.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {searchResults.map((game) => (
                  <GameCoverCard key={game.bgg_id} game={game} />
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          /* Carousels View */
          <div className="space-y-5">
            {loadingCarousels ? (
              <div className="space-y-5">
                {/* Top 10 Week Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted/40 animate-pulse rounded-lg" />
                  {renderSkeletonCarousel(true)}
                </div>
                {/* Novedades Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted/40 animate-pulse rounded-lg" />
                  {renderSkeletonCarousel()}
                </div>
                {/* Juegos para 2 Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted/40 animate-pulse rounded-lg" />
                  {renderSkeletonCarousel()}
                </div>
                {/* Top 10 Month Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted/40 animate-pulse rounded-lg" />
                  {renderSkeletonCarousel(true)}
                </div>
                {/* Community Rankings Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted/40 animate-pulse rounded-lg" />
                  <div className="w-full max-w-full min-w-0 flex gap-4 overflow-x-hidden py-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="h-[180px] w-[220px] sm:w-[260px] md:w-[280px] rounded-2xl bg-muted/40 animate-pulse border border-border/10 shrink-0" 
                      />
                    ))}
                  </div>
                </div>
                {/* Classics Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted/40 animate-pulse rounded-lg" />
                  {renderSkeletonCarousel()}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Top 10 Weekly (Played count based) */}
                <GameCarousel games={top10} title="🏆 TOP 10 de la Semana (Más Jugados)" variant="top10" />

                {/* Novedades */}
                <GameCarousel games={novedades} title="🇪🇸 Novedades en España" />

                {/* Juegos para 2 */}
                <GameCarousel games={paraDos} title="👥 Juegos para 2 Jugadores" />

                {/* Top 10 Monthly (Played count based) */}
                <GameCarousel games={top10Month} title="🔥 TOP 10 del Mes (Favoritos del Tablero)" variant="top10" />

                {/* Community Rankings (Created by users) */}
                {communityRankings.length > 0 && (
                  <div className="space-y-3 py-2">
                    <h3 className="text-lg font-black tracking-tight px-1 text-foreground">
                      ✨ Rankings de la Comunidad
                    </h3>
                    <div 
                      className="w-full max-w-full min-w-0 flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                      }}
                    >
                      {/* Hide webkit scrollbars inline */}
                      <style>{`
                        .no-scrollbar::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      {communityRankings.map((ranking) => (
                        <div 
                          key={ranking.id}
                          className="snap-start shrink-0 w-[220px] sm:w-[260px] md:w-[280px]"
                        >
                          <CommunityRankingCard ranking={ranking} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Classics */}
                <GameCarousel games={classics} title="🎖️ Clásicos de BGG" />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
export default ExplorePage;
