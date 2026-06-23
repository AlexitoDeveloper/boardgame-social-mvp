import { createElement, useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Dices, LogIn, LogOut, User, Sun, Moon, ListOrdered, LucideIcon, MessageSquare, Home, Users, Plus, X, Sparkles, Languages } from 'lucide-react'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/authContext'
import { useTheme } from '../../lib/useTheme'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabaseClient'

const MotionDiv = motion.div

const desktopNavItems = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/tablero', label: 'Tablero', icon: Dices },
  { to: '/chats', label: 'Chats', icon: MessageSquare },
  { to: '/grupos', label: 'Grupos', icon: Users },
  { to: '/tops', label: 'Crear Top', icon: ListOrdered },
]

interface NavItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
  badgeCount?: number;
}

function NavItem({ to, label, icon, mobile = false, badgeCount = 0 }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 px-3 py-2 text-sm transition-colors duration-300',
          !mobile && 'rounded-xl',
          mobile && 'flex-1 flex-col justify-center items-center gap-0 rounded-xl px-0 py-2 text-xs font-medium',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <MotionDiv
              layoutId={mobile ? 'mobile-nav-active' : 'desktop-nav-active'}
              className={cn(
                'absolute z-0',
                mobile 
                  ? 'inset-x-3 inset-y-0.5 bg-primary/15 dark:bg-primary/20 rounded-xl' 
                  : 'inset-0 bg-primary/15 dark:bg-primary/20 rounded-xl'
              )}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <div className={cn('relative z-10 flex items-center justify-center', !mobile && 'w-full justify-between')}>
            <div className={cn('flex items-center gap-3', mobile && 'flex-col gap-0 relative')}>
              {createElement(icon, { 'aria-hidden': true, focusable: false, className: cn(mobile ? 'h-5 w-5 opacity-90' : 'h-5 w-5') })}
              {!mobile && <span>{label}</span>}
              {mobile && badgeCount > 0 && (
                <span className="absolute top-[-5px] right-[-8px] w-[16px] h-[16px] bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[8px] font-black shrink-0 border border-card aspect-square">
                  {badgeCount}
                </span>
              )}
            </div>
            {!mobile && badgeCount > 0 && (
              <span className="w-[18px] h-[18px] bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm shadow-primary/20 aspect-square">
                {badgeCount}
              </span>
            )}
          </div>
        </>
      )}
    </NavLink>
  )
}

