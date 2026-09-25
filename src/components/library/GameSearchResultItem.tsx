import { Check, Plus, Loader2, Dices } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { Game } from '@/types'
import { useGameLocale } from '@/hooks/useGameLocale'

interface GameSearchResultItemProps {
  game: Game
  isInCollection: boolean
  isAdding: boolean
  onAdd: (game: Game) => void
}

export function GameSearchResultItem({
  game,
  isInCollection,
  isAdding,
  onAdd,
}: GameSearchResultItemProps) {
  const { getGameTitle, getGameCover } = useGameLocale()
  const title = getGameTitle(game) || game.title_es || game.title
  const cover = getGameCover(game) || game.image_url

  return (
    <div className="p-3 rounded-2xl bg-card/80 dark:bg-muted/20 border border-border/40 hover:border-primary/40 flex items-center justify-between gap-3 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        {cover ? (
          <OptimizedImage
            src={cover}
            alt={title}
            widthSize={100}
            className="w-11 h-11 rounded-xl shrink-0 border border-border/30 shadow-xs"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Dices className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0 space-y-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
            {title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            {game.year_published && <span>{game.year_published}</span>}
            {game.min_players && (
              <span>
                {game.min_players}-{game.max_players || game.min_players} jug.
              </span>
            )}
            {game.isFromBgg && (
              <Badge variant="outline" size="sm" className="text-xs px-1.5 py-0">
                BGG
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0">
        {isInCollection ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">En ludoteca</span>
          </span>
        ) : (
          <Button
            variant="default"
            size="sm"
            disabled={isAdding}
            onClick={() => onAdd(game)}
            icon={isAdding ? Loader2 : Plus}
            label="Añadir"
          />
        )}
      </div>
    </div>
  )
}
