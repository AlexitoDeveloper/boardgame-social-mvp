import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Loader2, X } from 'lucide-react'
import { GameSearchBar } from '../GameSearchBar'
import { OptimizedImage } from '../ui/OptimizedImage'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Game } from '../../types'
import { useTranslation } from 'react-i18next'
import { useGameLocale } from '../../hooks/useGameLocale'

const MotionDiv = motion.div

interface GameSelectionSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  selectedGames: Game[];
  setSelectedGames: React.Dispatch<React.SetStateAction<Game[]>>;
  isSearching: boolean;
  isShowingBggResults: boolean;
  isImporting: boolean;
  handleSelectGame: (game: Game) => void;
  handleSearchBgg: () => Promise<void>;
  onContinue: () => void;
}

export function GameSelectionSection({
  searchQuery,
  setSearchQuery,
  games,
  setGames,
  selectedGames,
  setSelectedGames,
  isSearching,
  isShowingBggResults,
  isImporting,
  handleSelectGame,
  handleSearchBgg,
  onContinue
}: GameSelectionSectionProps) {
  const { t } = useTranslation()
  const { getGameTitle } = useGameLocale()
  return (
    <MotionDiv
      key="game-stage"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 relative z-10"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-black tracking-tight text-foreground">
          {t('create.step1')}
        </h3>
        <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
          {t('create.step1Desc')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <GameSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            games={games}
            setGames={setGames}
            isSearching={isSearching}
            placeholder={t('create.searchPlaceholder')}
            onSelectGame={handleSelectGame}
            isGameDisabled={(game) => selectedGames.some(g => g.bgg_id === game.bgg_id)}
            closeOnSelect={false}
            onSearchBgg={handleSearchBgg}
            isShowingBggResults={isShowingBggResults}
            isImporting={isImporting}
          />

          {isImporting && (
            <div className="mt-3 text-primary bg-primary/5 border border-primary/20 px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-pulse shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
              <span>{t('create.importingBgg')}</span>
            </div>
          )}
        </div>

        {/* Shelf (Bandeja de Juegos) */}
        <div className="p-4 border border-border/40 rounded-xl bg-muted/20 backdrop-blur-sm shadow-inner space-y-3 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground font-black uppercase tracking-wider block">
              {t('create.shelfTitle')} ({selectedGames.length})
            </Label>
            {selectedGames.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                type="button"
                onClick={() => setSelectedGames([])}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t('common.clear')}
              </Button>
            )}
          </div>

          {selectedGames.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border/50 rounded-lg bg-background/30 text-muted-foreground text-xs font-semibold">
              {t('create.shelfEmpty')}
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent min-h-[72px] border border-transparent rounded-lg">
              <AnimatePresence initial={false}>
                {selectedGames.map((game) => (
                  <motion.div
                    key={game.bgg_id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                    className="group relative w-14 h-14 rounded-lg overflow-hidden border border-border bg-background/60 hover:border-primary flex items-center justify-center shrink-0 transition-colors shadow-sm"
                  >
                    <OptimizedImage
                      src={game.image_url}
                      alt={getGameTitle(game)}
                      widthSize={80}
                      heightSize={80}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedGames(prev => prev.filter(g => g.bgg_id !== game.bgg_id))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 p-0 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer shadow-md flex items-center justify-center"
                      title={`${t('common.remove')} ${game.title}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Continue Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/20">
          <Button 
            type="button"
            onClick={onContinue}
            className="flex-1 h-11 text-xs font-bold shadow-md cursor-pointer"
          >
            {selectedGames.length > 0 ? t('create.continueWithGames') : t('create.continueWithoutGame')}
          </Button>
        </div>
      </div>
    </MotionDiv>
  )
}
