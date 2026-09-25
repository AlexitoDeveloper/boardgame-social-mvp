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

function DesktopNavItem({
  to,
  label,
  icon,
  badgeCount = 0,
}: {
  to: string
  label: string
  icon: LucideIcon
  badgeCount?: number
}) {
  const isExact = to === '/'

  return (
    <NavLink
      to={to}
      end={isExact}
      className={({ isActive }) =>
        cn(
          'relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-160 select-none outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden',
          isActive
            ? 'text-primary font-bold shadow-2xs'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated/60 active:translate-y-[1px]'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <MotionDiv
              layoutId="desktop-nav-active"
              className="absolute inset-0 bg-primary/12 dark:bg-primary/20 rounded-xl z-0"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <div className="relative z-10 flex items-center gap-3">
            {createElement(icon, {
              'aria-hidden': true,
              focusable: false,
              className: cn(
                'h-5 w-5 shrink-0 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              ),
            })}
            <span>{label}</span>
          </div>
          {badgeCount > 0 && (
            <span className="relative z-10 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-xs ring-1 ring-background">
              {badgeCount}
            </span>
          )}
        </>
      )}
    </NavLink>
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
    <aside className="hidden w-72 shrink-0 glass-panel linen-finish p-4 md:flex md:flex-col sticky top-0 h-dvh overflow-y-auto z-40 border-y-0 border-l-0 border-r rounded-none">
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
      <div className="mt-4 text-xs text-center text-muted-foreground/50 font-semibold select-none shrink-0">
        {t('appShell.bggAttribution')}{' '}
        <Button asChild variant="link" className="p-0 h-auto text-xs font-semibold text-muted-foreground/70 hover:text-primary underline-offset-2">
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
