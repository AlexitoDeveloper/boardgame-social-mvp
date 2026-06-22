import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, 
  MapPin, 
  Calendar, 
  Info 
} from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tag } from '../ui/tag'
import { Button } from '../ui/button'
import { PremiumUpgradeModal } from '../PremiumUpgradeModal'
import { PremiumDeactivateModal } from '../PremiumDeactivateModal'
import { UserProfile } from '../../types'

const MotionDiv = motion.div

interface ProfileShowcaseCardProps {
  profile: UserProfile;
  isOwnProfileEditable: boolean;
  playerLevel: number;
  playerTitle: string;
  totalXp: number;
  xpCurrent: number;
  xpRange: number;
  xpProgress: number;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export function ProfileShowcaseCard({
  profile,
  isOwnProfileEditable,
  playerLevel,
  playerTitle,
  totalXp,
  xpCurrent,
  xpRange,
  xpProgress,
  setProfile
}: ProfileShowcaseCardProps) {
  const [showXpHelp, setShowXpHelp] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)

  return (
    <Card className="glass-panel border-border/30 shadow-2xl overflow-hidden rounded-3xl relative">
      {/* Sleek retro-futuristic backdrop glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-primary/15 to-violet-500/5 rounded-full blur-[80px] -z-10" />
      <div className="absolute top-10 left-10 w-28 h-28 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full blur-[60px] -z-10" />

      {/* Banner backdrop */}
      <div className="h-32 bg-gradient-to-r from-primary/30 via-[#260f38]/20 to-[#0e271a]/30 border-b border-white/5 relative overflow-hidden" />
      
      <CardContent className="p-4 pb-6 sm:p-6 sm:pb-6 relative flex flex-col items-center sm:items-start sm:flex-row gap-5">
        {/* Avatar container overlapping banner with dynamic colored status ring */}
        <div className="relative -mt-16 z-10 shrink-0">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400 via-primary to-emerald-400 opacity-80 animate-spin [animation-duration:15s]" />
          <Avatar className="w-28 h-28 border-[6px] border-card relative z-10 shadow-xl">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/10 text-primary text-3xl font-black">
              {profile.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 z-20 bg-primary border-4 border-card text-white text-[11px] font-black rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
            {playerLevel}
          </div>
        </div>
        
        <div className="pt-2 sm:pt-4 space-y-3 text-center sm:text-left flex-1 min-w-0 w-full">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground truncate flex items-center justify-center sm:justify-start gap-2">
              {profile.username}
              {profile.is_premium ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Tag variant="default" className="shrink-0">
                    <Crown className="w-3 h-3 shrink-0" /> PRO
                  </Tag>
                  {isOwnProfileEditable && (
                    <>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setIsDeactivateModalOpen(true)}
                        className="cursor-pointer text-muted-foreground hover:text-destructive hover:no-underline p-0 h-auto font-bold text-xs"
                      >
                        (Desactivar)
                      </Button>
                      <PremiumDeactivateModal
                        isOpen={isDeactivateModalOpen}
                        onClose={() => setIsDeactivateModalOpen(false)}
                        onSuccess={() => {
                          setProfile(prev => prev ? { ...prev, is_premium: false } : null)
                        }}
                      />
                    </>
                  )}
                </div>
              ) : (
                isOwnProfileEditable && (
                  <>
                    <Button
                      variant="premium"
                      size="sm"
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="shrink-0 animate-pulse cursor-pointer"
                      icon={Crown}
                      label="Obtener PRO"
                    />
                    <PremiumUpgradeModal 
                      isOpen={isUpgradeModalOpen}
                      onClose={() => setIsUpgradeModalOpen(false)}
                      onSuccess={() => {
                        setProfile(prev => prev ? { ...prev, is_premium: true } : null)
                      }}
                    />
                  </>
                )
              )}
            </h2>
            <span className="text-xs font-extrabold text-primary block mt-0.5 tracking-wider uppercase">
              {playerTitle}
            </span>
          </div>

          {/* Experience Bar layout */}
          <div className="space-y-1.5 w-full bg-muted/40 p-2.5 rounded-xl border border-border/20 relative">
            <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1">
                Experiencia del Jugador
                <span title="¿Cómo conseguir XP?" className="inline-flex">
                  <Info 
                    onClick={() => setShowXpHelp(!showXpHelp)}
                    className="w-3.5 h-3.5 text-primary hover:text-primary/80 cursor-pointer transition-colors shrink-0"
                  />
                </span>
              </span>
              <span className="text-foreground font-black">{xpCurrent} / {xpRange} XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-background border border-border/30 overflow-hidden relative">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-indigo-500 transition-all duration-1000 ease-out"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-[8.5px] text-muted-foreground/80 block leading-none font-semibold">
              ¡Total acumulado de {totalXp} XP de partidas, victorias y tops!
            </span>

            <AnimatePresence>
              {showXpHelp && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-border/10 mt-1.5 pt-1.5"
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] text-zinc-300 font-extrabold select-none">
                    <div className="flex items-center justify-between">
                      <span>🎲 Partida Jugada:</span>
                      <span className="text-emerald-400 font-black">+100 XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>⚔️ Victoria:</span>
                      <span className="text-rose-400 font-black">+250 XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>👑 Partida Master:</span>
                      <span className="text-amber-400 font-black">+150 XP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✨ Ranking Creado:</span>
                      <span className="text-cyan-400 font-black">+200 XP</span>
                    </div>
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs font-bold pt-0.5">
            {profile.city && (
              <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg border border-border/40 text-foreground/80 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {profile.city}
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg border border-border/40 text-foreground/80 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> {(() => {
                const dStr = new Date(profile.created_at || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                return dStr.charAt(0).toUpperCase() + dStr.slice(1);
              })()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
