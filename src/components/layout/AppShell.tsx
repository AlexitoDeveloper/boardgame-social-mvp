import { createElement, useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Dices, LogIn, LogOut, User, Sun, Moon, ListOrdered, LucideIcon, MessageSquare } from 'lucide-react'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/authContext'
import { useTheme } from '../../lib/useTheme'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { supabase } from '../../lib/supabaseClient'

const MotionDiv = motion.div

const navItems = [
  { to: '/', label: 'Tablero', icon: Dices },
  { to: '/chats', label: 'Chats', icon: MessageSquare },
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
              {createElement(icon, { className: cn(mobile ? 'h-5 w-5 opacity-90' : 'h-5 w-5') })}
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
  const { user, signOut } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false)
  const [unreadChats, setUnreadChats] = useState(0)

  const isChatPage = location.pathname.startsWith('/chats')

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
        <aside className="hidden w-72 border-r border-border/40 bg-card p-4 md:flex md:flex-col sticky top-0 h-dvh overflow-y-auto">
          <div className="mb-6 pt-safeTop px-2">
            <p className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent tracking-tight">Boardgame Social</p>
            <p className="text-sm font-medium text-primary mt-1">MVP</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} badgeCount={item.to === '/chats' ? unreadChats : 0} />
            ))}
          </nav>

          {/* Bottom: user */}
          <div className="mt-auto space-y-1 pt-4 border-t border-border/30">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/30 transition-colors duration-200"
                >
                  <Avatar className="h-7 w-7 border border-primary/30">
                    <AvatarImage src={avatarUrl || undefined} />
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
                        onClick={() => { setShowUserMenu(false); navigate('/perfil') }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
                      >
                        <User className="h-4 w-4 text-primary" />
                        <span>Mi Perfil</span>
                      </button>
                      <button
                        onClick={toggle}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors border-t border-border/30"
                      >
                        <div className="flex items-center gap-3">
                          {isDark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
                          <span>Tema</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">{isDark ? 'OSCURO' : 'CLARO'}</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border-t border-border/30"
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

        <main className={cn(
          "flex-1 min-w-0 w-full max-w-full px-4 pb-24 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 pt-[calc(1.5rem+env(safe-area-inset-top))] md:p-8 md:pb-8",
          isChatPage && "px-0 pt-0 pb-[calc(3rem+env(safe-area-inset-bottom))] h-dvh overflow-hidden flex flex-col md:p-8 md:pb-8 md:h-dvh md:overflow-hidden"
        )}>
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ──────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-[-2px] z-50 border-t border-border/30 bg-card px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom)+2px)] pt-1.5 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} badgeCount={item.to === '/chats' ? unreadChats : 0} mobile />
          ))}
          {user ? (
            <div className="relative flex flex-1 items-center justify-center">
              <button
                onClick={() => setShowMobileUserMenu(v => !v)}
                className="flex flex-1 flex-col items-center justify-center rounded-xl px-0 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 h-9 relative"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-[8px] font-bold">{initials}</AvatarFallback>
                </Avatar>
              </button>
              
              <AnimatePresence>
                {showMobileUserMenu && (
                  <>
                    <MotionDiv
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowMobileUserMenu(false)}
                      className="fixed inset-0 z-40"
                    />
                    <MotionDiv
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full right-2 mb-4 w-48 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-border/30"
                    >
                      <button
                        onClick={() => { setShowMobileUserMenu(false); navigate('/perfil') }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
                      >
                        <User className="h-4 w-4 text-primary" />
                        <span>Mi Perfil</span>
                      </button>
                      <button
                        onClick={toggle}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isDark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
                          <span>Tema</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">{isDark ? 'OSCURO' : 'CLARO'}</span>
                      </button>
                      <button
                        onClick={() => { handleSignOut(); setShowMobileUserMenu(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </MotionDiv>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="flex flex-1 flex-col items-center justify-center rounded-xl px-0 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 h-9"
            >
              <User className="h-5 w-5 text-primary" />
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
export { AppShell as default }
