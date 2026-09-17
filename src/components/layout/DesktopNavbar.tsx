import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Dices, Users, User, MessageSquare, Trophy, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { BrandLogo } from '../ui/BrandLogo'
import { Button } from '../ui/button'
import { UserMenuDropdown } from './UserMenuDropdown'

const MotionDiv = motion.div

interface DesktopNavItemConfig {
  to: string
  labelKey: string
  icon: LucideIcon
}

const primaryNavItems: DesktopNavItemConfig[] = [
  { to: '/', labelKey: 'nav.explore', icon: Home },
  { to: '/jugar', labelKey: 'nav.play', icon: Dices },
  { to: '/grupos', labelKey: 'nav.groups', icon: Users },
  { to: '/perfil', labelKey: 'nav.profile', icon: User },
]

const secondaryNavItems: DesktopNavItemConfig[] = [
  { to: '/chats', labelKey: 'nav.chats', icon: MessageSquare },
  { to: '/tops', labelKey: 'nav.tops', icon: Trophy },
]

interface DesktopNavbarProps {
  user: any
  unreadChats: number
  isDark: boolean
  toggleTheme: () => void
  language: string
  setLanguage: (lang: 'es' | 'en') => void
  onSignOut: () => void
}

function DesktopNavItem({ to, label, icon, badgeCount = 0 }: { to: string; label: string; icon: LucideIcon; badgeCount?: number }) {
  return (
    <Button asChild variant="ghost" className="w-full justify-start h-auto p-0 rounded-xl overflow-hidden">
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            'relative flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium transition-colors duration-200',
            isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <MotionDiv
                layoutId="desktop-nav-active"
                className="absolute inset-0 bg-primary/15 dark:bg-primary/20 rounded-xl z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-3">
              {createElement(icon, { 'aria-hidden': true, focusable: false, className: 'h-5 w-5 shrink-0' })}
              <span>{label}</span>
            </div>
            {badgeCount > 0 && (
              <span className="relative z-10 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs ring-1 ring-background">
                {badgeCount}
              </span>
            )}
          </>
        )}
      </NavLink>
    </Button>
  )
}

export function DesktopNavbar({
  user,
  unreadChats,
  isDark,
  toggleTheme,
  language,
  setLanguage,
  onSignOut,
}: DesktopNavbarProps) {
  const { t } = useTranslation()

  return (
    <aside className="hidden w-72 glass-panel linen-finish p-4 md:flex md:flex-col sticky top-0 h-dvh overflow-y-auto z-40 border-y-0 border-l-0 border-r rounded-none">
      {/* Brand Header */}
      <div className="mb-6 pt-safeTop px-2">
        <NavLink to="/" className="inline-block rounded-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary">
          <BrandLogo size="md" />
        </NavLink>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1">
        {primaryNavItems.map((item) => (
          <DesktopNavItem key={item.to} to={item.to} label={t(item.labelKey)} icon={item.icon} />
        ))}

        <div className="pt-3 mt-3 border-t border-border/20 space-y-1">
          {secondaryNavItems.map((item) => (
            <DesktopNavItem
              key={item.to}
              to={item.to}
              label={t(item.labelKey)}
              icon={item.icon}
              badgeCount={item.to === '/chats' ? unreadChats : 0}
            />
          ))}
        </div>
      </nav>

      {/* User Section (Bottom) */}
      <div className="mt-auto pt-4 border-t border-border/30">
        <UserMenuDropdown
          user={user}
          onSignOut={onSignOut}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          language={language}
          onToggleLanguage={() => setLanguage(language === 'es' ? 'en' : 'es')}
          side="top"
          align="start"
        />
      </div>

      {/* Legal Attribution */}
      <div className="mt-4 text-[11px] text-center text-muted-foreground/50 font-semibold select-none shrink-0">
        {t('appShell.bggAttribution')}{' '}
        <Button asChild variant="link" className="p-0 h-auto text-[11px] font-semibold text-muted-foreground/70 hover:text-primary underline-offset-2">
          <a
            href="https://boardgamegeek.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            BoardGameGeek
          </a>
        </Button>
      </div>
    </aside>
  )
}
