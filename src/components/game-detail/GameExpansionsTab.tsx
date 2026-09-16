import { Link } from 'react-router-dom'
import { Puzzle, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Game } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { useGameLocale } from '@/hooks/useGameLocale'

interface GameExpansionsTabProps {
  game: Game
  baseGame: Game | null
  expansions: Game[]
}

export function GameExpansionsTab({ game, baseGame, expansions }: GameExpansionsTabProps) {
  const { t } = useTranslation()
  const { getGameTitle } = useGameLocale()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        <Puzzle className="h-5 w-5 text-amber-500" />
        <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
          {game.is_expansion ? t('gameDetail.baseGameRequired') : t('gameDetail.availableExpansions', { count: expansions.length })}
        </h3>
      </div>

      {game.is_expansion && baseGame && (
        <Card variant="glass" className="border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-500">
            <Info className="h-5 w-5" />
            <h4 className="text-xs font-black uppercase tracking-wider">{t('gameDetail.requiresBaseGameTitle')}</h4>
          </div>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            {t('gameDetail.requiresBaseGameDesc')}
          </p>
          
          <Link 
            to={`/juegos/${baseGame.bgg_id}`}
            className="block max-w-md"
          >
            <Card variant="interactive" className="flex items-center gap-4 p-3.5">
              <OptimizedImage
                src={baseGame.image_url}
                alt={baseGame.title}
                widthSize={80}
                heightSize={110}
                className="w-12 h-16 rounded-lg border border-border/40 shrink-0 bg-muted/20 object-contain"
              />
              <div className="min-w-0 flex-1">
                <h5 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {getGameTitle(baseGame)}
                </h5>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="secondary" size="sm">
                    {t('gameDetail.baseGame')}
                  </Badge>
                  {baseGame.year_published && (
                    <span className="text-xs text-muted-foreground font-semibold">
                      {baseGame.year_published}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        </Card>
      )}

      {!game.is_expansion && expansions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {expansions.map(exp => (
            <Link 
              key={exp.bgg_id}
              to={`/juegos/${exp.bgg_id}`}
              className="block"
            >
              <Card variant="interactive" className="flex items-center gap-4 p-3.5 h-full">
                <OptimizedImage
                  src={exp.image_url}
                  alt={exp.title}
                  widthSize={80}
                  heightSize={110}
                  className="w-12 h-16 rounded-lg border border-border/40 shrink-0 bg-muted/20 object-contain"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                    {getGameTitle(exp)}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="warning" size="sm">
                      {t('gameDetail.expansion')}
                    </Badge>
                    {exp.year_published && (
                      <span className="text-xs text-muted-foreground font-semibold">
                        {exp.year_published}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
