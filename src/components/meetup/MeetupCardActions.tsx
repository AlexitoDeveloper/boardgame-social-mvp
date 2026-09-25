import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { User } from '@supabase/supabase-js'
import { Meetup } from '../../types'
import { useTranslation } from 'react-i18next'

export interface MeetupCardActionsProps {
  meetup: Meetup
  user: User | null
  isLoading: boolean
  isJoined: boolean
  isCreator: boolean
  isFull: boolean
  onJoinLeave: (meetup: Meetup) => void
  onNavigate: (path: string) => void
}

export function MeetupCardActions({
  meetup,
  user,
  isLoading,
  isJoined,
  isCreator,
  isFull,
  onJoinLeave,
  onNavigate,
}: MeetupCardActionsProps) {
  const { t } = useTranslation()

  const renderJoinButton = () => {
    if (meetup.completed) {
      return (
        <Button
          disabled
          variant="secondary"
          size="sm"
          className="flex-1 rounded-xl font-bold h-9"
        >
          {t('common.completed')}
        </Button>
      )
    }

    if (!user) {
      return (
        <Button
          onClick={() => onNavigate('/auth')}
          variant="default"
          size="sm"
          className="flex-1 h-9 rounded-xl font-bold"
        >
          {t('common.join')}
        </Button>
      )
    }

    if (isCreator) {
      return (
        <Button
          disabled
          variant="secondary"
          size="sm"
          className="flex-1 h-9 rounded-xl font-bold"
        >
          {t('common.hostAbbr')}
        </Button>
      )
    }

    if (isLoading) {
      return (
        <Button
          disabled
          variant="secondary"
          size="sm"
          className="flex-1 h-9 rounded-xl font-bold"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </Button>
      )
    }

    if (isJoined) {
      return (
        <Button
          onClick={() => onJoinLeave(meetup)}
          variant="outline"
          size="sm"
          className="flex-1 h-9 rounded-xl font-bold"
        >
          {t('common.leave')}
        </Button>
      )
    }

    if (isFull) {
      return (
        <Button
          disabled
          variant="outline"
          size="sm"
          className="flex-1 h-9 rounded-xl font-bold"
        >
          {t('common.full')}
        </Button>
      )
    }

    return (
      <Button
        onClick={() => onJoinLeave(meetup)}
        variant="default"
        size="sm"
        className="flex-1 h-9 rounded-xl font-bold"
      >
        {t('common.join')}
      </Button>
    )
  }

  return (
    <div className="flex gap-2 pt-1">
      <Button
        onClick={() => onNavigate(`/mesa/${meetup.id}`)}
        variant="outline"
        size="sm"
        className="flex-1 h-9 rounded-xl font-bold transition-all duration-200"
      >
        {t('common.details')}
      </Button>
      {renderJoinButton()}
    </div>
  )
}
