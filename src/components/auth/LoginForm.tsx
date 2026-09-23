import { FormEvent } from 'react'
import { Form } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface LoginFormProps {
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  loading: boolean
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
}: LoginFormProps) {
  const { t } = useTranslation()

  return (
    <Form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="font-semibold">
          {t('auth.emailLabel')}
        </Label>
        <Input
          id="login-email"
          type="email"
          placeholder="tu@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl bg-background border-border focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary transition-all duration-200"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password" className="font-semibold">
          {t('auth.passwordLabel')}
        </Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          required
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
            <Loader2 className="w-4 h-4 animate-spin" /> {t('auth.signInLoader')}
          </span>
        ) : (
          t('auth.signInButton')
        )}
      </Button>
    </Form>
  )
}
