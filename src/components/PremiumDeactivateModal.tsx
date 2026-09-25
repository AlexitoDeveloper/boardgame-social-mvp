import { useState } from 'react'
import { AlertTriangle, ShieldX } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import { useAuth } from '../lib/authContext'
import { supabase } from '../lib/supabaseClient'
import { USE_MOCKS } from '../lib/config'
import { useTranslation } from 'react-i18next'

interface PremiumDeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PremiumDeactivateModal({ isOpen, onClose, onSuccess }: PremiumDeactivateModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleDeactivate = async () => {
    setLoading(true)
    
    // Simulate / execute premium deactivation logic
    localStorage.removeItem('bgs_pro_simulated')

    if (user && !USE_MOCKS) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ is_premium: false })
          .eq('id', user.id)
        if (error) throw error
      } catch (err) {
        console.error("Could not deactivate premium status in users table:", err)
      }
    }

    // Trigger update event to notify other views (like Profile)
    window.dispatchEvent(new Event('profile_update'))

    if (onSuccess) {
      onSuccess()
    }
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md border-border/40 bg-card/95 backdrop-blur-xl text-foreground overflow-hidden rounded-3xl p-6 shadow-2xl">
        {/* Subtle backdrop glow */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br from-muted/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <DialogHeader className="flex flex-col items-center text-center space-y-3 relative z-10">
          <div className="w-14 h-14 bg-amber/10 rounded-2xl flex items-center justify-center text-amber dark:text-amber-hover border border-amber/30 shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <DialogTitle className="text-xl font-black text-center text-foreground">
              {t('premium.deactivateTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium text-center mt-1">
              {t('premium.deactivateDesc')}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 relative z-10">
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed text-center">
            {t('premium.deactivateWarning')}
          </p>
          
          <div className="rounded-2xl bg-muted/40 border border-border/40 p-3 flex items-start gap-2.5 text-left">
            <ShieldX className="w-4.5 h-4.5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">{t('premium.reversibleTitle')}</h4>
              <p className="text-xs text-muted-foreground leading-normal font-semibold">
                {t('premium.reversibleDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 relative z-10 pt-2">
          <Button
            variant="destructive"
            size="lg"
            onClick={handleDeactivate}
            disabled={loading}
            className="w-full"
          >
            {loading ? t('premium.deactivatingLoader') : t('premium.confirmDeactivate')}
          </Button>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-full"
            >
              {t('premium.keepPro')}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
