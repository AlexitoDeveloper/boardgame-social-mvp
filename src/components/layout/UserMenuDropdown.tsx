import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { User as UserIcon, LogIn, LogOut, Sun, Moon, Languages, Users, ListOrdered } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { cn } from '../../lib/utils'

export interface UserMenuDropdownProps {
  user: any
  onSignOut: () => void
  isDark: boolean
  onToggleTheme: () => void
  language: string
  onToggleLanguage: () => void
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  trigger?: React.ReactNode
}

export function UserMenuDropdown({
  user,
  onSignOut,
  isDark,
  onToggleTheme,
  language,
  onToggleLanguage,
  align = 'end',
  side = 'bottom',
  sideOffset = 8,
  trigger,
}: UserMenuDropdownProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isProfileActive = location.pathname.startsWith('/perfil')
  const isGroupsActive = location.pathname.startsWith('/grupos')
  const isTopsActive = location.pathname.startsWith('/tops')

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Usuario'
  const avatarUrl = user?.user_metadata?.avatar_url || null
  const initials = username.slice(0, 2).toUpperCase()

  const handleNavigate = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  const handleSignOutClick = () => {
    setOpen(false)
    onSignOut()
  }

  if (!user) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => navigate('/auth')}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <LogIn aria-hidden="true" focusable={false} className="h-5 w-5 text-primary shrink-0" />
        <span>{t('nav.signIn')}</span>
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted/30 transition-colors duration-200 h-auto"
          >
            <Avatar className="h-7 w-7 border border-primary/30 shrink-0">
              <AvatarImage src={avatarUrl || undefined} alt={username} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-left truncate">{username}</span>
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className="w-60 p-1.5 bg-card border border-border/40 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 linen-finish"
      >
        {/* User Identity Header */}
        <div className="px-3 py-2 flex items-center gap-2.5 border-b border-border/20 mb-1">
          <Avatar className="h-8 w-8 border border-primary/30 shrink-0">
            <AvatarImage src={avatarUrl || undefined} alt={username} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">{username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        {/* Quick Navigation Items */}
        <div className="space-y-0.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleNavigate('/perfil')}
            className={cn(
              "w-full justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg h-9",
              isProfileActive ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted/40"
            )}
          >
            <UserIcon aria-hidden="true" focusable={false} className="h-4 w-4 shrink-0 text-primary" />
            <span>{t('nav.profile')}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => handleNavigate('/grupos')}
            className={cn(
              "w-full justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg h-9",
              isGroupsActive ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted/40"
            )}
          >
            <Users aria-hidden="true" focusable={false} className="h-4 w-4 shrink-0 text-primary" />
            <span>{t('nav.groups')}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => handleNavigate('/tops')}
            className={cn(
              "w-full justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg h-9",
              isTopsActive ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted/40"
            )}
          >
            <ListOrdered aria-hidden="true" focusable={false} className="h-4 w-4 shrink-0 text-primary" />
            <span>{t('nav.tops')}</span>
          </Button>
        </div>

        <div className="my-1 border-t border-border/20" />

        {/* Preferences */}
        <div className="space-y-0.5">
          <Button
            type="button"
            variant="ghost"
            onClick={onToggleTheme}
            className="w-full justify-between px-3 py-2 text-xs font-semibold rounded-lg h-9 hover:bg-muted/40"
          >
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <Sun aria-hidden="true" focusable={false} className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon aria-hidden="true" focusable={false} className="h-4 w-4 text-indigo-400" />
              )}
              <span>{t('nav.theme')}</span>
            </div>
            <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">
              {isDark ? t('nav.dark') : t('nav.light')}
            </span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onToggleLanguage}
            className="w-full justify-between px-3 py-2 text-xs font-semibold rounded-lg h-9 hover:bg-muted/40"
          >
            <div className="flex items-center gap-2.5">
              <Languages aria-hidden="true" focusable={false} className="h-4 w-4 text-primary" />
              <span>{t('nav.changeLang')}</span>
            </div>
            <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">
              {language === 'es' ? t('nav.es') : t('nav.en')}
            </span>
          </Button>
        </div>

        <div className="my-1 border-t border-border/20" />

        {/* Sign Out */}
        <Button
          type="button"
          variant="ghost"
          onClick={handleSignOutClick}
          className="w-full justify-start gap-2.5 px-3 py-2 text-xs font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg h-9"
        >
          <LogOut aria-hidden="true" focusable={false} className="h-4 w-4 shrink-0" />
          <span>{t('nav.signOut')}</span>
        </Button>
      </PopoverContent>
    </Popover>
  )
}
