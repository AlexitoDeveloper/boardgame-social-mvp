import { FC } from 'react'
import { Plus, Loader2 } from 'lucide-react'
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
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  onGroupNameChange: (value: string) => void
  groupDesc: string
  onGroupDescChange: (value: string) => void
  loading: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
}

export const CreateGroupModal: FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  groupName,
  onGroupNameChange,
  groupDesc,
  onGroupDescChange,
  loading,
  error,
  onSubmit,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[24px] p-6 shadow-2xl text-left gap-4">
        <DialogHeader className="border-b border-border/25 pb-2">
          <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" aria-hidden="true" />
            <span>{t('groups.createModalTitle')}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            {t('groups.createModalDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <Label
                htmlFor="create-group-name"
                className="text-xs font-black uppercase text-muted-foreground tracking-wider"
              >
                {t('groups.groupNameLabel')}
              </Label>
              <span className="text-[11px] font-mono text-muted-foreground">
                {groupName.length}/45
              </span>
            </div>
            <Input
              id="create-group-name"
              type="text"
              placeholder={t('groups.groupNamePlaceholder')}
              value={groupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              maxLength={45}
              required
              disabled={loading}
              aria-invalid={!!error}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <Label
                htmlFor="create-group-desc"
                className="text-xs font-black uppercase text-muted-foreground tracking-wider"
              >
                {t('groups.groupDescLabel')}
              </Label>
              <span className="text-[11px] font-mono text-muted-foreground">
                {groupDesc.length}/150
              </span>
            </div>
            <Textarea
              id="create-group-desc"
              placeholder={t('groups.groupDescPlaceholder')}
              value={groupDesc}
              onChange={(e) => onGroupDescChange(e.target.value)}
              maxLength={150}
              className="resize-none h-20 text-xs"
              disabled={loading}
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-semibold text-destructive px-1">
              {error}
            </p>
          )}

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
              disabled={loading || !groupName.trim()}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <span>{t('groups.createButton')}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
