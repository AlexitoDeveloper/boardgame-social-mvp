import { Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { motion } from 'framer-motion'
import { UserProfile } from '../../types'

const MotionDiv = motion.div

interface MeetupDetailAttendeesProps {
  attendees: UserProfile[];
  maxPlayers: number;
  spotsRemaining: number;
  creatorId: string;
  userId: string | undefined;
}

export function MeetupDetailAttendees({ attendees, maxPlayers, spotsRemaining, creatorId, userId }: MeetupDetailAttendeesProps) {
  return (
    <Card className="border-border/30 bg-card/60 backdrop-blur-2xl shadow-lg">
      <CardHeader className="pb-3 border-b border-border/20 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-md font-extrabold tracking-tight uppercase text-primary">Asistentes</CardTitle>
          <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
            {attendees.length} de {maxPlayers} jugadores apuntados
          </CardDescription>
        </div>
        <Badge variant="secondary" className="font-extrabold text-xs">
          {spotsRemaining} plazas libres
        </Badge>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {attendees.map((attendee) => {
            const isUserOrganizer = attendee.id === creatorId
            const isCurrentAttendee = attendee.id === userId

            return (
              <MotionDiv 
                key={attendee.id} 
                layoutId={`attendee-${attendee.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-background/30 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-9 h-9 border border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
                    <AvatarImage src={attendee.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                      {attendee.username?.slice(0,2)?.toUpperCase() || 'H'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="text-sm font-bold block text-foreground truncate">
                      {attendee.username} {isCurrentAttendee && <span className="text-xs text-primary font-semibold">(Tú)</span>}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium block">
                      {isUserOrganizer ? 'Organiza la partida' : 'Jugador'}
                    </span>
                  </div>
                </div>

                {isUserOrganizer && (
                  <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-1.5 text-[10px] font-bold shrink-0">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    Master
                  </div>
                )}
              </MotionDiv>
            )
          })}

          {/* Empty slots placeholders */}
          {Array.from({ length: Math.max(0, spotsRemaining) }).map((_, idx) => (
            <div 
              key={`empty-${idx}`} 
              className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border/50 bg-transparent text-muted-foreground/40"
            >
              <div className="w-9 h-9 rounded-full border border-dashed border-border/50 flex items-center justify-center text-xs font-bold text-muted-foreground/30">
                ?
              </div>
              <span className="text-xs font-bold tracking-wide uppercase">Vacante</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
