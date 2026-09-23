import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Flag, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUgcSafety, SubmitReportParams } from '../../hooks/useUgcSafety'

interface ReportContentDialogProps {
  isOpen: boolean
  onClose: () => void
  contentType: SubmitReportParams['contentType']
  contentId?: string | null
  reportedUserId?: string | null
  title?: string
}

const REPORT_REASONS = [
  { id: 'harassment', label: 'Acoso o amenazas' },
  { id: 'hate', label: 'Incitación al odio o discriminación' },
  { id: 'inappropriate', label: 'Contenido sexual o inapropiado' },
  { id: 'spam', label: 'Spam o publicidad no deseada' },
  { id: 'other', label: 'Otro motivo' },
]

export function ReportContentDialog({
  isOpen,
  onClose,
  contentType,
  contentId,
  reportedUserId,
  title,
}: ReportContentDialogProps) {
  const { t } = useTranslation()
  const { submitReport, submitting } = useUgcSafety()
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id)
  const [details, setDetails] = useState('')

  const handleSubmit = async () => {
    const success = await submitReport({
      contentType,
      contentId,
      reportedUserId,
      reason: selectedReason,
      details,
    })

    if (success) {
      setDetails('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
            <Flag className="h-5 w-5" />
          </div>
          <DialogTitle>
            {title || t('reports.dialogTitle', 'Reportar contenido o usuario')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'reports.dialogDesc',
              'Tu reporte es confidencial. Ayúdanos a mantener la comunidad segura y libre de conductas abusivas.'
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              {t('reports.reasonLabel', '¿Cuál es el motivo del reporte?')}
            </Label>
            <div className="grid grid-cols-1 gap-1.5">
              {REPORT_REASONS.map((reason) => (
                <Button
                  key={reason.id}
                  type="button"
                  variant={selectedReason === reason.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedReason(reason.id)}
                  className="w-full justify-start text-xs h-9"
                >
                  <span>{reason.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="report-details" className="text-xs font-semibold">
              {t('reports.detailsLabel', 'Detalles adicionales (opcional)')}
            </Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('reports.detailsPlaceholder', 'Describe brevemente qué ha ocurrido...')}
              rows={3}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={onClose}
            disabled={submitting}
          >
            {t('common.cancel', 'Cancelar')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="default"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('reports.sending', 'Enviando...')}
              </span>
            ) : (
              t('reports.submitButton', 'Enviar Reporte')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
