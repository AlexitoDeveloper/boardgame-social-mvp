import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Languages } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { BrandLogo } from '../../components/ui/BrandLogo'
import { useAuth } from '../../lib/authContext'

interface LegalLayoutProps {
  title: string
  subtitle?: string
  lastUpdated: string
  children: ReactNode
}

export function LegalLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  const navigate = useNavigate()
  const { language, setLanguage } = useAuth()

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <BrandLogo size="xs" showBadge={false} />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs"
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{language === 'es' ? 'English' : 'Español'}</span>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 flex-1">
        <div className="mb-8 border-b border-border/40 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight font-display mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm mb-2">{subtitle}</p>
          )}
          <p className="text-xs text-muted-foreground font-mono">
            {language === 'es' ? 'Última actualización: ' : 'Last updated: '}
            {lastUpdated}
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 space-y-6 text-sm leading-relaxed">
          {children}
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Ludiclub. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
