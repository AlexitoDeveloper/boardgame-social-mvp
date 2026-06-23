import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Clipboard, Check, Trash2, LogOut, Layers, Calendar, Search, CheckSquare, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Form } from '../components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog'
import { Tabs } from '../components/ui/tabs'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useAuth } from '../lib/authContext'
import { CalendarDatePicker } from '../components/CalendarDatePicker'
import { GroupLudotecaTab } from '../components/group-detail/GroupLudotecaTab'
import { GroupPollsTab } from '../components/group-detail/GroupPollsTab'
import { GroupMembersTab } from '../components/group-detail/GroupMembersTab'
import { AppLanguage } from '../lib/gameLocale'
import { formatDate } from '../lib/dateLocale'
import { useTranslation } from 'react-i18next'
import { useGameLocale } from '../hooks/useGameLocale'

function formatMeetupDate(dateStr: string, lang: AppLanguage = 'es') {
  try {
    if (dateStr.length === 10 && dateStr.includes('-') && !dateStr.includes('T')) {
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, lang)
    }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return formatDate(date, { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }, lang)
  } catch {
    return dateStr
  }
}

export function GroupDetailPage() {
  const { id: groupId } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const { getGameTitle } = useGameLocale()
  const { user } = useAuth()
  const language = i18n.language as any
  const navigate = useNavigate()

  const {
    group,
    members,
    mergedCollection,
    polls,
    loading,
    error,
    createPoll,
    voteGame,
    closePoll,
    leaveGroup,
    kickMember,
    deleteGroup
  } = useGroupDetail(groupId)

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'ludoteca' | 'polls' | 'members'>('ludoteca')

  // Search inside merged collection
  const [collectionSearch, setCollectionSearch] = useState('')

  // Invite code copy feedback
  const [copied, setCopied] = useState(false)

  // Create Poll Modal State
  const [isPollOpen, setIsPollOpen] = useState(false)
  const [pollTitle, setPollTitle] = useState('')
  const [pollDesc, setPollDesc] = useState('')
  const [pollDate, setPollDate] = useState('')
  const [selectedGameIds, setSelectedGameIds] = useState<number[]>([])
  const [pollLoading, setPollLoading] = useState(false)
  const [pollError, setPollError] = useState<string | null>(null)
  const [pollGameSearch, setPollGameSearch] = useState('')
  const [hasPollDate, setHasPollDate] = useState(false)

  // Local Action Error Banner State
  const [actionError, setActionError] = useState<string | null>(null)

  // Confirmation Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const triggerConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    confirmText = t('groups.confirmText'),
    isDestructive = false
  ) => {
    setConfirmConfig({
      isOpen: true,
      title,
      description,
      onConfirm,
      confirmText,
      isDestructive
    })
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-bold">{t('groups.loadingGroupDetails')}</p>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold">
          {error || t('groups.groupNotFound')}
        </div>
        <Button onClick={() => navigate('/grupos')} className="rounded-xl flex items-center gap-1.5 mx-auto">
          <ArrowLeft className="h-4 w-4" /> {t('groups.backToGroups')}
        </Button>
      </div>
    )
  }

  const isCreator = group.creator_id === user?.id
  const isAdmin = members.find(m => m.user_id === user?.id)?.role === 'admin' || isCreator

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeave = () => {
    triggerConfirm(
      t('groups.leaveGroupConfirmTitle'),
      t('groups.leaveGroupConfirmDesc'),
      async () => {
        setActionError(null)
        try {
          await leaveGroup()
          navigate('/grupos')
        } catch (err: any) {
          setActionError(err.message || t('groups.leaveGroup'))
        }
      },
      t('groups.leaveGroup'),
      true
    )
  }

  const handleDelete = () => {
    triggerConfirm(
      t('groups.deleteGroupConfirmTitle'),
      t('groups.deleteGroupConfirmDesc'),
      async () => {
        setActionError(null)
        try {
          await deleteGroup()
          navigate('/grupos')
        } catch (err: any) {
          setActionError(err.message || t('groups.deleteGroup'))
        }
      },
      t('groups.deleteGroup'),
      true
    )
  }

  const handleKick = (targetUserId: string, username: string) => {
    triggerConfirm(
      t('groups.kickMemberConfirmTitle'),
      t('groups.kickMemberConfirmDesc', { username }),
      async () => {
        setActionError(null)
        try {
          await kickMember(targetUserId)
        } catch (err: any) {
          setActionError(err.message || t('groups.kick'))
        }
      },
      t('groups.kick'),
      true
    )
  }

  const handleCreatePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pollTitle.trim()) return
    if (selectedGameIds.length === 0) {
      setPollError(t('groups.pollErrorNoGames'))
      return
    }

    setPollLoading(true)
    setPollError(null)
    try {
      await createPoll(pollTitle, pollDesc, hasPollDate && pollDate ? pollDate : null, selectedGameIds)
      setIsPollOpen(false)
      setPollTitle('')
      setPollDesc('')
      setPollDate('')
      setSelectedGameIds([])
    } catch (err: any) {
      setPollError(err.message || t('groups.pollErrorCreate'))
    } finally {
      setPollLoading(false)
    }
  }

  const handleToggleGameNomination = (gameId: number) => {
    setSelectedGameIds(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    )
  }

  // Filter merged games
  const filteredMerged = mergedCollection.filter(item =>
    item.game.title.toLowerCase().includes(collectionSearch.toLowerCase()) ||
    (item.game.title_es && item.game.title_es.toLowerCase().includes(collectionSearch.toLowerCase()))
  )

  return (
    <section className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Back navigation and admin controls (sticky on mobile with safe-area spacing) */}
      <div className="sticky top-[-2px] z-30 flex items-center justify-between pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 -mx-4 px-4 md:-mx-8 md:px-8 bg-background/90 backdrop-blur-md border-b border-border/20 transition-all duration-200">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/grupos')} 
          className="rounded-xl flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 border border-border/20 hover:bg-muted/50 cursor-pointer text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">{t('groups.backToGroups')}</span><span className="xs:hidden">{t('common.back')}</span>
        </Button>

        <div className="flex gap-2">
          {isCreator ? (
            <Button
              onClick={handleDelete}
              variant="ghost"
              className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs h-9 flex items-center gap-1 cursor-pointer border border-transparent hover:border-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden xs:inline">{t('groups.deleteGroup')}</span><span className="xs:hidden">{t('common.remove')}</span>
            </Button>
          ) : (
            <Button
              onClick={handleLeave}
              variant="ghost"
              className="rounded-xl text-destructive hover:bg-destructive/10 font-bold text-xs h-9 flex items-center gap-1 cursor-pointer border border-transparent hover:border-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">{t('groups.leaveGroup')}</span><span className="xs:hidden">{t('common.leave')}</span>
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold flex justify-between items-center animate-in fade-in duration-200">
          <span>{actionError}</span>
          <Button onClick={() => setActionError(null)} variant="ghost" className="text-xs hover:underline font-bold bg-transparent border-none text-destructive cursor-pointer">{t('groups.close')}</Button>
        </div>
      )}

      {/* Group Detail Card / Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 p-6 rounded-2xl bg-card/65 border border-border/30 shadow-md relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-7 w-7 text-primary shrink-0" />
              <span>{group.name}</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {group.description || t('groups.defaultGroupDesc')}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold pt-2">
            <Users className="h-4 w-4 text-primary shrink-0" />
            <span>{members.length} {members.length === 1 ? t('groups.memberActive') : t('groups.membersActive')}</span>
          </div>
        </div>

        {/* Invite Code card */}
        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-primary tracking-widest">{t('groups.inviteCode')}</h4>
            <p className="text-[10px] text-muted-foreground font-semibold leading-normal">
              {t('groups.inviteCodeDesc')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-center text-lg font-black bg-card border border-border/30 rounded-xl py-2 px-3 tracking-wider text-foreground">
              {group.invite_code}
            </div>

            <Button
              onClick={handleCopyCode}
              variant={copied ? 'default' : 'outline'}
              className="rounded-xl h-11 px-3.5 shrink-0"
              title={t('groups.copyCode')}
            >
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <Tabs
        options={[
          { id: 'ludoteca', label: t('groups.sharedLudoteca'), icon: Layers, count: mergedCollection.length },
          { id: 'polls', label: t('groups.meetupsAndVotes'), icon: Calendar, count: polls.length },
          { id: 'members', label: t('groups.members'), icon: Users, count: members.length }
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        hideLabelsOnMobile
      />

      {/* Tabs Content */}
      <div className="min-h-[300px]">
        {activeTab === 'ludoteca' && (
          <GroupLudotecaTab
            filteredMerged={filteredMerged}
            user={user}
            collectionSearch={collectionSearch}
            setCollectionSearch={setCollectionSearch}
          />
        )}

        {activeTab === 'polls' && (
          <GroupPollsTab
            polls={polls}
            isAdmin={isAdmin}
            user={user}
            formatMeetupDate={(d) => formatMeetupDate(d, language)}
            triggerConfirm={triggerConfirm}
            closePoll={closePoll}
            voteGame={voteGame}
            setActionError={setActionError}
            openNewPollModal={() => {
              setIsPollOpen(true)
              setPollError(null)
              setPollTitle('')
              setPollDesc('')
              setPollDate('')
              setSelectedGameIds([])
              setPollGameSearch('')
              setHasPollDate(false)
            }}
            onCreateMeetupRedirect={(pollTitle, gameId, gameTitle) => {
              navigate(`/tablero/new?game_id=${gameId}&title=${encodeURIComponent(`${t('groups.pollsTitle')}: ${pollTitle}`)}&description=${encodeURIComponent(t('groups.groupMeetupRedirectDesc', { gameTitle }))}`)
            }}
          />
        )}

        {activeTab === 'members' && (
          <GroupMembersTab
            members={members}
            user={user}
            group={group}
            isAdmin={isAdmin}
            handleKick={handleKick}
          />
        )}
      </div>

      {/* ── MODAL: NUEVA ENCUESTA ────────────────────────────── */}
      <Dialog open={isPollOpen} onOpenChange={setIsPollOpen}>
        <DialogContent className="max-w-md bg-card border-border/50 rounded-[24px] p-6 shadow-2xl text-left gap-4">
          <DialogHeader className="border-b border-border/25 pb-2">
            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> {t('groups.openPollTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              {t('groups.openPollDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form onSubmit={handleCreatePollSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">{t('groups.pollTitleLabel')}</label>
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
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">{t('groups.pollDescLabel')}</label>
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
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider">{t('groups.proposeMeetupDate')}</label>
              <Input
                type="checkbox"
                checked={hasPollDate}
                onChange={(e) => setHasPollDate(e.target.checked)}
                className="accent-primary h-4 w-4 rounded border-border cursor-pointer flex-none bg-transparent p-0 border-none shadow-none focus-visible:ring-0 focus-visible:border-transparent"
                disabled={pollLoading}
              />
            </div>

            {hasPollDate && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">{t('groups.pollDateLabel')}</label>
                <CalendarDatePicker value={pollDate} onChange={setPollDate} />
              </div>
            )}

            {/* Selection list of games */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider px-1">
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
                ) : (
                  (() => {
                    const filteredCollectionForPoll = mergedCollection.filter(item =>
                      item.game.title.toLowerCase().includes(pollGameSearch.toLowerCase()) ||
                      (item.game.title_es && item.game.title_es.toLowerCase().includes(pollGameSearch.toLowerCase()))
                    )
                    if (filteredCollectionForPoll.length === 0) {
                      return <p className="text-center text-xs text-muted-foreground py-4">{t('groups.noGamesMatched')}</p>
                    }
                    return filteredCollectionForPoll.map((item) => {
                      const isSelected = selectedGameIds.includes(item.game.bgg_id)
                      return (
                        <div
                          key={item.game.bgg_id}
                          onClick={() => handleToggleGameNomination(item.game.bgg_id)}
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
                  })()
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
                onClick={() => setIsPollOpen(false)}
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
                {pollLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>{t('groups.launchPoll')}</span>
                )}
              </Button>
            </div>
            </Form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CONFIRMACIÓN GENERAL ────────────────────────── */}
      <Dialog open={confirmConfig.isOpen} onOpenChange={(open) => setConfirmConfig(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-sm bg-card border-border/50 rounded-[24px] p-6 shadow-2xl text-left gap-4">
          <DialogHeader className="border-b border-border/25 pb-2">
            <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              {confirmConfig.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-semibold">
              {confirmConfig.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
              className="rounded-xl font-bold text-xs"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => {
                confirmConfig.onConfirm()
                setConfirmConfig(prev => ({ ...prev, isOpen: false }))
              }}
              variant={confirmConfig.isDestructive ? 'destructive' : 'default'}
              className="rounded-xl font-bold text-xs px-4"
            >
              {confirmConfig.confirmText}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
export default GroupDetailPage;
