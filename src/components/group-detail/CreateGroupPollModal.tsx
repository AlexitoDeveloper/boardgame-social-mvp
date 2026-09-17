import React, { useState } from 'react'
import { Calendar, Search, CheckSquare, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Form } from '../ui/form'
import { Switch } from '../ui/switch'
import { CalendarDatePicker } from '../CalendarDatePicker'
import { MergedGame } from '../../hooks/useGroupDetail'
import { useTranslation } from 'react-i18next'
import { useGameLocale } from '../../hooks/useGameLocale'

interface CreateGroupPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  mergedCollection: MergedGame[];
  onCreatePoll: (title: string, description: string, meetupDate: string | null, gameIds: number[]) => Promise<void>;
}

export const CreateGroupPollModal: React.FC<CreateGroupPollModalProps> = ({
  isOpen,
  onClose,
  mergedCollection,
  onCreatePoll,
}) => {
  const { t } = useTranslation()
  const { getGameTitle } = useGameLocale()

  const [pollTitle, setPollTitle] = useState('')
  const [pollDesc, setPollDesc] = useState('')
  const [pollDate, setPollDate] = useState('')
  const [hasPollDate, setHasPollDate] = useState(false)
  const [selectedGameIds, setSelectedGameIds] = useState<number[]>([])
  const [pollGameSearch, setPollGameSearch] = useState('')
  const [pollLoading, setPollLoading] = useState(false)
  const [pollError, setPollError] = useState<string | null>(null)

  const handleToggleGame = (gameId: number) => {
    setSelectedGameIds(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pollTitle.trim()) return
    if (selectedGameIds.length === 0) {
      setPollError(t('groups.pollErrorNoGames'))
      return
    }

    setPollLoading(true)
    setPollError(null)
    try {
      await onCreatePoll(
        pollTitle.trim(),
        pollDesc.trim(),
        hasPollDate && pollDate ? pollDate : null,
        selectedGameIds
      )
      onClose()
      setPollTitle('')
      setPollDesc('')
      setPollDate('')
      setSelectedGameIds([])
      setPollGameSearch('')
      setHasPollDate(false)
    } catch (err: any) {
      setPollError(err.message || t('groups.pollErrorCreate'))
    } finally {
      setPollLoading(false)
    }
  }

  const filteredCollection = mergedCollection.filter(item =>
    item.game.title.toLowerCase().includes(pollGameSearch.toLowerCase()) ||
    (item.game.title_es && item.game.title_es.toLowerCase().includes(pollGameSearch.toLowerCase()))
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border/50 rounded-[24px] p-6 shadow-2xl text-left gap-4">
        <DialogHeader className="border-b border-border/25 pb-2">
          <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> {t('groups.openPollTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            {t('groups.openPollDesc')}
          </DialogDescription>
        </DialogHeader>

        <Form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-wider px-1">
              {t('groups.pollTitleLabel')}
            </label>
            <Input
              type="text"
              placeholder={t('groups.pollTitlePlaceholder')}
              value={pollTitle}
              onChange={(e) => setPollTitle(e.target.value)}
              maxLength={45}
              required
              disabled={pollLoading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-wider px-1">
              {t('groups.pollDescLabel')}
            </label>
            <Textarea
              placeholder={t('groups.pollDescPlaceholder')}
              value={pollDesc}
              onChange={(e) => setPollDesc(e.target.value)}
              className="resize-none h-16 text-xs"
              maxLength={150}
              disabled={pollLoading}
            />
          </div>

          <div className="flex items-center justify-between px-1 py-1">
            <label htmlFor="poll-date-switch" className="text-xs font-black uppercase text-muted-foreground tracking-wider cursor-pointer">
              {t('groups.proposeMeetupDate')}
            </label>
            <Switch
              id="poll-date-switch"
              checked={hasPollDate}
              onCheckedChange={setHasPollDate}
              disabled={pollLoading}
              size="sm"
            />
          </div>

          {hasPollDate && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="text-xs font-black uppercase text-muted-foreground tracking-wider px-1">
                {t('groups.pollDateLabel')}
              </label>
              <CalendarDatePicker value={pollDate} onChange={setPollDate} />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-wider px-1">
              {t('groups.nominateGamesLabel', { count: selectedGameIds.length })}
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={t('groups.searchGameNominatePlaceholder')}
                value={pollGameSearch}
                onChange={(e) => setPollGameSearch(e.target.value)}
                className="pl-8 h-8 text-xs rounded-lg bg-background/80"
                disabled={pollLoading}
              />
            </div>
            <div className="border border-border/30 rounded-xl bg-background/50 max-h-40 overflow-y-auto p-2.5 space-y-1.5 divide-y divide-border/10">
              {mergedCollection.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">{t('groups.emptyMergedNominate')}</p>
              ) : filteredCollection.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">{t('groups.noGamesMatched')}</p>
              ) : (
                filteredCollection.map((item) => {
                  const isSelected = selectedGameIds.includes(item.game.bgg_id)
                  return (
                    <div
                      key={item.game.bgg_id}
                      onClick={() => handleToggleGame(item.game.bgg_id)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/30'
                      }`}
                    >
                      <CheckSquare className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/30'}`} />
                      <span className="text-xs font-bold text-foreground truncate flex-1 leading-none pt-0.5">
                        {getGameTitle(item.game)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {pollError && (
            <p className="text-xs font-semibold text-destructive px-1">{pollError}</p>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold text-xs"
              disabled={pollLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="rounded-xl font-bold text-xs px-4"
              disabled={pollLoading || !pollTitle.trim() || selectedGameIds.length === 0}
            >
              {pollLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span>{t('groups.launchPoll')}</span>}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
