import { FC } from 'react'
import { Code, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface JoinGroupModalProps {
  isOpen: boolean
  onClose: () => void
  inviteCode: string
  onInviteCodeChange: (value: string) => void
  loading: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
}

export const JoinGroupModal: FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  inviteCode,
  onInviteCodeChange,
  loading,
  error,
  onSubmit,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-[24px] p-6 shadow-2xl text-left gap-4">
        <DialogHeader className="border-b border-border/25 pb-2">
          <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" aria-hidden="true" />
            <span>{t('groups.joinModalTitle')}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            {t('groups.joinModalDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="join-invite-code"
              className="text-xs font-black uppercase text-muted-foreground tracking-wider px-1 block"
            >
              {t('groups.joinModalTitle')}
            </Label>
            <Input
              id="join-invite-code"
              type="text"
              placeholder="Ej. GP-XXXXXX"
              value={inviteCode}
              onChange={(e) => onInviteCodeChange(e.target.value)}
              className="font-mono text-center uppercase tracking-wider text-sm font-bold"
              required
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby={error ? 'join-error-message' : undefined}
              autoFocus
            />
            {error && (
              <p
                id="join-error-message"
                role="alert"
                className="text-xs font-semibold text-destructive px-1"
              >
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold text-xs"
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="rounded-xl font-bold text-xs px-4"
              disabled={loading || !inviteCode.trim()}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <span>{t('groups.joinButton')}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
