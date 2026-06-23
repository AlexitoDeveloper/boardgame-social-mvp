import { useState } from 'react'
import { Crown, Sparkles, ShieldCheck, Zap, Image, Layout } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from './ui/dialog'
import { Button } from './ui/button'
import { useAuth } from '../lib/authContext'
import { supabase } from '../lib/supabaseClient'
import { USE_MOCKS } from '../lib/config'

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PremiumUpgradeModal({ isOpen, onClose, onSuccess }: PremiumUpgradeModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleActivatePremium = async () => {
    setLoading(true)
    // Simulated/Real premium activation logic
    localStorage.setItem('bgs_pro_simulated', 'true')

    if (user && !USE_MOCKS) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ is_premium: true })
          .eq('id', user.id)
        if (error) throw error
      } catch (err) {
        console.error("Could not persist is_premium status to users table:", err)
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
      <DialogContent className="sm:max-w-md border-primary/20 bg-[#0f111a]/95 backdrop-blur-xl text-foreground overflow-hidden rounded-3xl p-6 shadow-2xl shadow-primary/5">
        {/* Glow effect */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br from-primary/15 to-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <DialogHeader className="flex flex-col items-center text-center space-y-3 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/15 animate-pulse">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <DialogTitle className="text-xl font-black text-center bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
              Boardgame Social PRO
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 font-medium text-center mt-1">
              Desbloquea todo el potencial para tus partidas y rankings.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 relative z-10">
          <div className="space-y-3">
            {[
              {
                icon: Zap,
                title: "Límite Ampliado de Partidas",
                desc: "Crea hasta 10 partidas activas simultáneamente en el tablero en lugar de 5.",
                color: "text-primary bg-primary/10"
              },
              {
                icon: Layout,
                title: "Formatos y Ratios Avanzados",
                desc: "Exporta tus rankings adaptados para Stories (9:16), posts (1:1) o horizontal (16:9).",
                color: "text-emerald-400 bg-emerald-500/10"
              },
              {
                icon: Image,
                title: "Fondos Premium Exclusivos",
                desc: "Accede a degradados y estilos visuales prémium para dar vida a tus listas.",
                color: "text-teal-400 bg-teal-500/10"
              },
              {
                icon: ShieldCheck,
                title: "Personalización y Sin Marca de Agua",
                desc: "Exporta tus rankings sin la firma de Boardgame Social o añade tu propia marca de agua.",
                color: "text-success bg-success/10"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-900/60 hover:border-zinc-800 transition-all">
                  <div className={`p-2 rounded-xl shrink-0 ${feature.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h4 className="text-xs font-black text-foreground">{feature.title}</h4>
                    <p className="text-[10px] text-zinc-400 leading-normal font-medium">{feature.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 relative z-10 pt-2">
          <Button
            variant="premium"
            size="lg"
            onClick={handleActivatePremium}
            disabled={loading}
            className="w-full text-xs font-black h-11 rounded-2xl active:scale-98 cursor-pointer shadow-md"
          >
            {loading ? "Activando..." : (
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 fill-current animate-bounce" /> Activar Cuenta PRO (Simulado)
              </span>
            )}
          </Button>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-full text-[10px] font-bold cursor-pointer"
            >
              Quizás más tarde
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
