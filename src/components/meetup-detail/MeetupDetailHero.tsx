import { Calendar, MapPin } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Meetup, Game } from '../../types'
import { USE_MOCKS } from '../../lib/config'

interface MeetupDetailHeroProps {
  meetup: Meetup;
  gameInfo: Game | null;
  isPast: boolean;
  isFull: boolean;
  spotsRemaining: number;
}

export function MeetupDetailHero({ meetup, gameInfo, isPast, isFull, spotsRemaining }: MeetupDetailHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card/65 backdrop-blur-xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
      
      {/* Game Mini Frame */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative rounded-2xl overflow-hidden bg-background/80 border border-border/40 p-1.5 flex items-center justify-center shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
        {gameInfo?.image_url ? (
          <img 
            src={gameInfo.image_url} 
            alt={gameInfo?.title || 'Juego'} 
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-[10px] text-muted-foreground/60 font-extrabold text-center uppercase tracking-wider p-1 leading-snug">
            {(gameInfo?.title || meetup.game_name || 'Juego').slice(0, 3)}
          </div>
        )}
      </div>

      {/* Hero Meta Info */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Badges row with extra space */}
        <div className="flex flex-wrap gap-2">
          {isPast ? (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5">
              Finalizada
            </Badge>
          ) : isFull ? (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5">
              Mesa Llena
            </Badge>
          ) : spotsRemaining === 1 ? (
            <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 animate-pulse">
              Última Plaza
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5">
              Mesa Abierta
            </Badge>
          )}
          
          {USE_MOCKS && meetup.id.startsWith('mock-') && (
            <Badge variant="secondary" className="font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5">
              Demo
            </Badge>
          )}
        </div>

        {/* Title and Subtitle with gap */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-foreground">
            {meetup.title || 'Partida de Juego de Mesa'}
          </h1>
          
          {(gameInfo?.title || meetup.game_name) && (
            <div className="text-sm sm:text-base font-bold text-primary tracking-wide">
              Juego: <span className="text-foreground/90 font-semibold">{gameInfo?.title || meetup.game_name}</span>
            </div>
          )}
        </div>
        
        {/* Meta details with cleaner layout and icons */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-muted-foreground pt-1">
          <span className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
            {new Date(meetup.date).toLocaleDateString('es-ES', { weekday: 'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
          </span>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${meetup.location}, ${meetup.city}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
          >
            <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
            <span className="underline decoration-dotted decoration-primary/50 underline-offset-4">{meetup.location}, {meetup.city}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
