import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGroups, Group } from '../hooks/useGroups'
import { useGroupActions } from '../hooks/useGroupActions'
import { useAuth } from '../lib/authContext'
import { GroupsSkeletonGrid } from '../components/groups/GroupsSkeletonGrid'
import { GroupsEmptyState } from '../components/groups/GroupsEmptyState'
import { JoinGroupModal } from '../components/groups/JoinGroupModal'
import { CreateGroupModal } from '../components/groups/CreateGroupModal'
import { GroupsHero } from '../components/groups/GroupsHero'
import { GroupsFilters, GroupFilterMode } from '../components/groups/GroupsFilters'
import { GroupInteractiveCard } from '../components/groups/GroupInteractiveCard'
import { GroupQuickPeekSheet } from '../components/groups/GroupQuickPeekSheet'

const gridVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as const

export function GroupsPage() {
  const { user } = useAuth()
  const { groups, loading, error, createGroup, joinGroup } = useGroups()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<GroupFilterMode>('all')
  const [peekGroup, setPeekGroup] = useState<Group | null>(null)

  const actions = useGroupActions({
    groups,
    joinGroup,
    createGroup,
  })

  // Aggregated totals
  const totalMembers = useMemo(() => {
    return groups.reduce((acc, g) => acc + (g.member_count || 1), 0)
  }, [groups])

  // Filter groups by query and selected filter mode
  const filteredGroups = useMemo(() => {
    let result = groups

    if (filterMode === 'created' && user) {
      result = result.filter((g) => g.creator_id === user.id)
    } else if (filterMode === 'large') {
      result = result.filter((g) => (g.member_count || 1) >= 3)
    }

    const query = searchQuery.trim().toLowerCase()
    if (!query) return result

    return result.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        (g.description && g.description.toLowerCase().includes(query))
    )
  }, [groups, filterMode, user, searchQuery])

  return (
    <section className="space-y-7 pb-24">
      {/* 1. Hero Spotlight & Quick Actions Deck */}
      <GroupsHero
        totalGroups={groups.length}
        totalMembers={totalMembers}
        onJoinClick={actions.openJoinModal}
        onCreateClick={actions.openCreateModal}
      />

      {/* Auto-joining progress banner */}
      {actions.autoJoining && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center gap-3 animate-in fade-in duration-200"
        >
          <Loader2 className="w-5 h-5 animate-spin text-primary" aria-hidden="true" />
          <span className="text-sm font-bold text-foreground">
            {actions.autoJoinMessage}
          </span>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold"
        >
          {t('groups.loadingGroupsError')} {error}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <GroupsSkeletonGrid count={6} />
      ) : groups.length === 0 ? (
        <GroupsEmptyState
          onJoinClick={actions.openJoinModal}
          onCreateClick={actions.openCreateModal}
        />
      ) : (
        <div className="space-y-5">
          {/* 2. Interactive Search & Segmented Filter Chips */}
          <GroupsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterMode={filterMode}
            onFilterChange={setFilterMode}
            totalFiltered={filteredGroups.length}
          />

          {/* 3. Results Grid */}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16 px-4 text-muted-foreground text-sm border border-dashed border-border/50 rounded-3xl bg-muted/10">
              <p className="font-semibold text-foreground text-base mb-1">No se encontraron círculos</p>
              <p className="text-xs text-muted-foreground">Prueba ajustando los filtros o tu término de búsqueda.</p>
            </div>
          ) : (
            <motion.div
              variants={gridVars}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredGroups.map((group) => (
                <GroupInteractiveCard
                  key={group.id}
                  group={group}
                  isOwner={user ? group.creator_id === user.id : false}
                  onQuickPeek={(g) => setPeekGroup(g)}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* 4. Fluid Slide-Over Quick Peek Drawer */}
      <GroupQuickPeekSheet
        group={peekGroup}
        isOpen={Boolean(peekGroup)}
        onClose={() => setPeekGroup(null)}
        isOwner={user && peekGroup ? peekGroup.creator_id === user.id : false}
      />

      {/* Functional Modals */}
      <JoinGroupModal
        isOpen={actions.isJoinOpen}
        onClose={actions.closeJoinModal}
        inviteCode={actions.inviteCode}
        onInviteCodeChange={actions.setInviteCode}
        loading={actions.joinLoading}
        error={actions.joinError}
        onSubmit={actions.handleJoinSubmit}
      />

      <CreateGroupModal
        isOpen={actions.isCreateOpen}
        onClose={actions.closeCreateModal}
        groupName={actions.groupName}
        onGroupNameChange={actions.setGroupName}
        groupDesc={actions.groupDesc}
        onGroupDescChange={actions.setGroupDesc}
        loading={actions.createLoading}
        error={actions.createError}
        onSubmit={actions.handleCreateSubmit}
      />
    </section>
  )
}

export default GroupsPage
