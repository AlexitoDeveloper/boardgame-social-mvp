import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CalendarDays, 
  ChevronRight, 
  Clock, 
  Swords, 
  Plus, 
  Trash2, 
  Calendar,
  Dices,
  Download,
  ListOrdered,
  BarChart2
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Meetup, Game } from '../../types'
import { UserStats } from '../../hooks/useProfile'
import { StatsDashboard } from './StatsDashboard'
import { AdvancedStats } from './AdvancedStats'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion'
import { useGameLocale } from '../../hooks/useGameLocale'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../lib/dateLocale'

const MotionDiv = motion.div

interface TabContentListProps {
  activeTab: 'upcoming' | 'completed' | 'collection' | 'mas';
  upcomingMeetups: Meetup[];
  completedMeetups: Meetup[];
  collectionGames: Game[];
  loadingCollection: boolean;
  savedRankings: any[];
  loadingRankings: boolean;
  isOwnProfile: boolean;
  isOwnProfileEditable: boolean;
  currentUserId: string | undefined;
  stats: UserStats;
  meetups: Meetup[];
  profileId: string;
  handleRemoveFromCollection: (e: React.MouseEvent, bggId: number) => void;
  handleDeleteRanking: (e: React.MouseEvent, rankingId: string) => void;
  setSelectedRanking: (ranking: any) => void;
  setIsImportModalOpen: (val: boolean) => void;
}

