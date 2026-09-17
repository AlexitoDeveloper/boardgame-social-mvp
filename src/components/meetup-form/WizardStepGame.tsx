import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Loader2, X, AlertTriangle, Dices, Layers } from 'lucide-react'
import { GameSearchBar } from '../GameSearchBar'
import { OptimizedImage } from '../ui/OptimizedImage'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { ExpansionBadge } from '../ui/expansion-badge'
import { Game } from '@/types'
import { useTranslation } from 'react-i18next'
import { useGameLocale } from '../../hooks/useGameLocale'

const MotionDiv = motion.div

interface WizardStepGameProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  games: Game[]
  setGames: React.Dispatch<React.SetStateAction<Game[]>>
  selectedGames: Game[]
  isSearching: boolean
  isShowingBggResults: boolean
  isImporting: boolean
  availableExpansions: Game[]
  showExpansions: boolean
  setShowExpansions: (show: boolean) => void
  hasOnlyExpansions: boolean
  handleSearchBgg: () => Promise<void>
  handleSelectGame: (game: Game) => void
  handleToggleExpansion: (exp: Game) => void
  handleRemoveGame: (bggId: number) => void
  onClearGames: () => void
}

export function WizardStepGame({
  searchQuery,
  setSearchQuery,
  games,
  setGames,
  selectedGames,
  isSearching,
  isShowingBggResults,
  isImporting,
  availableExpansions,
  showExpansions,
  setShowExpansions,
  hasOnlyExpansions,
  handleSearchBgg,
  handleSelectGame,
  handleToggleExpansion,
  handleRemoveGame,
  onClearGames
}: WizardStepGameProps) {
  const { t } = useTranslation()
  const { getGameTitle } = useGameLocale()

  return (
    <MotionDiv
      key="step-game"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <Dices className="w-5 h-5 text-primary shrink-0" />
          <span>{t('create.stepGame')}</span>
        </h2>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{t('create.step1Desc')}</p>
      </div>

      <div className="space-y-2 relative">
        <GameSearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          games={games}
          setGames={setGames}
          isSearching={isSearching}
          placeholder={t('create.searchPlaceholder')}
          onSelectGame={handleSelectGame}
          isGameDisabled={(game) => selectedGames.some((g) => g.bgg_id === game.bgg_id)}
          closeOnSelect={false}
          onSearchBgg={handleSearchBgg}
          isShowingBggResults={isShowingBggResults}
          isImporting={isImporting}
        />
        {isImporting && (
          <div className="mt-2 text-primary bg-primary/10 border border-primary/20 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-pulse shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
            <span>{t('create.importingBgg')}</span>
          </div>
        )}
      </div>

      {/* Selected Games Shelf */}
      <div className="p-4 border border-border/40 rounded-2xl bg-card/40 backdrop-blur-md shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground font-black uppercase tracking-wider block">
            {t('create.shelfTitle')} ({selectedGames.length})
          </Label>
          {selectedGames.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onClearGames}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer h-7 text-xs px-2 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t('common.clear')}
            </Button>
          )}
        </div>

        {selectedGames.length === 0 ? (
          <div className="text-center py-7 px-4 border border-dashed border-border/50 rounded-xl bg-background/20 text-muted-foreground text-xs font-medium space-y-1">
            <p className="font-semibold text-foreground/80">{t('create.shelfEmpty')}</p>
            <p className="text-muted-foreground/70 text-xs">{t('create.noGamesSelected')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <AnimatePresence initial={false}>
              {selectedGames.map((game) => (
                <motion.div
                  key={game.bgg_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-background/50 hover:border-primary/40 transition-colors shadow-sm gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {game.image_url ? (
                      <OptimizedImage
                        src={game.image_url}
                        alt={getGameTitle(game)}
                        widthSize={60}
                        heightSize={60}
                        className="w-10 h-10 rounded-lg object-cover border border-border/20 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center text-xs font-black text-muted-foreground shrink-0">?</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{getGameTitle(game)}</p>
                      {game.is_expansion && <ExpansionBadge size="xs" className="mt-0.5" />}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveGame(game.bgg_id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg"
                    aria-label={`${t('common.remove')} ${getGameTitle(game)}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {hasOnlyExpansions && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{t('create.onlyExpansionsWarning')}</span>
        </div>
      )}

      {availableExpansions.length > 0 && (
        <div className="space-y-2 p-3.5 border border-border/40 rounded-2xl bg-card/40 backdrop-blur-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowExpansions(!showExpansions)}
            className="cursor-pointer p-0 h-auto text-primary hover:bg-transparent flex items-center gap-1.5 text-xs font-bold"
          >
            <Layers className="w-4 h-4" />
            <span>{showExpansions ? t('create.hideExpansions') : t('create.showExpansions', { count: availableExpansions.length })}</span>
          </Button>

          <AnimatePresence>
            {showExpansions && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-0.5">
                  {availableExpansions.map((exp) => {
                    const isChecked = selectedGames.some((sg) => sg.bgg_id === exp.bgg_id)
                    return (
                      <div
                        key={exp.bgg_id}
                        onClick={() => handleToggleExpansion(exp)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer select-none transition-all text-xs font-semibold ${
                          isChecked
                            ? 'border-primary/60 bg-primary/10 text-foreground shadow-sm shadow-primary/5'
                            : 'border-border/40 bg-background/30 text-muted-foreground hover:bg-muted/30 hover:border-border/80'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-border/80 bg-background'
                        }`}>
                          {isChecked && <span className="text-[10px] font-black leading-none">✓</span>}
                        </div>
                        {exp.image_url ? (
                          <OptimizedImage src={exp.image_url} alt={exp.title} widthSize={40} heightSize={40} className="w-7 h-7 rounded-md object-cover shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-muted/60 flex items-center justify-center text-[10px] font-extrabold text-muted-foreground shrink-0">?</div>
                        )}
                        <span className="truncate flex-1">{exp.title}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </MotionDiv>
  )
}
