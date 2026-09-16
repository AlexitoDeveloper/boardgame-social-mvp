import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Users, CalendarDays, 
  Loader2, Plus, Check, Info, Puzzle
} from 'lucide-react'
import { useGameDetail } from '../hooks/useGameDetail'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs } from '../components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useGameLocale } from '../hooks/useGameLocale'
import { AppLanguage } from '../lib/dateLocale'

import { GameHeroHeader } from '../components/game-detail/GameHeroHeader'
import { GameDetailsTab } from '../components/game-detail/GameDetailsTab'
import { GameCommunityTab } from '../components/game-detail/GameCommunityTab'
import { GameMeetupsTab } from '../components/game-detail/GameMeetupsTab'
import { GameExpansionsTab } from '../components/game-detail/GameExpansionsTab'
import { GameActionsCard } from '../components/game-detail/GameActionsCard'

export function GameDetailPage() {
  const { t, i18n } = useTranslation()
  const { getGameTitle, getGameCover } = useGameLocale()
  const language = (i18n.language?.startsWith('en') ? 'en' : 'es') as AppLanguage
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

  const title = getGameTitle(game)
  const coverUrl = getGameCover(game)
  const hasBaseGame = !!(game.is_expansion && baseGame)
  const hasExpansions = !game.is_expansion && expansions.length > 0
  const hasExpansionsOrBaseGame = hasBaseGame || hasExpansions

  const tabs = [
    { id: 'details', label: t('gameDetail.technicalSheet'), icon: Info },
    { id: 'community', label: t('gameDetail.community'), icon: Users, count: owners.length > 0 ? owners.length : undefined },
    { id: 'meetups', label: t('gameDetail.meetups'), icon: CalendarDays, count: upcomingMeetups.length > 0 ? upcomingMeetups.length : undefined },
    ...(hasExpansionsOrBaseGame ? [{ id: 'expansions', label: t('gameDetail.expansions'), icon: Puzzle, count: expansions.length > 0 ? expansions.length : undefined }] : [])
  ] as const

  const currentTabObj = tabs.find(tab => tab.id === activeTab)

  return (
    <div className="relative min-h-dvh pb-16 space-y-6">
      {/* Sticky top bar with synchronized context */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-2 -mx-4 px-4 md:-mx-8 md:px-8 bg-background/85 backdrop-blur-md border-b border-border/20">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="cursor-pointer"
          icon={ArrowLeft}
          label={t('common.back')}
          aria-label={t('common.back')}
          title={t('common.back')}
        />
        <div className="flex items-center gap-2">
          <Badge variant="primary-soft" size="default">
            {currentTabObj?.label || t('gameDetail.technicalSheet')}
          </Badge>
        </div>
      </div>

      {/* Hero Header */}
      <GameHeroHeader
        game={game}
        title={title}
        coverUrl={coverUrl}
        language={language}
      />

      {/* Mobile Compact Quick Actions */}
      <div className="relative z-10 lg:hidden max-w-6xl mx-auto px-4 grid grid-cols-2 gap-3">
        <Link to={`/mesa/nueva?gameId=${game.bgg_id}`} className="w-full">
          <Button 
            variant="default"
            size="sm" 
            className="w-full font-black text-xs h-10 gap-1.5 shadow-sm"
            icon={Plus}
            label={t('common.hostTable')}
            aria-label={t('common.hostTable')}
          />
        </Link>

        <Button
          variant={isInCollection ? 'outline' : 'secondary'}
          size="sm"
          className="w-full font-bold text-xs h-10 gap-1.5"
          onClick={toggleCollection}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : isInCollection ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{t('gameDetail.inLudoteca')}</span>
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{t('gameDetail.addToLudoteca')}</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16 relative z-10 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main content tabs */}
          <div className="lg:col-span-2 space-y-6">
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
                  {activeTab === 'details' && <GameDetailsTab game={game} />}
                  {activeTab === 'community' && (
                    <GameCommunityTab
                      playsCount={playsCount}
                      winnersLog={winnersLog}
                      owners={owners}
                      currentUserCity={currentUserCity}
                    />
                  )}
                  {activeTab === 'meetups' && (
                    <GameMeetupsTab
                      game={game}
                      upcomingMeetups={upcomingMeetups}
                      language={language}
                    />
                  )}
                  {activeTab === 'expansions' && (
                    <GameExpansionsTab
                      game={game}
                      baseGame={baseGame}
                      expansions={expansions}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar Actions on Desktop */}
          <div className="hidden lg:block lg:col-span-1 space-y-6 lg:sticky lg:top-8">
            <GameActionsCard
              game={game}
              isInCollection={isInCollection}
              actionLoading={actionLoading}
              toggleCollection={toggleCollection}
            />
          </div>
        </div>

        {/* BGG Legal Disclaimer */}
        <div className="text-xs text-center text-muted-foreground/50 font-semibold select-none pt-12 border-t border-border/10 mt-8">
          {t('profile.collection.attribution')}{' '}
          <a
            href="https://boardgamegeek.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors hover:underline"
          >
            BoardGameGeek
          </a>
        </div>
      </div>
    </div>
  )
}
