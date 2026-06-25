import { ListOrdered } from 'lucide-react'
import { useTops } from '../hooks/useTops'
import { TopsCanvas } from '../components/tops/TopsCanvas'
import { TopsSettings } from '../components/tops/TopsSettings'
import { TopsSearchSection } from '../components/tops/TopsSearchSection'
import { useTranslation } from 'react-i18next'

export function TopsPage() {
  const { t } = useTranslation()
  const tops = useTops()

  return (
    <section className="space-y-6 max-w-5xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ListOrdered className="text-primary w-8 h-8" /> {t('tops.topsTitle')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('tops.topsDesc')}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Canvas takes the FULL width of the container */}
        <div className="w-full">
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
            isPremium={tops.isPremium}
            showWatermark={tops.showWatermark}
            customWatermark={tops.customWatermark}
            selectedBg={tops.selectedBg}
            aspectRatio={tops.aspectRatio}
            isExportingCanvas={tops.isExportingCanvas}
            saving={tops.saving}
            saveSuccess={tops.saveSuccess}
            handleSaveToProfile={tops.handleSaveToProfile}
          />
        </div>

        {/* Settings and Search section side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <TopsSearchSection
              searchQuery={tops.searchQuery}
              setSearchQuery={tops.setSearchQuery}
              searchResults={tops.searchResults}
              setSearchResults={tops.setSearchResults}
              isSearching={tops.isSearching}
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
              mode={tops.mode}
            />
          </div>
          <div className="space-y-4">
            <TopsSettings
              mode={tops.mode}
              setMode={tops.setMode}
              setSelectedGameForPlacement={tops.setSelectedGameForPlacement}
              isPremium={tops.isPremium}
              setIsPremium={tops.setIsPremium}
              showWatermark={tops.showWatermark}
              setShowWatermark={tops.setShowWatermark}
              customWatermark={tops.customWatermark}
              setCustomWatermark={tops.setCustomWatermark}
              selectedBg={tops.selectedBg}
              setSelectedBg={tops.setSelectedBg}
              aspectRatio={tops.aspectRatio}
              setAspectRatio={tops.setAspectRatio}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TopsPage;
