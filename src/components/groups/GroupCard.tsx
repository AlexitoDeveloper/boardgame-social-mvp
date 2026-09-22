import { useState, useCallback, FC } from 'react'
import { Link } from 'react-router-dom'
import { Users, MessageCircle, Clipboard, Check, ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { toast } from '../ui/toast'
import { Group } from '../../hooks/useGroups'

interface GroupCardProps {
  group: Group
}

export const GroupCard: FC<GroupCardProps> = ({ group }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const handleShareWhatsApp = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const inviteUrl = `${window.location.origin}/grupos?join=${group.invite_code}`
      const text = t('groups.inviteWhatsAppText', {
        groupName: group.name,
        inviteUrl,
      })
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    },
    [group.invite_code, group.name, t]
  )

  const handleCopyCode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const inviteUrl = `${window.location.origin}/grupos?join=${group.invite_code}`
      navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast.success(t('toast.inviteCopied', '¡Enlace de invitación copiado al portapapeles!'))
      setTimeout(() => setCopied(false), 2000)
    },
    [group.invite_code, t]
  )

  // Derive group initials for avatar
  const initials = group.name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'G'

  const memberText =
    group.member_count === 1 ? t('groups.memberCard') : t('groups.membersCard')

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 400, damping: 30 },
        },
      }}
      className="h-full"
    >
      <Card
        variant="interactive"
        className="group relative flex flex-col justify-between h-full p-5 overflow-hidden text-left bg-card border-border/40 hover:border-primary/40 shadow-xs hover:shadow-md transition-[transform,box-shadow,border-color] duration-150 rounded-2xl"
      >
        {/* Top Header: Monogram Avatar & Member Count Badge */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 text-primary font-black font-display text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-150"
          >
            {initials}
          </div>

          <Badge variant="secondary" className="font-mono-tabular text-xs font-semibold py-1 gap-1 border-border/30">
            <Users className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            <span>
              {group.member_count || 1} {memberText}
            </span>
          </Badge>
        </div>

        {/* Middle Section: Title & Description */}
        <div className="space-y-1.5 flex-1">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors duration-150 line-clamp-1 font-display">
            <Link
              to={`/grupos/${group.id}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg after:absolute after:inset-0 after:z-0"
            >
              {group.name}
            </Link>
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
            {group.description || t('groups.noDescription')}
          </p>
        </div>

        {/* Footer Utility Row */}
        <div className="flex items-center justify-between pt-3 mt-4 border-t border-border/30">
          {/* Invite Code Quick Copy */}
          <div className="relative z-10">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleCopyCode}
              className="h-7 text-xs font-bold uppercase text-muted-foreground bg-muted/40 border border-border/30 hover:bg-muted/70 hover:text-foreground px-2 py-0.5 rounded-lg transition-colors cursor-pointer font-mono-tabular"
              title={t('groups.copyInviteLink')}
              aria-label={copied ? t('groups.copied') : t('groups.copyInviteLink')}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-primary animate-in zoom-in-75 duration-150" aria-hidden="true" />
                  <span>{t('groups.copied')}</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-3 w-3" aria-hidden="true" />
                  <span>{group.invite_code}</span>
                </>
              )}
            </Button>
          </div>

          {/* Quick Actions Cluster: WhatsApp + Navigate indicator */}
          <div className="relative z-10 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleShareWhatsApp}
              className="h-7 text-xs font-semibold text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 px-2 rounded-lg transition-colors cursor-pointer"
              title={t('groups.inviteWhatsApp')}
              aria-label={t('groups.inviteWhatsApp')}
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              <span className="hidden sm:inline text-xs">{t('groups.inviteWhatsApp')}</span>
            </Button>

            <div
              aria-hidden="true"
              className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150 p-1"
            >
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
