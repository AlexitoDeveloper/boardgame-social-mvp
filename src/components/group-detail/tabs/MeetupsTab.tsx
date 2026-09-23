import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, ChevronRight } from 'lucide-react'
import { Button } from '../../ui/button'
import { Card } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Skeleton } from '../../ui/skeleton'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../../lib/dateLocale'
import { GroupMeetup } from '../../../hooks/useGroupHub'
import { GroupMember } from '../../../hooks/useGroupDetail'
import { NextMeetupSpotlight } from './NextMeetupSpotlight'

interface MeetupsTabProps {
  groupId: string
  meetups: GroupMeetup[]
  loading: boolean
  members?: GroupMember[]
  currentUserId?: string
}

export const MeetupsTab: React.FC<MeetupsTabProps> = ({
  groupId,
  meetups,
  loading,
  members = [],
  currentUserId,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const language = i18n.language as any

  const formatMeetupDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return formatDate(
        d,
        { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
        language
      )
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  const [heroMeetup, ...remainingMeetups] = meetups

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Section Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{t('groups.upcomingMeetups', 'Agenda de quedadas')}</span>
          </h2>
          {meetups.length > 0 && (
            <Badge variant="secondary" size="sm" className="font-bold">
              {meetups.length}
            </Badge>
          )}
        </div>

        <Button
          size="sm"
          onClick={() => navigate(`/mesa/nueva?groupId=${groupId}`)}
          className="rounded-xl font-bold text-xs h-9 px-3.5 gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('groups.scheduleMeetup', 'Organizar Quedada')}</span>
        </Button>
      </div>

      {/* Empty State */}
      {meetups.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-border/50 bg-card/40 rounded-3xl max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-primary">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-black text-foreground text-base font-display">
              {t('groups.noMeetupsScheduled', 'La mesa está despejada')}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('groups.noMeetupsScheduledDesc', 'Proponed un juego, fijad la fecha y reservad vuestros asientos para la próxima partida.')}
            </p>
          </div>
          <Button
            size="default"
            onClick={() => navigate(`/mesa/nueva?groupId=${groupId}`)}
            className="rounded-xl font-bold text-xs gap-2 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('groups.createFirstMeetup', 'Convocar Partida')}</span>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Spotlight Hero Meetup */}
          {heroMeetup && (
            <NextMeetupSpotlight
              meetup={heroMeetup}
              members={members}
              currentUserId={currentUserId}
              formattedDate={formatMeetupDateTime(heroMeetup.date)}
              onSelect={() => navigate(`/mesa/${heroMeetup.id}`)}
            />
          )}

          {/* Chronological Queue (High Density Agenda Rows) */}
          {remainingMeetups.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-foreground/85 px-1">
                {t('groups.followingMeetups', 'Siguientes partidas')}
              </h3>
              <div className="divide-y divide-border/20 rounded-2xl border border-border/40 bg-card/60 overflow-hidden">
                {remainingMeetups.map((m) => {
                  const joined = m.joined_players?.length || 0
                  const max = m.max_players || 4
                  return (
                    <div
                      key={m.id}
                      onClick={() => navigate(`/mesa/${m.id}`)}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-muted border border-border/30 shrink-0">
                          {m.gameImg ? (
                            <img src={m.gameImg} alt={m.gameTitle || m.title} className="w-full h-full object-cover" />
                          ) : (
                            <Calendar className="w-5 h-5 text-muted-foreground m-3" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-sm font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
                            {m.gameTitle || m.title}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="font-semibold text-primary">{formatMeetupDateTime(m.date)}</span>
                            <span>•</span>
                            <span className="truncate">{m.is_online ? 'Online' : m.location || 'Presencial'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" size="sm" className="font-mono text-xs">
                          {joined}/{max} p
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MeetupsTab
