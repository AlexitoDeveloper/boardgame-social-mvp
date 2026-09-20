import React, { useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
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

interface AddGroupGuestModalProps {
  isOpen: boolean
  onClose: () => void
  onAddGuest: (name: string) => Promise<boolean | void>
  existingGuestNames: string[]
}

export const AddGroupGuestModal: React.FC<AddGroupGuestModalProps> = ({
  isOpen,
  onClose,
  onAddGuest,
  existingGuestNames,
}) => {
  const { t } = useTranslation()
  const [guestName, setGuestName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault()
    const trimmed = guestName.trim()

    if (!trimmed) {
      setError(t('groups.guestNameRequired', 'Introduce un nombre para el invitado.'))
      return
    }

    if (trimmed.length < 2) {
      setError(t('groups.guestNameTooShort', 'El nombre debe tener al menos 2 caracteres.'))
      return
    }

    if (trimmed.length > 30) {
      setError(t('groups.guestNameTooLong', 'El nombre no puede superar 30 caracteres.'))
      return
    }

    const duplicate = existingGuestNames.some(
      (n) => n.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      setError(t('groups.guestNameDuplicate', 'Ya existe un invitado habitual con este nombre.'))
      return
    }

    setError(null)
    setLoading(true)

    try {
      await onAddGuest(trimmed)
      setGuestName('')
      onClose()
    } catch (err: any) {
      setError(err?.message || t('groups.guestAddError', 'No se pudo guardar el invitado habitual.'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setGuestName('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-border/40 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
            <UserPlus className="w-5 h-5" aria-hidden="true" />
          </div>
          <DialogTitle className="text-lg font-black font-display tracking-tight text-foreground">
            {t('groups.addHabitualGuest', 'Añadir Invitado Habitual')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {t(
              'groups.addHabitualGuestDesc',
              'Registra a amigos o familiares que juegan frecuentemente con el grupo. Aparecerán automáticamente al registrar partidas y podrán vincularse a su cuenta cuando se unan.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div
          className="space-y-4 pt-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="habitualGuestName" className="text-xs font-bold text-foreground">
              {t('groups.guestNameLabel', 'Nombre o apodo del invitado')}
            </Label>
            <Input
              id="habitualGuestName"
              placeholder={t('groups.guestNamePlaceholder', 'Ej. Carlos, Laura M., Papá')}
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value)
                if (error) setError(null)
              }}
              disabled={loading}
              className="h-11 rounded-xl text-sm"
            />
            {error && (
              <p className="text-xs text-destructive font-semibold mt-1">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl font-bold text-xs h-10"
            >
              {t('common.cancel', 'Cancelar')}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit()}
              disabled={loading || !guestName.trim()}
              className="rounded-xl font-bold text-xs h-10 gap-1.5 shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>{t('groups.saveGuestBtn', 'Guardar Invitado')}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
