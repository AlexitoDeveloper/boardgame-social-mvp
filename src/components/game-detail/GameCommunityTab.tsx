import { Link } from 'react-router-dom'
import { Dices, Crown, Bookmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { GameWinner, GameOwner } from '@/hooks/useGameDetail'
import { Meetup } from '@/types'
import { AppLanguage } from '@/lib/dateLocale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GameUpcomingMeetupsSection } from './GameUpcomingMeetupsSection'

interface GameCommunityTabProps {
  playsCount: number
  winnersLog: GameWinner[]
  owners: GameOwner[]
  currentUserCity: string | null
  upcomingMeetups?: Meetup[]
  language?: AppLanguage
}

export function GameCommunityTab({
  playsCount,
  winnersLog,
  owners,
  currentUserCity,
  upcomingMeetups,
  language = 'es'
}: GameCommunityTabProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      {/* Upcoming Scheduled Meetups */}
      <GameUpcomingMeetupsSection
        upcomingMeetups={upcomingMeetups}
        language={language}
      />

      {/* Community Stats Recap Panel */}
      <Card variant="glass" className="p-5 relative overflow-hidden">
        <Dices className="absolute right-[-15px] bottom-[-15px] h-24 w-24 text-primary/5 select-none pointer-events-none rotate-12" />
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary rounded-xl shrink-0">
            <Dices className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-black tracking-widest text-muted-foreground block">
              {t('gameDetail.registeredPlays')}
            </span>
            <h4 className="text-xl font-black text-foreground mt-0.5">
              {playsCount} {playsCount === 1 ? t('gameDetail.communityPlay') : t('gameDetail.communityPlays')}
            </h4>
          </div>
        </div>
      </Card>

      {/* Leaderboard layout for community winners */}
      <Card variant="glass" className="p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Crown className="h-5 w-5 text-amber-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            {t('gameDetail.victoryHistory')}
          </h3>
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
                      <span className="text-xs font-bold text-muted-foreground">
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
            <p className="text-xs text-muted-foreground/75">{t('gameDetail.noWinsDesc')}</p>
          </div>
        )}
      </Card>

      {/* Local Ludoteca Owners */}
      <Card variant="glass" className="p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-3">
          <Bookmark className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
            {t('gameDetail.communityLudoteca')}
          </h3>
        </div>

        {owners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {owners.map(owner => {
              const isLocal = currentUserCity && owner.city && currentUserCity.toLowerCase() === owner.city.toLowerCase()
              return (
                <div 
                  key={owner.user_id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/20 hover:border-border/80 transition-colors"
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
                      <Link to={`/perfil/${owner.user_id}`} className="hover:underline hover:text-foreground transition-colors">
                        <span className="text-sm font-bold text-foreground block truncate">{owner.username}</span>
                      </Link>
                      {owner.city && (
                        <span className="text-xs text-muted-foreground font-semibold block truncate">
                          📍 {owner.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {currentUserCity ? (
                    isLocal ? (
                      <Badge variant="success" size="sm" className="shrink-0">
                        {t('gameDetail.nearby')}
                      </Badge>
                    ) : (
                      owner.city && (
                        <Badge variant="secondary" size="sm" className="shrink-0">
                          {t('gameDetail.foreign')}
                        </Badge>
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
            <p className="text-xs text-muted-foreground/75">{t('gameDetail.emptyLudotecaDesc')}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
