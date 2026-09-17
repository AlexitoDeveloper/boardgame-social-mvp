import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, MapPin, Globe, Plus, ArrowRight, Dices } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../lib/dateLocale'
import { GroupMeetup } from '../../hooks/useGroupHub'

interface GroupUpcomingMeetupsProps {
  groupId: string;
  meetups: GroupMeetup[];
  loading: boolean;
}

export const GroupUpcomingMeetups: React.FC<GroupUpcomingMeetupsProps> = ({
  groupId,
  meetups,
  loading,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const language = i18n.language as any

  const formatMeetupDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return formatDate(d, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }, language)
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="p-4 rounded-2xl bg-card/60 border border-border/30 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <span>{t('groups.upcomingMeetups', 'Quedadas del Grupo')}</span>
            <Badge variant="secondary" className="text-[11px] font-black px-2 py-0.5">
              {meetups.length}
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('groups.upcomingMeetupsDesc', 'Partidas y eventos programados con los miembros')}
          </p>
        </div>

        {meetups.length > 0 && (
          <Button
            size="sm"
            onClick={() => navigate(`/mesa/nueva?groupId=${groupId}`)}
            className="rounded-xl font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('groups.scheduleMeetup', 'Organizar Partida')}</span>
          </Button>
        )}
      </div>

      {meetups.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border/50 bg-card/30 rounded-2xl max-w-md mx-auto space-y-3">
          <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <h4 className="font-extrabold text-foreground text-sm">
            {t('groups.noMeetupsScheduled', 'No hay quedadas programadas')}
          </h4>
          <p className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">
            {t('groups.noMeetupsScheduledDesc', 'Sé el primero en proponer una quedada para este grupo y reúne a tus amigos en la mesa.')}
          </p>
          <Button
            size="sm"
            onClick={() => navigate(`/mesa/nueva?groupId=${groupId}`)}
            className="rounded-xl font-bold text-xs gap-1.5 mt-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('groups.createFirstMeetup', 'Crear Primera Quedada')}</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetups.map((meetup) => {
            const joinedCount = meetup.joined_players?.length || 0
            const maxPlayers = meetup.max_players || 4
            const isFull = joinedCount >= maxPlayers

            return (
              <Card
                key={meetup.id}
                onClick={() => navigate(`/mesa/${meetup.id}`)}
                className="p-4 rounded-2xl bg-card/75 hover:bg-card border-border/40 hover:border-primary/40 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/60 border border-border/30 shrink-0 flex items-center justify-center">
                    {meetup.gameImg ? (
                      <img src={meetup.gameImg} alt={meetup.gameTitle || meetup.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Dices className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {meetup.title}
                      </h4>
                      {isFull && (
                        <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-bold">
                          {t('common.full', 'Completa')}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-primary font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{formatMeetupDateTime(meetup.date)}</span>
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
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{joinedCount} / {maxPlayers} {t('common.players', 'jugadores')}</span>
                  </div>

                  <span className="font-bold text-primary flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform">
                    {t('common.view', 'Ver')} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
