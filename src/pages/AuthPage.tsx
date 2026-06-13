import { createElement, FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Card, CardContent } from '../components/ui/card'
import { Loader2, LogIn, UserPlus } from 'lucide-react'

const MotionDiv = motion.div

const tabVars = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export function AuthPage() {
  const [tab, setTab]             = useState<'login' | 'register'>('login')
  const [tabDir, setTabDir]       = useState(1)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [username, setUsername]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [errorMsg, setErrorMsg]   = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

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
        ? 'Email o contraseña incorrectos.'
        : error.message)
    } else {
      navigate('/')
    }
  }

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username.trim()) { setErrorMsg('El nombre de usuario es obligatorio.'); return }
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

    // Upsert into public.users table
    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        username,
      })
    }

    setLoading(false)
    setSuccessMsg('¡Cuenta creada! Ya puedes iniciar sesión.')
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
            Boardgame Social
          </p>
          <p className="text-sm text-muted-foreground mt-2">La red social de juegos de mesa</p>
        </div>

        <Card className="border-border/40 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-primary/10">
          {/* Tabs */}
          <div className="flex border-b border-border/30">
            {[
              { id: 'login' as const,    label: 'Iniciar Sesión', icon: LogIn },
              { id: 'register' as const, label: 'Crear Cuenta',   icon: UserPlus },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors duration-200 relative ${
                  tab === id
                    ? 'text-primary'
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
              </button>
            ))}
          </div>

          <CardContent className="pt-6 pb-8 px-6">
            {/* Success message */}
            <AnimatePresence>
              {successMsg && (
                <MotionDiv
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
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
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
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
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="font-semibold">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 bg-background/50 border-border/50 focus-visible:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="font-semibold">Contraseña</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 bg-background/50 border-border/50 focus-visible:ring-primary/40"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                      disabled={loading}
                    >
                      {loading
                        ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</span>
                        : 'Entrar'}
                    </Button>
                  </form>
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
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username" className="font-semibold">Nombre de usuario</Label>
                      <Input
                        id="reg-username"
                        type="text"
                        placeholder="boardgamer_xyz"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-11 bg-background/50 border-border/50 focus-visible:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="font-semibold">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="tu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 bg-background/50 border-border/50 focus-visible:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="font-semibold">Contraseña <span className="text-xs text-muted-foreground font-normal">(mín. 6 caracteres)</span></Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 bg-background/50 border-border/50 focus-visible:ring-primary/40"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                      disabled={loading}
                    >
                      {loading
                        ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</span>
                        : 'Crear Cuenta'}
                    </Button>
                  </form>
                </MotionDiv>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  )
}
export default AuthPage;
