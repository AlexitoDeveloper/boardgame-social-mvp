import { createElement, FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { LogIn, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'

const MotionDiv = motion.div

const tabVars = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export function AuthPage() {
  const { t } = useTranslation()
  const [tab, setTab]             = useState<'login' | 'register'>('login')
  const [tabDir, setTabDir]       = useState(1)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [username, setUsername]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [errorMsg, setErrorMsg]   = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const switchTab = (next: 'login' | 'register') => {
    setTabDir(next === 'register' ? 1 : -1)
    setTab(next)
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setErrorMsg(error.message === 'Invalid login credentials'
        ? t('auth.errorInvalidCredentials')
        : error.message)
    } else {
      navigate(redirectTo)
    }
  }

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username.trim()) { setErrorMsg(t('auth.errorUsernameRequired')); return }
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    })

    if (error) {
      setLoading(false)
      setErrorMsg(error.message)
      return
    }

    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        username,
      })
    }

    setLoading(false)
    setSuccessMsg(t('auth.successRegistered'))
    switchTab('login')
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <p className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            {t('auth.title')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">{t('auth.subtitle')}</p>
        </div>

        <Card className="bg-card border border-border shadow-xl rounded-[24px]">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: 'login' as const,    label: t('auth.signInTab'), icon: LogIn },
              { id: 'register' as const, label: t('auth.signUpTab'), icon: UserPlus },
            ].map(({ id, label, icon }) => (
              <Button
                key={id}
                onClick={() => switchTab(id)}
                variant="ghost"
                className={`flex-1 rounded-none h-auto hover:bg-transparent flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors duration-200 relative ${
                  tab === id
                    ? 'text-primary hover:text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {createElement(icon, { className: 'h-4 w-4' })}
                {label}
                {tab === id && (
                  <MotionDiv
                    layoutId="auth-tab-underline"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Button>
            ))}
          </div>

          <CardContent className="pt-6 pb-8 px-6">
            {/* Success message */}
            <AnimatePresence>
              {successMsg && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-5"
                >
                  <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                    {successMsg}
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {errorMsg && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-5"
                >
                  <div className="text-destructive bg-destructive/10 px-4 py-3 rounded-lg text-sm font-medium border border-destructive/20">
                    {errorMsg}
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>

            {/* Forms */}
            <AnimatePresence mode="wait" custom={tabDir}>
              {tab === 'login' ? (
                <MotionDiv
                  key="login"
                  custom={tabDir}
                  variants={tabVars}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <LoginForm
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    loading={loading}
                    onSubmit={handleLogin}
                  />
                </MotionDiv>
              ) : (
                <MotionDiv
                  key="register"
                  custom={tabDir}
                  variants={tabVars}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  <RegisterForm
                    username={username}
                    setUsername={setUsername}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    loading={loading}
                    onSubmit={handleRegister}
                  />
                </MotionDiv>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  )
}

export default AuthPage
