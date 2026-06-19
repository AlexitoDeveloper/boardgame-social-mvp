import { useState } from 'react'
import { useExploreGames } from '../hooks/useExploreGames'
import { ExploreHeader } from '../components/ExploreHeader'
import { GameCarousel } from '../components/GameCarousel'
import { GameCoverCard } from '../components/GameCoverCard'
import { Library } from 'lucide-react'
import { motion } from 'framer-motion'

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
  const renderSkeletonCarousel = () => (
    <div className="flex gap-4 overflow-x-hidden py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          className="aspect-[2/3] w-[140px] sm:w-[160px] md:w-[180px] rounded-xl bg-muted/40 animate-pulse border border-border/10 shrink-0" 
        />
      ))}
    </div>
  )

  return (
    <section className="space-y-6 pb-20 px-4 md:px-0">
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
          <div className="space-y-8">
            {loadingCarousels ? (
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted/40 animate-pulse rounded-lg" />
                  {renderSkeletonCarousel()}
                </div>
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-muted/40 animate-pulse rounded-lg" />
                  {renderSkeletonCarousel()}
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <GameCarousel games={novedades} title="🔥 Novedades en España" />
                <GameCarousel games={paraDos} title="👥 Juegos para 2 Jugadores" />
                <GameCarousel games={classics} title="🏆 Top Clásicos" />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
export default ExplorePage;
