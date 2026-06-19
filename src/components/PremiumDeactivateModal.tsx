import React, { useState } from 'react'
import { AlertTriangle, ShieldX } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import { useAuth } from '../lib/authContext'
import { supabase } from '../lib/supabaseClient'
import { USE_MOCKS } from '../lib/config'

interface PremiumDeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PremiumDeactivateModal({ isOpen, onClose, onSuccess }: PremiumDeactivateModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

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
      <DialogContent className="sm:max-w-md border-destructive/20 bg-[#0f111a]/95 backdrop-blur-xl text-foreground overflow-hidden rounded-3xl p-6 shadow-2xl shadow-destructive/5">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br from-destructive/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-br from-destructive/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <DialogHeader className="flex flex-col items-center text-center space-y-3 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-2xl flex items-center justify-center text-destructive border border-destructive/30 shadow-lg shadow-destructive/10">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <DialogTitle className="text-xl font-black text-center text-destructive">
              Desactivar Boardgame Social PRO
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 font-medium text-center mt-1">
              ¿Estás seguro de que deseas volver a la cuenta estándar?
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 relative z-10">
          <p className="text-xs text-zinc-300 font-semibold leading-relaxed text-center">
            Al desactivar tu cuenta PRO, perderás inmediatamente el acceso a los formatos avanzados de exportación, tus fondos premium personalizados y tu límite máximo de partidas activas volverá a ser de 5.
          </p>
          
          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800/80 p-3 flex items-start gap-2.5 text-left">
            <ShieldX className="w-4.5 h-4.5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-[11px] font-black text-foreground">Acción reversible</h4>
              <p className="text-[10px] text-zinc-400 leading-normal font-semibold">
                Podrás volver a activarla cuando quieras, pero perderás la configuración premium activa en tus rankings.
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
            className="w-full text-xs font-black h-11 rounded-2xl active:scale-98 cursor-pointer shadow-md"
          >
            {loading ? "Desactivando..." : "Sí, desactivar cuenta PRO"}
          </Button>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-full text-[10px] font-bold cursor-pointer hover:bg-zinc-900"
            >
              Mantener PRO
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
