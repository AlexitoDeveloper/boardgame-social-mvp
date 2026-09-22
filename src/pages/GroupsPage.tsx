import { useState, useMemo } from 'react'
import { Search, Loader2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useGroups } from '../hooks/useGroups'
import { useGroupActions } from '../hooks/useGroupActions'
import { GroupsHeader } from '../components/groups/GroupsHeader'
import { GroupsSkeletonGrid } from '../components/groups/GroupsSkeletonGrid'
import { GroupsEmptyState } from '../components/groups/GroupsEmptyState'
import { GroupCard } from '../components/groups/GroupCard'
import { JoinGroupModal } from '../components/groups/JoinGroupModal'
import { CreateGroupModal } from '../components/groups/CreateGroupModal'

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} as const

export function GroupsPage() {
  const { groups, loading, error, createGroup, joinGroup } = useGroups()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  const actions = useGroupActions({
    groups,
    joinGroup,
    createGroup,
  })

  // Filter groups by name or description
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return groups
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        (g.description && g.description.toLowerCase().includes(query))
    )
  }, [groups, searchQuery])

  return (
    <section className="space-y-6 pb-20">
      {/* Page Header */}
      <GroupsHeader
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
        <div className="space-y-4">
          {/* Search bar & active counters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="search"
                aria-label={t('groups.searchPlaceholder')}
                placeholder={t('groups.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-10 rounded-xl"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full hover:bg-muted text-muted-foreground"
                  aria-label={t('common.clear', 'Limpiar')}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {searchQuery && (
              <Badge variant="secondary" className="font-mono-tabular text-xs self-start sm:self-auto py-1">
                {filteredGroups.length} {filteredGroups.length === 1 ? t('groups.titleSingular', 'grupo') : t('groups.title', 'grupos')}
              </Badge>
            )}
          </div>

          {/* Results grid or no-results notice */}
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border/40 rounded-2xl">
              {t('groups.noResults')}
            </div>
          ) : (
            <motion.div
              variants={containerVars}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Join Group Dialog */}
      <JoinGroupModal
        isOpen={actions.isJoinOpen}
        onClose={actions.closeJoinModal}
        inviteCode={actions.inviteCode}
        onInviteCodeChange={actions.setInviteCode}
        loading={actions.joinLoading}
        error={actions.joinError}
        onSubmit={actions.handleJoinSubmit}
      />

      {/* Create Group Dialog */}
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
