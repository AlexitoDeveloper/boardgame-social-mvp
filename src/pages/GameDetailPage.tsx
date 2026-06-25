import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Star, Users, Globe, CalendarDays, 
  Bookmark, Trophy, Dices, Crown, Loader2, Plus, Check, Info, Hourglass, BarChart, Puzzle
} from 'lucide-react'
import { useGameDetail } from '../hooks/useGameDetail'
import { Button } from '../components/ui/button'
import { Tabs } from '../components/ui/tabs'
import { OptimizedImage } from '../components/ui/OptimizedImage'
import { formatDate } from '../lib/dateLocale'
import { useTranslation } from 'react-i18next'
import { useGameLocale } from '../hooks/useGameLocale'

export function GameDetailPage() {
  const { t, i18n } = useTranslation()
  const { getGameTitle } = useGameLocale()
  const language = i18n.language as any
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    loading,
    error,
    game,
    baseGame,
    expansions,
    playsCount,
    winnersLog,
    owners,
    isInCollection,
    actionLoading,
    toggleCollection,
    currentUserCity,
    upcomingMeetups
  } = useGameDetail(id)

  const [activeTab, setActiveTab] = useState<'details' | 'community' | 'meetups' | 'expansions'>('details')

  const title = game ? getGameTitle(game) : ''

  // Format ratings
  const avgRating = game?.rating_average ? game.rating_average.toFixed(1) : 'N/A'
  const geekRating = game?.rating_geek ? game.rating_geek.toFixed(1) : 'N/A'
  
  const complexity = game?.complexity || 0
  let complexityLabel = t('gameDetail.unknown')
  let complexityColor = 'bg-gray-500'

  if (complexity > 0) {
    if (complexity <= 2.2) {
      complexityLabel = t('gameDetail.lightLabel')
      complexityColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    } else if (complexity <= 3.5) {
      complexityLabel = t('gameDetail.mediumLabel')
      complexityColor = 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    } else {
      complexityLabel = t('gameDetail.heavyLabel')
      complexityColor = 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    }
  }

  // Players display
  const players = game?.min_players && game?.max_players
    ? game.min_players === game.max_players
      ? `${game.min_players}`
      : `${game.min_players}-${game.max_players}`
    : 'N/A'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="text-center">
          <h3 className="text-lg font-black tracking-tight text-foreground">{t('gameDetail.loadingTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('gameDetail.loadingDesc')}</p>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-md mx-auto text-center gap-4">
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-full">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight text-foreground">{t('gameDetail.notFoundTitle')}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error || t('gameDetail.notFoundDesc')}
          </p>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('gameDetail.backToExplore')}
          </Button>
        </Link>
      </div>
    )
  }

  const hasBaseGame = !!(game.is_expansion && baseGame)
  const hasExpansions = !game.is_expansion && expansions.length > 0
  const hasExpansionsOrBaseGame = hasBaseGame || hasExpansions

  const tabs = [
    { id: 'details', label: t('gameDetail.technicalSheet'), icon: Info },
    { id: 'community', label: t('gameDetail.community'), icon: Users, count: owners.length > 0 ? owners.length : undefined },
    { id: 'meetups', label: t('gameDetail.meetups'), icon: CalendarDays, count: upcomingMeetups.length > 0 ? upcomingMeetups.length : undefined },
    ...(hasExpansionsOrBaseGame ? [{ id: 'expansions', label: t('gameDetail.expansions'), icon: Puzzle, count: expansions.length > 0 ? expansions.length : undefined }] : [])
  ] as const

  // Details Tab Content
  const tabDetailsContent = (
    <div className="space-y-6">
      {/* Quick Specs Row */}
      <div className="grid grid-cols-3 gap-4 p-5 glass-panel rounded-2xl shadow-sm">
        <div className="flex flex-col items-center justify-center text-center p-2">
          <Users className="h-6 w-6 text-primary mb-1.5" />
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">{t('common.players')}</span>
          <span className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">{players}</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-2 border-x border-border/30">
          <Hourglass className="h-6 w-6 text-teal-400 mb-1.5" />
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">{t('explore.duration')}</span>
          <span className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">{game.playing_time ? `${game.playing_time} ${t('explore.minutes')}` : 'N/A'}</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-2">
          <BarChart className="h-6 w-6 text-purple-400 mb-1.5" />
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">{t('explore.difficulty')}</span>
          <span className="text-sm sm:text-base font-extrabold text-foreground mt-0.5">{complexity > 0 ? `${complexity.toFixed(1)}/5` : 'N/A'}</span>
        </div>
      </div>

      {/* BGG Rankings and Ratings Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* BGG Rank Card */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-sm h-36 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group/metric">
          <Trophy className="absolute right-4 top-4 h-12 w-12 text-primary/10 select-none pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('gameDetail.bggRank')}</span>
            <h3 className="text-3xl font-black tracking-tight text-foreground">
              {game.bgg_rank ? `#${game.bgg_rank}` : 'N/A'}
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground/75 leading-normal">
            {t('gameDetail.globalRankDesc')}
          </p>
        </div>

        {/* Rating Card */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-sm h-36 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group/metric">
          <Star className="absolute right-4 top-4 h-12 w-12 text-amber-500/10 select-none pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('explore.rating')}</span>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black tracking-tight text-foreground">{avgRating}</h3>
              <span className="text-xs text-muted-foreground/70 font-semibold">/10</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/75 leading-normal">
            Geek Rating: {geekRating}
          </p>
        </div>

        {/* Complexity Card */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-sm h-36 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group/metric">
          <BarChart className="absolute right-4 top-4 h-12 w-12 text-purple-500/10 select-none pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{t('explore.difficulty')}</span>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black tracking-tight text-foreground">
                {complexity > 0 ? `${complexity.toFixed(1)}` : 'N/A'}
              </h3>
              <span className="text-xs text-muted-foreground/70 font-semibold">/5</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/75 leading-normal">
            {complexityLabel}
          </p>
        </div>
      </div>

      {/* Complexity Progress Gauge */}
      {complexity > 0 && (
        <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">{t('gameDetail.difficultyProfile')}</h4>
            </div>
            <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md border ${complexityColor}`}>
              {complexityLabel}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000 ${
                  complexity <= 2.2 ? 'bg-emerald-500' : complexity <= 3.5 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${(complexity / 5) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
              <span>{t('gameDetail.light')} (0)</span>
              <span>{t('gameDetail.medium')} (2.5)</span>
              <span>{t('gameDetail.heavy')} (5)</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            {t('gameDetail.difficultyDescription', { 
              complexity: complexity.toFixed(2), 
              label: complexity <= 2.2 ? t('gameDetail.light') : complexity <= 3.5 ? t('gameDetail.medium') : t('gameDetail.heavy') 
            })}
          </p>
        </div>
      )}

      {/* Publishers Info Block */}
      {(game.publisher || game.es_publisher) && (
        <div className="glass-panel rounded-2xl p-5 space-y-4 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-2">{t('gameDetail.distributionPublishers')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-semibold text-foreground/80">
            {game.publisher && (
              <p>
                {t('gameDetail.intlPublisher')}: <span className="font-bold text-foreground block mt-1">{game.publisher}</span>
              </p>
            )}
            {game.es_publisher && (
              <p>
                {t('gameDetail.spainPublisher')}: <span className="font-bold text-primary block mt-1">{game.es_publisher}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // Community Tab Content
  const tabCommunityContent = (
    <div className="space-y-6">
      {/* Community Stats Recap Panel */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
        <Dices className="absolute right-[-15px] bottom-[-15px] h-24 w-24 text-primary/5 select-none pointer-events-none rotate-12" />
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
            <Dices className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground block">
              {t('gameDetail.registeredPlays')}
            </span>
            <h4 className="text-xl font-black text-foreground mt-0.5">
              {playsCount} {playsCount === 1 ? t('gameDetail.communityPlay') : t('gameDetail.communityPlays')}
            </h4>
          </div>
        </div>
      </div>

      {/* Leaderboard layout for community winners */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Crown className="h-5 w-5 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">{t('gameDetail.victoryHistory')}</h3>
        </div>

        {winnersLog.length > 0 ? (
          <div className="divide-y divide-border/30">
            {winnersLog.map((winner, index) => (
              <div key={winner.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full font-black text-xs">
                    {index === 0 ? (
                      <span className="text-base">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-base">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-base">🥉</span>
                    ) : (
                      <span className="text-muted-foreground">#{index + 1}</span>
                    )}
                  </div>
                  
                  {winner.avatar_url ? (
                    <img 
                      src={winner.avatar_url} 
                      alt={winner.name} 
                      className="h-8 w-8 rounded-full object-cover border border-border/40"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted border border-border/40 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {winner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <span className="text-sm font-bold text-foreground truncate">{winner.name}</span>
                </div>
                
                <span className="text-xs font-extrabold bg-muted text-foreground px-2.5 py-1 rounded-lg">
                  {winner.wins} {winner.wins === 1 ? t('gameDetail.victory') : t('gameDetail.victorias')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground space-y-2">
            <Crown className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs font-medium">{t('gameDetail.noWinsTitle')}</p>
            <p className="text-[11px] text-muted-foreground/75">{t('gameDetail.noWinsDesc')}</p>
          </div>
        )}
      </div>

      {/* Local Ludoteca Owners */}
      <div className="glass-panel rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Bookmark className="h-5 w-5 text-primary" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">{t('gameDetail.communityLudoteca')}</h3>
        </div>

        {owners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {owners.map(owner => {
              const isLocal = currentUserCity && owner.city && currentUserCity.toLowerCase() === owner.city.toLowerCase()
              return (
                <div 
                  key={owner.user_id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/20 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Link to={`/perfil/${owner.user_id}`} className="shrink-0">
                      {owner.avatar_url ? (
                        <img 
                          src={owner.avatar_url} 
                          alt={owner.username} 
                          className="h-8 w-8 rounded-full object-cover border border-border/40 hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted border border-border/40 flex items-center justify-center hover:bg-muted/65 transition-colors">
                          <span className="text-xs font-bold text-muted-foreground">
                            {owner.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </Link>
                    
                    <div className="min-w-0">
                      <Link to={`/perfil/${owner.user_id}`} className="hover:underline hover:text-primary transition-colors">
                        <span className="text-sm font-bold text-foreground block truncate">{owner.username}</span>
                      </Link>
                      {owner.city && (
                        <span className="text-[10px] text-muted-foreground font-semibold block truncate">
                          📍 {owner.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {currentUserCity ? (
                    isLocal ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                        {t('gameDetail.nearby')}
                      </span>
                    ) : (
                      owner.city && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted/40 border border-border/10 px-2 py-0.5 rounded-md shrink-0">
                          {t('gameDetail.foreign')}
                        </span>
                      )
                    )
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground space-y-2">
            <Bookmark className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-xs font-medium">{t('gameDetail.emptyLudotecaTitle')}</p>
            <p className="text-[11px] text-muted-foreground/75">{t('gameDetail.emptyLudotecaDesc')}</p>
          </div>
        )}
      </div>
    </div>
  )

  // Meetups Tab Content
  const tabMeetupsContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
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
              <div 
                key={meetup.id} 
                className="glass-panel hover:border-primary/45 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between group"
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
                          <span className="text-[8px] font-bold text-muted-foreground">
                            {meetup.users?.username?.charAt(0).toUpperCase() || 'O'}
                          </span>
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {t('gameDetail.organizedBy', { username: meetup.users?.username })}
                      </span>
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      isFull ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {isFull ? t('common.full') : t('common.free')}
                    </span>
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

                  <div className="text-[11px] font-semibold text-muted-foreground/80 space-y-1 border-t border-border/30 pt-3">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
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
                        <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Online via {meetup.platform || 'Discord'}</span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5 truncate">
                        <span className="shrink-0 text-primary">📍</span>
                        <span>{meetup.location} ({meetup.city})</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/30">
                  <Link to={`/tablero/${meetup.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-[11px] gap-1 h-8 rounded-xl font-black">
                      {t('gameDetail.viewMeetupDetails')}
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground glass-panel rounded-2xl p-6 space-y-3">
          <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <div>
            <h4 className="text-xs font-black uppercase text-foreground">{t('gameDetail.noScheduledPlaysTitle')}</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-normal">
              {t('gameDetail.noScheduledPlaysDesc')}
            </p>
          </div>
          <Link to={`/tablero/new?gameId=${game.bgg_id}`} className="inline-block mt-2">
            <Button size="sm" className="font-black gap-1.5 px-4 h-9">
              <Plus className="h-4 w-4" />
              {t('gameDetail.createNewMeetup')}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )

  // Expansions Tab Content
  const tabExpansionsContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        <Puzzle className="h-5 w-5 text-amber-500" />
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
          {game.is_expansion ? t('gameDetail.baseGameRequired') : t('gameDetail.availableExpansions', { count: expansions.length })}
        </h3>
      </div>

      {game.is_expansion && baseGame && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500">
            <Info className="h-5 w-5" />
            <h4 className="text-xs font-black uppercase tracking-wider">{t('gameDetail.requiresBaseGameTitle')}</h4>
          </div>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            {t('gameDetail.requiresBaseGameDesc')}
          </p>
          
          <Link 
            to={`/juegos/${baseGame.bgg_id}`}
            className="flex items-center gap-4 p-3.5 rounded-xl bg-card border border-border/40 hover:border-primary/40 hover:shadow-md transition-all group max-w-md"
          >
            <OptimizedImage
              src={baseGame.image_url}
              alt={baseGame.title}
              widthSize={80}
              heightSize={110}
              className="w-12 h-16 rounded-lg border border-border/40 shrink-0 bg-muted/20"
            />
            <div className="min-w-0">
              <h5 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {getGameTitle(baseGame)}
              </h5>
              <p className="text-[10px] text-muted-foreground font-extrabold mt-1 uppercase tracking-wider">
                {t('gameDetail.baseGame')} • {baseGame.year_published || 'N/A'}
              </p>
            </div>
          </Link>
        </div>
      )}

      {!game.is_expansion && expansions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {expansions.map(exp => (
            <Link 
              key={exp.bgg_id}
              to={`/juegos/${exp.bgg_id}`}
              className="flex items-center gap-4 p-3.5 rounded-xl bg-card border border-border/40 hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <OptimizedImage
                src={exp.image_url}
                alt={exp.title}
                widthSize={80}
                heightSize={110}
                className="w-12 h-16 rounded-lg border border-border/40 shrink-0 bg-muted/20"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                  {getGameTitle(exp)}
                </h4>
                <p className="text-[10px] text-muted-foreground font-extrabold mt-1 uppercase tracking-wider">
                  {t('gameDetail.expansion')} • {exp.year_published || 'N/A'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )

  // Sidebar Content (Quick actions)
  const sidebarContent = (
    <div className="space-y-6">
      {/* Quick Actions Panel */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground border-b border-border/40 pb-3">
          {t('gameDetail.actionsTitle')}
        </h3>
        
        <div className="flex flex-col gap-3">
          {/* Organize Match Button */}
          <Link to={`/tablero/new?gameId=${game.bgg_id}`} className="w-full">
            <Button className="w-full font-black tracking-tight gap-2 py-6 rounded-xl shadow-md cursor-pointer bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/95 hover:to-emerald-500 hover:shadow-lg transition-all duration-300">
              <CalendarDays className="h-4.5 w-4.5" />
              {t('gameDetail.organizeMeetup')}
            </Button>
          </Link>

          {/* Toggle Personal Collection */}
          <Button
            variant={isInCollection ? 'outline' : 'secondary'}
            className="w-full font-bold text-xs gap-2 py-6 rounded-xl cursor-pointer"
            onClick={toggleCollection}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : isInCollection ? (
              <>
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                {t('gameDetail.inLudoteca')}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                {t('gameDetail.addToLudoteca')}
              </>
            )}
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed text-center pt-2">
          {t('gameDetail.collectionTip')}
        </p>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen pb-16 space-y-6">
      {/* Ambient background blur behind the header */}
      {game.image_url && (
        <div className="absolute top-0 inset-x-0 h-[380px] overflow-hidden pointer-events-none select-none z-0 opacity-30">
          <OptimizedImage
            src={game.image_url}
            alt=""
            widthSize={100}
            className="w-full h-full object-cover filter blur-[40px] scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>
      )}

      {/* Header bar (sticky on mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-2 -mx-4 px-4 md:-mx-8 md:px-8 bg-background/85 backdrop-blur-md border-b border-border/20">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="cursor-pointer"
          icon={ArrowLeft}
          label={t('common.back')}
        />
        <span className="text-[10px] font-black text-primary uppercase bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-wider select-none">
          {t('gameDetail.technicalSheet')}
        </span>
      </div>

      {/* Info Header - Side-by-side flex row on all views */}
      <div className="relative max-w-6xl mx-auto px-4 flex gap-4 md:gap-8 items-start md:items-end text-left select-text">
        {/* Cover Art - Rendered in natural aspect ratio with responsive height */}
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative h-28 sm:h-36 md:h-48 shrink-0 rounded-xl md:rounded-2xl shadow-xl border border-border/30 hover:scale-[1.01] transition-transform duration-300 flex items-center justify-center bg-zinc-950/10"
        >
          <OptimizedImage
            src={game.image_url}
            alt={title}
            widthSize={350}
            fit="contain"
            className="h-full w-auto object-contain rounded-xl md:rounded-2xl"
          />
        </motion.div>

        {/* Title and metadata */}
        <div className="flex-grow space-y-2 md:space-y-3 pb-1 md:pb-2 select-text min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            {game.year_published && (
              <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground bg-card/85 dark:bg-card/45 border border-border/20 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg backdrop-blur-sm shadow-sm">
                <CalendarDays className="h-2.5 w-2.5 md:h-3 md:w-3" />
                {game.year_published}
              </span>
            )}
            {game.has_spanish_edition && (
              <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg backdrop-blur-sm shadow-sm">
                <Globe className="h-2.5 w-2.5 md:h-3 md:w-3" />
                ES
              </span>
            )}
            {game.is_expansion && (
              <span className="text-[9px] md:text-[10px] font-extrabold tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg uppercase backdrop-blur-sm shadow-sm">
                {t('gameDetail.expansion')}
              </span>
            )}
            <a 
              href={`https://boardgamegeek.com/boardgame/${game.bgg_id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground bg-card/85 dark:bg-card/45 border border-border/20 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md md:rounded-lg backdrop-blur-sm shadow-sm hover:text-primary hover:border-primary/30 transition-colors"
            >
              BGG ↗
            </a>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-foreground drop-shadow-md leading-tight break-words">
            {title}
          </h1>

          {language === 'es' && game.title_es && game.title_es !== game.title && (
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
              {t('gameDetail.originalTitle')}: <span className="italic font-bold text-foreground/80">{game.title}</span>
            </p>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16 relative z-10 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Panel on Mobile */}
            <div className="lg:hidden">
              {sidebarContent}
            </div>
            <Tabs
              options={tabs as any}
              activeTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId as any)}
              className="max-w-xl mb-4"
              hideLabelsOnMobile
            />

            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'details' && tabDetailsContent}
                  {activeTab === 'community' && tabCommunityContent}
                  {activeTab === 'meetups' && tabMeetupsContent}
                  {activeTab === 'expansions' && tabExpansionsContent}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1 space-y-6 lg:sticky lg:top-8">
            {sidebarContent}
          </div>
        </div>

        {/* BGG Legal Disclaimer */}
        <div className="text-[10px] text-center text-muted-foreground/45 font-semibold select-none pt-12 border-t border-border/10 mt-8">
          {t('profile.collection.attribution')} <a href="https://boardgamegeek.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">BoardGameGeek</a>
        </div>
      </div>
    </div>
  )
}
