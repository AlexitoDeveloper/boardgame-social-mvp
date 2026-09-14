import { createElement, useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Dices, LogIn, LogOut, User, Sun, Moon, ListOrdered, LucideIcon, MessageSquare, Home, Users, Plus, X, Sparkles, Languages, Volume2, VolumeX } from 'lucide-react'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../lib/authContext'
import { useTheme } from '../../lib/useTheme'
import { useTableSound } from '../../hooks/useTableSound'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { supabase } from '../../lib/supabaseClient'
import { useTranslation } from 'react-i18next'

import { BggOnboardingModal } from '../onboarding/BggOnboardingModal'

const MotionDiv = motion.div

const desktopNavItems = [
  { to: '/', labelKey: 'nav.explore', icon: Home },
  { to: '/jugar', labelKey: 'nav.play', icon: Dices },
  { to: '/grupos', labelKey: 'nav.groups', icon: Users },
  { to: '/perfil', labelKey: 'nav.profile', icon: User },
]

const desktopSecondaryItems = [
  { to: '/chats', labelKey: 'nav.chats', icon: MessageSquare },
  { to: '/tops', labelKey: 'nav.tops', icon: ListOrdered },
]

interface NavItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
  badgeCount?: number;
}

function NavItem({ to, label, icon, mobile = false, badgeCount = 0 }: NavItemProps) {
  const { playClack } = useTableSound()
  return (
    <NavLink
      to={to}
      onClick={() => playClack()}
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
  const { t } = useTranslation()
  const { isDark, toggle } = useTheme()
  const { soundEnabled, toggleSound, playClack } = useTableSound()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unreadChats, setUnreadChats] = useState(0)
  const [showBggOnboarding, setShowBggOnboarding] = useState(false)

  const isChatPage = location.pathname.startsWith('/chats')
  const isProfileActive = location.pathname.startsWith('/perfil')

  // Check if express BGG onboarding is needed
  useEffect(() => {
    if (!user) return

    // 1. If explicit query ?onboarding=true is set, open it
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('onboarding') === 'true') {
      setShowBggOnboarding(true)
      return
    }

    // 2. If already marked as onboarded in localStorage, don't open
    if (localStorage.getItem(`bgg_onboarded_${user.id}`) === 'true') {
      return
    }

    // 3. If user has bgg_username in metadata, they are already synced
    if (user.user_metadata?.bgg_username) {
      localStorage.setItem(`bgg_onboarded_${user.id}`, 'true')
      return
    }

    // 4. Check if user already has games in mock collection
    const mockCollStr = localStorage.getItem(`boardgame_social_mock_collection_${user.id}`)
    if (mockCollStr) {
      try {
        const parsed = JSON.parse(mockCollStr)
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(`bgg_onboarded_${user.id}`, 'true')
          return
        }
      } catch {}
    }

    // 5. Query Supabase user_collection to verify if user already has games
    let isCancelled = false
    const checkUserCollection = async () => {
      try {
        const { count, error } = await supabase
          .from('user_collection')
          .select('game_id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (error) {
          return
        }

        if (count && count > 0) {
          // User is ALREADY synchronized with BGG!
          localStorage.setItem(`bgg_onboarded_${user.id}`, 'true')
          return
        }

        // Only show if user has 0 games in collection and hasn't seen it yet
        if (!isCancelled && !localStorage.getItem(`bgg_onboarded_${user.id}`)) {
          setShowBggOnboarding(true)
        }
      } catch {
        // Silently skip if query fails
      }
    }

    checkUserCollection()
    return () => { isCancelled = true }
  }, [user, location.search])

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
      <div className="flex min-h-dvh w-full">

        {/* ── Desktop sidebar ────────────────────────────────── */}
        <aside className="hidden w-72 glass-panel linen-finish p-4 md:flex md:flex-col sticky top-0 h-dvh overflow-y-auto z-40 border-y-0 border-l-0 border-r rounded-none">
          <div className="mb-6 pt-safeTop px-2">
            <p className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent tracking-tight">Boardgame Social</p>
            <p className="text-sm font-medium text-primary mt-1">MVP</p>
          </div>

          <nav className="space-y-1">
            {desktopNavItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={t(item.labelKey)} icon={item.icon} badgeCount={item.to === '/jugar' ? unreadChats : 0} />
            ))}

            <div className="pt-3 mt-3 border-t border-border/20 space-y-1">
              {desktopSecondaryItems.map((item) => (
                <NavItem key={item.to} to={item.to} label={t(item.labelKey)} icon={item.icon} badgeCount={item.to === '/chats' ? unreadChats : 0} />
              ))}
            </div>
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
                      className="absolute bottom-full mb-2 left-0 right-0 bg-card dark:bg-card border border-border/40 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 linen-finish"
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
                        <span>{t('nav.profile')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={toggle}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors border-t border-border/30 rounded-none h-auto"
                      >
                        <div className="flex items-center gap-3">
                          {isDark ? <Sun aria-hidden="true" focusable={false} className="h-4 w-4 text-primary" /> : <Moon aria-hidden="true" focusable={false} className="h-4 w-4 text-primary" />}
                          <span>{t('nav.theme')}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">{isDark ? t('nav.dark') : t('nav.light')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          toggleSound()
                          playClack()
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors border-t border-border/30 rounded-none h-auto"
                      >
                        <div className="flex items-center gap-3">
                          {soundEnabled ? (
                            <Volume2 aria-hidden="true" focusable={false} className="h-4 w-4 text-primary" />
                          ) : (
                            <VolumeX aria-hidden="true" focusable={false} className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span>{t('nav.sound', 'Sonido táctil')}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">
                          {soundEnabled ? 'ON' : 'OFF'}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/30 transition-colors border-t border-border/30 rounded-none h-auto"
                      >
                        <div className="flex items-center gap-3">
                          <Languages aria-hidden="true" focusable={false} className="h-4 w-4 text-primary" />
                          <span>{t('nav.changeLang')}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px] uppercase">{language === 'es' ? t('nav.es') : t('nav.en')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border-t border-border/30 rounded-none h-auto"
                      >
                        <LogOut aria-hidden="true" focusable={false} className="h-4 w-4" />
                        {t('nav.signOut')}
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
                <span>{t('nav.signIn')}</span>
              </Button>
            )}
          </div>

          {/* Legal Attribution */}
          <div className="mt-4 text-[10px] text-center text-muted-foreground/50 font-semibold select-none shrink-0">
            {t('appShell.bggAttribution')} <a href="https://boardgamegeek.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">BoardGameGeek</a>
          </div>
        </aside>

        <main className={cn(
          "flex-1 min-w-0 w-full max-w-full px-4 pb-24 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 pt-[calc(1.5rem+env(safe-area-inset-top))] md:p-8 md:pb-8",
          isChatPage && "px-0 pt-0 pb-[calc(3rem+env(safe-area-inset-bottom))] h-dvh overflow-hidden flex flex-col md:p-8 md:pb-8 md:h-dvh md:overflow-hidden bg-card/95 md:bg-transparent"
        )}>
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 glass-panel rounded-t-[20px] border-b-0 border-x-0 px-2 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          <NavItem to="/" label={t('nav.explore')} icon={Home} mobile />
          <NavItem to="/jugar" label={t('nav.play')} icon={Dices} badgeCount={unreadChats} mobile />
          <NavItem to="/grupos" label={t('nav.groups')} icon={Users} mobile />
          <NavItem to={user ? "/perfil" : "/auth"} label={t('nav.profile')} icon={User} mobile />
        </div>
      </nav>

      {/* Express BGG Onboarding Modal for New Users */}
      <BggOnboardingModal
        isOpen={showBggOnboarding}
        onClose={() => setShowBggOnboarding(false)}
      />
    </div>
  )
}
export { AppShell as default }
