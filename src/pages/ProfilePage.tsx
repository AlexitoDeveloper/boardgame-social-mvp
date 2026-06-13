import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { supabase } from '../lib/supabaseClient'
import { Meetup, UserProfile } from '../types'
import { getMockMeetupsForList } from '../lib/mockData'
import { Button } from '../components/ui/button'
import { USE_MOCKS } from '../lib/config'
import { Card, CardContent } from '../components/ui/card'
import { 
  Crown,
  History,
  Calendar, 
  Award, 
  MapPin, 
  ArrowLeft, 
  Loader2, 
  ChevronRight, 
  UserCheck, 
  Clock, 
  CalendarDays,
  UserX,
  Target,
  Users,
  Dices,
  Swords
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'

const MotionDiv = motion.div

interface UserStats {
  played: number;
  won: number;
  winRate: number;
  karma: number;
  missed: number;
}

const MOCK_PROFILES: Record<string, UserProfile> = {
  'mock-u1': { id: 'mock-u1', username: 'boardgamer_alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', city: 'Madrid' },
  'mock-u2': { id: 'mock-u2', username: 'meeple_sara', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara', city: 'Barcelona' },
  'mock-u3': { id: 'mock-u3', username: 'hex_and_counter', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HexCounter', city: 'Bilbao' },
  'mock-u4': { id: 'mock-u4', username: 'ludo_valen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valen', city: 'Valencia' },
}

// Custom SVG Circular Gauge Component for high-end gaming dashboard look
function CircularProgress({ 
  value, 
  colorClass, 
  size = 64, 
  strokeWidth = 6 
}: { 
  value: number; 
  colorClass: string; 
  size?: number; 
  strokeWidth?: number 
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Track circle */}
        <circle
          className="text-muted-foreground/15 stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-black text-foreground tracking-tighter">{value}%</span>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const profileId = id || user?.id || ''
  const isOwnProfile = profileId === user?.id

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [stats, setStats] = useState<UserStats>({ played: 0, won: 0, winRate: 0, karma: 100, missed: 0 })
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming')

  useEffect(() => {
    async function loadProfileData() {
      if (!profileId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMsg('')

      const isMock = USE_MOCKS && profileId.startsWith('mock-')

      if (isMock) {
        const mockProf = MOCK_PROFILES[profileId]
        if (!mockProf) {
          setErrorMsg('No se encontró el perfil de demostración.')
          setLoading(false)
          return
        }

        setProfile(mockProf)

        const allMocks = getMockMeetupsForList()
        const completedMockKey = 'boardgame_social_mock_completed_meetups'
        const completedMockStr = localStorage.getItem(completedMockKey)
        const completedMockData = completedMockStr ? JSON.parse(completedMockStr) : {}

        const userMockMeetups = allMocks
          .map(m => {
            const completedInfo = completedMockData[m.id]
            if (completedInfo) {
              return {
                ...m,
                completed: completedInfo.completed,
                winner_user_id: completedInfo.winner_user_id,
                winner_guest_id: completedInfo.winner_guest_id,
                attended_players: completedInfo.attended_players,
                attended_guests: completedInfo.attended_guests
              }
            }
            return m
          })
          .filter(m => m.joined_players?.includes(profileId))

        setMeetups(userMockMeetups)
        calculateStats(userMockMeetups, profileId)
        setLoading(false)
      } else {
        try {
          const { data: profData, error: profError } = await supabase
            .from('users')
            .select('*')
            .eq('id', profileId)
            .single()

          if (profError) throw profError
          setProfile(profData as UserProfile)

          const { data: meetupsData, error: meetupsError } = await supabase
            .from('meetups')
            .select('*, games(*), users:users!meetups_creator_id_fkey(*)')
            .contains('joined_players', [profileId])

          if (meetupsError) throw meetupsError
          
          setMeetups(meetupsData as Meetup[] || [])
          calculateStats(meetupsData || [], profileId)
        } catch (err: any) {
          console.error("Error loading profile:", err)
          setErrorMsg(err.message || 'Error al obtener el perfil de usuario.')
        } finally {
          setLoading(false)
        }
      }
    }

    loadProfileData()
  }, [profileId])

  const calculateStats = (userMeetups: Meetup[], userId: string) => {
    const completed = userMeetups.filter(m => m.completed)
    const attended = completed.filter(m => m.attended_players?.includes(userId))
    const missed = completed.filter(m => !m.attended_players?.includes(userId))
    const won = completed.filter(m => m.winner_user_id === userId)

    const winRate = attended.length > 0 ? Math.round((won.length / attended.length) * 100) : 0
    const karma = completed.length > 0 ? Math.round((attended.length / completed.length) * 100) : 100

    setStats({
      played: attended.length,
      won: won.length,
      winRate,
      karma,
      missed: missed.length
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando perfil de jugador...</p>
      </div>
    )
  }

  if (errorMsg || !profile) {
    return (
      <section className="space-y-4 max-w-xl mx-auto p-4 text-center">
        <div className="text-destructive bg-destructive/10 px-4 py-6 rounded-2xl border border-destructive/20 space-y-3">
          <UserX className="w-10 h-10 mx-auto text-destructive" />
          <h2 className="text-xl font-bold">Perfil no disponible</h2>
          <p className="text-sm font-medium text-foreground/80">{errorMsg || 'No se pudo cargar el perfil solicitado.'}</p>
        </div>
        <Button onClick={() => navigate('/')} className="rounded-xl flex items-center gap-1.5 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Volver al Tablero
        </Button>
      </section>
    )
  }

  const upcomingMeetups = meetups.filter(m => !m.completed)
  const completedMeetups = meetups.filter(m => m.completed)

  const getKarmaInfo = (val: number) => {
    if (val >= 90) return { color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10', circleColor: 'text-emerald-500', label: 'Confiable' }
    if (val >= 70) return { color: 'text-amber-500 border-amber-500/20 bg-amber-500/10', circleColor: 'text-amber-500', label: 'Frecuente' }
    return { color: 'text-destructive border-destructive/20 bg-destructive/10', circleColor: 'text-destructive', label: 'Ausente habitual' }
  }

  const karmaInfo = getKarmaInfo(stats.karma)

  return (
    <section className="space-y-6 max-w-xl mx-auto p-4 pb-24">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="rounded-xl flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 border border-border/20 hover:bg-muted/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Atrás
        </Button>
        {isOwnProfile ? (
          <span className="text-[10px] font-black text-primary uppercase bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-wider">
            Tu Cuenta
          </span>
        ) : (
          <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted border border-border/40 px-3 py-1 rounded-full tracking-wider">
            Ficha de Jugador
          </span>
        )}
      </div>

      {/* Profile Info Card with beautiful banner backdrop */}
      <Card className="border-border/30 bg-card shadow-xl overflow-hidden rounded-2xl">
        {/* Colorful artistic background banner */}
        <div className="h-28 bg-gradient-to-r from-primary/25 via-emerald-500/15 to-violet-500/10 border-b border-border/10" />
        
        <CardContent className="pb-6 px-6 relative flex flex-col items-center sm:items-start sm:flex-row gap-5">
          {/* Avatar container overlapping the banner with glowing ring */}
          <div className="relative -mt-12 z-10 shrink-0">
            <Avatar className="w-24 h-24 border-4 border-card ring-2 ring-border shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-2xl font-black">
                {profile.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="pt-3 sm:pt-4 space-y-3 text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-2xl font-black tracking-tight text-foreground truncate">{profile.username}</h2>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs font-bold">
              {profile.city && (
                <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg border border-border/40 text-foreground/80 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg border border-border/40 text-foreground/80 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> Se unió en {(() => {
                  const dStr = new Date(profile.created_at || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                  return dStr.charAt(0).toUpperCase() + dStr.slice(1);
                })()}
              </span>
            </div>

            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <Badge variant="outline" className={`font-black tracking-wide text-[10px] px-3 py-1 rounded-full uppercase ${karmaInfo.color} border shadow-sm`}>
                Karma: {karmaInfo.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Dashboard Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Win Rate Card */}
        <Card className="border-border/30 bg-card/65 backdrop-blur-3xl shadow-lg relative overflow-hidden group rounded-2xl hover:border-amber-500/30 hover:shadow-amber-500/5 transition-all duration-300">
          {/* Decorative background swords icon */}
          <div className="absolute -right-3 -bottom-5 opacity-10 dark:opacity-[0.06] group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none">
            <Swords className="w-28 h-28 text-amber-500 stroke-[1.25] rotate-12" />
          </div>
          <CardContent className="p-5 flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Tasa de Victoria</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-foreground">{stats.winRate}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold leading-normal truncate">
                {stats.won} victorias de {stats.played} partidas
              </p>
            </div>
            
            <div className="drop-shadow-[0_0_8px_rgba(245,158,11,0.25)] shrink-0">
              <CircularProgress 
                value={stats.winRate} 
                colorClass="text-amber-500" 
                size={64}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="border-border/30 bg-card/65 backdrop-blur-3xl shadow-lg relative overflow-hidden group rounded-2xl hover:border-emerald-500/30 hover:shadow-emerald-500/5 transition-all duration-300">
          {/* Decorative background dices icon */}
          <div className="absolute -right-3 -bottom-5 opacity-10 dark:opacity-[0.06] group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none">
            <Dices className="w-28 h-28 text-emerald-500 stroke-[1.25] -rotate-12" />
          </div>
          <CardContent className="p-5 flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Asistencia Real</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-foreground">{stats.karma}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold leading-normal truncate">
                {stats.played} jugadas | {stats.missed} ausencias
              </p>
            </div>
            
            <div className={`drop-shadow-[0_0_8px_rgba(${karmaInfo.circleColor === 'text-emerald-500' ? '16,185,129' : '239,68,68'},0.25)] shrink-0`}>
              <CircularProgress 
                value={stats.karma} 
                colorClass={karmaInfo.circleColor} 
                size={64}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Menu Slider (Premium Pill Design) */}
      <div className="bg-muted/40 p-1.5 rounded-2xl border border-border/20 flex gap-1.5">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 rounded-xl text-xs font-black relative transition-all duration-300 ${
            activeTab === 'upcoming' ? 'text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          {activeTab === 'upcoming' && (
            <MotionDiv 
              layoutId="active-pill" 
              className="absolute inset-0 bg-primary rounded-xl z-0"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" /> Próximas ({upcomingMeetups.length})
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 rounded-xl text-xs font-black relative transition-all duration-300 ${
            activeTab === 'completed' ? 'text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          {activeTab === 'completed' && (
            <MotionDiv 
              layoutId="active-pill" 
              className="absolute inset-0 bg-primary rounded-xl z-0"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Historial ({completedMeetups.length})
          </span>
        </button>
      </div>

      {/* Match History List */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' ? (
            <MotionDiv
              key="upcoming-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {upcomingMeetups.length === 0 ? (
                <div className="text-center py-12 px-4 bg-muted/10 rounded-2xl border border-dashed border-border/40">
                  <p className="text-sm font-bold text-muted-foreground">No tienes partidas programadas.</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Busca mesas abiertas en el tablero para unirte.</p>
                </div>
              ) : (
                upcomingMeetups.map(meetup => {
                  const rawGame = meetup.games
                  const game = Array.isArray(rawGame) ? rawGame[0] : rawGame

                  return (
                    <Link key={meetup.id} to={`/tablero/${meetup.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/45 hover:bg-muted/40 hover:border-primary/20 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-background/60 border border-border/20 p-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 group-hover:border-primary/30 transition-all duration-300">
                            {game?.image_url ? (
                              <img src={game.image_url} alt={game.title} className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105 duration-300" />
                            ) : (
                              <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">?</div>
                            )}
                          </div>
                          <div className="min-w-0 text-left space-y-1">
                            <span className="font-extrabold text-sm block text-foreground truncate group-hover:text-primary transition-colors">{meetup.title}</span>
                            <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                              {new Date(meetup.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-black text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">Ver Mesa</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </MotionDiv>
          ) : (
            <MotionDiv
              key="completed-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {completedMeetups.length === 0 ? (
                <div className="text-center py-12 px-4 bg-muted/10 rounded-2xl border border-dashed border-border/40">
                  <p className="text-sm font-bold text-muted-foreground">Aún no has participado en ninguna partida completada.</p>
                </div>
              ) : (
                completedMeetups.map(meetup => {
                  const rawGame = meetup.games
                  const game = Array.isArray(rawGame) ? rawGame[0] : rawGame
                  const isWinner = meetup.winner_user_id === profileId
                  const didAttend = meetup.attended_players?.includes(profileId)

                  return (
                    <Link key={meetup.id} to={`/tablero/${meetup.id}`}>
                      <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md group ${
                        isWinner 
                          ? 'border-amber-500/25 bg-amber-500/[0.02] hover:bg-amber-500/[0.04] hover:border-amber-500/40' 
                          : !didAttend 
                            ? 'border-destructive/25 bg-destructive/[0.01] opacity-70 hover:opacity-100 hover:bg-destructive/[0.03]'
                            : 'border-border/40 bg-card/45 hover:bg-muted/40 hover:border-primary/20'
                      }`}>
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-12 h-12 rounded-xl shrink-0 overflow-hidden p-1 flex items-center justify-center transition-all duration-300 ${
                            isWinner 
                              ? 'bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40' 
                              : 'bg-background/60 border border-border/20 group-hover:border-primary/30'
                          }`}>
                            {game?.image_url ? (
                              <img src={game.image_url} alt={game.title} className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105 duration-300" />
                            ) : (
                              <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">?</div>
                            )}
                          </div>
                          <div className="min-w-0 text-left space-y-1">
                            <span className="font-extrabold text-sm block text-foreground truncate group-hover:text-primary transition-colors">{meetup.title}</span>
                            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1">
                              <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                {new Date(meetup.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              
                              {/* Winner Badge */}
                              {isWinner && (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/15 border-amber-500/10 py-0.2 px-1.5 text-[9px] font-black tracking-wide rounded-full flex items-center gap-0.5">
                                  <Award className="w-2.5 h-2.5 fill-current" /> GANADO
                                </Badge>
                              )}

                              {/* No attendance badge */}
                              {!didAttend && (
                                <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/15 border-destructive/10 py-0.2 px-1.5 text-[9px] font-black tracking-wide rounded-full">
                                  AUSENTE
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  )
                })
              )}
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
export default ProfilePage;
