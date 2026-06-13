import { Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { UserProfile } from '../../types'

const MotionDiv = motion.div

interface MeetupDetailAttendeesProps {
  attendees: UserProfile[];
  maxPlayers: number;
  spotsRemaining: number;
  creatorId: string;
  userId: string | undefined;
  guestReservationId?: string;
}

export function MeetupDetailAttendees({ 
  attendees, 
  maxPlayers, 
  spotsRemaining, 
  creatorId, 
  userId, 
  guestReservationId 
}: MeetupDetailAttendeesProps) {
  
  const renderEmptySlots = () => {
    const slotsToRender = Math.min(3, spotsRemaining)
    if (slotsToRender <= 0) return null

    return Array.from({ length: slotsToRender }).map((_, idx) => (
      <div 
        key={`empty-${idx}`} 
        className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/50 bg-transparent text-muted-foreground/40"
      >
        <div className="w-9 h-9 rounded-full border border-dashed border-border/50 flex items-center justify-center text-xs font-bold text-muted-foreground/30">
          ?
        </div>
        <span className="text-xs font-bold tracking-wide uppercase">Vacante</span>
      </div>
    ))
  }

  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-lg">
      <CardHeader className="pb-3 border-b border-border/20 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-md font-extrabold tracking-tight uppercase text-primary">Asistentes</CardTitle>
          <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
            {attendees.length} de {maxPlayers} jugadores en la mesa
          </CardDescription>
        </div>
        <Badge variant="secondary" className="font-extrabold text-xs">
          {spotsRemaining} plazas libres
        </Badge>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-1">
            {attendees.map((attendee) => {
              const isUserOrganizer = attendee.id === creatorId
              const isCurrentAttendee = attendee.id === userId || (guestReservationId && attendee.id === guestReservationId)

              const attendeeContent = (
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="w-9 h-9 border border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={attendee.avatar_url || undefined} />
                    <AvatarFallback className={`text-xs font-bold ${attendee.is_guest ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                      {attendee.username?.slice(0,2)?.toUpperCase() || 'IN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-left">
                    <span className="text-sm font-bold block text-foreground truncate group-hover:text-primary transition-colors">
                      {attendee.username} {isCurrentAttendee && <span className="text-xs text-primary font-semibold">(Tú)</span>}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium block">
                      {isUserOrganizer ? 'Organiza la partida' : attendee.is_guest ? 'Invitado temporal' : 'Jugador'}
                    </span>
                  </div>
                </div>
              )

              return (
                <MotionDiv 
                  key={attendee.id} 
                  layoutId={`attendee-${attendee.id}`}
                  className={`flex items-center justify-between p-3 rounded-xl border bg-background/30 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group ${
                    attendee.is_guest 
                      ? 'border-border/20 border-dashed opacity-90' 
                      : 'border-border/30'
                  }`}
                >
                  {attendee.is_guest ? (
                    attendeeContent
                  ) : (
                    <Link to={`/perfil/${attendee.id}`} className="min-w-0 flex-1 flex items-center">
                      {attendeeContent}
                    </Link>
                  )}

                  {isUserOrganizer && (
                    <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-1.5 text-[10px] font-bold shrink-0">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      Master
                    </div>
                  )}

                  {attendee.is_guest && !isUserOrganizer && (
                    <div className="px-2 py-0.5 rounded-full bg-muted/60 border border-border text-muted-foreground/80 flex items-center text-[10px] font-bold shrink-0">
                      Invitado
                    </div>
                  )}
                </MotionDiv>
              )
            })}

            {renderEmptySlots()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
