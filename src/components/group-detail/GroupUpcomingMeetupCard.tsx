import React from 'react'
import { Calendar, MapPin, Globe, Dices, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { GroupMeetup } from '../../hooks/useGroupHub'
import { GroupMember } from '../../hooks/useGroupDetail'
import { useTranslation } from 'react-i18next'

interface GroupUpcomingMeetupCardProps {
  meetup: GroupMeetup
  members?: GroupMember[]
  currentUserId?: string
  formattedDate: string
  onClick: () => void
}

export const GroupUpcomingMeetupCard: React.FC<GroupUpcomingMeetupCardProps> = ({
  meetup,
  members = [],
  currentUserId,
  formattedDate,
  onClick,
}) => {
  const { t } = useTranslation()
  const joinedIds = meetup.joined_players || []
  const joinedCount = joinedIds.length
  const maxPlayers = meetup.max_players || 4
  const isFull = joinedCount >= maxPlayers
  const isAttending = Boolean(currentUserId && joinedIds.includes(currentUserId))
  const remainingSlots = Math.max(0, maxPlayers - joinedCount)

  // Map joined player IDs to members for avatars
  const attendeeMembers = joinedIds
    .map((id) => members.find((m) => m.user_id === id))
    .filter(Boolean) as GroupMember[]

  return (
    <Card
      onClick={onClick}
      className="p-4 rounded-2xl bg-card/75 hover:bg-card border-border/40 hover:border-primary/40 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/60 border border-border/30 shrink-0 flex items-center justify-center">
          {meetup.gameImg ? (
            <img
              src={meetup.gameImg}
              alt={meetup.gameTitle || meetup.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Dices className="w-6 h-6 text-muted-foreground/40" />
          )}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {meetup.title}
            </h4>

            {isAttending && (
              <Badge variant="primary-soft" className="text-[10px] py-0 px-1.5 font-bold gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
                <span>{t('meetups.attending', 'Asistirás')}</span>
              </Badge>
            )}

            {isFull ? (
              <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-bold">
                {t('common.full', 'Completa')}
              </Badge>
            ) : remainingSlots > 0 ? (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold text-muted-foreground border-border/60">
                {t('meetups.slotsLeft', '{{count}} libres', { count: remainingSlots })}
              </Badge>
            ) : null}
          </div>

          <p className="text-xs text-primary font-bold flex items-center gap-1">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{formattedDate}</span>
          </p>

          <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            {meetup.is_online ? (
              <>
                <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{t('meetups.online', 'Online')}</span>
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                <span>{meetup.location || meetup.city || t('meetups.inPerson', 'Presencial')}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/20 text-xs">
        {/* Attendee Avatar Stack (Playtomic Pattern) */}
        <div className="flex items-center gap-2">
          {attendeeMembers.length > 0 ? (
            <div className="flex items-center -space-x-2">
              {attendeeMembers.slice(0, 3).map((m) => (
                <Avatar key={m.user_id} className="h-6 w-6 border-2 border-card ring-1 ring-border/20">
                  <AvatarImage src={m.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/15 text-primary text-[9px] font-black">
                    {m.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {joinedCount > 3 && (
                <span className="h-6 min-w-6 px-1 rounded-full bg-muted/70 border border-border/40 text-[9px] font-extrabold flex items-center justify-center text-muted-foreground">
                  +{joinedCount - 3}
                </span>
              )}
            </div>
          ) : null}

          <span className="text-muted-foreground font-semibold text-xs">
            {joinedCount} / {maxPlayers} {t('common.players', 'jugadores')}
          </span>
        </div>

        <span className="font-bold text-primary flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform">
          {t('common.view', 'Ver')} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Card>
  )
}
