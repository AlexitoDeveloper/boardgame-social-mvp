import { createElement, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Compass, Home, PencilLine, Sun, Moon, LogIn, LogOut, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../lib/useTheme'
import { useAuth } from '../../lib/authContext'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const MotionDiv = motion.div

const navItems = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/review/new', label: 'Reseña', icon: PencilLine },
  { to: '/radar', label: 'Radar', icon: Compass },
]

function NavItem({ to, label, icon, mobile = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-300',
          !mobile && 'rounded-xl',
          mobile && 'flex-1 flex-col justify-center gap-1.5 rounded-lg px-0 py-2.5 text-xs font-medium',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <MotionDiv
              layoutId={mobile ? 'mobile-nav-active' : 'desktop-nav-active'}
              className={cn('absolute inset-0 bg-primary/15 dark:bg-primary/20 z-0', mobile ? 'rounded-lg' : 'rounded-xl')}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <div className={cn('relative z-10 flex', !mobile && 'items-center gap-3', mobile && 'flex-col items-center')}>
            {createElement(icon, { className: cn(mobile ? 'h-5 w-5 mb-1 opacity-90' : 'h-5 w-5') })}
            <span>{label}</span>
          </div>
        </>
      )}
    </NavLink>
  )
}

export function AppShell() {
  const { isDark, toggle } = useTheme()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario'
  const avatarUrl = user?.user_metadata?.avatar_url || null
  const initials = username.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    setShowUserMenu(false)
    await signOut()
    navigate('/auth')
  }

  return (
    <div className="min-h-dvh bg-background selection:bg-primary/30">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl">

        {/* ── Desktop sidebar ────────────────────────────────── */}
        <aside className="hidden w-72 border-r border-border/40 bg-background/60 backdrop-blur-xl p-4 md:flex md:flex-col sticky top-0 h-dvh overflow-y-auto">
          <div className="mb-6 pt-safeTop px-2">
            <p className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent tracking-tight">Boardgame Social</p>
            <p className="text-sm font-medium text-primary mt-1">MVP</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </nav>

          {/* Bottom: theme + user */}
          <div className="mt-auto space-y-1 pt-4 border-t border-border/30">
            <button
              onClick={toggle}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-200"
            >
              {isDark ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
              <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/30 transition-colors duration-200"
                >
                  <Avatar className="h-7 w-7 border border-primary/30">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left truncate">{username}</span>
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <MotionDiv
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-2 left-0 right-0 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden z-50"
                    >
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-200"
              >
                <LogIn className="h-5 w-5 text-primary" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </aside>

        <main className="flex-1 w-full max-w-full px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ──────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/30 bg-background/65 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl saturate-150 supports-[backdrop-filter]:bg-background/60 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} mobile />
          ))}
          <button
            onClick={toggle}
            className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg px-0 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            {isDark ? <Sun className="h-5 w-5 mb-1 text-primary" /> : <Moon className="h-5 w-5 mb-1 text-primary" />}
            <span>{isDark ? 'Claro' : 'Oscuro'}</span>
          </button>
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg px-0 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Avatar className="h-5 w-5 mb-1">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span>Salir</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-lg px-0 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <User className="h-5 w-5 mb-1 text-primary" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
