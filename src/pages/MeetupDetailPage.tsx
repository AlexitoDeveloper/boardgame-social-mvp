import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { useMeetupDetail } from '../hooks/useMeetupDetail'
import { Button } from '../components/ui/button'
import { 
  ArrowLeft, 
  Check, 
  Share2, 
  Loader2, 
  Info 
} from 'lucide-react'

// Import subcomponents
import { MeetupDetailHero } from '../components/meetup-detail/MeetupDetailHero'
import { MeetupDetailDescription } from '../components/meetup-detail/MeetupDetailDescription'
import { MeetupDetailAttendees } from '../components/meetup-detail/MeetupDetailAttendees'
import { MeetupDetailLocation } from '../components/meetup-detail/MeetupDetailLocation'
import { MeetupDetailSidebar } from '../components/meetup-detail/MeetupDetailSidebar'

export function MeetupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    meetup,
    attendees,
    gameInfo,
    loading,
    joining,
    canceling,
    copySuccess,
    timeLeft,
    errorMsg,
    handleShare,
    handleJoinLeave,
    handleCancelMeetup,
    guestReservation,
    handleJoinAsGuest,
    handleLeaveAsGuest,
    handleCompleteMeetup
  } = useMeetupDetail(id, user)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando detalles de la partida...</p>
      </div>
    )
  }

  if (errorMsg || !meetup) {
    return (
      <section className="space-y-4 max-w-xl mx-auto p-4 text-center">
        <div className="text-destructive bg-destructive/10 px-4 py-6 rounded-2xl border border-destructive/20 space-y-3">
          <Info className="w-10 h-10 mx-auto text-destructive" />
          <h2 className="text-xl font-bold">¡Vaya! Algo salió mal</h2>
          <p className="text-sm font-medium text-foreground/80">{errorMsg || 'No se pudo cargar la partida solicitada.'}</p>
        </div>
        <Button onClick={() => navigate('/')} className="rounded-xl flex items-center gap-1.5 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero
        </Button>
      </section>
    )
  }

  const userId = user?.id
  const isJoined = userId ? meetup.joined_players?.includes(userId) : false
  const isCreator = meetup.creator_id === userId
  const spotsRemaining = meetup.max_players - attendees.length
  const isFull = spotsRemaining <= 0
  const isPast = new Date(meetup.date).getTime() < new Date().getTime()

  return (
    <section className="space-y-6 max-w-4xl mx-auto p-0 pb-6 md:p-4 md:pb-24">
      
      {/* Back navigation and share toolbar (sticky on mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-2 -mx-4 px-4 bg-background/85 backdrop-blur-md border-b border-border/20 md:relative md:top-auto md:z-10 md:bg-transparent md:backdrop-blur-none md:border-b-0 md:-mx-0 md:px-0 md:py-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')} 
          className="rounded-xl flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 border border-border/20 hover:bg-muted/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Volver al Tablero</span><span className="xs:hidden">Volver</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="rounded-xl flex items-center gap-1.5 border border-border/40 hover:bg-primary/5 transition-all text-xs h-9 cursor-pointer bg-card px-3"
        >
          {copySuccess ? (
            <>
              <Check className="w-4 h-4 text-success" />
              <span className="text-success font-semibold">¡Copiado!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-primary" />
              <span>Compartir</span>
            </>
          )}
        </Button>
      </div>

      {/* Hero Header component */}
      <MeetupDetailHero
        meetup={meetup}
        gameInfo={gameInfo}
        isPast={isPast}
        isFull={isFull}
        spotsRemaining={spotsRemaining}
      />

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Description, Attendees, Location */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Meetup Description */}
          <MeetupDetailDescription description={meetup.description} />

          {/* Attendees list grid */}
          <MeetupDetailAttendees
            attendees={attendees}
            maxPlayers={meetup.max_players}
            spotsRemaining={spotsRemaining}
            creatorId={meetup.creator_id}
            userId={userId}
            guestReservationId={guestReservation?.id}
          />

          {/* Location details card & Google Map locator */}
          <MeetupDetailLocation
            location={meetup.location}
            city={meetup.city}
          />


        </div>

        {/* Right Columns - Sidebar */}
        <MeetupDetailSidebar
          meetup={meetup}
          gameInfo={gameInfo}
          attendees={attendees}
          isPast={isPast}
          isCreator={isCreator}
          isJoined={isJoined}
          isFull={isFull}
          joining={joining}
          canceling={canceling}
          timeLeft={timeLeft}
          user={user}
          handleJoinLeave={handleJoinLeave}
          handleCancelMeetup={handleCancelMeetup}
          guestReservation={guestReservation}
          handleJoinAsGuest={handleJoinAsGuest}
          handleLeaveAsGuest={handleLeaveAsGuest}
          handleCompleteMeetup={handleCompleteMeetup}
        />
      </div>
    </section>
  )
}
export default MeetupDetailPage;
