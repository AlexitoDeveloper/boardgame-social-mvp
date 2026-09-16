import { Link } from 'react-router-dom'
import { CalendarDays, Globe, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Meetup, Game } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, AppLanguage } from '@/lib/dateLocale'

interface GameMeetupsTabProps {
  game: Game
  upcomingMeetups: Meetup[]
  language: AppLanguage
}

export function GameMeetupsTab({ game, upcomingMeetups, language }: GameMeetupsTabProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            {t('gameDetail.upcomingPlays')}
          </h3>
        </div>
        
        <span className="text-xs font-extrabold text-muted-foreground">
          {upcomingMeetups?.length || 0} {upcomingMeetups?.length === 1 ? t('common.game').toLowerCase() : t('gameDetail.meetups').toLowerCase()}
        </span>
      </div>

      {upcomingMeetups && upcomingMeetups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingMeetups.map(meetup => {
            const dateObj = new Date(meetup.date)
            const isFull = (meetup.joined_players?.length || 0) >= meetup.max_players
            
            return (
              <Card 
                key={meetup.id} 
                variant="glass"
                className="p-5 flex flex-col justify-between group hover:border-border/80 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      {meetup.users?.avatar_url ? (
                        <img 
                          src={meetup.users.avatar_url} 
                          alt={meetup.users.username} 
                          className="h-6 w-6 rounded-full object-cover border border-border/40"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold text-muted-foreground">
                            {meetup.users?.username?.charAt(0).toUpperCase() || 'O'}
                          </span>
                        </div>
                      )}
                      <span className="text-xs font-bold text-muted-foreground">
                        {t('gameDetail.organizedBy', { username: meetup.users?.username })}
                      </span>
                    </div>

                    <Badge variant={isFull ? 'destructive' : 'success'} size="sm">
                      {isFull ? t('common.full') : t('common.free')}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">
                      {meetup.title}
                    </h4>
                    {meetup.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-medium leading-normal">
                        {meetup.description}
                      </p>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-muted-foreground/80 space-y-1 border-t border-border/30 pt-3">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>
                        {formatDate(dateObj, { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }, language)}
                      </span>
                    </p>
                    {meetup.is_online ? (
                      <p className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>Online via {meetup.platform || 'Discord'}</span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 truncate">
                        <span className="shrink-0 text-muted-foreground">📍</span>
                        <span>{meetup.location} ({meetup.city})</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/30">
                  <Link to={`/mesa/${meetup.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 font-bold">
                      {t('gameDetail.viewMeetupDetails')}
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card variant="glass" className="text-center py-12 p-6 space-y-3">
          <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <div>
            <h4 className="text-xs font-black uppercase text-foreground">{t('gameDetail.noScheduledPlaysTitle')}</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-normal">
              {t('gameDetail.noScheduledPlaysDesc')}
            </p>
          </div>
          <Link to={`/mesa/nueva?gameId=${game.bgg_id}`} className="inline-block mt-2">
            <Button 
              variant="default"
              size="sm" 
              className="font-black gap-1.5 px-4 h-9 shadow-sm"
              icon={Plus}
              label={t('common.hostTable')}
              aria-label={t('common.hostTable')}
            />
          </Link>
        </Card>
      )}
    </div>
  )
}
