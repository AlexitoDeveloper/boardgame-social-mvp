import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Dices } from 'lucide-react'
import { GroupDetailTabId } from './GroupDetailSegmentedNav'
import { MeetupsTab } from './tabs/MeetupsTab'
import { MatchesTab } from './tabs/MatchesTab'
import { LudotecaTab } from './tabs/LudotecaTab'
import { HallOfFameTab } from './tabs/HallOfFameTab'
import { MembersTab } from './tabs/MembersTab'
import { TableToolsBar } from '../table-hub/TableToolsBar'
import { User } from '@supabase/supabase-js'
import { MergedGame } from '../../hooks/useGroupDetail'

interface GroupDetailTabsProps {
  activeTab: GroupDetailTabId
  groupId: string
  hub: any
  user: User | null
  filteredMerged: MergedGame[]
  collectionSearch: string
  setCollectionSearch: (search: string) => void
}

export const GroupDetailTabs: React.FC<GroupDetailTabsProps> = ({
  activeTab,
  groupId,
  hub,
  user,
  filteredMerged,
  collectionSearch,
  setCollectionSearch,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-[380px] transition-all duration-200 ease-out">
      {activeTab === 'meetups' && (
        <MeetupsTab
          groupId={groupId}
          meetups={hub.upcomingMeetups}
          loading={hub.loadingMeetups}
          members={hub.members}
          currentUserId={user?.id}
        />
      )}

      {activeTab === 'matches' && (
        <MatchesTab
          groupId={groupId}
          matches={hub.pastMeetups}
          loading={hub.loadingPastMeetups}
          onOpenQuickLogModal={() => navigate(`/partida/nueva?groupId=${groupId}`)}
          onRefresh={hub.fetchPastMeetups}
        />
      )}

      {activeTab === 'ludoteca' && (
        <LudotecaTab
          filteredMerged={filteredMerged}
          user={user}
          collectionSearch={collectionSearch}
          setCollectionSearch={setCollectionSearch}
          onOpenAddGame={() => hub.setIsAddGameModalOpen(true)}
          onLogMatch={(bggId) => navigate(`/partida/nueva?groupId=${groupId}&gameId=${bggId}`)}
        />
      )}

      {activeTab === 'hall_of_fame' && (
        <HallOfFameTab groupId={groupId} />
      )}

      {activeTab === 'table_tools' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 sm:p-5 rounded-2xl bg-card/60 border border-border/30 shadow-xs">
            <h3 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
              <Dices className="w-4 h-4 text-primary shrink-0" />
              <span>{t('quickLog.tableToolsTitle', 'Herramientas de mesa')}</span>
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              {t('quickLog.tableToolsDesc', 'Lanza dados, elige al primer jugador y controla turnos en vivo.')}
            </p>
          </div>
          <TableToolsBar attendees={hub.members.map((m: any) => ({ id: m.user_id, name: m.username, avatarUrl: m.avatar_url }))} />
        </div>
      )}

      {activeTab === 'members' && (
        <MembersTab
          members={hub.members}
          guests={hub.guests}
          user={user}
          group={hub.group}
          isAdmin={hub.isAdmin}
          handleKick={hub.handleKick}
          onAddGuest={hub.addGroupGuest}
          onRemoveGuest={hub.removeGroupGuest}
          onAssociateGuest={hub.associateGroupGuest}
        />
      )}
    </div>
  )
}

export default GroupDetailTabs
