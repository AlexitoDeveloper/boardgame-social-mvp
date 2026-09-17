import { Link } from 'react-router-dom'
import { ListOrdered, Plus } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Game } from '../../types'
import { FeaturedGameHero } from '../FeaturedGameHero'
import { GameCarousel } from '../GameCarousel'
import { CommunityRankingCard } from '../CommunityRankingCard'
import { Button } from '../ui/button'

type CommunityRankingItem = Parameters<typeof CommunityRankingCard>[0]['ranking']

interface ExploreCarouselsProps {
  featuredGame: Game | null;
  top10: Game[];
  novedades: Game[];
  fastGames: Game[];
  paraDos: Game[];
  heavyGames: Game[];
  top10Month: Game[];
  partyGames: Game[];
  communityRankings: CommunityRankingItem[];
  classics: Game[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

export function ExploreCarousels({
  featuredGame,
  top10,
  novedades,
  fastGames,
  paraDos,
  heavyGames,
  top10Month,
  partyGames,
  communityRankings,
  classics,
}: ExploreCarouselsProps) {
  const { t } = useTranslation()

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Juego Recomendado del Día */}
      {featuredGame && (
        <motion.div variants={sectionVariants}>
          <FeaturedGameHero game={featuredGame} />
        </motion.div>
      )}

      {/* Top 10 Weekly (Played count based) */}
      <motion.div variants={sectionVariants}>
        <GameCarousel 
          games={top10} 
          title={t('explore.top10Week')} 
          variant="top10" 
        />
      </motion.div>

      {/* Novedades */}
      <motion.div variants={sectionVariants}>
        <GameCarousel 
          games={novedades} 
          title={t('explore.newSpain')} 
        />
      </motion.div>

      {/* Partidas Rápidas */}
      {fastGames.length > 0 && (
        <motion.div variants={sectionVariants}>
          <GameCarousel 
            games={fastGames} 
            title={t('explore.fastGames')} 
          />
        </motion.div>
      )}

      {/* Juegos para 2 */}
      <motion.div variants={sectionVariants}>
        <GameCarousel 
          games={paraDos} 
          title={t('explore.for2Players')} 
        />
      </motion.div>

      {/* Euros y Estrategia Pesada */}
      {heavyGames.length > 0 && (
        <motion.div variants={sectionVariants}>
          <GameCarousel 
            games={heavyGames} 
            title={t('explore.heavyGames')} 
          />
        </motion.div>
      )}

      {/* Top 10 Monthly (Played count based) */}
      <motion.div variants={sectionVariants}>
        <GameCarousel 
          games={top10Month} 
          title={t('explore.top10Month')} 
          variant="top10" 
        />
      </motion.div>

      {/* Fiesta y Grupos Grandes */}
      {partyGames.length > 0 && (
        <motion.div variants={sectionVariants}>
          <GameCarousel 
            games={partyGames} 
            title={t('explore.partyGames')} 
          />
        </motion.div>
      )}

      {/* Community Rankings & Tops Spotlight */}
      <motion.div variants={sectionVariants} className="space-y-3 py-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black font-display tracking-tight text-foreground">
            {t('explore.communityRankingsTitle', 'Rankings de la Comunidad')}
          </h3>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 rounded-full text-xs font-bold gap-1 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Link to="/tops">
              <Plus className="w-3.5 h-3.5" />
              <span>{t('common.create', 'Crear')}</span>
            </Link>
          </Button>
        </div>

        {communityRankings.length > 0 ? (
          <div className="w-full max-w-full min-w-0 flex gap-4 overflow-x-auto pb-4 pt-1 px-1.5 snap-x snap-mandatory scroll-smooth no-scrollbar">
            {communityRankings.map((ranking) => (
              <div 
                key={ranking.id}
                className="snap-start shrink-0 w-[220px] sm:w-[260px] md:w-[280px]"
              >
                <CommunityRankingCard ranking={ranking} />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-primary/10 via-card to-card border border-border/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1 max-w-md">
              <h4 className="text-sm font-bold text-foreground">
                {t('tops.exploreBannerTitle', '¿Cuáles son tus juegos favoritos?')}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('tops.exploreBannerDesc', 'Diseña y exporta tu propia Tier List o Top 10 para compartir con tu grupo.')}
              </p>
            </div>
            <Button
              asChild
              variant="default"
              size="sm"
              className="rounded-xl font-bold text-xs h-9 px-3.5 shadow-sm shadow-primary/20 shrink-0"
            >
              <Link to="/tops">
                <ListOrdered className="w-3.5 h-3.5 mr-1" />
                <span>{t('common.create', 'Crear')}</span>
              </Link>
            </Button>
          </div>
        )}
      </motion.div>

      {/* Classics */}
      <motion.div variants={sectionVariants}>
        <GameCarousel 
          games={classics} 
          title={t('explore.classicsBgg')} 
        />
      </motion.div>
    </motion.div>
  )
}

export default ExploreCarousels;