export function AppShell() {
  const { user, signOut, language, setLanguage } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false)
  const [unreadChats, setUnreadChats] = useState(0)
  const [showQuickActions, setShowQuickActions] = useState(false)

  const isChatPage = location.pathname.startsWith('/chats')
  const isProfileActive = location.pathname.startsWith('/perfil')
  const isGroupsActive = location.pathname.startsWith('/grupos')

  // Function to calculate and update unread chats count
  const updateUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadChats(0)
      return
    }

    const guestReservationsStr = localStorage.getItem('boardgame_social_guest_reservations')
    const guestReservations = guestReservationsStr ? JSON.parse(guestReservationsStr) : {}
    const guestMeetupIds = Object.keys(guestReservations)

    const orParts = [
      `creator_id.eq.${user.id}`,
      `joined_players.cs.{${user.id}}`
    ]
    if (guestMeetupIds.length > 0) {
      orParts.push(`id.in.(${guestMeetupIds.join(',')})`)
    }

    try {
      const { data: meetupsData } = await supabase
        .from('meetups')
        .select('id')
        .or(orParts.join(','))

      if (meetupsData && meetupsData.length > 0) {
        const ids = meetupsData.map(m => m.id)
        const { data: msgsData } = await supabase
          .from('meetup_messages')
          .select('meetup_id, created_at, user_id, guest_id')
          .in('meetup_id', ids)

        if (msgsData) {
          let count = 0
          ids.forEach(mId => {
            const lastReadStr = localStorage.getItem(`boardgame_social_chat_last_read_${mId}`) || ''
            const lastRead = lastReadStr ? new Date(lastReadStr).getTime() : 0
            const guestRes = guestReservations[mId]
            
            const meetupMsgs = msgsData.filter(m => m.meetup_id === mId)
            const unreadMsgs = meetupMsgs.filter(msg => {
              const isMyMessage = msg.user_id === user.id || (guestRes && msg.guest_id === guestRes.id)
              return !isMyMessage && new Date(msg.created_at).getTime() > lastRead
            })
            if (unreadMsgs.length > 0) {
              count++
            }
          })
          setUnreadChats(count)
        }
      } else {
        setUnreadChats(0)
      }
    } catch (err) {
      console.error("Error updating unread count in AppShell:", err)
    }
  }, [user])

  // Sync on mount, auth change, and subscribe to realtime chat updates
  useEffect(() => {
    updateUnreadCount()

    // Listen to local read updates
    window.addEventListener('chat_read_update', updateUnreadCount)

    // Listen to realtime chat inserts
    const channel = supabase
      .channel('app_shell_chat_counter_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meetup_messages'
        },
        () => {
          updateUnreadCount()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('chat_read_update', updateUnreadCount)
      supabase.removeChannel(channel)
    }
  }, [user, updateUnreadCount])

  // Keyboard escape listener for quick actions modal
  useEffect(() => {
    if (!showQuickActions) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQuickActions(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showQuickActions])

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
      <div className="flex min-h-dvh w-full">

        {/* ── Desktop sidebar ────────────────────────────────── */}
        <aside className="hidden w-72 glass-panel p-4 md:flex md:flex-col sticky top-0 h-dvh overflow-y-auto z-40 border-y-0 border-l-0 border-r rounded-none">
          <div className="mb-6 pt-safeTop px-2">
            <p className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent tracking-tight">Boardgame Social</p>
            <p className="text-sm font-medium text-primary mt-1">MVP</p>
          </div>

          <nav className="space-y-1">
            {desktopNavItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} badgeCount={item.to === '/chats' ? unreadChats : 0} />
            ))}
          </nav>

          {/* Bottom: user */}
          <div className="mt-auto space-y-1 pt-4 border-t border-border/30">
            {user ? (
              <div className="relative">
                <Button
                  onClick={() => setShowUserMenu(v => !v)}
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/30 transition-colors duration-200 h-auto"
                >
                  <Avatar className="h-7 w-7 border border-primary/30 shrink-0">
                    <AvatarImage src={avatarUrl || undefined} alt={username} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left truncate">{username}</span>
                </Button>
                <AnimatePresence>
                  {showUserMenu && (
                    <MotionDiv
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full mb-2 left-0 right-0 bg-card dark:bg-card border border-border/40 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => { setShowUserMenu(false); navigate('/perfil') }}
                        className={cn(
                          "w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer rounded-none",
                          isProfileActive 
                            ? "bg-primary/10 text-primary font-bold"
                            : "hover:bg-muted/30 text-foreground"
                        )}
                      >
                        <User aria-hidden="true" focusable={false} className={cn("h-4 w-4 shrink-0 transition-colors", isProfileActive ? "text-primary" : "text-muted-foreground")} />
                        <span>Mi Perfil</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={toggle}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors border-t border-border/30 rounded-none h-auto"
                      >
                        <div className="flex items-center gap-3">
                          {isDark ? <Sun aria-hidden="true" focusable={false} className="h-4 w-4 text-primary" /> : <Moon aria-hidden="true" focusable={false} className="h-4 w-4 text-primary" />}
                          <span>Tema</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">{isDark ? 'OSCURO' : 'CLARO'}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors border-t border-border/30 rounded-none h-auto"
                      >
                        <div className="flex items-center gap-3">
                          <Languages aria-hidden="true" focusable={false} className="h-4 w-4 text-primary" />
                          <span>Idioma</span>
                        </div>
                        <span className="text-muted-foreground text-[10px] uppercase">{language === 'es' ? 'Español' : 'English'}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border-t border-border/30 rounded-none h-auto"
                      >
                        <LogOut aria-hidden="true" focusable={false} className="h-4 w-4" />
                        Cerrar Sesión
                      </Button>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>
            ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-200 h-auto"
                >
                <LogIn aria-hidden="true" focusable={false} className="h-5 w-5 text-primary shrink-0" />
                <span>Iniciar Sesión</span>
              </Button>
            )}
          </div>

          {/* Legal Attribution */}
          <div className="mt-4 text-[10px] text-center text-muted-foreground/50 font-semibold select-none shrink-0">
            Datos proporcionados por <a href="https://boardgamegeek.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">BoardGameGeek</a>
          </div>
        </aside>

        <main className={cn(
          "flex-1 min-w-0 w-full max-w-full px-4 pb-24 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 pt-[calc(1.5rem+env(safe-area-inset-top))] md:p-8 md:pb-8",
          isChatPage && "px-0 pt-0 pb-[calc(3rem+env(safe-area-inset-bottom))] h-dvh overflow-hidden flex flex-col md:p-8 md:pb-8 md:h-dvh md:overflow-hidden bg-card/95 md:bg-transparent"
        )}>
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-[-2px] z-50 glass-panel rounded-t-[20px] border-b-0 border-x-0 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom)+2px)] pt-1.5 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-1">
          <NavItem to="/" label="Inicio" icon={Home} mobile />
          <NavItem to="/tablero" label="Tablero" icon={Dices} mobile />

          {/* Quick Actions mobile center button */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowQuickActions(v => !v)}
            className="flex-grow flex-1 flex flex-col justify-center items-center rounded-xl px-0 py-2 cursor-pointer hover:bg-transparent h-auto"
          >
            <div className={cn(
              "w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 active:scale-95 transition-all duration-300",
              showQuickActions && "rotate-45 bg-zinc-700"
            )}>
              <Plus className="w-5 h-5 text-white" />
            </div>
          </Button>

          <NavItem to="/chats" label="Chats" icon={MessageSquare} badgeCount={unreadChats} mobile />
          {user ? (
            <div className="relative flex flex-1 items-center justify-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowMobileUserMenu(v => !v)}
                className="flex flex-1 flex-col items-center justify-center rounded-xl px-0 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 h-9 relative hover:bg-transparent p-0"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={avatarUrl || undefined} alt={username} />
                  <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">{initials}</AvatarFallback>
                </Avatar>
              </Button>
              
              <AnimatePresence>
                {showMobileUserMenu && (
                  <>
                    <MotionDiv
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowMobileUserMenu(false)}
                      className="fixed inset-0 z-40 bg-transparent"
                    />
                    <MotionDiv
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full right-2 mb-4 w-48 bg-card dark:bg-card border border-border/40 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-border/25"
                    >
                      <Button
                        onClick={() => { setShowMobileUserMenu(false); navigate('/perfil') }}
                        variant="ghost"
                        className={cn(
                          "w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer rounded-none",
                          isProfileActive 
                            ? "bg-primary/10 text-primary font-bold"
                            : "hover:bg-muted/30 text-foreground"
                        )}
                      >
                        <User className={cn("h-4 w-4 shrink-0 transition-colors", isProfileActive ? "text-primary" : "text-muted-foreground")} />
                        <span>Mi Perfil</span>
                      </Button>
                      <Button
                        onClick={() => { setShowMobileUserMenu(false); navigate('/grupos') }}
                        variant="ghost"
                        className={cn(
                          "w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer rounded-none",
                          isGroupsActive 
                            ? "bg-primary/10 text-primary font-bold"
                            : "hover:bg-muted/30 text-foreground"
                        )}
                      >
                        <Users className={cn("h-4 w-4 shrink-0 transition-colors", isGroupsActive ? "text-primary" : "text-muted-foreground")} />
                        <span>Grupos de Juego</span>
                      </Button>
                      <Button
                        onClick={toggle}
                        variant="ghost"
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors rounded-none h-auto"
                      >
                        <div className="flex items-center gap-3">
                          {isDark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
                          <span>Tema</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">{isDark ? 'OSCURO' : 'CLARO'}</span>
                      </Button>
                      <Button
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                        variant="ghost"
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors rounded-none h-auto border-t border-border/30"
                      >
                        <div className="flex items-center gap-3">
                          <Languages className="h-4 w-4 text-primary" />
                          <span>Idioma</span>
                        </div>
                        <span className="text-muted-foreground text-[10px] uppercase">{language === 'es' ? 'Español' : 'English'}</span>
                      </Button>
                      <Button
                        onClick={() => { handleSignOut(); setShowMobileUserMenu(false) }}
                        variant="ghost"
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors rounded-none h-auto border-t border-border/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </Button>
                    </MotionDiv>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="flex flex-1 flex-col items-center justify-center rounded-xl px-0 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 h-9 hover:bg-transparent p-0"
                >
                  <User aria-hidden="true" focusable={false} className="h-5 w-5 text-primary shrink-0" />
                </Button>
          )}
        </div>
      </nav>

      {/* Quick Actions Drawer for Mobile */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm !mt-0"
          >
            {/* Click-away backdrop */}
            <div 
              onClick={() => setShowQuickActions(false)}
              className="absolute inset-0 z-0 cursor-pointer"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full sm:max-w-sm bg-card dark:bg-card border-t sm:border border-border/40 dark:border-white/10 rounded-t-[24px] sm:rounded-[24px] p-6 shadow-2xl space-y-4 text-left pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-border/20">
                <h3 className="text-sm font-black tracking-tight text-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Acciones Rápidas
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowQuickActions(false)}
                  className="p-1 rounded-full hover:bg-muted/30 text-muted-foreground transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <Button
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/tablero/new');
                  }}
                  variant="ghost"
                  className="flex items-center justify-start gap-3.5 p-3 rounded-xl border border-border/30 dark:border-white/5 hover:bg-primary/5 transition-all text-left group cursor-pointer w-full h-auto"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Dices className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-bold text-foreground">Organizar Quedada</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Abre una mesa de juego en el tablero.</p>
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/tops');
                  }}
                  variant="ghost"
                  className="flex items-center justify-start gap-3.5 p-3 rounded-xl border border-border/30 dark:border-white/5 hover:bg-primary/5 transition-all text-left group cursor-pointer w-full h-auto"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <ListOrdered className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-bold text-foreground">Crear Ranking</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ordena tus juegos favoritos y comparte tu top.</p>
                  </div>
                </Button>

                <Button
                  onClick={() => {
                    setShowQuickActions(false);
                    navigate('/grupos?create=true');
                  }}
                  variant="ghost"
                  className="flex items-center justify-start gap-3.5 p-3 rounded-xl border border-border/30 dark:border-white/5 hover:bg-primary/5 transition-all text-left group cursor-pointer w-full h-auto"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-bold text-foreground">Crear Grupo</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Fusiona colecciones y vota qué jugar.</p>
                  </div>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export { AppShell as default }
