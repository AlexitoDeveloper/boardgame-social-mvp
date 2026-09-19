import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { Button } from '../components/ui/button'
import { Tabs } from '../components/ui/tabs'
import { useProfile } from '../hooks/useProfile'
import { ProfileSkeleton } from '../components/profile/ProfileSkeleton'
import { ProfileShowcaseCard } from '../components/profile/ProfileShowcaseCard'
import { TabContentList, ProfileTabType } from '../components/profile/TabContentList'
import { EditProfileModal } from '../components/profile/EditProfileModal'
import { BggSyncModal } from '../components/library/BggSyncModal'
import { RankingVisualizerModal } from '../components/profile/RankingVisualizerModal'
import { AddGameToLibraryModal } from '../components/library/AddGameToLibraryModal'
import { ArrowLeft, Edit, UserX, Dices, CalendarDays, Settings, Award, BarChart2, History } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ProfileSettingsModal } from '../components/profile/ProfileSettingsModal'
import { toast } from '../components/ui/toast'

export function ProfilePage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rankingIdParam = searchParams.get('ranking')

  const profileId = id || user?.id || ''
  const isOwnProfile = profileId === user?.id
  const isOwnProfileEditable = isOwnProfile || (profileId.startsWith('mock-'))

  const {
    profile,
    setProfile,
    meetups,
    stats,
    loading,
    errorMsg,
    savedRankings,
    loadingRankings,
    collectionGames,
    loadingCollection,
    savingProfile,
    saveProfile,
    importBggCollection,
    addToCollection,
    removeFromCollection,
    deleteRanking
  } = useProfile({ profileId, currentUserId: user?.id })

  // Modal display states
  const [isEditing, setIsEditing] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false)
  const [selectedRanking, setSelectedRanking] = useState<any | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Active Tab state
  const [activeTab, setActiveTab] = useState<ProfileTabType>('upcoming')

  // Set selected ranking if URL param matches
  useEffect(() => {
    if (rankingIdParam && savedRankings.length > 0) {
      const found = savedRankings.find(r => r.id === rankingIdParam)
      if (found) {
        setSelectedRanking(found)
      }
    }
  }, [rankingIdParam, savedRankings])

  if (loading) {
    return <ProfileSkeleton />
  }

  if (errorMsg || !profile) {
    return (
      <section className="space-y-4 max-w-xl mx-auto p-4 text-center">
        <div className="text-destructive bg-destructive/10 px-4 py-6 rounded-2xl border border-destructive/20 space-y-3">
          <UserX className="w-10 h-10 mx-auto text-destructive" />
          <h2 className="text-xl font-bold">{t('profile.notAvailableTitle')}</h2>
          <p className="text-sm font-medium text-foreground/80">{errorMsg || t('profile.notAvailableDesc')}</p>
        </div>
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          size="sm" 
          icon={ArrowLeft} 
          label={t('profile.backToBoard')} 
          className="mx-auto cursor-pointer" 
        />
      </section>
    )
  }

  const upcomingMeetups = meetups.filter(m => !m.completed && new Date(m.date).getTime() >= Date.now())
  const completedMeetups = meetups.filter(m => m.completed || new Date(m.date).getTime() < Date.now())
  const organizedCount = meetups.filter(m => m.creator_id === profileId).length

  // Gamer Level calculations
  const totalXp = (stats.played * 100) + (stats.won * 250) + (organizedCount * 150) + (savedRankings.length * 200)
  const playerLevel = Math.floor(totalXp / 1000) + 1
  const prevLevelXp = (playerLevel - 1) * 1000
  const xpRange = 1000
  const xpCurrent = totalXp - prevLevelXp
  const xpProgress = Math.min(100, Math.max(0, (xpCurrent / xpRange) * 100))

  const getPlayerTitle = (level: number) => {
    if (level >= 10) return t('profile.level10')
    if (level >= 6) return t('profile.level6')
    if (level >= 4) return t('profile.level4')
    if (level >= 2) return t('profile.level2')
    return t('profile.level1')
  }
  const playerTitle = getPlayerTitle(playerLevel)

  return (
    <section className="space-y-6 max-w-xl mx-auto p-0 pb-6 md:p-4 md:pb-24 relative">
      {/* Header bar (sticky on mobile) */}
      <div className="sticky top-[-2px] pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 z-30 flex items-center justify-between -mx-4 px-4 md:-mx-8 md:px-8 bg-background/85 backdrop-blur-md border-b border-border/20">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="cursor-pointer"
          icon={ArrowLeft}
          label={t('profile.back')}
        />
        <div className="flex items-center gap-2">
          {isOwnProfileEditable && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer text-foreground"
              icon={Edit}
              label={t('profile.editData')}
            />
          )}
          {isOwnProfile && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className="cursor-pointer text-foreground"
              icon={Settings}
              aria-label="Ajustes y preferencias"
            />
          )}
        </div>
      </div>

      <ProfileShowcaseCard
        profile={profile}
        isOwnProfileEditable={isOwnProfileEditable}
        playerLevel={playerLevel}
        playerTitle={playerTitle}
        totalXp={totalXp}
        xpCurrent={xpCurrent}
        xpRange={xpRange}
        xpProgress={xpProgress}
        setProfile={setProfile}
      />

      {/* Navigation Tabs (Próximas, Historial, Ludoteca, Vitrina, Estadísticas) */}
      <Tabs<ProfileTabType>
        options={[
          { id: 'upcoming', label: t('profile.tabs.upcoming', 'Próximas'), icon: CalendarDays, count: upcomingMeetups.length },
          { id: 'completed', label: t('profile.tabs.completed', 'Historial'), icon: History, count: completedMeetups.length },
          { id: 'collection', label: t('profile.tabs.collection', 'Ludoteca'), icon: Dices, count: collectionGames.length },
          { id: 'vitrina', label: t('profile.tabs.vitrina', 'Vitrina'), icon: Award },
          { id: 'stats', label: t('profile.tabs.stats', 'Estadísticas'), icon: BarChart2 }
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab)}
        scrollable
      />

      {/* Tab Panels */}
      <TabContentList
        activeTab={activeTab}
        upcomingMeetups={upcomingMeetups}
        completedMeetups={completedMeetups}
        collectionGames={collectionGames}
        loadingCollection={loadingCollection}
        savedRankings={savedRankings}
        loadingRankings={loadingRankings}
        isOwnProfile={isOwnProfile}
        isOwnProfileEditable={isOwnProfileEditable}
        currentUserId={user?.id}
        stats={stats}
        meetups={meetups}
        profileId={profileId}
        organizedCount={organizedCount}
        handleRemoveFromCollection={async (e, bggId) => {
          e.preventDefault()
          e.stopPropagation()
          await removeFromCollection(bggId)
          toast.info(t('toast.gameRemovedFromCollection', 'Juego eliminado de tu ludoteca.'))
        }}
        handleDeleteRanking={async (e, rankingId) => {
          e.preventDefault()
          e.stopPropagation()
          await deleteRanking(rankingId)
          toast.info(t('common.deleted', 'Eliminado'))
        }}
        setSelectedRanking={setSelectedRanking}
        setIsImportModalOpen={setIsImportModalOpen}
        setIsAddGameModalOpen={setIsAddGameModalOpen}
      />

      {/* Modal Dialogs */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
        profileId={profileId}
        currentUserId={user?.id}
        onSave={async (username, city, avatarUrl) => {
          await saveProfile(username, city, avatarUrl)
          toast.success(t('toast.profileSaved', 'Ajustes del perfil guardados.'))
        }}
        saving={savingProfile}
      />

      <BggSyncModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importBggCollection}
      />

      <AddGameToLibraryModal
        isOpen={isAddGameModalOpen}
        onClose={() => setIsAddGameModalOpen(false)}
        userCollectionGameIds={collectionGames.map((g) => g.bgg_id)}
        onAddGame={async (gameId) => {
          await addToCollection(gameId)
          toast.success(t('toast.gameAddedToCollection', '¡Juego añadido a tu ludoteca!'))
        }}
      />

      <RankingVisualizerModal
        selectedRanking={selectedRanking}
        onClose={() => setSelectedRanking(null)}
      />

      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </section>
  )
}

export default ProfilePage;
