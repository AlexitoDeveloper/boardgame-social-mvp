import { useNavigate } from 'react-router-dom'
import { Sun, Moon, Languages, LogOut, Check, ListOrdered, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../lib/authContext'
import { useTheme } from '../../lib/useTheme'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { t } = useTranslation()
  const { language, setLanguage, signOut } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/auth')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-extrabold font-display tracking-tight text-foreground">
            {t('nav.theme')} & {t('nav.changeLang')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Personaliza la apariencia y el idioma de tu experiencia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Theme Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
              {t('nav.theme')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={!isDark ? 'default' : 'outline'}
                onClick={() => isDark && toggleTheme()}
                className={cn(
                  'h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all',
                  !isDark && 'shadow-md shadow-primary/20'
                )}
              >
                <Sun className="h-4 w-4 text-amber-500" />
                <span>{t('nav.light')}</span>
                {!isDark && <Check className="h-3.5 w-3.5 ml-auto" />}
              </Button>

              <Button
                type="button"
                variant={isDark ? 'default' : 'outline'}
                onClick={() => !isDark && toggleTheme()}
                className={cn(
                  'h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all',
                  isDark && 'shadow-md shadow-primary/20'
                )}
              >
                <Moon className="h-4 w-4 text-indigo-400" />
                <span>{t('nav.dark')}</span>
                {isDark && <Check className="h-3.5 w-3.5 ml-auto" />}
              </Button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
              {t('nav.changeLang')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={language === 'es' ? 'default' : 'outline'}
                onClick={() => setLanguage('es')}
                className={cn(
                  'h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all',
                  language === 'es' && 'shadow-md shadow-primary/20'
                )}
              >
                <Languages className="h-4 w-4" />
                <span>Español</span>
                {language === 'es' && <Check className="h-3.5 w-3.5 ml-auto" />}
              </Button>

              <Button
                type="button"
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                className={cn(
                  'h-12 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all',
                  language === 'en' && 'shadow-md shadow-primary/20'
                )}
              >
                <Languages className="h-4 w-4" />
                <span>English</span>
                {language === 'en' && <Check className="h-3.5 w-3.5 ml-auto" />}
              </Button>
            </div>
          </div>

          {/* Creator Tools Quick Access */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
              {t('nav.tools', 'Herramientas')}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose()
                navigate('/tops')
              }}
              className="w-full h-11 rounded-xl flex items-center justify-between px-3 text-xs font-bold hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ListOrdered className="h-4 w-4 text-primary" />
                <span>{t('tops.topsTitle', 'Generador de Tops & Tier Lists')}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Sign Out Action */}
          <div className="pt-2 border-t border-border/20">
            <Button
              type="button"
              variant="destructive"
              onClick={handleSignOut}
              className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-bold"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('nav.signOut')}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
