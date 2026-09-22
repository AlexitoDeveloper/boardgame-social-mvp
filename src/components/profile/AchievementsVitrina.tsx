import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Maximize2, ShieldCheck, Lock } from 'lucide-react'
import { UserStats } from '../../hooks/useProfile'
import { AchievementMedallion } from './AchievementMedallion'
import { useTranslation } from 'react-i18next'
import { BadgePreviewModal } from './BadgePreviewModal'
import { ACHIEVEMENT_TIER_ASSETS } from './achievementAssets'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { getAchievementsList, AchievementItem } from './achievementsConfig'
import { cn } from '@/lib/utils'

interface AchievementsVitrinaProps {
  organizedCount: number;
  stats: UserStats;
  savedRankingsCount: number;
}

export function AchievementsVitrina({
  organizedCount,
  stats,
  savedRankingsCount
}: AchievementsVitrinaProps) {
  const { t } = useTranslation()

  const achievements = useMemo(
    () => getAchievementsList(t, organizedCount, stats, savedRankingsCount),
    [t, organizedCount, stats, savedRankingsCount]
  )

  const [activeAchId, setActiveAchId] = useState<string>('host')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const activeAch: AchievementItem = achievements.find(a => a.id === activeAchId) || achievements[0]

  const unlockedCount = achievements.filter(a => a.currentTier !== null).length

  return (
    <div className="space-y-4">
      {/* Vitrina Header with Unlocked Counter */}
      <div className="flex items-center justify-between px-1 select-none">
        <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-widest flex items-center gap-1.5 text-left">
          <Award className="w-4 h-4 text-primary" /> {t('profile.achievements.title')}
        </h3>
        <Badge variant="primary-soft" size="sm" className="font-mono-tabular">
          {unlockedCount} / {achievements.length} Desbloqueados
        </Badge>
      </div>

      {/* Tactile Medals Mobile Grid */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-md">
        {achievements.map((ach) => {
          const isActive = activeAchId === ach.id
          const hasUnlocked = ach.currentTier !== null
          const displayName = hasUnlocked ? (ach.currentTier?.name || ach.baseName) : ach.baseName

          return (
            <motion.button
              key={ach.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={() => setActiveAchId(ach.id)}
              className={cn(
                "flex flex-col items-center select-none cursor-pointer focus-visible:outline-none rounded-xl p-1.5 sm:p-2 transition-all text-center relative border",
                isActive
                  ? "bg-primary/10 border-primary/40 shadow-sm shadow-primary/10"
                  : "border-transparent hover:bg-muted/30"
              )}
              aria-label={displayName}
            >
              {/* Achievement Badge Container */}
              <div
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center relative shrink-0 transition-transform duration-200",
                  isActive && "scale-105",
                  !hasUnlocked && "opacity-40 grayscale"
                )}
              >
                <AchievementMedallion
                  id={ach.id}
                  tier={ach.currentTier?.tier || null}
                  unlocked={hasUnlocked}
                  active={false}
                />
              </div>

              {/* Title with fluid vertical space - Zero letter slicing */}
              <div className="w-full min-h-[32px] sm:min-h-[36px] flex items-center justify-center mt-1 px-0.5">
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] font-bold tracking-tight text-center leading-snug line-clamp-2 break-words",
                    hasUnlocked
                      ? isActive
                        ? "text-primary font-black"
                        : "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {displayName}
                </span>
              </div>

              {/* Value / Progress label */}
              <span className="text-[10px] font-mono-tabular font-bold text-muted-foreground/80 mt-0.5">
                {ach.id === 'reliable' ? `${stats.karma}%` : `${ach.progressVal}`}
              </span>

              {/* Active Dot indicator below medal */}
              {isActive && (
                <motion.div
                  layoutId="active-achievement-dot"
                  className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shadow-xs shadow-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Selected Achievement Focus Card */}
      <AnimatePresence mode="wait">
        {activeAch && (() => {
          const hasUnlocked = activeAch.currentTier !== null
          const tierName = activeAch.currentTier
            ? activeAch.currentTier.name
            : `${t('profile.achievements.lockedBadge')} (${activeAch.baseName})`
          const tierLabel = activeAch.currentTier ? activeAch.currentTier.tier : t('profile.achievements.lockedBadge')

          return (
            <motion.div
              key={activeAch.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
              className="p-4 rounded-2xl border bg-card/60 border-border/30 text-left relative overflow-hidden space-y-3 shadow-md"
            >
              <div className="flex gap-3.5 items-start">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  onClick={() => setIsModalOpen(true)}
                  className="w-16 h-16 shrink-0 rounded-full flex items-center justify-center cursor-pointer relative"
                  title="Ver en detalle"
                >
                  <AchievementMedallion 
                    id={activeAch.id} 
                    tier={activeAch.currentTier?.tier || null} 
                    unlocked={hasUnlocked} 
                    active={true}
                  />
                </motion.div>
                
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {hasUnlocked ? (
                        <Badge variant="primary-soft" size="sm" className="font-bold">
                          <ShieldCheck className="w-3 h-3 mr-1" /> {tierLabel}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm" className="font-bold">
                          <Lock className="w-3 h-3 mr-1" /> Bloqueado
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setIsModalOpen(true)}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                      title="Ver en grande"
                      icon={Maximize2}
                      aria-label="Ver en grande"
                    />
                  </div>
                  
                  <h4 className="font-extrabold text-sm text-foreground">{tierName}</h4>
                  <p className="text-xs text-muted-foreground leading-normal">{activeAch.description}</p>
                </div>
              </div>

              {/* Progress bar towards next tier with accessible contrast */}
              <div className="space-y-1.5 pt-2 border-t border-border/20">
                <div className="flex justify-between items-center text-xs font-bold text-foreground">
                  <span className="text-muted-foreground">{activeAch.nextLevelDesc}</span>
                  <span className="font-mono-tabular font-black text-primary">{activeAch.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/60 border border-border/30 overflow-hidden relative">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${activeAch.progressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium block">
                  {activeAch.progressText}
                </span>
              </div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* Modal Preview */}
      {(() => {
        const hasUnlocked = activeAch.currentTier !== null
        const tierKey = activeAch.currentTier ? activeAch.currentTier.tier.toLowerCase() : 'bronce'
        const modalImg = ACHIEVEMENT_TIER_ASSETS[`${activeAch.id}_${tierKey}`] || ACHIEVEMENT_TIER_ASSETS[`${activeAch.id}_bronce`]

        return (
          <BadgePreviewModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            imageSrc={modalImg}
            title={hasUnlocked ? activeAch.currentTier?.name || activeAch.baseName : `${t('profile.achievements.lockedBadge')} (${activeAch.baseName})`}
            subtitle={activeAch.baseName}
            description={activeAch.description}
            tierLabel={activeAch.currentTier?.tier || t('profile.achievements.lockedBadge')}
            unlocked={hasUnlocked}
            progressPercent={activeAch.progressPercent}
            progressText={activeAch.progressText}
          />
        )
      })()}
    </div>
  )
}
