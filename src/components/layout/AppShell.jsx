import { createElement } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Compass, Home, PencilLine } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/review/new', label: 'Resena', icon: PencilLine },
  { to: '/radar', label: 'Radar', icon: Compass },
]

function NavItem({ to, label, icon, mobile = false }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
          mobile && 'flex-1 flex-col justify-center gap-1 rounded-lg px-1 py-2 text-xs',
        )
      }
    >
      {createElement(icon, { className: cn('h-5 w-5', mobile && 'h-4 w-4') })}
      <span>{label}</span>
    </NavLink>
  )
}

export function AppShell() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
        <aside className="hidden w-72 border-r bg-card/80 p-4 md:flex md:flex-col">
          <div className="mb-6 pt-safeTop">
            <p className="text-lg font-semibold">Boardgame Social</p>
            <p className="text-sm text-muted-foreground">MVP - Fase 3</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              mobile
            />
          ))}
        </div>
      </nav>
    </div>
  )
}
