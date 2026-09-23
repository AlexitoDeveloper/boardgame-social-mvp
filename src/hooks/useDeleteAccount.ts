import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { toast } from '../components/ui/toast'
import { useTranslation } from 'react-i18next'

export function useDeleteAccount() {
  const [isDeleting, setIsDeleting] = useState(false)
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const deleteAccount = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.rpc('delete_user_account')
      if (error) {
        console.error('Error invoking delete_user_account RPC:', error)
        toast.error(t('settings.deleteError', 'Error al eliminar la cuenta. Inténtalo de nuevo.'))
        setIsDeleting(false)
        return false
      }

      toast.info(t('settings.deleteSuccess', 'Tu cuenta y datos han sido eliminados correctamente.'))
      await signOut()
      navigate('/auth', { replace: true })
      return true
    } catch (err) {
      console.error('Unexpected error deleting account:', err)
      toast.error(t('settings.deleteError', 'Error inesperado al eliminar la cuenta.'))
      setIsDeleting(false)
      return false
    }
  }

  return {
    deleteAccount,
    isDeleting,
  }
}
