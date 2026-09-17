import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Dices, Plus, Gamepad2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'
import { Tabs } from '../components/ui/tabs'
import { useGroups } from '../hooks/useGroups'
import { usePlayDecisionEngine } from '../hooks/usePlayDecisionEngine'
import { PlayFilterBar } from '../components/play/PlayFilterBar'
import { PlayCollectionSelector } from '../components/play/PlayCollectionSelector'
import { GameDecisionCard } from '../components/play/GameDecisionCard'
import { TableToolsBar } from '../components/table-hub/TableToolsBar'
import { PlayActiveMeetups } from '../components/play/PlayActiveMeetups'
import { ExpressVotingModal } from '../components/play/ExpressVotingModal'
import { BggSyncModal } from '../components/library/BggSyncModal'

type PlayTabMode = 'decide' | 'table'

export function PlayPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { groups } = useGroups()

  const [activeTab, setActiveTab] = useState<PlayTabMode>(
    searchParams.get('tab') === 'table' ? 'table' : 'decide'
  )
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showVotingModal, setShowVotingModal] = useState(false)

  const engine = usePlayDecisionEngine()
  const hasActiveFilters =
    engine.selectedPlayers !== null ||
    engine.selectedDuration !== 'any' ||
    engine.selectedComplexity !== 'any' ||
    engine.onlyUnplayed

  // Deep-link auto-trigger for real-time express voting rooms
  useEffect(() => {
    if (searchParams.get('votingRoom')) {
      setShowVotingModal(true)
    }
  }, [searchParams])

  const tabOptions = [
    { id: 'decide' as const, label: t('play.tabs.decide'), icon: Dices },
    { id: 'table' as const, label: t('play.tabs.table'), icon: Gamepad2 },
  ]

  return (
    <section className="space-y-6 max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/75 bg-clip-text text-transparent flex items-center gap-2.5 font-display">
            <span className="p-2 rounded-2xl bg-primary/10 text-primary inline-flex">
              <Dices className="w-7 h-7" aria-hidden="true" />
            </span>
            <span>{t('play.title')}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{t('play.subtitle')}</p>
        </div>

        <Button
          type="button"
          onClick={() => navigate('/mesa/nueva')}
          className="rounded-2xl font-bold shadow-lg shadow-primary/25 flex items-center gap-2 h-11 px-5 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{t('play.openTable')}</span>
        </Button>
      </div>

      {/* Segmented Mode Switcher */}
      <div className="max-w-md">
        <Tabs
          options={tabOptions}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Mode 1: Decision Engine */}
      {activeTab === 'decide' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-[28px] glass-panel border border-border/40 p-6 sm:p-8 relative overflow-hidden shadow-xl space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/70 text-muted-foreground border border-border/40 text-xs font-bold uppercase tracking-wider mb-1">
                <Dices className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>{t('play.decisionTitle')}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl">{t('play.decisionDesc')}</p>
            </div>

            <div className="space-y-5">
              <PlayFilterBar
                selectedPlayers={engine.selectedPlayers}
                onSelectPlayers={engine.setSelectedPlayers}
                selectedDuration={engine.selectedDuration}
                onSelectDuration={engine.setSelectedDuration}
                selectedComplexity={engine.selectedComplexity}
                onSelectComplexity={engine.setSelectedComplexity}
                onResetFilters={engine.resetFilters}
                hasActiveFilters={hasActiveFilters}
              />
              <PlayCollectionSelector
                selectedGroupId={engine.selectedGroupId}
                onSelectGroupId={engine.setSelectedGroupId}
                groups={groups}
                loadingGames={engine.loadingGames}
                filteredCount={engine.filteredGames.length}
                onOpenSyncModal={() => setShowSyncModal(true)}
                onlyUnplayed={engine.onlyUnplayed}
                onToggleOnlyUnplayed={() => engine.setOnlyUnplayed((prev: boolean) => !prev)}
              />
            </div>

            <GameDecisionCard
              suggestedGame={engine.suggestedGame}
              spinningGame={engine.spinningGame}
              isSpinning={engine.isSpinning}
              loadingGames={engine.loadingGames}
              filteredCount={engine.filteredGames.length}
              spinError={engine.spinError}
              availableExpansions={engine.availableExpansionsForSuggested}
              onSpin={engine.spinRoulette}
              onOpenVoting={() => setShowVotingModal(true)}
              onResetFilters={engine.resetFilters}
              onStartSession={(id: number) => navigate(`/mesa/nueva?gameId=${id}`)}
            />
          </div>
        </div>
      )}

      {/* Mode 2: Table Companion Hub */}
      {activeTab === 'table' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <TableToolsBar />
        </div>
      )}

      {/* Shared Active / Upcoming Games Section */}
      <PlayActiveMeetups />

      <BggSyncModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} onSuccess={engine.refreshGames} />
      <ExpressVotingModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        candidates={engine.filteredGames}
        roomId={searchParams.get('votingRoom') || (engine.selectedGroupId !== 'personal' ? `group-${engine.selectedGroupId}` : 'general')}
        onGameSelected={(game) => {
          setShowVotingModal(false)
          navigate(`/mesa/nueva?gameId=${game.bgg_id}`)
        }}
      />
    </section>
  )
}

export default PlayPage
