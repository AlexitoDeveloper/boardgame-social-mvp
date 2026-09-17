import { memo } from 'react'
import { ACHIEVEMENT_TIER_ASSETS } from './achievementAssets'

export interface MedallionProps {
  id: string;
  tier: 'Bronce' | 'Plata' | 'Oro' | 'Platino' | null;
  unlocked: boolean;
  active: boolean;
}

const AchievementMedallionComponent = ({ id, tier, unlocked, active }: MedallionProps) => {
  const tierKey = tier ? tier.toLowerCase() : 'bronce'
  const specificAssetKey = `${id}_${tierKey}`
  const imgSource = ACHIEVEMENT_TIER_ASSETS[specificAssetKey] || ACHIEVEMENT_TIER_ASSETS[`${id}_bronce`]

  const getTierRingStyle = () => {
    if (!unlocked) return 'ring-1 ring-border/40'
    switch (tier) {
      case 'Platino':
        return 'ring-2 ring-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]'
      case 'Oro':
        return 'ring-2 ring-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]'
      case 'Plata':
        return 'ring-2 ring-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.35)]'
      case 'Bronce':
      default:
        return 'ring-2 ring-amber-700/80 drop-shadow-[0_0_6px_rgba(180,83,9,0.3)]'
    }
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none transition-transform duration-200 ${
      active ? 'scale-105' : ''
    }`}>
      {/* Native Illustrated Artwork with Tier Ring */}
      <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center ${getTierRingStyle()} bg-background/80 transition-all duration-300`}>
        <img
          src={imgSource}
          alt={id}
          className={`w-full h-full object-cover object-center scale-[1.05] transition-all duration-300 ${
            unlocked
              ? 'filter-none'
              : 'filter grayscale contrast-75 brightness-40 opacity-50'
          }`}
        />
      </div>

      {/* Locked Padlock Overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 rounded-full bg-zinc-950/85 border border-zinc-700/60 flex items-center justify-center shadow-lg backdrop-blur-xs">
            <svg viewBox="0 0 16 16" className="w-3 h-3 text-zinc-300" fill="currentColor">
              <path fillRule="evenodd" d="M4 6V4a4 4 0 118 0v2h.5A1.5 1.5 0 0114 7.5v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 13.5v-6A1.5 1.5 0 013.5 6H4zm2-2a2 2 0 104 0v2H6V4zm2 5a1 1 0 00-.707 1.707L7 12.414V13a1 1 0 102 0v-.586l-.293-.293A1 1 0 008 9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Active Indicator Glow */}
      {active && (
        <div className="absolute -inset-1 rounded-full border-2 border-primary animate-pulse pointer-events-none" />
      )}
    </div>
  )
}

export const AchievementMedallion = memo(AchievementMedallionComponent)
export default AchievementMedallion

