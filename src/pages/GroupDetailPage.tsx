import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Layers, Calendar, Trophy, Dices, CheckSquare } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Tabs } from '../components/ui/tabs'
import { useGroupHub } from '../hooks/useGroupHub'
import { useAuth } from '../lib/authContext'
import { useTranslation } from 'react-i18next'
import { GroupHeroHeader } from '../components/group-detail/GroupHeroHeader'
import { GroupUpcomingMeetups } from '../components/group-detail/GroupUpcomingMeetups'
import { GroupLudotecaTab } from '../components/group-detail/GroupLudotecaTab'
import { GroupHallOfFameTab } from '../components/group-detail/GroupHallOfFameTab'
import { GroupPollsTab } from '../components/group-detail/GroupPollsTab'
import { GroupMembersTab } from '../components/group-detail/GroupMembersTab'
import { TableToolsBar } from '../components/table-hub/TableToolsBar'
import { GroupInviteQrModal } from '../components/groups/GroupInviteQrModal'
import { AddGameToLibraryModal } from '../components/library/AddGameToLibraryModal'
import { QuickLogMatchModal } from '../components/session/QuickLogMatchModal'
import { CreateGroupPollModal } from '../components/group-detail/CreateGroupPollModal'
import { GroupConfirmDialog } from '../components/group-detail/GroupConfirmDialog'

