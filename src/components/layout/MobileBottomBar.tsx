import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Dices, Users, MessageSquare, User, LogIn, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

const MotionDiv = motion.div

interface MobileBottomBarProps {
  user: any
  unreadChats: number
}

interface MobileNavItemProps {
  to: string
  label: string
  icon: LucideIcon
  badgeCount?: number
}

function MobileBottomNavItem({ to, label, icon, badgeCount = 0 }: MobileNavItemProps) {
  return (
    <Button
      asChild
      variant="ghost"
      className="relative flex-1 min-h-[48px] h-12 min-w-[48px] flex items-center justify-center p-0 rounded-2xl shadow-none bg-transparent hover:bg-transparent active:bg-transparent"
    >
      <NavLink
        to={to}
        aria-label={label}
        className={({ isActive }) =>
          cn(
            'relative flex items-center justify-center w-full h-full text-muted-foreground transition-colors duration-200 select-none',
            isActive ? 'text-primary' : 'hover:text-foreground'
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <MotionDiv
                layoutId="mobile-nav-active"
                className="absolute inset-x-2 inset-y-1 bg-primary/15 dark:bg-primary/20 rounded-xl z-0"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <div className="relative z-10 flex items-center justify-center">
              <div className="relative inline-flex items-center justify-center">
                {createElement(icon, {
                  'aria-hidden': true,
                  focusable: false,
                  className: cn(
                    'h-6 w-6 transition-transform duration-200',
                    isActive && 'scale-110 stroke-[2.25]'
                  ),
                })}
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[17px] h-[17px] px-1 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ring-2 ring-background shadow-xs pointer-events-none">
                    {badgeCount}
                  </span>
                )}
              </div>
              <span className="sr-only">{label}</span>
            </div>
          </>
        )}
      </NavLink>
    </Button>
  )
}

export function MobileBottomBar({ user, unreadChats }: MobileBottomBarProps) {
  const { t } = useTranslation()

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="fixed inset-x-0 bottom-0 z-40 glass-panel rounded-t-[24px] border-b-0 border-x-0 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgb(0,0,0,0.08)] md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-1">
        {/* 1. Explorar */}
        <MobileBottomNavItem to="/" label={t('nav.explore')} icon={Home} />

        {/* 2. Jugar / Mesas */}
        <MobileBottomNavItem to="/jugar" label={t('nav.play')} icon={Dices} />

        {/* 3. Grupos */}
        <MobileBottomNavItem to="/grupos" label={t('nav.groups')} icon={Users} />

        {/* 4. Chats con badge */}
        <MobileBottomNavItem
          to="/chats"
          label={t('nav.chats')}
          icon={MessageSquare}
          badgeCount={unreadChats}
        />

        {/* 5. Perfil / Auth */}
        {user ? (
          <MobileBottomNavItem to="/perfil" label={t('nav.profile')} icon={User} />
        ) : (
          <MobileBottomNavItem to="/auth" label={t('nav.signIn')} icon={LogIn} />
        )}
      </div>
    </nav>
  )
}
