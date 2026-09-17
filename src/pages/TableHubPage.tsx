import { useTableHub } from '../hooks/useTableHub'
import { HomeVersionSwitcher } from '../components/home-compare/HomeVersionSwitcher'
import { TableToolsBar } from '../components/table-hub/TableToolsBar'
import { ActiveSessionBanner } from '../components/table-hub/ActiveSessionBanner'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Dices, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

export function TableHubPage() {
  const {
    activeSession,
    lastFinishedSession,
    userCollectionCount
  } = useTableHub()

  return (
    <section className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* 1. Version Switcher for comparison */}
      <HomeVersionSwitcher current="table" />

      {/* 2. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-primary uppercase tracking-wider mb-1">
            <Dices className="w-3.5 h-3.5" />
            Asistente de Mesa en Vivo
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Mesa de Juego
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Herramientas interactivas para tu partida en mesa, puntuación y turnos.
          </p>
        </div>

        {userCollectionCount > 0 && (
          <div className="self-start sm:self-auto text-xs font-bold text-muted-foreground bg-muted/40 border border-border/30 px-3 py-1.5 rounded-xl">
            📦 <span className="text-foreground">{userCollectionCount}</span> juegos en tu ludoteca
          </div>
        )}
      </div>

      {/* 3. Active Session or Last Match Banner */}
      <ActiveSessionBanner
        activeSession={activeSession}
        lastFinishedSession={lastFinishedSession}
      />

      {/* 4. Quick Table Tools Bar (Primer Jugador, Marcador, Dados 3D, Reloj) */}
      <TableToolsBar
        attendees={
          activeSession?.joined_players?.map((p: any) => ({
            id: p.user_id || p.id,
            name: p.users?.username || p.name || 'Jugador',
            avatarUrl: p.users?.avatar_url || null
          })) || []
        }
      />

      {/* 5. Game Night Decision Card (CTA to Play Engine) */}
      <Card className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card/70 to-card/90 p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary">
            <Dices className="w-3.5 h-3.5 text-primary" />
            Motor de Elección de Mesa
          </div>
          <h3 className="text-xl font-black text-foreground">
            ¿Indecisos con qué juego sacar hoy?
          </h3>
          <p className="text-xs text-muted-foreground max-w-md">
            Introduce cuántos sois en el salón y de cuánto tiempo disponéis. La ruleta filtrará tu ludoteca física para daros la recomendación ideal.
          </p>
        </div>

        <Button asChild size="lg" className="rounded-2xl font-black shadow-xl shadow-primary/25 shrink-0 w-full md:w-auto">
          <Link to="/jugar">
            <Play className="w-4 h-4 mr-2 fill-current" />
            Abrir Selector de Partida
          </Link>
        </Button>
      </Card>
    </section>
  )
}

export default TableHubPage
