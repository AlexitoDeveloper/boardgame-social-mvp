import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Dices, Download, Plus, Search, X, Trash2 } from 'lucide-react'
import { Chip } from '../../ui/chip'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Skeleton } from '../../ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog'
import { toast } from '../../ui/toast'
import { Game, Meetup } from '../../../types'
import { useGameLocale } from '../../../hooks/useGameLocale'
import { useTranslation } from 'react-i18next'
import { GamePosterCard } from './GamePosterCard'
import { ProfileGameDrawer } from './ProfileGameDrawer'

interface CollectionTabProps {
  collectionGames: Game[];
  loadingCollection: boolean;
  isOwnProfileEditable: boolean;
  meetups: Meetup[];
  profileId: string;
  handleRemoveFromCollection: (e: React.MouseEvent, bggId: number) => void;
  setIsImportModalOpen: (val: boolean) => void;
  setIsAddGameModalOpen?: (val: boolean) => void;
}

type FilterType = 'all' | 'owned' | 'want_to_play' | 'unplayed'

export function CollectionTab({
  collectionGames,
  loadingCollection,
  isOwnProfileEditable,
  meetups,
  profileId,
  handleRemoveFromCollection,
  setIsImportModalOpen,
  setIsAddGameModalOpen
}: CollectionTabProps) {
  const { t } = useTranslation()
  const { getGameTitle } = useGameLocale()
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null)
  const [selectedGameForDrawer, setSelectedGameForDrawer] = useState<Game | null>(null)

  const [wantToPlayIds, setWantToPlayIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`want_to_play_${profileId}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const toggleWantToPlay = (bggId: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const isCurrentlyWishlisted = wantToPlayIds.includes(bggId)
    const next = isCurrentlyWishlisted
      ? wantToPlayIds.filter(id => id !== bggId)
      : [...wantToPlayIds, bggId]
    setWantToPlayIds(next)
    localStorage.setItem(`want_to_play_${profileId}`, JSON.stringify(next))
    if (!isCurrentlyWishlisted) {
      toast.success(t('profile.collection.addedWantToPlay', '¡Añadido a Quiero Jugar!'))
    } else {
      toast.info(t('profile.collection.removedWantToPlay', 'Eliminado de Quiero Jugar'))
    }
  }

  const playedBggIds = useMemo(() => {
    const ids = new Set<number>()
    meetups.filter(m => m.completed).forEach(m => {
      (m.games || []).forEach(g => {
        if (g.bgg_id != null) ids.add(Number(g.bgg_id))
      })
    })
    return ids
  }, [meetups])

  const { filteredGames, counts } = useMemo(() => {
    const unplayed = collectionGames.filter(g => {
      if ((g as any).is_unplayed === true) return true
      if ((g as any).play_count === 0) return true
      return !playedBggIds.has(Number(g.bgg_id))
    })
    const wantToPlay = collectionGames.filter(g => wantToPlayIds.includes(Number(g.bgg_id)))

    let list = collectionGames
    if (filter === 'unplayed') list = unplayed
    else if (filter === 'want_to_play') list = wantToPlay

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(g => getGameTitle(g).toLowerCase().includes(q))
    }

    return {
      filteredGames: list,
      counts: {
        all: collectionGames.length,
        owned: collectionGames.length,
        want_to_play: wantToPlay.length,
        unplayed: unplayed.length
      }
    }
  }, [collectionGames, filter, searchQuery, playedBggIds, wantToPlayIds, getGameTitle])

  const filterChips: { id: FilterType; label: string; count: number }[] = [
    { id: 'all', label: t('profile.collection.filterAll', 'Todos'), count: counts.all },
    { id: 'owned', label: t('profile.collection.filterOwned', 'En Ludoteca'), count: counts.owned },
    { id: 'want_to_play', label: t('profile.collection.filterWantToPlay', 'Quiero Jugar'), count: counts.want_to_play },
    { id: 'unplayed', label: t('profile.collection.filterUnplayed', 'Estantería de la Vergüenza'), count: counts.unplayed }
  ]

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('profile.collection.searchPlaceholder', 'Buscar en la colección...')}
            className="pl-10 pr-10 h-11 text-sm rounded-xl bg-card/60 border-border/50 focus-visible:bg-card shadow-xs"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
              icon={X}
            />
          )}
        </div>

        {isOwnProfileEditable && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              icon={Download}
              label={t('profile.collection.syncButton')}
            />
            <Button
              size="sm"
              onClick={() => setIsAddGameModalOpen?.(true)}
              icon={Plus}
              label={t('profile.collection.addGame')}
            />
          </div>
        )}
      </div>

      {/* Horizontal Filter Chips with Instant Counter Badges */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterChips.map(chip => (
          <Chip
            key={chip.id}
            variant="purple"
            size="sm"
            selected={filter === chip.id}
            onClick={() => setFilter(chip.id)}
            badge={
              <span className={`text-[10px] font-mono-tabular px-1.5 py-0.5 rounded-full font-black ${
                filter === chip.id 
                  ? 'bg-purple-500/25 text-purple-700 dark:text-purple-300' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {chip.count}
              </span>
            }
          >
            {chip.label}
          </Chip>
        ))}
      </div>

      {/* Zero-CLS Skeleton Loading Grid */}
      {loadingCollection ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4 mx-auto rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12 px-4 bg-card/40 rounded-2xl border border-dashed border-border/40 space-y-3 select-none">
          <Dices className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm font-bold text-muted-foreground">
            {searchQuery
              ? 'No hay juegos que coincidan con la búsqueda'
              : filter === 'unplayed'
                ? '¡Sin juegos en la estantería de la vergüenza! Has jugado a todos los títulos de tu ludoteca.'
                : filter === 'want_to_play'
                  ? 'Aún no has marcado ningún juego en tu lista de Quiero Jugar.'
                  : t('profile.collection.emptyTitle')}
          </p>
          {isOwnProfileEditable && (
            <div className="flex justify-center gap-2 pt-1">
              <Button size="sm" onClick={() => setIsAddGameModalOpen?.(true)} icon={Plus} label={t('profile.collection.addGame')} />
            </div>
          )}
        </div>
      ) : (
        /* Letterboxd / BG Stats 2:3 Aspect Ratio Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGames.map(game => (
              <GamePosterCard
                key={game.bgg_id}
                game={game}
                isWishlisted={wantToPlayIds.includes(game.bgg_id)}
                isUnplayed={!playedBggIds.has(game.bgg_id)}
                gameTitle={getGameTitle(game)}
                onClick={() => setSelectedGameForDrawer(game)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Attribution */}
      <div className="text-[11px] text-center text-muted-foreground/50 font-semibold pt-2 select-none">
        {t('profile.collection.attribution')} <a href="https://boardgamegeek.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">BoardGameGeek</a>
      </div>

      {/* Remove Game Confirmation Modal */}
      <Dialog open={!!gameToDelete} onOpenChange={(open) => !open && setGameToDelete(null)}>
        <DialogContent className="max-w-sm w-full p-5 sm:p-6 bg-card border border-border/40 shadow-2xl rounded-3xl space-y-4">
          <DialogHeader className="space-y-1.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-1">
              <Trash2 className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-black text-foreground tracking-tight">
              {t('profile.collection.removeFromCollection', 'Quitar de mi ludoteca')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              ¿Seguro que deseas eliminar <span className="font-bold text-foreground">{gameToDelete ? getGameTitle(gameToDelete) : ''}</span> de tu ludoteca?
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setGameToDelete(null)}
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="default"
              onClick={(e) => {
                if (gameToDelete) {
                  const bggId = gameToDelete.bgg_id
                  setGameToDelete(null)
                  handleRemoveFromCollection(e, bggId)
                }
              }}
              icon={Trash2}
              label={t('common.delete', 'Eliminar')}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabletop Action Drawer (Ergonomic 48px Touch Targets) */}
      <ProfileGameDrawer
        game={selectedGameForDrawer}
        open={!!selectedGameForDrawer}
        onOpenChange={(open) => !open && setSelectedGameForDrawer(null)}
        isWishlisted={selectedGameForDrawer ? wantToPlayIds.includes(selectedGameForDrawer.bgg_id) : false}
        isUnplayed={selectedGameForDrawer ? !playedBggIds.has(selectedGameForDrawer.bgg_id) : false}
        isOwnProfileEditable={isOwnProfileEditable}
        gameTitle={selectedGameForDrawer ? getGameTitle(selectedGameForDrawer) : ''}
        onToggleWishlist={toggleWantToPlay}
        onRemove={(game) => {
          setSelectedGameForDrawer(null)
          setGameToDelete(game)
        }}
      />
    </div>
  )
}