export function GroupDetailPage() {
  const { id: groupId } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'meetups' | 'ludoteca' | 'hall_of_fame' | 'polls' | 'table_tools' | 'members'>('meetups')
  const [collectionSearch, setCollectionSearch] = useState('')

  const hub = useGroupHub(groupId)

  if (hub.loading) {
    return (
      <section className="space-y-6 pb-20 max-w-6xl mx-auto">
        <GroupHeroHeader group={null} members={[]} loading isCreator={false} isAdmin={false} copiedLink={false} onCopyLink={() => {}} onShareWhatsApp={() => {}} onOpenQrModal={() => {}} onOpenQuickLogModal={() => {}} onDeleteGroup={() => {}} onLeaveGroup={() => {}} />
      </section>
    )
  }

  if (hub.error || !hub.group) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold">{hub.error || t('groups.groupNotFound')}</div>
        <Button onClick={() => navigate('/grupos')} icon={ArrowLeft} label={t('groups.backToGroups')} className="mx-auto" />
      </div>
    )
  }

  const filteredMerged = hub.mergedCollection.filter(item =>
    item.game.title.toLowerCase().includes(collectionSearch.toLowerCase()) ||
    (item.game.title_es && item.game.title_es.toLowerCase().includes(collectionSearch.toLowerCase()))
  )

  const tabOptions = [
    { id: 'meetups' as const, label: t('groups.upcomingMeetupsTab', 'Quedadas'), icon: Calendar, count: hub.upcomingMeetups.length },
    { id: 'ludoteca' as const, label: t('groups.sharedLudoteca', 'Ludoteca'), icon: Layers, count: hub.mergedCollection.length },
    { id: 'hall_of_fame' as const, label: t('groups.hallOfFame', 'Salón de la Fama'), icon: Trophy },
    { id: 'polls' as const, label: t('groups.meetupsAndVotes', 'Votaciones'), icon: CheckSquare, count: hub.polls.length },
    { id: 'table_tools' as const, label: t('quickLog.tableToolsTitle', 'Herramientas'), icon: Dices },
    { id: 'members' as const, label: t('groups.members', 'Miembros'), icon: Users, count: hub.members.length },
  ]

  return (
    <section className="space-y-6 pb-20 max-w-6xl mx-auto">
      <GroupHeroHeader
        group={hub.group} members={hub.members} gamesCount={hub.mergedCollection.length} isCreator={hub.isCreator} isAdmin={hub.isAdmin}
        copiedLink={hub.copiedLink} onCopyLink={hub.handleCopyInviteLink} onShareWhatsApp={hub.handleShareWhatsApp}
        onOpenQrModal={() => hub.setIsQrModalOpen(true)} onOpenQuickLogModal={() => hub.setIsQuickLogModalOpen(true)}
        onDeleteGroup={hub.handleDelete} onLeaveGroup={hub.handleLeave}
      />

      {hub.actionError && (
        <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold flex justify-between items-center">
          <span>{hub.actionError}</span>
          <Button onClick={() => hub.setActionError(null)} variant="ghost" className="text-xs hover:underline font-bold text-destructive">{t('groups.close')}</Button>
        </div>
      )}

      <Tabs options={tabOptions} activeTab={activeTab} onChange={setActiveTab} scrollable />

      <div className="min-h-[300px]">
        {activeTab === 'meetups' && groupId && <GroupUpcomingMeetups groupId={groupId} meetups={hub.upcomingMeetups} loading={hub.loadingMeetups} />}
        {activeTab === 'ludoteca' && <GroupLudotecaTab filteredMerged={filteredMerged} user={user} collectionSearch={collectionSearch} setCollectionSearch={setCollectionSearch} onOpenAddGame={() => hub.setIsAddGameModalOpen(true)} />}
        {activeTab === 'hall_of_fame' && groupId && <GroupHallOfFameTab groupId={groupId} />}
        {activeTab === 'polls' && (
          <GroupPollsTab
            polls={hub.polls} isAdmin={hub.isAdmin} user={user} formatMeetupDate={(d) => d}
            triggerConfirm={hub.triggerConfirm} closePoll={hub.closePoll} voteGame={hub.voteGame}
            setActionError={hub.setActionError} openNewPollModal={() => hub.setIsPollOpen(true)}
            onCreateMeetupRedirect={(pTitle, gId, gTitle) => navigate(`/mesa/nueva?game_id=${gId}&groupId=${groupId}&title=${encodeURIComponent(`${t('groups.pollsTitle')}: ${pTitle}`)}&description=${encodeURIComponent(t('groups.groupMeetupRedirectDesc', { gameTitle: gTitle }))}`)}
          />
        )}
        {activeTab === 'table_tools' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 sm:p-5 rounded-2xl bg-card/60 border border-border/30 shadow-xs">
              <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                <Dices className="w-4 h-4 text-primary shrink-0" /> <span>{t('quickLog.tableToolsTitle')}</span>
              </h3>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{t('quickLog.tableToolsDesc')}</p>
            </div>
            <TableToolsBar attendees={hub.members.map((m) => ({ id: m.user_id, name: m.username, avatarUrl: m.avatar_url }))} />
          </div>
        )}
        {activeTab === 'members' && <GroupMembersTab members={hub.members} user={user} group={hub.group} isAdmin={hub.isAdmin} handleKick={hub.handleKick} />}
      </div>

      <CreateGroupPollModal isOpen={hub.isPollOpen} onClose={() => hub.setIsPollOpen(false)} mergedCollection={hub.mergedCollection} onCreatePoll={hub.createPoll} />
      <GroupConfirmDialog isOpen={hub.confirmConfig.isOpen} onClose={() => hub.setConfirmConfig(p => ({ ...p, isOpen: false }))} onConfirm={hub.confirmConfig.onConfirm} title={hub.confirmConfig.title} description={hub.confirmConfig.description} confirmText={hub.confirmConfig.confirmText} isDestructive={hub.confirmConfig.isDestructive} />
      <GroupInviteQrModal isOpen={hub.isQrModalOpen} onClose={() => hub.setIsQrModalOpen(false)} groupName={hub.group.name} inviteCode={hub.group.invite_code} />
      <AddGameToLibraryModal isOpen={hub.isAddGameModalOpen} onClose={() => hub.setIsAddGameModalOpen(false)} userCollectionGameIds={hub.mergedCollection.map(i => i.game.bgg_id)} onAddGame={hub.addGameToGroup} isGroupContext />
      <QuickLogMatchModal isOpen={hub.isQuickLogModalOpen} onClose={() => hub.setIsQuickLogModalOpen(false)} groupId={groupId} groupMembers={hub.members.map(m => ({ user_id: m.user_id, username: m.username, avatar_url: m.avatar_url }))} groupGames={hub.mergedCollection.map(mc => mc.game)} onSuccess={hub.refreshAll} />
    </section>
  )
}
export default GroupDetailPage
