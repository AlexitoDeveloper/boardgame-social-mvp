import { Trophy } from 'lucide-react'
import { useTops } from '../hooks/useTops'
import { TopsCanvas } from '../components/tops/TopsCanvas'
import { TopsSidebar } from '../components/tops/TopsSidebar'

export function TopsPage() {
  const tops = useTops()

  return (
    <section className="space-y-6 max-w-5xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Trophy className="text-primary w-8 h-8" /> Generador de Rankings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ordena tus juegos preferidos y genera una imagen premium para compartir en tus redes sociales.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* TOP PANEL: Controls & Game Pool Shelf */}
        <TopsSidebar
          mode={tops.mode}
          setMode={tops.setMode}
          searchQuery={tops.searchQuery}
          setSearchQuery={tops.setSearchQuery}
          searchResults={tops.searchResults}
          setSearchResults={tops.setSearchResults}
          isSearching={tops.isSearching}
          handleSearch={tops.handleSearch}
          errorMsg={tops.errorMsg}
          addToPool={tops.addToPool}
          pool={tops.pool}
          selectedGameForPlacement={tops.selectedGameForPlacement}
          selectGame={tops.selectGame}
          removeFromPool={tops.removeFromPool}
          handleClearPool={tops.handleClearPool}
          tiers={tops.tiers}
          top10={tops.top10}
          placeInTier={tops.placeInTier}
          placeInTop10={tops.placeInTop10}
          setSelectedGameForPlacement={tops.setSelectedGameForPlacement}
          handleDragStart={tops.handleDragStart}
          handleDropOnPool={tops.handleDropOnPool}
        />

        {/* BOTTOM PANEL: Exportable Editor Canvas */}
        <TopsCanvas
          exportAreaRef={tops.exportAreaRef}
          mode={tops.mode}
          rankingTitle={tops.rankingTitle}
          setRankingTitle={tops.setRankingTitle}
          tiers={tops.tiers}
          top10={tops.top10}
          selectedGameForPlacement={tops.selectedGameForPlacement}
          placeInTier={tops.placeInTier}
          returnTierGameToPool={tops.returnTierGameToPool}
          placeInTop10={tops.placeInTop10}
          returnTop10GameToPool={tops.returnTop10GameToPool}
          editTierName={tops.editTierName}
          handleDragStart={tops.handleDragStart}
          handleDropOnTier={tops.handleDropOnTier}
          handleDropOnTop10={tops.handleDropOnTop10}
          handleExportImage={tops.handleExportImage}
          exporting={tops.exporting}
          pool={tops.pool}
          handleClearAll={tops.handleClearAll}
        />
      </div>
    </section>
  )
}

export default TopsPage;
