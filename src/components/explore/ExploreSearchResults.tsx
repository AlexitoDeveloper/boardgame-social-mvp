import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Library } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Game } from '../../types'
import { GameCoverCard } from '../GameCoverCard'
import { ExploreSkeletonGrid } from './ExploreLoadingState'

interface ExploreSearchResultsProps {
  loading: boolean;
  searchResults: Game[];
}

export const ExploreSearchResults = memo(function ExploreSearchResults({ loading, searchResults }: ExploreSearchResultsProps) {
  const { t } = useTranslation()

  return (
    <div>
      <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
        {t('explore.searchTitle', { count: searchResults.length })}
      </h2>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="search-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ExploreSkeletonGrid />
          </motion.div>
        ) : searchResults.length === 0 ? (
          <motion.div
            key="search-empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="text-center py-20 px-4 border border-dashed border-border/60 rounded-3xl bg-muted/10"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center mx-auto mb-4">
              <Library className="h-8 w-8 text-muted-foreground/60" strokeWidth={2} aria-hidden="true" />
            </div>
            <p className="text-muted-foreground font-bold text-base">{t('explore.noSearchResultsTitle')}</p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm mx-auto">{t('explore.noSearchResultsDesc')}</p>
          </motion.div>
        ) : (
          <motion.div
            key="search-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {searchResults.map((game) => (
              <GameCoverCard key={game.bgg_id} game={game} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default ExploreSearchResults;
