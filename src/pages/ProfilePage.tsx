import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { Button } from '../components/ui/button'
import { Tabs } from '../components/ui/tabs'
import { useProfile } from '../hooks/useProfile'
import { ProfileSkeleton } from '../components/profile/ProfileSkeleton'
import { ProfileShowcaseCard } from '../components/profile/ProfileShowcaseCard'
import { AchievementsVitrina } from '../components/profile/AchievementsVitrina'
import { TabContentList } from '../components/profile/TabContentList'
import { EditProfileModal } from '../components/profile/EditProfileModal'
import { ImportBggModal } from '../components/profile/ImportBggModal'
import { RankingVisualizerModal } from '../components/profile/RankingVisualizerModal'
import { ArrowLeft, Edit, UserX, History, Dices, CalendarDays, MoreHorizontal } from 'lucide-react'

export function ProfilePage() {
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
    importingCollection,
    importError,
    setImportError,
    importSuccessCount,
    setImportSuccessCount,
    importBggCollection,
    removeFromCollection,
    deleteRanking
  } = useProfile({ profileId, currentUserId: user?.id })

  // Modal display states
  const [isEditing, setIsEditing] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedRanking, setSelectedRanking] = useState<any | null>(null)

  // Active Tab state
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'collection' | 'mas'>('upcoming')

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
          <h2 className="text-xl font-bold">Perfil no disponible</h2>
          <p className="text-sm font-medium text-foreground/80">{errorMsg || 'No se pudo cargar el perfil solicitado.'}</p>
        </div>
        <Button 
          onClick={() => navigate('/')} 
          variant="outline" 
          size="sm" 
          icon={ArrowLeft} 
          label="Volver al Tablero" 
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
    if (level >= 10) return 'Mítico del Cartón 👑'
    if (level >= 6) return 'Gran Maestro de la Mesa ⚔️'
    if (level >= 4) return 'Veterano del Meeple 🛡️'
    if (level >= 2) return 'Estratega del Salón 🎲'
    return 'Novato del Meeple 🌱'
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
          label="Atrás"
        />
        <div className="flex items-center gap-2">
          {isOwnProfileEditable && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer text-foreground"
              icon={Edit}
              label="Editar Datos"
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

      {/* Achievements Vitrina */}
      <AchievementsVitrina
        organizedCount={organizedCount}
        stats={stats}
        savedRankingsCount={savedRankings.length}
      />


      {/* Navigation Tabs */}
      <Tabs
        options={[
          { id: 'upcoming', label: 'Próximas', icon: CalendarDays, count: upcomingMeetups.length },
          { id: 'completed', label: 'Historial', icon: History, count: completedMeetups.length },
          { id: 'collection', label: 'Ludoteca', icon: Dices, count: collectionGames.length },
          { id: 'mas', label: 'Más', icon: MoreHorizontal }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        hideLabelsOnMobile
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
        handleRemoveFromCollection={async (e, bggId) => {
          e.preventDefault()
          e.stopPropagation()
          if (confirm('¿Quieres quitar este juego de tu ludoteca?')) {
            await removeFromCollection(bggId)
          }
        }}
        handleDeleteRanking={async (e, rankingId) => {
          e.preventDefault()
          e.stopPropagation()
          if (confirm('¿Estás seguro de que quieres eliminar este ranking de tu perfil?')) {
            await deleteRanking(rankingId)
          }
        }}
        setSelectedRanking={setSelectedRanking}
        setIsImportModalOpen={setIsImportModalOpen}
      />

      {/* Modal Dialogs */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
        profileId={profileId}
        currentUserId={user?.id}
        onSave={saveProfile}
        saving={savingProfile}
      />

      <ImportBggModal
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        importingCollection={importingCollection}
        importError={importError}
        setImportError={setImportError}
        importSuccessCount={importSuccessCount}
        setImportSuccessCount={setImportSuccessCount}
        onImport={importBggCollection}
      />

      <RankingVisualizerModal
        selectedRanking={selectedRanking}
        onClose={() => setSelectedRanking(null)}
      />
    </section>
  )
}

export default ProfilePage;
