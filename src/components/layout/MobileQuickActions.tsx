import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ListOrdered, Users, Sparkles, X, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'

interface MobileQuickActionsProps {
  isOpen: boolean
  onClose: () => void
}

const MotionDiv = motion.div

export function MobileQuickActions({ isOpen, onClose }: MobileQuickActionsProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleAction = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4 bg-black/60 backdrop-blur-xs !mt-0"
        >
          {/* Click-away backdrop */}
          <MotionDiv
            onClick={onClose}
            className="absolute inset-0 z-0 cursor-pointer"
            aria-hidden="true"
          />

          <MotionDiv
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="relative z-10 w-full sm:max-w-sm bg-card border-t sm:border border-border/40 dark:border-white/10 rounded-t-[28px] sm:rounded-[24px] p-6 shadow-2xl space-y-4 text-left pb-[calc(1.5rem+env(safe-area-inset-bottom))] linen-finish"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                {t('nav.quickActions')}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label={t('common.close', 'Cerrar')}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-2.5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleAction('/mesa/nueva')}
                className="flex items-center justify-start gap-3.5 p-3 rounded-2xl border border-border/30 dark:border-white/5 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group cursor-pointer w-full h-auto"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {t('nav.createMeetup')}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {t('nav.createMeetupDesc')}
                  </p>
                </div>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => handleAction('/grupos?create=true')}
                className="flex items-center justify-start gap-3.5 p-3 rounded-2xl border border-border/30 dark:border-white/5 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group cursor-pointer w-full h-auto"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {t('nav.createGroup')}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {t('nav.createGroupDesc')}
                  </p>
                </div>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => handleAction('/tops')}
                className="flex items-center justify-start gap-3.5 p-3 rounded-2xl border border-border/30 dark:border-white/5 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group cursor-pointer w-full h-auto"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {t('profile.stats.createRanking')}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {t('nav.createRankingDesc')}
                  </p>
                </div>
              </Button>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  )
}
