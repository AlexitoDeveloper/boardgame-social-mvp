/**
 * Kinetic Tabletop Design System Tokens
 * Industrial Precision meets Tabletop Tactility (Teenage Engineering × Linear × Tabletop Artifacts)
 */

export const DESIGN_TOKENS = {
  // Physical spring physics constants (Emil Kowalski / Linear specs)
  springs: {
    // Mechanical keycap button press
    keycap: { type: 'spring', stiffness: 420, damping: 28 },
    // Bottom drawer / sheet tray slide
    sheetTray: { type: 'spring', stiffness: 320, damping: 32 },
    // Chit & token micro-pop
    tokenPop: { type: 'spring', stiffness: 500, damping: 25 },
    // Monospace score counter rollup
    counter: { type: 'spring', stiffness: 280, damping: 24 },
  },

  // 4-Tier Surface Elevation Hierarchy
  surfaces: {
    void: 'bg-surface-void',         // #060910
    ground: 'bg-surface-ground',     // #0A0F1D Midnight Neoprene
    elevated: 'bg-surface-elevated', // #111827 Machined Tray
    plate: 'bg-surface-plate',       // #162032 Raised Keycap/Tile
  },

  // Tactile Depth Shadow Classes
  depths: {
    keycapSm: 'shadow-tactile-sm active:shadow-tactile-active active:translate-y-[1px]',
    keycapMd: 'shadow-tactile-md active:shadow-tactile-active active:translate-y-[2px]',
    recessed: 'shadow-recessed',
    subpixelRim: 'shadow-subpixel-rim',
  },

  // Semantic Tabletop Meeple Player Colors
  meeples: {
    red: {
      name: 'Vermilion Red',
      bg: 'bg-red-500/15',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/30',
      solid: 'bg-red-600 text-white',
    },
    blue: {
      name: 'Cobalt Blue',
      bg: 'bg-blue-500/15',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30',
      solid: 'bg-blue-600 text-white',
    },
    yellow: {
      name: 'Ochre Gold',
      bg: 'bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30',
      solid: 'bg-amber-500 text-slate-950',
    },
    green: {
      name: 'Emerald Felt',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      solid: 'bg-emerald-600 text-white',
    },
    purple: {
      name: 'Amethyst Violet',
      bg: 'bg-purple-500/15',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30',
      solid: 'bg-purple-600 text-white',
    },
    orange: {
      name: 'Burnt Orange',
      bg: 'bg-orange-500/15',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-500/30',
      solid: 'bg-orange-600 text-white',
    },
  },
} as const

export type MeepleColorKey = keyof typeof DESIGN_TOKENS.meeples
