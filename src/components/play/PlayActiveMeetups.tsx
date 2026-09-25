import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Plus, ArrowRight, Dices, CheckCircle2, Clock, MapPin, Users } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { useAuth } from '../../lib/authContext'
import { supabase } from '../../lib/supabaseClient'
import { USE_MOCKS } from '../../lib/config'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../lib/dateLocale'

export const PlayActiveMeetups: FC = () => {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [activeMeetups, setActiveMeetups] = useState<any[]>([])
  const [loadingMeetups, setLoadingMeetups] = useState(true)

  useEffect(() => {
    let isCancelled = false

    const loadActiveMeetups = async () => {
      if (!user) {
        setActiveMeetups([])
        setLoadingMeetups(false)
        return
      }

      setLoadingMeetups(true)
      try {
        let guestMeetupIds: string[] = []
        try {
          const guestResStr = localStorage.getItem('ludiclub_guest_reservations') || localStorage.getItem('boardgame_social_guest_reservations')
          if (guestResStr) {
            const guestMap = JSON.parse(guestResStr)
            guestMeetupIds = Object.keys(guestMap)
          }
        } catch {}

        if (USE_MOCKS) {
          const stored = localStorage.getItem('ludiclub_mock_meetups') || localStorage.getItem('boardgame_social_mock_meetups')
          if (stored) {
            const list = JSON.parse(stored)
            const now = Date.now()
            const myMeetups = list
              .filter(
                (m: any) =>
                  (m.creator_id === user.id ||
                    m.joined_players?.includes(user.id) ||
                    guestMeetupIds.includes(m.id)) &&
                  !m.completed &&
                  new Date(m.date).getTime() >= now - 1000 * 60 * 60 * 4
              )
              .map((m: any) => {
                const firstGame = m.games?.[0] || m.meetup_games?.[0]?.games
                return {
                  ...m,
                  gameTitle: firstGame?.title_es || firstGame?.title || m.title,
                  gameImg: firstGame?.image_url_es || firstGame?.image_url || null,
                }
              })
            if (!isCancelled) setActiveMeetups(myMeetups)
          }
          return
        }

        const orParts = [`creator_id.eq.${user.id}`, `joined_players.cs.{${user.id}}`]
        if (guestMeetupIds.length > 0) {
          orParts.push(`id.in.(${guestMeetupIds.join(',')})`)
        }

        const nowIso = new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        const { data, error } = await supabase
          .from('meetups')
          .select(`
            id,
            title,
            date,
            location,
            city,
            max_players,
            joined_players,
            completed,
            is_online,
            meetup_games (
              game_id,
              games (
                title,
                title_es,
                image_url,
                image_url_es
              )
            )
          `)
          .or(orParts.join(','))
          .eq('completed', false)
          .gte('date', nowIso)
          .order('date', { ascending: true })
          .limit(4)

        if (error) {
          console.error('Error loading active meetups in PlayActiveMeetups:', error)
        } else if (data && !isCancelled) {
          const formatted = data.map((m: any) => {
            const firstGame = m.meetup_games?.[0]?.games
            return {
              ...m,
              gameTitle: firstGame?.title_es || firstGame?.title || m.title,
              gameImg: firstGame?.image_url_es || firstGame?.image_url || null,
            }
          })
          setActiveMeetups(formatted)
        }
      } catch (err) {
        console.error('Error loading active meetups in PlayActiveMeetups:', err)
      } finally {
        if (!isCancelled) setLoadingMeetups(false)
      }
    }

    loadActiveMeetups()
    return () => { isCancelled = true }
  }, [user])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <Play className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span>{t('play.activeSessionsTitle', 'Tus Partidas Próximas')}</span>
        </h2>
      </div>

      {loadingMeetups ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : activeMeetups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeMeetups.map((meetup) => {
            const gameTitle = meetup.gameTitle || meetup.title
            const gameImg = meetup.gameImg || null
            const isToday = new Date(meetup.date).toDateString() === new Date().toDateString()
            const attendeesCount = meetup.joined_players?.length || 1

            return (
              <Card
                key={meetup.id}
                spotlight
                onClick={() => navigate(`/mesa/${meetup.id}`)}
                className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-3 group active:scale-[0.99]"
              >
                <div>
                  {/* Top Bar: Status Badge & Time */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <Badge
                      variant={isToday ? "tag-emerald" : "slatenavy"}
                      className="text-xs font-bold py-0.5 px-2"
                    >
                      {isToday ? t('common.today', 'Hoy') : t('play.upcoming', 'Próxima')}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground" />
                      {formatDate(
                        meetup.date,
                        { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
                        i18n.language as any
                      )}
                    </span>
                  </div>

                  {/* Game & Details Row */}
                  <div className="flex items-start gap-3">
                    {gameImg ? (
                      <img
                        src={gameImg}
                        alt={gameTitle}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-border/40 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0 border border-border/40">
                        <Dices className="w-6 h-6" aria-hidden="true" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                        {gameTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 truncate">
                        <MapPin className="size-3 text-primary shrink-0" />
                        <span className="truncate">
                          {meetup.is_online ? t('common.online') : meetup.location || meetup.city || t('common.inPersonTable')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer: Attendees & Action */}
                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold font-mono-tabular">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span>
                      {attendeesCount}/{meetup.max_players} {t('common.playersAbbr', 'jug.')}
                    </span>
                  </div>

                  <Button
                    size="xs"
                    variant="default"
                    label={t('common.view', 'Ver Mesa')}
                    icon={ArrowRight}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-dashed border-border/50 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 mx-auto text-muted-foreground/40" aria-hidden="true" />
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-xs text-muted-foreground font-medium">
              {t('play.noActiveSessions')}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => navigate('/mesa/nueva')}
            size="sm"
            variant="outline"
            className="rounded-xl font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span>{t('play.openTable')}</span>
          </Button>
        </div>
      )}
    </div>
  )
}
