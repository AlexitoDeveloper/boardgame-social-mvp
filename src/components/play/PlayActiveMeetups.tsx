import { FC, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Play, MessageSquare, Plus, ArrowRight, Dices, CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/button'
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
          const guestResStr = localStorage.getItem('boardgame_social_guest_reservations')
          if (guestResStr) {
            const guestMap = JSON.parse(guestResStr)
            guestMeetupIds = Object.keys(guestMap)
          }
        } catch {}

        if (USE_MOCKS) {
          const stored = localStorage.getItem('boardgame_social_mock_meetups')
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
                  gameTitle: firstGame?.title || m.title,
                  gameImg: firstGame?.image_url || null,
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
                image_url
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
              gameTitle: firstGame?.title || m.title,
              gameImg: firstGame?.image_url || null,
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
          <span>{t('play.activeSessionsTitle')}</span>
        </h2>
        <Link
          to="/chats"
          className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1"
        >
          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('play.goToChat')}</span>
        </Link>
      </div>

      {loadingMeetups ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : activeMeetups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeMeetups.map((meetup) => {
            const gameTitle = meetup.gameTitle || meetup.title
            const gameImg = meetup.gameImg || null
            const isToday = new Date(meetup.date).toDateString() === new Date().toDateString()

            return (
              <div
                key={meetup.id}
                onClick={() => navigate(`/mesa/${meetup.id}`)}
                className="p-4 rounded-2xl glass-panel border border-border/40 hover:border-border/80 transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-3.5 group active:scale-[0.99]"
              >
                {gameImg ? (
                  <img
                    src={gameImg}
                    alt={gameTitle}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border/20 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <Dices className="w-6 h-6" aria-hidden="true" />
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {gameTitle}
                    </h4>
                    {isToday && (
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-black text-xs uppercase tracking-wider">
                        Hoy
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {formatDate(
                      meetup.date,
                      { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
                      i18n.language as any
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground/80 font-semibold truncate">
                    {meetup.is_online ? 'Online' : meetup.location || meetup.city || 'Mesa presencial'} •{' '}
                    {meetup.joined_players?.length || 1}/{meetup.max_players} jug.
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
              </div>
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
