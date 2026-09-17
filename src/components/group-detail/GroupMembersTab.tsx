import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Shield, UserMinus } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { GroupMember } from '../../hooks/useGroupDetail'
import { User } from '@supabase/supabase-js'
import { formatDate } from '../../lib/dateLocale'
import { useTranslation } from 'react-i18next'

interface GroupMembersTabProps {
  members: GroupMember[];
  user: User | null;
  group: any;
  isAdmin: boolean;
  handleKick: (userId: string, username: string) => void;
}

export const GroupMembersTab: React.FC<GroupMembersTabProps> = ({
  members,
  user,
  group,
  isAdmin,
  handleKick,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const language = i18n.language as any

  const handleProfileClick = (memberUsername: string, memberUserId: string) => {
    if (memberUserId === user?.id) {
      navigate('/perfil')
    } else {
      navigate(`/perfil/${memberUsername}`)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
          <span>{t('groups.participants', 'Miembros del Grupo')}</span>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 font-bold">
            {members.length}
          </Badge>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((member) => {
          const isMe = member.user_id === user?.id
          const isMemberCreator = member.user_id === group?.creator_id
          const isMemberAdmin = member.role === 'admin'

          return (
            <Card
              key={member.user_id}
              className="p-3.5 rounded-2xl bg-card/75 border-border/30 shadow-xs flex items-center justify-between gap-3 hover:border-border/60 transition-colors"
            >
              <div
                onClick={() => handleProfileClick(member.username, member.user_id)}
                className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 group"
              >
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 border border-border/40 group-hover:scale-105 transition-transform">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                      {member.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online / Active status indicator */}
                  <span
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-card"
                    title={t('common.online', 'En línea')}
                  />
                </div>

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
                        <Crown className="w-2.5 h-2.5 fill-amber-500" /> {t('common.creator', 'Creador')}
                      </Badge>
                    ) : isMemberAdmin ? (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-tight flex items-center gap-0.5 text-primary border-primary/30 bg-primary/5">
                        <Shield className="w-2.5 h-2.5 text-primary" /> {t('common.admin', 'Admin')}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-muted-foreground font-semibold mt-0.5 truncate">
                    {t('groups.memberSince', 'Miembro desde')}{' '}
                    {formatDate(member.joined_at, { day: 'numeric', month: 'short', year: 'numeric' }, language)}
                  </p>
                </div>
              </div>

              {/* Admin Kick Action */}
              {isAdmin && !isMemberCreator && !isMe && (
                <Button
                  onClick={() => handleKick(member.user_id, member.username)}
                  variant="ghost"
                  size="sm"
                  aria-label={t('common.kick', 'Expulsar')}
                  title={t('common.kick', 'Expulsar')}
                  className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs h-8 px-2 shrink-0"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
