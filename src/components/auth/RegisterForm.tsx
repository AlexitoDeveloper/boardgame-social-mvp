import { FormEvent } from 'react'
import { Form } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface RegisterFormProps {
  username: string
  setUsername: (val: string) => void
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  loading: boolean
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function RegisterForm({
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
}: RegisterFormProps) {
  const { t } = useTranslation()

  return (
    <Form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reg-username" className="font-semibold">
          {t('auth.usernameLabel')}
        </Label>
        <Input
          id="reg-username"
          type="text"
          placeholder={t('auth.usernamePlaceholder')}
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-11 rounded-xl bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary transition-all duration-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email" className="font-semibold">
          {t('auth.emailLabel')}
        </Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="tu@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary transition-all duration-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password" className="font-semibold">
          {t('auth.passwordLabel')}{' '}
          <span className="text-xs text-muted-foreground font-normal">
            {t('auth.passwordHelp')}
          </span>
        </Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 rounded-xl bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary transition-all duration-200"
        />
      </div>
      <Button
        type="submit"
        variant="premium"
        className="w-full h-11 font-bold shadow-lg transition-all"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> {t('auth.signUpLoader')}
          </span>
        ) : (
          t('auth.signUpButton')
        )}
      </Button>

      <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-2">
        {t('auth.legalNotice', 'Al registrarte en Ludiclub, aceptas nuestros')}{' '}
        <a href="/terms" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">
          {t('legal.terms', 'Términos de Servicio')}
        </a>{' '}
        {t('common.and', 'y la')}{' '}
        <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary underline hover:text-primary/80">
          {t('legal.privacy', 'Política de Privacidad')}
        </a>.
      </p>
    </Form>
  )
}
