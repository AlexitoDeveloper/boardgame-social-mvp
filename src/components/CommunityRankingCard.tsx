import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Layers, ListOrdered } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { useAuth } from '../lib/authContext'
import { formatDate } from '../lib/dateLocale'

interface CommunityRanking {
  id: string;
  title: string;
  mode: 'tier' | 'top10';
  user_id: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface CommunityRankingCardProps {
  ranking: CommunityRanking;
}

export const CommunityRankingCard = memo(function CommunityRankingCard({ ranking }: CommunityRankingCardProps) {
  const { language } = useAuth()
  const username = ranking.user?.username || 'Usuario'
  const avatarUrl = ranking.user?.avatar_url || undefined
  const modeLabel = ranking.mode === 'tier' ? 'Tier List' : 'Top 10'
  const Icon = ranking.mode === 'tier' ? Layers : ListOrdered

  return (
    <Link
      to={`/perfil/${ranking.user_id}?ranking=${ranking.id}`}
      className="group relative block h-[180px] w-full overflow-hidden rounded-2xl bg-card border border-border/30 shadow-sm transition-[transform,border-color,box-shadow] duration-150 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-md [@media(hover:hover)]:hover:border-primary/30 select-none"
    >
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-emerald-500/5 rounded-full pointer-events-none group-hover:from-primary/20 transition-colors duration-200" />

        {/* Top Section: Badge & Icon */}
        <div className="flex justify-between items-start z-10">
          <Badge 
            variant="primary-soft" 
            className="flex items-center gap-1 px-2 py-0.5"
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span>{modeLabel}</span>
          </Badge>
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </div>

        {/* Title */}
        <div className="space-y-1 z-10 flex-1 flex flex-col justify-center mt-2">
          <h4 className="text-xs sm:text-sm font-black leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200 text-pretty">
            {ranking.title || 'Ranking sin título'}
          </h4>
        </div>

        {/* Bottom Section: Creator Profile info */}
        <div className="flex items-center gap-2 border-t border-border/20 pt-2.5 z-10 shrink-0">
          <Avatar className="h-6 w-6 border border-border/30 shrink-0">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={username} />
            ) : null}
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
              {username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors truncate">
              {username}
            </span>
            <span className="text-xs text-muted-foreground font-mono-tabular">
              {formatDate(ranking.created_at, { day: 'numeric', month: 'short' }, language)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
})
export default CommunityRankingCard;
