import { Search, Layers, Sparkles } from 'lucide-react'
import { Input } from '../ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { GameCoverCard } from '../GameCoverCard'
import { MergedGame } from '../../hooks/useGroupDetail'
import { User } from '@supabase/supabase-js'
import { useTranslation } from 'react-i18next'

interface GroupLudotecaTabProps {
  filteredMerged: MergedGame[];
  user: User | null;
  collectionSearch: string;
  setCollectionSearch: (search: string) => void;
}

export function GroupLudotecaTab({
  filteredMerged,
  user,
  collectionSearch,
  setCollectionSearch
}: GroupLudotecaTabProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={t('groups.searchPlaceholder')}
            value={collectionSearch}
            onChange={(e) => setCollectionSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>{t('groups.unitedLudotecas')}</span>
        </div>
      </div>

      {filteredMerged.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-muted/15 max-w-md mx-auto space-y-3">
          <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground font-bold text-sm">{t('groups.emptyLudoteca')}</p>
          <p className="text-xs text-foreground/50 px-6 max-w-sm mx-auto leading-normal">
            {t('groups.emptyLudotecaDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMerged.map((item) => (
            <div key={item.game.bgg_id} className="space-y-2 flex flex-col justify-between">
              <GameCoverCard game={item.game} />
              <div className="text-[10px] bg-muted/30 p-2 rounded-xl border border-border/20 space-y-1.5">
                <p className="font-bold text-[9px] text-muted-foreground uppercase tracking-wider leading-none">{t('groups.ownedBy')}</p>
                <div className="flex flex-wrap gap-1 items-center">
                  {item.owners.map((owner) => {
                    const initials = owner.username.slice(0, 2).toUpperCase()
                    return (
                      <div
                        key={owner.user_id}
                        className="flex items-center gap-1 bg-background/60 hover:bg-background px-1.5 py-1 rounded-lg border border-border/15 font-semibold text-foreground/80 text-[10px] shadow-sm select-all transition-colors cursor-default"
                        title={owner.username}
                      >
                        <Avatar className="h-4 w-4 shrink-0 border border-primary/20">
                          <AvatarImage src={owner.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-[6px] font-bold">{initials}</AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[70px]">
                          {owner.user_id === user?.id ? t('common.you') : owner.username}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
