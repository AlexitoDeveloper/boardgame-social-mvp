import React from 'react'
import { Calendar, MapPin, Globe, Users, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { Card } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar'
import { GroupMeetup } from '../../../hooks/useGroupHub'
import { GroupMember } from '../../../hooks/useGroupDetail'
import { useTranslation } from 'react-i18next'

interface NextMeetupSpotlightProps {
  meetup: GroupMeetup
  members?: GroupMember[]
  currentUserId?: string
  formattedDate: string
  onSelect: () => void
}

export const NextMeetupSpotlight: React.FC<NextMeetupSpotlightProps> = ({
  meetup,
  members = [],
  currentUserId,
  formattedDate,
  onSelect,
}) => {
  const { t } = useTranslation()
  const joinedIds = meetup.joined_players || []
  const joinedCount = joinedIds.length
  const maxPlayers = meetup.max_players || 4
  const isFull = joinedCount >= maxPlayers
  const isAttending = Boolean(currentUserId && joinedIds.includes(currentUserId))
  const remainingSlots = Math.max(0, maxPlayers - joinedCount)

  const attendeeMembers = joinedIds
    .map((id) => members.find((m) => m.user_id === id))
    .filter(Boolean) as GroupMember[]

  return (
    <Card
      onClick={onSelect}
      className="relative overflow-hidden rounded-3xl border-primary/25 bg-gradient-to-br from-card via-card/95 to-primary/5 p-6 shadow-lg shadow-primary/5 transition-all duration-200 hover:border-primary/50 cursor-pointer group"
    >
      {/* Ambient background glow if game cover exists */}
      {meetup.gameImg && (
        <div
          className="absolute -right-12 -top-12 h-64 w-64 rounded-full opacity-15 blur-3xl pointer-events-none transition-opacity duration-300 group-hover:opacity-25"
          style={{ backgroundImage: `url(${meetup.gameImg})`, backgroundSize: 'cover' }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Artwork + Main Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-muted/80 border border-border/40 shrink-0 shadow-md">
            {meetup.gameImg ? (
              <img
                src={meetup.gameImg}
                alt={meetup.gameTitle || meetup.title}
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                <Users className="w-8 h-8 opacity-70" />
              </div>
            )}
            <div className="absolute top-1.5 left-1.5">
              <Badge variant="default" size="sm" className="text-xs shadow-sm font-black">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                <span>{t('groups.nextUp', 'Próxima')}</span>
              </Badge>
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black font-display text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                {meetup.gameTitle || meetup.title}
              </h3>
              {isAttending && (
                <Badge variant="success" size="sm" className="font-bold gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t('meetups.attending', 'Asistirás')}</span>
                </Badge>
              )}
              {isFull ? (
                <Badge variant="warning" size="sm">
                  {t('common.full', 'Mesa Completa')}
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" className="border-primary/30 text-primary bg-primary/5">
                  {t('meetups.slotsLeft', '{{count}} asientos libres', { count: remainingSlots })}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-foreground font-bold">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{formattedDate}</span>
              </span>

              <span className="flex items-center gap-1.5 truncate">
                {meetup.is_online ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t('meetups.online', 'Mesa Online')}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{meetup.location || meetup.city || t('meetups.inPerson', 'Presencial')}</span>
                  </>
                )}
              </span>
            </div>

            {/* Tactile Seat Roster Stack */}
            <div className="pt-1 flex items-center gap-3">
              <div className="flex items-center -space-x-2">
                {attendeeMembers.slice(0, 5).map((m) => (
                  <Avatar key={m.user_id} className="h-7 w-7 border-2 border-card shadow-xs ring-1 ring-border/20">
                    <AvatarImage src={m.avatar_url || undefined} />
                    <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                      {m.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {joinedCount > 5 && (
                  <span className="h-7 min-w-7 px-1.5 rounded-full bg-muted border border-border/40 text-xs font-bold text-muted-foreground flex items-center justify-center">
                    +{joinedCount - 5}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {joinedCount} de {maxPlayers} sentados
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Button */}
        <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
          <Button
            size="default"
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
            className="w-full md:w-auto rounded-2xl font-bold text-xs h-11 px-5 gap-2 shadow-md hover:shadow-primary/20 cursor-pointer"
          >
            <span>{isAttending ? t('meetups.viewMyTable', 'Ver Mi Mesa') : t('meetups.joinTable', 'Ver y Unirme')}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
