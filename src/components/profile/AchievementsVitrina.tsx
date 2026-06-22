import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award } from 'lucide-react'
import { UserStats } from '../../hooks/useProfile'
import { AchievementMedallion } from './AchievementMedallion'

const MotionDiv = motion.div

interface AchievementsVitrinaProps {
  organizedCount: number;
  stats: UserStats;
  savedRankingsCount: number;
}

interface Tier {
  req: number;
  name: string;
  tier: 'Bronce' | 'Plata' | 'Oro' | 'Platino';
  color: string;
}

export function AchievementsVitrina({
  organizedCount,
  stats,
  savedRankingsCount
}: AchievementsVitrinaProps) {
  const hostTiers: Tier[] = [
    { req: 1, name: 'Anfitrión Novel', tier: 'Bronce', color: 'from-amber-700 to-amber-900 text-amber-400 shadow-amber-900/30' },
    { req: 3, name: 'Anfitrión Frecuente', tier: 'Plata', color: 'from-zinc-400/90 to-zinc-650 text-zinc-200 shadow-zinc-500/20' },
    { req: 8, name: 'Gran Anfitrión', tier: 'Oro', color: 'from-yellow-400 to-amber-500 text-yellow-400 shadow-yellow-500/20 border-yellow-500/30' },
    { req: 15, name: 'Señor del Tablero', tier: 'Platino', color: 'from-cyan-400 to-indigo-500 text-cyan-300 shadow-cyan-500/20 border-cyan-400/50 ring-1 ring-cyan-400/30' }
  ]

  const winnerTiers: Tier[] = [
    { req: 1, name: 'Primera Sangre', tier: 'Bronce', color: 'from-amber-700 to-amber-900 text-amber-400 shadow-amber-900/30' },
    { req: 3, name: 'Campeón de la Tarde', tier: 'Plata', color: 'from-zinc-400/90 to-zinc-650 text-zinc-200 shadow-zinc-500/20' },
    { req: 8, name: 'Espada de Victoria', tier: 'Oro', color: 'from-yellow-400 to-amber-500 text-yellow-400 shadow-yellow-500/20 border-yellow-500/30' },
    { req: 15, name: 'Gran Conquistador', tier: 'Platino', color: 'from-cyan-400 to-indigo-500 text-cyan-300 shadow-cyan-500/20 border-cyan-400/50 ring-1 ring-cyan-400/30' }
  ]

  const veteranTiers: Tier[] = [
    { req: 1, name: 'Novato Iniciado', tier: 'Bronce', color: 'from-amber-700 to-amber-900 text-amber-400 shadow-amber-900/30' },
    { req: 5, name: 'Veterano Lúdico', tier: 'Plata', color: 'from-zinc-400/90 to-zinc-650 text-zinc-200 shadow-zinc-500/20' },
    { req: 15, name: 'Meeple de Acero', tier: 'Oro', color: 'from-yellow-400 to-amber-500 text-yellow-400 shadow-yellow-500/20 border-yellow-500/30' },
    { req: 30, name: 'Devorador de Reglas', tier: 'Platino', color: 'from-cyan-400 to-indigo-500 text-cyan-300 shadow-cyan-500/20 border-cyan-400/50 ring-1 ring-cyan-400/30' }
  ]

  const reliableTiers = [
    { reqKarma: 80, reqPlayed: 1, name: 'Formal', tier: 'Bronce' as const, color: 'from-amber-700 to-amber-900 text-amber-400 shadow-amber-900/30' },
    { reqKarma: 90, reqPlayed: 3, name: 'Karma de Acero', tier: 'Plata' as const, color: 'from-zinc-400/90 to-zinc-650 text-zinc-200 shadow-zinc-500/20' },
    { reqKarma: 95, reqPlayed: 8, name: 'Asistente de Honor', tier: 'Oro' as const, color: 'from-yellow-400 to-amber-500 text-yellow-400 shadow-yellow-500/20 border-yellow-500/30' },
    { reqKarma: 100, reqPlayed: 15, name: 'Reloj Suizo', tier: 'Platino' as const, color: 'from-cyan-400 to-indigo-500 text-cyan-300 shadow-cyan-500/20 border-cyan-400/50 ring-1 ring-cyan-400/30' }
  ]

  const criticTiers: Tier[] = [
    { req: 1, name: 'Opinólogo', tier: 'Bronce', color: 'from-amber-700 to-amber-900 text-amber-400 shadow-amber-900/30' },
    { req: 3, name: 'Crítico de la BGG', tier: 'Plata', color: 'from-zinc-400/90 to-zinc-650 text-zinc-200 shadow-zinc-500/20' },
    { req: 6, name: 'Curador de Culto', tier: 'Oro', color: 'from-yellow-400 to-amber-500 text-yellow-400 shadow-yellow-500/20 border-yellow-500/30' },
    { req: 10, name: 'Oráculo de Cartón', tier: 'Platino', color: 'from-cyan-400 to-indigo-500 text-cyan-300 shadow-cyan-500/20 border-cyan-400/50 ring-1 ring-cyan-400/30' }
  ]

  const getTierInfo = (tiers: Tier[], value: number) => {
    let currentIdx = -1
    for (let i = 0; i < tiers.length; i++) {
      if (value >= tiers[i].req) {
        currentIdx = i
      }
    }
    const currentTier = currentIdx >= 0 ? tiers[currentIdx] : null
    const nextTier = currentIdx + 1 < tiers.length ? tiers[currentIdx + 1] : null
    return { currentTier, nextTier, progressVal: value, targetVal: nextTier ? nextTier.req : (currentTier?.req || 0) }
  }

  const getReliableInfo = (currentKarma: number, currentPlayed: number) => {
    let currentIdx = -1
    for (let i = 0; i < reliableTiers.length; i++) {
      if (currentKarma >= reliableTiers[i].reqKarma && currentPlayed >= reliableTiers[i].reqPlayed) {
        currentIdx = i
      }
    }
    const currentTier = currentIdx >= 0 ? reliableTiers[currentIdx] : null
    const nextTier = currentIdx + 1 < reliableTiers.length ? reliableTiers[currentIdx + 1] : null
    return { currentTier, nextTier, progressVal: currentKarma, targetVal: nextTier ? nextTier.reqKarma : (currentTier?.reqKarma || 0) }
  }

  const achievements = [
    {
      id: 'host',
      baseName: 'Anfitrión',
      description: 'Organiza partidas en el tablero.',
      currentValue: organizedCount,
      ...getTierInfo(hostTiers, organizedCount),
      unit: 'partidas organizadas',
      reqDesc: 'partidas'
    },
    {
      id: 'winner',
      baseName: 'Espada de Victoria',
      description: 'Gana partidas registradas.',
      currentValue: stats.won,
      ...getTierInfo(winnerTiers, stats.won),
      unit: 'victorias',
      reqDesc: 'victorias'
    },
    {
      id: 'veteran',
      baseName: 'Veterano',
      description: 'Completa partidas jugadas.',
      currentValue: stats.played,
      ...getTierInfo(veteranTiers, stats.played),
      unit: 'partidas completadas',
      reqDesc: 'partidas'
    },
    {
      id: 'reliable',
      baseName: 'Asistencia',
      description: 'Mantén una asistencia impecable.',
      currentValue: stats.karma,
      ...getReliableInfo(stats.karma, stats.played),
      unit: 'karma de asistencia',
      reqDesc: '% karma'
    },
    {
      id: 'critic',
      baseName: 'Crítico',
      description: 'Crea y guarda rankings en tu perfil.',
      currentValue: savedRankingsCount,
      ...getTierInfo(criticTiers, savedRankingsCount),
      unit: 'rankings creados',
      reqDesc: 'rankings'
    }
  ]

  const [activeAchId, setActiveAchId] = useState<string>('host')
  const activeAch = achievements.find(a => a.id === activeAchId) || achievements[0]

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-widest flex items-center gap-1.5 select-none text-left">
        <Award className="w-4 h-4 text-primary" /> Vitrina de Logros
      </h3>
      <div className="grid grid-cols-5 gap-2.5">
        {achievements.map((ach) => {
          const isActive = activeAchId === ach.id
          const hasUnlocked = ach.currentTier !== null

          return (
            <div 
              key={ach.id} 
              onClick={() => setActiveAchId(ach.id)}
              onMouseEnter={() => setActiveAchId(ach.id)}
              className="flex flex-col items-center select-none cursor-pointer"
            >
              {/* Achievement Badge Container */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                hasUnlocked 
                  ? `${isActive ? 'ring-2 ring-primary scale-105 border-primary/45' : 'hover:scale-105 border-white/10'}`
                  : `bg-zinc-950/20 border-dashed border-border/40 opacity-30 filter grayscale ${
                      isActive ? 'ring-2 ring-muted scale-105' : ''
                    }`
              }`}>
                <AchievementMedallion 
                  id={ach.id} 
                  tier={ach.currentTier?.tier || null} 
                  unlocked={hasUnlocked} 
                  active={isActive}
                />
              </div>
              
              {/* Mini label below */}
              <span className={`text-[8px] font-extrabold uppercase tracking-wide mt-1.5 text-center truncate w-full ${
                hasUnlocked 
                  ? isActive ? 'text-primary font-black' : 'text-foreground font-black'
                  : 'text-zinc-500'
              }`}>
                {hasUnlocked ? ach.currentTier?.name : 'Bloqueado'}
              </span>
              
              <span className="text-[7.5px] font-semibold text-muted-foreground/80 scale-90">
                {ach.id === 'reliable' ? `${stats.karma}%` : `${ach.progressVal}`}
              </span>
            </div>
          )
        })}
      </div>

      {/* Selected Achievement Detail Sub-card with tier levels progress bar */}
      <AnimatePresence mode="wait">
        {activeAch && (() => {
          const hasUnlocked = activeAch.currentTier !== null
          const tierName = activeAch.currentTier ? activeAch.currentTier.name : `Bloqueado (${activeAch.baseName})`
          const tierLabel = activeAch.currentTier ? activeAch.currentTier.tier : 'Ninguno'
          
          let nextLevelDesc = ''
          let progressPercent = 0
          let progressText = ''

          if (activeAch.nextTier) {
            if (activeAch.id === 'reliable') {
              const nextTierCast = activeAch.nextTier as { reqKarma: number; reqPlayed: number; name: string; tier: string; color: string }
              const nextKarma = nextTierCast.reqKarma
              const nextPlayed = nextTierCast.reqPlayed
              progressPercent = Math.min(100, Math.round((stats.karma / nextKarma) * 50 + (Math.min(stats.played, nextPlayed) / nextPlayed) * 50))
              nextLevelDesc = `Siguiente nivel: ${nextTierCast.name} (${nextTierCast.tier})`
              progressText = `Requiere: Karma >= ${nextKarma}% (Actual: ${stats.karma}%) y ${stats.played}/${nextPlayed} partidas (Actual)`
            } else {
              const nextTierCast = activeAch.nextTier as Tier
              const nextReq = nextTierCast.req
              progressPercent = Math.min(100, Math.round((activeAch.progressVal / nextReq) * 100))
              nextLevelDesc = `Siguiente nivel: ${nextTierCast.name} (${nextTierCast.tier})`
              progressText = `Progreso: ${activeAch.progressVal} / ${nextReq} ${activeAch.reqDesc}`
            }
          } else if (hasUnlocked) {
            progressPercent = 100
            nextLevelDesc = '¡Nivel máximo alcanzado! 🏆'
            progressText = `Tienes ${activeAch.progressVal} ${activeAch.unit}`
          } else {
            if (activeAch.id === 'reliable') {
              const reliableT = reliableTiers[0]
              progressPercent = Math.min(100, Math.round((stats.karma / reliableT.reqKarma) * 50 + (Math.min(stats.played, reliableT.reqPlayed) / reliableT.reqPlayed) * 50))
              nextLevelDesc = `Desbloquear Bronce: ${reliableT.name}`
              progressText = `Requiere: Karma >= ${reliableT.reqKarma}% (Actual: ${stats.karma}%) y ${stats.played}/${reliableT.reqPlayed} partidas (Actual)`
            } else {
              const firstReq = activeAch.targetVal
              progressPercent = Math.min(100, Math.round((activeAch.progressVal / firstReq) * 100))
              nextLevelDesc = `Desbloquear Bronce: ${activeAch.baseName} Novel`
              progressText = `Progreso: ${activeAch.progressVal} / ${firstReq} ${activeAch.reqDesc}`
            }
          }

          return (
            <MotionDiv
              key={activeAch.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="p-3.5 rounded-2xl border bg-muted/20 border-border/30 text-left relative overflow-hidden space-y-2.5"
            >
              <div className="flex gap-4 items-start">
                {/* Large Medallion Frame */}
                <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/30 flex items-center justify-center p-0.5">
                  <AchievementMedallion 
                    id={activeAch.id} 
                    tier={activeAch.currentTier?.tier || null} 
                    unlocked={hasUnlocked} 
                    active={true}
                  />
                </div>
                
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[9.5px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 select-none">
                      {hasUnlocked ? `🏆 Logro Desbloqueado (${tierLabel})` : '🔒 Logro Bloqueado'}
                    </span>
                    <span className={`text-[9px] font-black uppercase bg-muted px-2 py-0.5 rounded border border-border/40 shrink-0 ${
                      hasUnlocked ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {activeAch.id === 'reliable' ? `${stats.karma}% Karma` : `${activeAch.progressVal} ${activeAch.reqDesc}`}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-extrabold text-xs text-foreground">{tierName}</h4>
                    <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{activeAch.description}</p>
                  </div>
                </div>
              </div>

              {/* Progress bar towards next tier */}
              <div className="space-y-1 pt-1 border-t border-border/10">
                <div className="flex justify-between items-center text-[8.5px] font-bold text-muted-foreground uppercase tracking-wide">
                  <span>{nextLevelDesc}</span>
                  <span className="text-foreground">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-background border border-border/20 overflow-hidden relative">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[8px] text-muted-foreground/80 block font-semibold leading-tight">
                  {progressText}
                </span>
              </div>
            </MotionDiv>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
