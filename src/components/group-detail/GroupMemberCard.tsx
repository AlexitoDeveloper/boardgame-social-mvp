import React from 'react'
import { Crown, Shield, UserMinus } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { GroupMember } from '../../hooks/useGroupDetail'
import { formatDate, AppLanguage } from '../../lib/dateLocale'
import { useTranslation } from 'react-i18next'

interface GroupMemberCardProps {
  member: GroupMember
  isMe: boolean
  isMemberCreator: boolean
  isMemberAdmin: boolean
  canKick: boolean
  onProfileClick: () => void
  onKick: () => void
  language?: AppLanguage
}

export const GroupMemberCard: React.FC<GroupMemberCardProps> = ({
  member,
  isMe,
  isMemberCreator,
  isMemberAdmin,
  canKick,
  onProfileClick,
  onKick,
  language,
}) => {
  const { t } = useTranslation()

  return (
    <Card
      onClick={onProfileClick}
      className="p-3.5 rounded-2xl bg-card/75 border-border/30 shadow-xs flex items-center justify-between gap-3 hover:border-border/60 hover:bg-card/90 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="h-10 w-10 border border-border/40 shrink-0 group-hover:scale-105 transition-transform">
          <AvatarImage src={member.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
            {member.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {member.username}
            </span>
            {isMe && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-tight">
                {t('common.you', 'Tú')}
              </Badge>
            )}
            {isMemberCreator ? (
              <Badge variant="warning" className="text-[10px] px-1.5 py-0 leading-tight flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5 fill-amber-500" aria-hidden="true" /> {t('common.creator', 'Creador')}
              </Badge>
            ) : isMemberAdmin ? (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-tight flex items-center gap-0.5 text-primary border-primary/30 bg-primary/5">
                <Shield className="w-2.5 h-2.5 text-primary" aria-hidden="true" /> {t('common.admin', 'Admin')}
              </Badge>
            ) : null}
          </div>

          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5 truncate">
            {t('groups.memberSince', 'Miembro desde')}{' '}
            {formatDate(member.joined_at, { day: 'numeric', month: 'short', year: 'numeric' }, language)}
          </p>
        </div>
      </div>

      {canKick && (
        <div className="shrink-0 flex items-center">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onKick()
            }}
            variant="ghost"
            aria-label={t('common.kick', 'Expulsar')}
            title={t('common.kick', 'Expulsar')}
            className="rounded-xl text-destructive hover:bg-destructive/10 font-bold h-11 w-11 min-h-[44px] min-w-[44px] p-0 flex items-center justify-center cursor-pointer transition-colors"
          >
            <UserMinus className="w-4 h-4 text-destructive" aria-hidden="true" />
          </Button>
        </div>
      )}
    </Card>
  )
}
