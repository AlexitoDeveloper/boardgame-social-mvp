import React, { memo } from 'react'

export interface MedallionProps {
  id: string;
  tier: 'Bronce' | 'Plata' | 'Oro' | 'Platino' | null;
  unlocked: boolean;
  active: boolean;
}

const AchievementMedallionComponent = ({ id, tier, unlocked, active }: MedallionProps) => {
  const gradId = `grad-${id}-${tier || 'locked'}`
  const bgGradId = `bg-grad-${id}-${tier || 'locked'}`
  const glowFilterId = `glow-${id}-${tier || 'locked'}`
  
  // High-fidelity Multi-stop Metallic Gradients mapping
  let stops = ['#52525b', '#3f3f46', '#27272a', '#18181b'] // Locked / Zinc metal
  
  if (unlocked && tier) {
    if (tier === 'Bronce') {
      stops = ['#f59e0b', '#d97706', '#b45309', '#78350f']
    } else if (tier === 'Plata') {
      stops = ['#f1f5f9', '#cbd5e1', '#94a3b8', '#475569']
    } else if (tier === 'Oro') {
      stops = ['#fde047', '#fbbf24', '#ca8a04', '#854d0e']
    } else if (tier === 'Platino') {
      stops = ['#a5f3fc', '#22d3ee', '#6366f1', '#312e81'] // Cyan-indigo celestial glow
    }
  }

  // Medallion wrapper layout
  const renderMedallionBase = (children: React.ReactNode) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] select-none overflow-visible">
      <defs>
        {/* Main emblem gradient - unified coordinate mapping for seamless gradient flow */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="35%" stopColor={stops[1]} />
          <stop offset="70%" stopColor={stops[2]} />
          <stop offset="100%" stopColor={stops[3]} />
        </linearGradient>
        
        {/* Subtle radial inner glow background */}
        <radialGradient id={bgGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={unlocked ? (tier === 'Platino' ? '#1e1b4b' : '#18181b') : '#09090b'} stopOpacity={unlocked ? 0.35 : 0.9} />
          <stop offset="100%" stopColor="#09090b" />
        </radialGradient>

        {/* Platinum Neon Glow Filter */}
        {tier === 'Platino' && unlocked && (
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      
      {/* Outer base shape with status outline */}
      <circle 
        cx="50" 
        cy="50" 
        r="46" 
        fill={`url(#${bgGradId})`} 
        stroke={`url(#${gradId})`} 
        strokeWidth="3.2" 
        filter={tier === 'Platino' && unlocked ? `url(#${glowFilterId})` : undefined}
      />
      
      {/* Dynamic rotating outer indicator ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="40" 
        stroke={`url(#${gradId})`} 
        strokeWidth="1.2" 
        strokeDasharray="4 6" 
        fill="none" 
        className={unlocked && active ? "animate-spin [animation-duration:30s] origin-center" : "opacity-25"}
      />
      
      {children}

      {/* Lock overlay if locked */}
      {!unlocked && (
        <g transform="translate(42, 60)" className="opacity-75">
          <rect x="0" y="5" width="16" height="12" rx="2" fill="#52525b" />
          <path d="M 3 5 L 3 1 C 3 -1.5 5 -3 8 -3 C 11 -3 13 -1.5 13 1 L 13 5" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )

  // Medallion vector paths
  switch (id) {
    case 'host':
      return renderMedallionBase(
        <>
          {/* Stylized crown */}
          <path 
            d="M 30 63 L 70 63 L 75 42 L 62 50 L 50 32 L 38 50 L 25 42 Z" 
            fill={`url(#${gradId})`} 
            stroke={unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}
            strokeWidth="1.2"
          />
          {/* Pedestal under crown */}
          <path d="M 28 66 L 72 66 L 68 71 L 32 71 Z" fill={`url(#${gradId})`} opacity="0.85" />
          {/* Jewels */}
          <circle cx="50" cy="30" r="2.5" fill={unlocked ? '#ffffff' : '#52525b'} />
          <circle cx="24" cy="40" r="2" fill={unlocked ? '#ffffff' : '#52525b'} />
          <circle cx="76" cy="40" r="2" fill={unlocked ? '#ffffff' : '#52525b'} />
        </>
      )
      
    case 'winner':
      return renderMedallionBase(
        <>
          {/* Shield backdrop */}
          <path 
            d="M 32 32 C 32 32 50 24 50 24 C 50 24 68 32 68 32 C 68 47 63 65 50 74 C 37 65 32 47 32 32 Z" 
            fill="none" 
            stroke={`url(#${gradId})`} 
            strokeWidth="2" 
            opacity="0.4"
          />
          {/* Crossed swords */}
          <path d="M 28 72 L 72 28" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
          <path d="M 31 63 L 37 69" stroke={`url(#${gradId})`} strokeWidth="2" />
          <path d="M 72 72 L 28 28" stroke={`url(#${gradId})`} strokeWidth="3" strokeLinecap="round" />
          <path d="M 69 63 L 63 69" stroke={`url(#${gradId})`} strokeWidth="2" />
          {/* Center glow jewel */}
          <circle cx="50" cy="50" r="3.5" fill={unlocked ? '#ffffff' : '#52525b'} />
        </>
      )
      
    case 'veteran':
      return renderMedallionBase(
        <>
          {/* Laurel wreath left */}
          <path 
            d="M 26 50 Q 23 64 34 71 M 29 57 Q 24 66 31 70" 
            fill="none" 
            stroke={`url(#${gradId})`} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.5"
          />
          {/* Laurel wreath right */}
          <path 
            d="M 74 50 Q 77 64 66 71 M 71 57 Q 76 66 69 70" 
            fill="none" 
            stroke={`url(#${gradId})`} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.5"
          />
          {/* Symmetrical high-fidelity Meeple vector shape */}
          <path 
            d="M256 54.99c-27 0-46.418 14.287-57.633 32.23-10.03 16.047-14.203 34.66-15.017 50.962-30.608 15.135-64.515 30.394-91.815 45.994-14.32 8.183-26.805 16.414-36.203 25.26C45.934 218.28 39 228.24 39 239.99c0 5 2.44 9.075 5.19 12.065 2.754 2.99 6.054 5.312 9.812 7.48 7.515 4.336 16.99 7.95 27.412 11.076 15.483 4.646 32.823 8.1 47.9 9.577-14.996 25.84-34.953 49.574-52.447 72.315C56.65 378.785 39 403.99 39 431.99c0 4-.044 7.123.31 10.26.355 3.137 1.256 7.053 4.41 10.156 3.155 3.104 7.017 3.938 10.163 4.28 3.146.345 6.315.304 10.38.304h111.542c8.097 0 14.026.492 20.125-3.43 6.1-3.92 8.324-9.275 12.67-17.275l.088-.16.08-.166s9.723-19.77 21.324-39.388c5.8-9.808 12.097-19.576 17.574-26.498 2.74-3.46 5.304-6.204 7.15-7.754.564-.472.82-.56 1.184-.76.363.2.62.288 1.184.76 1.846 1.55 4.41 4.294 7.15 7.754 5.477 6.922 11.774 16.69 17.574 26.498 11.6 19.618 21.324 39.387 21.324 39.387l.08.165.088.16c4.346 8 6.55 13.323 12.61 17.254 6.058 3.93 11.974 3.45 19.957 3.45H448c4 0 7.12.043 10.244-.304 3.123-.347 6.998-1.21 10.12-4.332 3.12-3.122 3.984-6.997 4.33-10.12.348-3.122.306-6.244.306-10.244 0-28-17.65-53.205-37.867-79.488-17.493-22.74-37.45-46.474-52.447-72.315 15.077-1.478 32.417-4.93 47.9-9.576 10.422-3.125 19.897-6.74 27.412-11.075 3.758-2.168 7.058-4.49 9.81-7.48 2.753-2.99 5.192-7.065 5.192-12.065 0-11.75-6.934-21.71-16.332-30.554-9.398-8.846-21.883-17.077-36.203-25.26-27.3-15.6-61.207-30.86-91.815-45.994-.814-16.3-4.988-34.915-15.017-50.96C302.418 69.276 283 54.99 256 54.99z" 
            fill={`url(#${gradId})`}
            transform="translate(26.5, 26.5) scale(0.092)"
            stroke={unlocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}
            strokeWidth="8"
          />
        </>
      )
      
    case 'reliable':
      return renderMedallionBase(
        <>
          <circle cx="50" cy="50" r="28" stroke={`url(#${gradId})`} strokeWidth="1.2" strokeDasharray="2 4" fill="none" opacity="0.3" />
          
          {/* Shield / Badge base shape */}
          <path 
            d="M 34 32 C 34 32 50 25 50 25 C 50 25 66 32 66 32 L 66 52 C 66 62 50 71 50 71 C 50 71 34 62 34 52 Z" 
            fill={`url(#${gradId})`}
            opacity="0.85"
          />
          
          {/* Thick Glowing Checkmark */}
          <path 
            d="M 40 49 L 47 56 L 60 40" 
            stroke={unlocked ? '#09090b' : '#d4d4d8'} 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity="0.9"
          />
        </>
      )
      
    case 'critic':
      return renderMedallionBase(
        <>
          {/* Sparkles / star shapes above the lists */}
          <path d="M 50 21 L 51.5 24 L 54.5 25.5 L 51.5 27 L 50 30 L 48.5 27 L 45.5 25.5 L 48.5 24 Z" fill={`url(#${gradId})`} opacity="0.9" />
          <path d="M 28 30 L 29 32.5 L 31.5 33.5 L 29 34.5 L 28 37 L 27 34.5 L 24.5 33.5 L 27 32.5 Z" fill={`url(#${gradId})`} opacity="0.7" />
          
          {/* Custom stacking lists / cards */}
          {/* Back card */}
          <rect 
            x="32" 
            y="42" 
            width="28" 
            height="32" 
            rx="3" 
            fill={`url(#${gradId})`} 
            stroke="rgba(0,0,0,0.15)" 
            strokeWidth="1"
            transform="rotate(-10 46 58)" 
            opacity="0.6"
          />
          {/* Front card */}
          <rect 
            x="40" 
            y="44" 
            width="28" 
            height="32" 
            rx="3" 
            fill={`url(#${gradId})`} 
            stroke="rgba(0,0,0,0.25)" 
            strokeWidth="1"
            transform="rotate(6 54 60)" 
          />
          {/* Lines inside front card */}
          <line x1="45" y1="50" x2="63" y2="52" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6 54 60)" />
          <line x1="45" y1="56" x2="59" y2="58" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6 54 60)" />
          <line x1="45" y1="62" x2="61" y2="64" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" transform="rotate(6 54 60)" />
        </>
      )
      
    default:
      return null
  }
}

// React.memo to optimize rendering and avoid recalculations
export const AchievementMedallion = memo(AchievementMedallionComponent)
export default AchievementMedallion;
