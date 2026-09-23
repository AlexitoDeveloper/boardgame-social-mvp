import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { toast } from '../components/ui/toast'
import { useTranslation } from 'react-i18next'

export interface SubmitReportParams {
  reportedUserId?: string | null
  contentType: 'chat_message' | 'meetup' | 'group' | 'profile'
  contentId?: string | null
  reason: string
  details?: string
}

export function useUgcSafety() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)

  const submitReport = async (params: SubmitReportParams): Promise<boolean> => {
    if (!user) {
      toast.error(t('auth.loginRequired', 'Debes iniciar sesión para reportar.'))
      return false
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('content_reports').insert({
        reporter_id: user.id,
        reported_user_id: params.reportedUserId || null,
        content_type: params.contentType,
        content_id: params.contentId || null,
        reason: params.reason,
        details: params.details?.trim() || null,
      })

      if (error) {
        console.error('Error submitting report:', error)
        toast.error(t('reports.error', 'No se pudo enviar el reporte. Inténtalo de nuevo.'))
        return false
      }

      toast.success(
        t('reports.success', 'Gracias por avisarnos. Nuestro equipo revisará el contenido.')
      )
      return true
    } catch (err) {
      console.error('Unexpected error reporting content:', err)
      toast.error(t('reports.error', 'Error inesperado al enviar el reporte.'))
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const blockUser = async (targetUserId: string): Promise<boolean> => {
    if (!user) return false
    if (user.id === targetUserId) return false

    try {
      const { error } = await supabase.from('user_blocks').insert({
        blocker_id: user.id,
        blocked_user_id: targetUserId,
      })

      if (error) {
        // Ignore duplicate block key
        if (!error.message.includes('unique')) {
          console.error('Error blocking user:', error)
          toast.error(t('reports.blockError', 'No se pudo bloquear al usuario.'))
          return false
        }
      }

      toast.info(t('reports.blockSuccess', 'Has bloqueado a este usuario.'))
      return true
    } catch (err) {
      console.error('Unexpected error blocking user:', err)
      return false
    }
  }

  return {
    submitReport,
    blockUser,
    submitting,
  }
}
