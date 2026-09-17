import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, MessageCircle, QrCode, Clipboard, Check, Trash2, LogOut, Zap, Lock, Shield, Crown, Layers } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Skeleton } from '../ui/skeleton'
import { useTranslation } from 'react-i18next'
import { GroupMember } from '../../hooks/useGroupDetail'

interface GroupHeroHeaderProps {
  group: any;
  members: GroupMember[];
  gamesCount?: number;
  loading?: boolean;
  isCreator: boolean;
  isAdmin: boolean;
  copiedLink: boolean;
  onCopyLink: () => void;
  onShareWhatsApp: () => void;
  onOpenQrModal: () => void;
  onOpenQuickLogModal: () => void;
  onDeleteGroup: () => void;
  onLeaveGroup: () => void;
}

export const GroupHeroHeader: React.FC<GroupHeroHeaderProps> = ({
  group,
  members,
  gamesCount = 0,
  loading = false,
  isCreator,
  isAdmin,
  copiedLink,
  onCopyLink,
  onShareWhatsApp,
  onOpenQrModal,
  onOpenQuickLogModal,
  onDeleteGroup,
  onLeaveGroup,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-card/65 border border-border/30 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-72 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!group) return null

  const previewMembers = members.slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Top sticky app bar */}
      <div className="sticky top-[-2px] z-30 flex items-center justify-between pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 -mx-4 px-4 md:-mx-8 md:px-8 bg-background/90 backdrop-blur-md border-b border-border/20 transition-all duration-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/grupos')}
          aria-label={t('common.back')}
          title={t('common.back')}
          className="rounded-xl flex items-center gap-1.5 text-foreground hover:text-foreground h-10 border border-border/30 hover:bg-muted/50 cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" /> <span>{t('common.back')}</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenQuickLogModal}
            icon={Zap}
            className="rounded-xl font-bold text-xs h-10 px-3.5 shadow-xs"
          >
            <span>{t('quickLog.saveBtn', 'Registrar')}</span>
          </Button>

          {isCreator ? (
            <Button
              onClick={onDeleteGroup}
              variant="ghost"
              aria-label={t('groups.deleteGroup')}
              title={t('groups.deleteGroup')}
              className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs h-10 px-3 flex items-center gap-1 cursor-pointer border border-transparent hover:border-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden xs:inline">{t('groups.deleteGroup')}</span>
            </Button>
          ) : (
            <Button
              onClick={onLeaveGroup}
              variant="ghost"
              aria-label={t('groups.leaveGroup')}
              title={t('groups.leaveGroup')}
              className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs h-10 px-3 flex items-center gap-1 cursor-pointer border border-transparent hover:border-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">{t('groups.leaveGroup')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Hero Presentation Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/40 shadow-sm relative overflow-hidden flex flex-col justify-between gap-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 shadow-inner">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground truncate">
                  {group.name}
                </h1>

                <Badge variant="secondary" className="text-xs font-bold py-0.5 px-2 bg-muted text-foreground/90 border-border/40 gap-1 flex items-center">
                  <Lock className="w-3.5 h-3.5 text-foreground/70" />
                  <span>{t('groups.privateGroup', 'Grupo Privado')}</span>
                </Badge>

                {isCreator ? (
                  <Badge variant="warning" className="text-xs font-bold py-0.5 px-2 bg-amber-500/15 text-amber-300 border-amber-500/30 gap-1 flex items-center">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('common.creator', 'Creador')}</span>
                  </Badge>
                ) : isAdmin ? (
                  <Badge variant="outline" className="text-xs font-bold py-0.5 px-2 bg-primary/15 text-primary border-primary/40 gap-1 flex items-center">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span>{t('common.admin', 'Admin')}</span>
                  </Badge>
                ) : null}
              </div>

              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed line-clamp-2 font-normal">
                {group.description || t('groups.defaultGroupDesc')}
              </p>

              {/* Group Meta Indicators */}
              <div className="flex items-center gap-4 pt-1 flex-wrap text-xs text-foreground/90 font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 overflow-hidden items-center py-0.5">
                    {previewMembers.map((m) => (
                      <Avatar key={m.user_id} className="inline-block h-6 w-6 rounded-full ring-2 ring-card">
                        <AvatarImage src={m.avatar_url || undefined} />
                        <AvatarFallback className="text-[9px] font-black bg-primary/20 text-primary">
                          {m.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span>
                    {members.length} {members.length === 1 ? t('groups.memberActive') : t('groups.membersActive')}
                  </span>
                </div>

                {gamesCount > 0 && (
                  <div className="flex items-center gap-1.5 text-foreground/90">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>{gamesCount} {t('common.games', 'juegos')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invite & Share Actions */}
        <div className="pt-3 border-t border-border/25 space-y-2.5">
          {/* Row 1: Unified Invite Code Tap-to-Copy Pill */}
          <Button
            type="button"
            variant="outline"
            onClick={onCopyLink}
            aria-label={t('groups.inviteCode', 'Código de Invitación')}
            className="w-full h-11 rounded-xl bg-muted/50 hover:bg-muted/80 border-border/40 text-foreground px-4 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <span className="text-[11px] uppercase tracking-wider font-bold text-foreground/75">
              {t('groups.inviteCode', 'Código de Invitación')}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-black text-foreground tracking-widest">
                {copiedLink ? t('groups.copied', '¡Copiado!') : group.invite_code}
              </span>
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clipboard className="w-4 h-4 text-primary" />
              )}
            </div>
          </Button>

          {/* Row 2: WhatsApp & QR Code buttons (2 equal columns) */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onShareWhatsApp}
              className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>WhatsApp</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onOpenQrModal}
              className="h-11 rounded-xl border-border/50 bg-card hover:bg-muted/40 text-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-foreground" />
              <span>{t('groups.showQrCode', 'Código QR')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
