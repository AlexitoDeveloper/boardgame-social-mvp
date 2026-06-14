import { Calendar, MapPin, Laptop } from 'lucide-react'
import { Tag } from '../ui/tag'
import { Meetup } from '../../types'
import { USE_MOCKS } from '../../lib/config'

interface MeetupDetailHeroProps {
  meetup: Meetup;
  isPast: boolean;
  isFull: boolean;
  spotsRemaining: number;
}

export function MeetupDetailHero({ meetup, isPast, isFull, spotsRemaining }: MeetupDetailHeroProps) {
  const gamesList = meetup.games || [];
  const mainGame = gamesList[0] || null;

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/30 bg-card/65 backdrop-blur-xl shadow-xl p-4 sm:p-8 flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center">
      
      {/* Game Mini Frame */}
      <div className="flex-shrink-0 flex items-center">
        {gamesList.length <= 1 ? (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-background/80 border border-border/40 p-1.5 flex items-center justify-center shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
            {mainGame?.image_url ? (
              <img 
                src={mainGame.image_url} 
                alt={mainGame?.title || 'Juego'} 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-[10px] text-muted-foreground/60 font-extrabold text-center uppercase tracking-wider p-1 leading-snug">
                {gamesList.length === 0 ? '💬 ?' : (mainGame?.title || meetup.game_name || 'Juego').slice(0, 3)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex -space-x-8 hover:-space-x-3 transition-all duration-350 items-center pl-3">
            {gamesList.slice(0, 3).map((game, idx) => (
              <div 
                key={game.bgg_id}
                style={{ zIndex: 10 - idx }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-background border border-border/50 p-1.5 flex items-center justify-center shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:scale-110 hover:z-30 transition-all duration-200"
              >
                {game.image_url ? (
                  <img 
                    src={game.image_url} 
                    alt={game.title || 'Juego'} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-[9px] text-muted-foreground/60 font-extrabold text-center uppercase">
                    {game.title.slice(0, 3)}
                  </div>
                )}
              </div>
            ))}
            {gamesList.length > 3 && (
              <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center z-0 translate-x-2 hover:scale-110 transition-transform">
                <span className="text-[11px] font-black text-primary">+{gamesList.length - 3}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Meta Info */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Badges/Tags row with extra space */}
        <div className="flex flex-wrap gap-2">
          {isPast ? (
            <Tag variant="secondary">
              Finalizada
            </Tag>
          ) : isFull ? (
            <Tag variant="destructive">
              Mesa llena
            </Tag>
          ) : spotsRemaining === 1 ? (
            <Tag variant="warning" pulse>
              Última plaza
            </Tag>
          ) : (
            <Tag variant="success">
              Mesa abierta
            </Tag>
          )}
          
          {USE_MOCKS && meetup.id.startsWith('mock-') && (
            <Tag variant="outline">
              Demo
            </Tag>
          )}
        </div>

        {/* Title and Subtitle with gap */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-foreground">
            {meetup.title || 'Partida de Juego de Mesa'}
          </h1>
          
          {gamesList.length === 0 ? (
            <div className="text-sm sm:text-base font-bold text-amber-500 tracking-wide flex items-center gap-1.5">
              <span>Juegos:</span> 
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
                Por decidir en el chat
              </span>
            </div>
          ) : (
            <div className="text-sm sm:text-base font-bold text-primary tracking-wide flex flex-wrap items-center gap-2">
              <span>Juegos:</span> 
              <div className="flex flex-wrap gap-1.5">
                {gamesList.map((g) => (
                  <span key={g.bgg_id} className="text-foreground/90 font-semibold bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-lg text-xs">
                    {g.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Meta details with cleaner layout and icons */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-muted-foreground pt-1">
          <span className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
            {new Date(meetup.date).toLocaleDateString('es-ES', { weekday: 'long', day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
          </span>
          {meetup.is_online ? (
            <span className="flex items-center gap-2">
              <Laptop className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Partida Online • {meetup.platform || 'BGA / TTS'}</span>
            </span>
          ) : (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${meetup.location || ''}, ${meetup.city || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
            >
              <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
              <span className="underline decoration-dotted decoration-primary/50 underline-offset-4">{meetup.location}, {meetup.city}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
