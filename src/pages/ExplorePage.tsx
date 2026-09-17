import { useState } from 'react'
import { useExploreGames } from '../hooks/useExploreGames'
import { ExploreHeader } from '../components/ExploreHeader'
import { ExploreSearchResults } from '../components/explore/ExploreSearchResults'
import { ExploreCarousels } from '../components/explore/ExploreCarousels'
import { ExploreLoadingState } from '../components/explore/ExploreLoadingState'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export function ExplorePage() {
  const { t } = useTranslation()
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
    fastGames,
    heavyGames,
    partyGames,
    top10,
    top10Month,
    communityRankings,
    searchResults,
    isFiltering,
    featuredGame
  } = useExploreGames(search, playerFilter, complexityFilter, spanishOnly)

  return (
    <section className="space-y-6 pb-20">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black font-display tracking-tight text-foreground">
          {t('nav.home')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('explore.exploreSubtitle')}
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
          {t('meetup.errorTitle')}: {error}
        </div>
      )}

      {/* Main View Transition Area */}
      <div className="min-h-[400px]">
        {isFiltering ? (
          <ExploreSearchResults
            loading={loadingSearch}
            searchResults={searchResults}
          />
        ) : (
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {loadingCarousels ? (
                <motion.div
                  key="carousels-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExploreLoadingState />
                </motion.div>
              ) : (
                <motion.div
                  key="carousels-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ExploreCarousels
                    featuredGame={featuredGame}
                    top10={top10}
                    novedades={novedades}
                    fastGames={fastGames}
                    paraDos={paraDos}
                    heavyGames={heavyGames}
                    top10Month={top10Month}
                    partyGames={partyGames}
                    communityRankings={communityRankings}
                    classics={classics}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  )
}

export default ExplorePage;
