import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../lib/dateLocale'
import { GroupMeetup } from '../../hooks/useGroupHub'
import { GroupMember } from '../../hooks/useGroupDetail'
import { GroupUpcomingMeetupCard } from './GroupUpcomingMeetupCard'

interface GroupUpcomingMeetupsProps {
  groupId: string
  meetups: GroupMeetup[]
  loading: boolean
  members?: GroupMember[]
  currentUserId?: string
}

export const GroupUpcomingMeetups: React.FC<GroupUpcomingMeetupsProps> = ({
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
        {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        },
        language
      )
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
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

  const hasUpcoming = meetups.length > 0

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-base font-black font-display tracking-tight text-foreground">
            {t('groups.upcomingMeetups', 'Quedadas Programadas')}
          </h3>
          {hasUpcoming && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 font-bold">
              {meetups.length}
            </Badge>
          )}
        </div>

        {hasUpcoming && (
          <Button
            size="sm"
            onClick={() => navigate(`/mesa/nueva?groupId=${groupId}`)}
            className="rounded-xl font-bold text-xs h-9 px-3.5 gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('groups.scheduleMeetup', 'Organizar Quedada')}</span>
          </Button>
        )}
      </div>

      {!hasUpcoming ? (
        <Card className="p-8 text-center border-dashed border-border/50 bg-card/30 rounded-2xl max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/40 mx-auto flex items-center justify-center text-muted-foreground">
            <Calendar className="w-6 h-6" />
          </div>

          <div className="space-y-1 max-w-xs mx-auto">
            <h4 className="font-extrabold text-foreground text-sm">
              {t('groups.noMeetupsScheduled', 'No hay quedadas programadas')}
            </h4>
            <p className="text-xs text-muted-foreground leading-normal">
              {t('groups.noMeetupsScheduledDesc', 'Sé el primero en proponer una quedada para este grupo y reúne a tus amigos en la mesa.')}
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => navigate(`/mesa/nueva?groupId=${groupId}`)}
            className="rounded-xl font-bold text-xs gap-1.5 shadow-sm mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('groups.createFirstMeetup', 'Organizar Primera Quedada')}</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetups.map((meetup) => (
            <GroupUpcomingMeetupCard
              key={meetup.id}
              meetup={meetup}
              members={members}
              currentUserId={currentUserId}
              formattedDate={formatMeetupDateTime(meetup.date)}
              onClick={() => navigate(`/mesa/${meetup.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
