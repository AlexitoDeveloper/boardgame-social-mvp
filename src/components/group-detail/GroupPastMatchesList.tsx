import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Plus } from 'lucide-react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { toast } from '../ui/toast'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../lib/dateLocale'
import { GroupMeetup } from '../../hooks/useGroupHub'
import { supabase } from '../../lib/supabaseClient'
import { USE_MOCKS } from '../../lib/config'
import { DeleteTableConfirmDialog } from '../meetup-detail/DeleteTableConfirmDialog'
import { GroupPastMatchCard } from './GroupPastMatchCard'

interface GroupPastMatchesListProps {
  groupId: string
  matches: GroupMeetup[]
  loading: boolean
  onOpenQuickLogModal: () => void
  onRefresh?: () => void
}

export const GroupPastMatchesList: React.FC<GroupPastMatchesListProps> = ({
  groupId: _groupId,
  matches,
  loading,
  onOpenQuickLogModal,
  onRefresh,
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const language = i18n.language as any

  const [deletingMatch, setDeletingMatch] = useState<GroupMeetup | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deletingMatch) return
    setIsDeleting(true)
    try {
      const isMock = USE_MOCKS && deletingMatch.id.startsWith('mock-')
      if (isMock) {
        const stored = localStorage.getItem('boardgame_social_mock_meetups')
        if (stored) {
          const list = JSON.parse(stored).filter((m: any) => m.id !== deletingMatch.id)
          localStorage.setItem('boardgame_social_mock_meetups', JSON.stringify(list))
        }
      } else {
        const { error } = await supabase.from('meetups').delete().eq('id', deletingMatch.id)
        if (error) throw error
      }
      toast.success(t('meetup.deleteSuccess', 'Mesa eliminada correctamente.'))
      setDeletingMatch(null)
      onRefresh?.()
    } catch (err: any) {
      toast.error(err?.message || 'Error al eliminar la partida.')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatMatchDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return formatDate(
        d,
        {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        },
        language
      )
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="p-4 rounded-2xl bg-card/60 border border-border/30 space-y-3"
          >
            <div className="flex gap-3">
              <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-border/50 bg-card/30 rounded-2xl max-w-md mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-primary">
          <Trophy className="w-6 h-6" />
        </div>
        <h4 className="font-extrabold text-foreground text-sm">
          {t('groups.noMatchesRecorded', 'No hay partidas registradas aún')}
        </h4>
        <p className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">
          {t(
            'groups.noMatchesRecordedDesc',
            'Registra vuestra primera partida rápida para guardar el resultado, las puntuaciones y alimentar el Salón de la Fama.'
          )}
        </p>
        <Button
          size="sm"
          onClick={onOpenQuickLogModal}
          className="rounded-xl font-bold text-xs gap-1.5 mt-2 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('quickLog.saveBtn', 'Registrar Primera Partida')}</span>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-black font-display tracking-tight text-foreground">
            {t('groups.pastMatchesSubTab', 'Partidas Jugadas')}
          </h3>
          <Badge variant="secondary" className="text-xs px-2 py-0.5 font-bold">
            {matches.length}
          </Badge>
        </div>

        <Button
          size="sm"
          onClick={onOpenQuickLogModal}
          className="rounded-xl font-bold text-xs h-9 px-3.5 gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('quickLog.saveBtn', 'Registrar Partida')}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
        <GroupPastMatchCard
          key={match.id}
          match={match}
          formattedDate={formatMatchDate(match.date)}
          canDelete={Boolean(onRefresh)}
          onClick={() => navigate(`/mesa/${match.id}`)}
          onDelete={() => setDeletingMatch(match)}
        />
        ))}
      </div>

      {deletingMatch && (
        <DeleteTableConfirmDialog
          isOpen={Boolean(deletingMatch)}
          onClose={() => setDeletingMatch(null)}
          onConfirmDelete={handleConfirmDelete}
          isDeleting={isDeleting}
          tableTitle={deletingMatch.gameTitle || deletingMatch.title}
        />
      )}
    </div>
  )
}
