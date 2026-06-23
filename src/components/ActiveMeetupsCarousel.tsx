import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Users, Flame, Laptop } from 'lucide-react'
import { Card } from './ui/card'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Tag } from './ui/tag'
import { getGameTitle } from '../lib/gameLocale'

interface ActiveMeetupsCarouselProps {
  meetups: any[];
}

export function ActiveMeetupsCarousel({ meetups }: ActiveMeetupsCarouselProps) {
  if (!meetups || meetups.length === 0) return null

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center gap-2 px-1">
        <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
        <h3 className="text-lg font-black tracking-tight text-foreground">
          Mesas Abiertas en tu Zona
        </h3>
        <span className="text-[10px] sm:text-xs font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
          En Directo
        </span>
      </div>

      <div className="w-full max-w-full min-w-0 flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar">
        {meetups.map((meetup) => {
          const registeredCount = meetup.joined_players?.length || 0
          const guestsCount = meetup.meetup_guests?.length || 0
          const totalAttendees = registeredCount + guestsCount
          const isFull = totalAttendees >= meetup.max_players
          
          const gamesList = Array.isArray(meetup.games) ? meetup.games : (meetup.games ? [meetup.games] : [])
          const primaryGame = gamesList[0] || null
          const gameTitle = primaryGame ? getGameTitle(primaryGame) : (meetup.game_name || 'Por decidir')
          const coverUrl = primaryGame?.image_url || null

          return (
            <Link
              key={meetup.id}
              to={`/tablero/${meetup.id}`}
              className="snap-start shrink-0 w-[260px] sm:w-[300px] block group"
            >
              <Card className="overflow-hidden glass-panel spotlight-card border border-border/40 hover:border-primary/45 transition-all duration-300 shadow-md hover:shadow-lg p-0 flex flex-col h-full bg-card/65 backdrop-blur-xl relative">
                {/* Visual Backdrop inside card */}
                {coverUrl && (
                  <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden -z-10 rounded-2xl">
                    <img 
                      src={coverUrl} 
                      alt="" 
                      className="w-full h-full object-cover filter blur-[40px] opacity-10 scale-125 transition-transform duration-500 group-hover:scale-150"
                    />
                  </div>
                )}

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Header: Host & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar className="w-5 h-5 border border-border">
                          <AvatarImage src={meetup.users?.avatar_url || meetup.creator?.avatar_url || undefined} />
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                            {(meetup.users?.username || meetup.creator?.username)?.slice(0,2)?.toUpperCase() || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-extrabold text-foreground/80 truncate">
                          {meetup.users?.username || meetup.creator?.username || 'anónimo'}
                        </span>
                      </div>
                      <Tag 
                        variant={isFull ? "secondary-solid" : "default-solid"} 
                        className="text-[9px] py-0 px-1.5 h-4.5 font-bold uppercase tracking-wider shrink-0"
                      >
                        {isFull ? 'Completo' : `${totalAttendees}/${meetup.max_players} pl.`}
                      </Tag>
                    </div>

                    {/* Meetup Title */}
                    <h4 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                      {meetup.title}
                    </h4>

                    {/* Game Title Tag */}
                    <div className="text-[10px] font-bold text-primary tracking-wide truncate">
                      🎮 {gameTitle}
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="space-y-1.5 pt-2 border-t border-border/20 text-[10px] font-semibold text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {new Date(meetup.date).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {meetup.is_online ? (
                        <>
                          <Laptop className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">Online • {meetup.platform || 'Discord'}</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">{meetup.city} • {meetup.location || 'Por definir'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