export function TabContentList({
  activeTab,
  upcomingMeetups,
  completedMeetups,
  collectionGames,
  loadingCollection,
  savedRankings,
  loadingRankings,
  isOwnProfile,
  isOwnProfileEditable,
  currentUserId,
  stats,
  meetups,
  profileId,
  handleRemoveFromCollection,
  handleDeleteRanking,
  setSelectedRanking,
  setIsImportModalOpen
}: TabContentListProps) {

  const { t } = useTranslation()
  const { getGameTitle, language } = useGameLocale()

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {activeTab === 'upcoming' && (
          <MotionDiv
            key="upcoming-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {upcomingMeetups.length === 0 ? (
              <div className="text-center py-12 px-4 bg-muted/10 rounded-2xl border border-dashed border-border/40 select-none">
                <p className="text-sm font-bold text-muted-foreground">{t('profile.upcomingEmpty')}</p>
                {isOwnProfile && <p className="text-xs text-muted-foreground/80 mt-1">{t('profile.upcomingEmptyDesc')}</p>}
              </div>
            ) : (
              upcomingMeetups.map(meetup => {
                const gamesList = Array.isArray(meetup.games) ? meetup.games : (meetup.games ? [meetup.games] : [])
                const mainGame = gamesList[0] || null

                return (
                  <Link key={meetup.id} to={`/tablero/${meetup.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-2xl glass-panel hover:bg-muted/40 hover:border-primary/20 hover:shadow-lg transition-all group border-border/40">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-12 h-12 shrink-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-background/60 border border-border/20 p-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 group-hover:border-primary/30 transition-all duration-300">
                            {mainGame?.image_url ? (
                              <img src={mainGame.image_url} alt={getGameTitle(mainGame)} className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105 duration-300" />
                            ) : (
                              <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">?</div>
                            )}
                          </div>
                          {gamesList.length > 1 && (
                            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-md border border-background shadow-sm z-10 select-none">
                              +{gamesList.length - 1}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 text-left space-y-1">
                          <span className="font-extrabold text-sm block text-foreground truncate group-hover:text-primary transition-colors">{meetup.title}</span>
                          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                            {formatDate(meetup.date, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }, language)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-black text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{t('profile.verMesa')}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </MotionDiv>
        )}

        {activeTab === 'completed' && (
          <MotionDiv
            key="completed-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {completedMeetups.length === 0 ? (
              <div className="text-center py-12 px-4 bg-muted/10 rounded-2xl border border-dashed border-border/40 select-none">
                <p className="text-sm font-bold text-muted-foreground">{t('profile.historyEmpty')}</p>
              </div>
            ) : (
              completedMeetups.map(meetup => {
                const gamesList = Array.isArray(meetup.games) ? meetup.games : (meetup.games ? [meetup.games] : [])
                const mainGame = gamesList[0] || null
                const isWinner = gamesList.some(g => g.winner_user_id === currentUserId)
                const didAttend = meetup.attended_players?.includes(currentUserId || '')

                return (
                  <Link key={meetup.id} to={`/tablero/${meetup.id}`}>
                    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md group ${
                      isWinner 
                        ? 'border-rose-500/25 bg-rose-500/[0.02] hover:bg-rose-500/[0.04] hover:border-rose-500/40 glass-panel shadow-sm' 
                        : !didAttend 
                          ? 'border-destructive/25 bg-destructive/[0.01] opacity-70 hover:opacity-100 hover:bg-destructive/[0.03] glass-panel shadow-sm'
                          : 'border-border/40 hover:bg-muted/40 hover:border-primary/20 glass-panel shadow-sm'
                    }`}>
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-12 h-12 shrink-0">
                          <div className={`w-12 h-12 rounded-xl shrink-0 overflow-hidden p-1 flex items-center justify-center transition-all duration-300 ${
                            isWinner 
                              ? 'bg-rose-500/10 border border-rose-500/20 group-hover:border-rose-500/40' 
                              : 'bg-background/60 border border-border/20 group-hover:border-primary/30'
                          }`}>
                            {mainGame?.image_url ? (
                              <img src={mainGame.image_url} alt={getGameTitle(mainGame)} className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105 duration-300" />
                            ) : (
                              <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">?</div>
                            )}
                          </div>
                          {gamesList.length > 1 && (
                            <div className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-md border shadow-sm z-10 select-none ${
                              isWinner
                                ? 'bg-rose-500 text-rose-foreground border-rose-950'
                                : 'bg-primary text-primary-foreground border-background'
                            }`}>
                              +{gamesList.length - 1}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 text-left space-y-1">
                          <span className="font-extrabold text-sm block text-foreground truncate group-hover:text-primary transition-colors">{meetup.title}</span>
                          <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1">
                            <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                              {formatDate(meetup.date, { day: 'numeric', month: 'short', year: 'numeric' }, language)}
                            </span>
                            
                            {/* Winner Badge using Swords Icon */}
                            {isWinner && (
                              <Badge variant="destructive" className="flex items-center gap-0.5 shrink-0">
                                <Swords className="w-2.5 h-2.5 fill-current" /> {t('common.won')}
                              </Badge>
                            )}

                            {/* Pending Closure warning badges */}
                            {!meetup.completed && new Date(meetup.date).getTime() < Date.now() && (
                              meetup.creator_id === currentUserId ? (
                                <Badge variant="warning" pulse className="shrink-0">
                                  {t('profile.pendingClosure')}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="shrink-0">
                                  {t('profile.pendingReport')}
                                </Badge>
                              )
                            )}

                            {/* No attendance badge */}
                            {meetup.completed && !didAttend && (
                              <Badge variant="destructive" className="shrink-0">
                                {t('profile.absent')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })
            )}
          </MotionDiv>
        )}

        {activeTab === 'mas' && (
          <MotionDiv
            key="mas-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
          >
            <Accordion type="multiple" defaultValue={['estadisticas','rankings']} className="space-y-2">
              {/* ── Estadísticas ──────────────────────────── */}
              <AccordionItem value="estadisticas" className="glass-panel rounded-2xl border-border/30 px-4 border">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{t('profile.stats.title')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <StatsDashboard stats={stats} />
                    <AdvancedStats stats={stats} meetups={meetups} profileId={profileId} />
                  </div>
                </AccordionContent>
              </AccordionItem>
              {/* ── Rankings ──────────────────────────────── */}
              <AccordionItem value="rankings" className="glass-panel rounded-2xl border-border/30 px-4 border">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-primary shrink-0" />
                    <span>{t('profile.stats.rankings')}</span>
                    <span className="text-[10px] font-black text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      {savedRankings.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {loadingRankings ? (
                      <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="h-14 w-full bg-muted/20 border border-border/30 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : savedRankings.length === 0 ? (
                      <div className="text-center py-8 px-4 bg-muted/10 rounded-xl border border-dashed border-border/40 select-none">
                        <p className="text-sm font-bold text-muted-foreground">{t('profile.stats.noRankings')}</p>
                        {isOwnProfile && (
                          <Link to="/tops" className="inline-block mt-3">
                            <Button size="sm" icon={Plus} label={t('profile.stats.createRanking')} className="cursor-pointer" />
                          </Link>
                        )}
                      </div>
                    ) : (
                      savedRankings.map((ranking) => (
                        <div 
                          key={ranking.id} 
                          onClick={() => setSelectedRanking(ranking)}
                          className="p-3 rounded-xl border border-border/30 hover:bg-muted/40 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
                        >
                          <div className="space-y-1 flex-1 min-w-0 pr-3">
                            <h4 className="font-extrabold text-xs text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 min-w-0">
                              <span className="truncate">{ranking.title || t('tops.untitled')}</span>
                              <Badge variant="primary-soft" className="shrink-0 text-[9px]">
                                {ranking.mode === 'tier' ? 'Tier List' : 'Top 10'}
                              </Badge>
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                              <Calendar className="w-3 h-3 text-primary shrink-0" />
                              {formatDate(ranking.created_at || Date.now(), { day: 'numeric', month: 'short', year: 'numeric' }, language)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isOwnProfile && (
                              <Button 
                                variant="ghost" size="sm" 
                                onClick={(e) => handleDeleteRanking(e, ranking.id)}
                                className="cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title={t('tops.deleteRanking')} icon={Trash2}
                              />
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </MotionDiv>
        )}

        {activeTab === 'collection' && (
          <MotionDiv
            key="collection-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {isOwnProfileEditable && collectionGames.length === 0 && (
              <div className="flex justify-between items-center bg-card/35 backdrop-blur-md border border-border/20 rounded-2xl p-4 shadow-sm hover:border-primary/20 transition-all duration-300">
                <div className="text-left space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">{t('profile.collection.importBgg')}</h4>
                  <p className="text-[10px] text-muted-foreground leading-normal font-semibold">{t('profile.collection.importBggDesc')}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  icon={Plus}
                  label={t('profile.collection.importButton')}
                />
              </div>
            )}

            {loadingCollection ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[2/3] w-full bg-muted/20 border border-border/30 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : collectionGames.length === 0 ? (
              <div className="text-center py-12 px-4 bg-muted/10 rounded-2xl border border-dashed border-border/40 space-y-3 select-none">
                <Dices className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-muted-foreground">{t('profile.collection.emptyTitle')}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {isOwnProfileEditable 
                      ? t('profile.collection.emptyDescOwn') 
                      : t('profile.collection.emptyDescOther')}
                  </p>
                </div>
                {isOwnProfileEditable && (
                  <Button 
                    size="sm" 
                    onClick={() => setIsImportModalOpen(true)}
                    className="mt-2 cursor-pointer"
                    icon={Plus}
                    label={t('profile.collection.importLudoteca')}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1 select-none">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    {collectionGames.length} {collectionGames.length === 1 ? t('profile.collection.gameCount') : t('profile.collection.gamesCount')}
                  </span>
                  {isOwnProfileEditable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsImportModalOpen(true)}
                      className="cursor-pointer"
                      icon={Download}
                      label={t('profile.collection.syncButton')}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {collectionGames.map(game => (
                    <Link 
                      key={game.bgg_id} 
                      to={`/juegos/${game.bgg_id}`}
                      className="group relative glass-panel hover:border-primary/35 rounded-2xl p-3 flex flex-col items-center text-center hover:shadow-lg hover:scale-[1.01] transition-all duration-300 overflow-hidden border-border/40"
                    >
                      {/* Trash action button */}
                      {isOwnProfileEditable && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={(e) => handleRemoveFromCollection(e, game.bgg_id)}
                          className="absolute top-2.5 right-2.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer z-30 flex items-center justify-center shadow-md border border-white/10 bg-black/75 hover:bg-destructive"
                          title={t('profile.collection.removeFromCollection')}
                          icon={Trash2}
                        />
                      )}
                      
                      <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-muted/20 border border-border/10 relative flex items-center justify-center shrink-0">
                        {game.image_url ? (
                          <>
                            {/* Blurred background copy for cropped edges fill */}
                            <img 
                              src={game.image_url} 
                              alt="" 
                              className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
                            />
                            {/* Contained front cover artwork */}
                            <img 
                              src={game.image_url} 
                              alt={getGameTitle(game)} 
                              className="w-full h-full object-contain p-1 relative z-10 rounded-lg transition-transform group-hover:scale-105 duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          </>
                        ) : null}
                        <div className={`absolute inset-0 flex items-center justify-center p-3 text-xs font-bold text-muted-foreground ${game.image_url ? 'hidden' : ''}`}>
                          {getGameTitle(game)}
                        </div>
                      </div>
                      <div className="mt-3 w-full px-0.5 text-center">
                        <h4 className="font-extrabold text-foreground group-hover:text-primary transition-colors text-xs line-clamp-1 leading-snug">
                          {getGameTitle(game)}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-bold block mt-0.5">
                          {game.year_published || 'N/A'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* BGG attribution footer under collection games */}
            <div className="text-[9px] text-center text-muted-foreground/40 font-semibold select-none pt-4">
              Datos de ludoteca proporcionados por <a href="https://boardgamegeek.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">BoardGameGeek</a>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  )
}
