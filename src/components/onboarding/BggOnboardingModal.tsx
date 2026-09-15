import { useState } from 'react'
import { Dices, Check, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Form } from '../ui/form'
import { useAuth } from '../../lib/authContext'
import { supabase } from '../../lib/supabaseClient'
import { USE_MOCKS } from '../../lib/config'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface BggOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BggOnboardingModal({ isOpen, onClose, onSuccess }: BggOnboardingModalProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [bggUsername, setBggUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [importedCount, setImportedCount] = useState<number | null>(null)

  const handleDismiss = () => {
    if (user?.id) {
      localStorage.setItem(`bgg_onboarded_${user.id}`, 'true')
    }
    onClose()
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bggUsername.trim() || !user) return

    setLoading(true)
    setErrorMsg('')

    if (USE_MOCKS) {
      setTimeout(() => {
        const mockKey = `boardgame_social_mock_collection_${user.id}`
        const existing = JSON.parse(localStorage.getItem(mockKey) || '[]')
        const dixitGame = { bgg_id: 37111, title: 'Dixit', year_published: 2008, image_url: 'https://cf.geekdo-images.com/39A865b4-B6BE-4b82-9022-7935E5B9FE6C.png' }
        const catanGame = { bgg_id: 13, title: 'Catan', year_published: 1995, image_url: 'https://cf.geekdo-images.com/40B7E05C-CC71-460B-A5DF-F2803CE10599.png' }
        const updated = [...existing]
        if (!updated.some(g => g.bgg_id === dixitGame.bgg_id)) updated.push(dixitGame)
        if (!updated.some(g => g.bgg_id === catanGame.bgg_id)) updated.push(catanGame)
        localStorage.setItem(mockKey, JSON.stringify(updated))
        localStorage.setItem(`bgg_onboarded_${user.id}`, 'true')

        setLoading(false)
        setImportedCount(2)
        if (onSuccess) onSuccess()
      }, 1400)
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('bgg-ingest', {
        body: {
          action: 'import-collection',
          username: bggUsername.trim(),
          userId: user.id
        }
      })

      if (error) throw error

      if (data && data.success) {
        localStorage.setItem(`bgg_onboarded_${user.id}`, 'true')
        setImportedCount(data.imported || 0)
        if (onSuccess) onSuccess()
      } else {
        throw new Error(data?.error || t('profile.bggImport.error') || 'Error al importar colección')
      }
    } catch (err: any) {
      console.error('Error in express onboarding import:', err)
      setErrorMsg(err.message || 'No pudimos sincronizar con BoardGameGeek. Revisa tu usuario e inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    if (user?.id) {
      localStorage.setItem(`bgg_onboarded_${user.id}`, 'true')
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !loading && (open ? null : handleDismiss())}>
      <DialogContent className="max-w-md bg-card border-border/50 rounded-3xl p-6 shadow-2xl text-left gap-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        <DialogHeader className="border-b border-border/20 pb-3 flex flex-col space-y-1.5 text-left sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-lg font-black tracking-tight text-foreground">
              {importedCount !== null ? t('onboarding.successTitle') : t('onboarding.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            {importedCount !== null ? t('onboarding.successDesc', { count: importedCount }) : t('onboarding.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {importedCount !== null ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-foreground">{t('onboarding.successTitle')}</h4>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {t('onboarding.successDesc', { count: importedCount })}
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleFinish}
                size="lg"
                className="w-full rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/25"
              >
                <span>{t('onboarding.startPlaying')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <Form onSubmit={handleImport} className="space-y-4">
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider">
                <Dices className="w-4 h-4" />
                <span>{t('onboarding.bggStepTitle')}</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {t('onboarding.bggStepDesc')}
              </p>
            </div>

            {errorMsg && (
              <div className="text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <Label htmlFor="express-bgg-username" className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider">
                {t('onboarding.bggUsernameLabel')}
              </Label>
              <Input
                id="express-bgg-username"
                type="text"
                autoFocus
                required
                value={bggUsername}
                onChange={(e) => setBggUsername(e.target.value)}
                placeholder={t('onboarding.bggPlaceholder')}
                disabled={loading}
                className="h-11 rounded-xl text-sm"
              />
              <p className="text-[10px] text-muted-foreground font-medium">
                {t('onboarding.infoNote')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                disabled={loading}
                className="order-2 sm:order-1 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t('onboarding.skip')}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || !bggUsername.trim()}
                className="order-1 sm:order-2 flex-1 rounded-xl text-xs font-bold shadow-md shadow-primary/20 h-10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5 shrink-0" />
                    {t('onboarding.importing')}
                  </>
                ) : (
                  t('onboarding.importButton')
                )}
              </Button>
            </div>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
