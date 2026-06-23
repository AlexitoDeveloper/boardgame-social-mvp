import { Crown } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { GroupMember } from '../../hooks/useGroupDetail'
import { User } from '@supabase/supabase-js'

interface GroupMembersTabProps {
  members: GroupMember[];
  user: User | null;
  group: any;
  isAdmin: boolean;
  handleKick: (userId: string, username: string) => void;
}

export function GroupMembersTab({
  members,
  user,
  group,
  isAdmin,
  handleKick
}: GroupMembersTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <h3 className="text-lg font-black tracking-tight text-foreground">Participantes del Grupo</h3>

      <div className="bg-card/65 border border-border/30 rounded-2xl shadow-sm overflow-hidden divide-y divide-border/20">
        {members.map((member) => {
          const isMe = member.user_id === user?.id
          const isMemberCreator = member.user_id === group.creator_id

          return (
            <div key={member.user_id} className="flex items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border/50">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {member.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-sm text-foreground leading-none">
                      {member.username}
                    </span>
                    {isMe && (
                      <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5 leading-none">
                        Tú
                      </Badge>
                    )}
                    {isMemberCreator && (
                      <Badge variant="warning" className="text-[8px] px-1.5 py-0.5 leading-none flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5 fill-amber-500" /> Creador
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                    Miembro desde el {new Date(member.joined_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Kick Action */}
              {isAdmin && !isMemberCreator && !isMe && (
                <Button
                  onClick={() => handleKick(member.user_id, member.username)}
                  variant="ghost"
                  className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-[10px] h-8 px-2.5"
                >
                  Expulsar
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
