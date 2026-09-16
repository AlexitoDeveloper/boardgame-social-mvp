import { Link } from 'react-router-dom'
import { Trophy, Play, ArrowRight, Dices, Users } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { OptimizedImage } from '../ui/OptimizedImage'
import { formatDate } from '../../lib/dateLocale'

interface ActiveSessionBannerProps {
  activeSession: any | null
  lastFinishedSession: any | null
}

export function ActiveSessionBanner({ activeSession, lastFinishedSession }: ActiveSessionBannerProps) {
  if (activeSession) {
    const game = activeSession.games?.[0]?.games || activeSession.games || null
    const gameTitle = game?.title_es || game?.title || activeSession.game_name || 'Partida en curso'
    const cover = game?.image_url_es || game?.image_url || null

    return (
      <Card className="relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-card/70 to-card/90 backdrop-blur-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-20 sm:w-20 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-md bg-muted/30 border border-border/30 flex items-center justify-center">
              {cover ? (
                <OptimizedImage src={cover} alt={gameTitle} widthSize={150} fit="contain" className="w-full h-full" />
              ) : (
                <Dices className="w-8 h-8 text-primary" />
              )}
            </div>

            <div className="space-y-1">
              <Badge className="bg-primary/20 text-primary border border-primary/30 uppercase text-[10px] font-black tracking-wider animate-pulse">
                🔴 Sesión Activa en Mesa
              </Badge>
              <h3 className="text-xl font-black text-foreground">{gameTitle}</h3>
              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                <Users className="w-3.5 h-3.5 text-primary" />
                {activeSession.joined_players?.length || activeSession.max_players || 4} jugadores en mesa
              </p>
            </div>
          </div>

          <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/25 shrink-0 w-full sm:w-auto">
            <Link to={`/mesa/${activeSession.id}`}>
              <Play className="w-4 h-4 mr-1.5 fill-current" />
              Continuar Partida
            </Link>
          </Button>
        </div>
      </Card>
    )
  }

  if (lastFinishedSession) {
    const game = lastFinishedSession.games?.[0]?.games || lastFinishedSession.games || null
    const gameTitle = game?.title_es || game?.title || lastFinishedSession.game_name || 'Partida'
    const cover = game?.image_url_es || game?.image_url || null

    return (
      <Card className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-18 rounded-xl overflow-hidden bg-muted/30 border border-border/30 flex items-center justify-center shrink-0">
            {cover ? (
              <OptimizedImage src={cover} alt={gameTitle} widthSize={120} fit="contain" className="w-full h-full" />
            ) : (
              <Trophy className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Última victoria registrada
            </div>
            <h4 className="text-base font-black text-foreground">{gameTitle}</h4>
            <p className="text-xs text-muted-foreground">
              {lastFinishedSession.date ? formatDate(lastFinishedSession.date) : 'Reciente'}
            </p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="rounded-xl font-bold shrink-0">
          <Link to={`/mesa/${lastFinishedSession.id}`}>
            Ver Podio y Puntos
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      </Card>
    )
  }

  return null
}
