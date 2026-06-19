import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { supabase } from '../lib/supabaseClient'
import { Meetup, UserProfile, Game } from '../types'
import { getMockMeetupsForList } from '../lib/mockData'
import { getGameTitle } from '../lib/gameLocale'
import { Button } from '../components/ui/button'
import { Tabs } from '../components/ui/tabs'
import { USE_MOCKS } from '../lib/config'
import { Card, CardContent } from '../components/ui/card'
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal'
import { PremiumDeactivateModal } from '../components/PremiumDeactivateModal'
import { toPng } from 'html-to-image'
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
  Dices,
  Swords,
  Trash2,
  ListOrdered,
  Download,
  Sparkles,
  X,
  Plus,
  Info,
  Edit,
  User,
  Camera
} from 'lucide-react'
import imageCompression from 'browser-image-compression'

import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Tag } from '../components/ui/tag'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

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

const MOCK_RANKINGS: Record<string, any[]> = {
  'mock-u1': [
    {
      id: 'mock-r1',
      user_id: 'mock-u1',
      title: 'Mis Euros Favoritos',
      mode: 'tier',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      data: {
        tiers: [
          { id: 'S', name: 'S', color: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white', textColor: 'text-white', games: [
            { bgg_id: 224517, title: 'Brass: Birmingham', year_published: 2018, image_url: 'https://cf.geekdo-images.com/x3zxztFbRYCgssNZ55ZMnw__micro/img/QDuQwi75tL54enp_8_93K3s97d0=/fit-in/64x64/filters:strip_icc()/pic3490053.jpg' }
          ] },
          { id: 'A', name: 'A', color: 'bg-gradient-to-br from-orange-500 to-amber-500 text-white', textColor: 'text-white', games: [
            { bgg_id: 167791, title: 'Terraforming Mars', year_published: 2016, image_url: 'https://cf.geekdo-images.com/yLZJCDgC7y0uJUWSpFd58A__micro/img/z7A4g4dG6NqH2fT0zJc2j6m9V-g=/fit-in/64x64/filters:strip_icc()/pic3536616.png' }
          ] },
          { id: 'B', name: 'B', color: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white', textColor: 'text-white', games: [] },
          { id: 'C', name: 'C', color: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white', textColor: 'text-white', games: [] },
          { id: 'D', name: 'D', color: 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white', textColor: 'text-white', games: [] },
        ],
        top10: [],
        selectedBg: 'cyberpunk',
        aspectRatio: 'standard'
      }
    }
  ]
}

const BACKGROUNDS: Record<string, string> = {
  default: 'from-[#141b29] via-[#0e121b] to-[#0a362e]',
  sunset: 'from-indigo-950 via-purple-950 to-pink-900',
  cyberpunk: 'from-slate-950 via-violet-950 to-indigo-900',
  ocean: 'from-slate-950 via-sky-950 to-cyan-900',
  volcanic: 'from-stone-950 via-stone-900 to-red-950',
  'midnight-gold': 'from-zinc-950 via-zinc-900 to-amber-950',
  minimal: 'from-zinc-950 via-zinc-900 to-zinc-950',
};

const GLOWS: Record<string, { g1: string; g2: string; g3: string }> = {
  default: {
    g1: 'from-primary/20 to-teal-600/20',
    g2: 'from-teal-500/20 to-emerald-600/20',
    g3: 'bg-primary/10'
  },
  sunset: {
    g1: 'from-pink-500/10 to-transparent',
    g2: 'from-purple-500/10 to-transparent',
    g3: 'bg-pink-500/5'
  },
  cyberpunk: {
    g1: 'from-fuchsia-500/10 to-transparent',
    g2: 'from-violet-500/10 to-transparent',
    g3: 'bg-fuchsia-500/5'
  },
  ocean: {
    g1: 'from-sky-500/15 to-transparent',
    g2: 'from-blue-500/10 to-transparent',
    g3: 'bg-cyan-500/5'
  },
  volcanic: {
    g1: 'from-red-500/10 to-transparent',
    g2: 'from-orange-650/10 to-transparent',
    g3: 'bg-red-500/5'
  },
  'midnight-gold': {
    g1: 'from-amber-500/10 to-transparent',
    g2: 'from-yellow-600/10 to-transparent',
    g3: 'bg-amber-500/5'
  },
  minimal: {
    g1: 'from-white/5 to-transparent',
    g2: 'from-white/5 to-transparent',
    g3: 'bg-white/5'
  }
};

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
  const [searchParams] = useSearchParams()
  const rankingIdParam = searchParams.get('ranking')

  const profileId = id || user?.id || ''
  const isOwnProfile = profileId === user?.id
  const isOwnProfileEditable = isOwnProfile || (USE_MOCKS && profileId.startsWith('mock-'))

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [editError, setEditError] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)

  const handleOpenEdit = () => {
    if (!profile) return
    setEditUsername(profile.username || '')
    setEditCity(profile.city || '')
    setEditAvatarUrl(profile.avatar_url || '')
    setEditError('')
    setIsEditing(true)
  }

  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9)
    setEditAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setEditError('')

    try {
      // 1. Process image compression using browser-image-compression
      const options = {
        maxSizeMB: 0.1, // ~100KB maximum size
        maxWidthOrHeight: 256, // limit width/height to 256px
        useWebWorker: true,
      }
      
      const compressedFile = await imageCompression(file, options)

      const isMock = USE_MOCKS && profileId.startsWith('mock-')

      if (isMock) {
        // Mock Mode: Convert to Base64
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setEditAvatarUrl(reader.result)
          }
          setUploadingFile(false)
        }
        reader.onerror = () => {
          setEditError('Error al procesar el archivo en modo de demostración.')
          setUploadingFile(false)
        }
        reader.readAsDataURL(compressedFile)
      } else {
        // Real Mode: Upload to Supabase Storage with local Base64 fallback
        try {
          if (!user) throw new Error('Usuario no autenticado.')
          
          const fileExt = file.name.split('.').pop() || 'png'
          const filePath = `public/${user.id}/${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, compressedFile, {
              upsert: true,
              contentType: compressedFile.type || 'image/png'
            })

          if (uploadError) throw uploadError

          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

          if (!data?.publicUrl) throw new Error('No se pudo obtener la URL pública del avatar.')

          setEditAvatarUrl(data.publicUrl)
          setUploadingFile(false)
        } catch (err: any) {
          console.warn('Fallo en la subida a Supabase Storage, aplicando fallback a Base64:', err)
          // Fallback to Base64 direct storage in database if bucket fails or isn't set up
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setEditAvatarUrl(reader.result)
            }
            setUploadingFile(false)
          }
          reader.onerror = () => {
            setEditError('Error al convertir el avatar a Base64.')
            setUploadingFile(false)
          }
          reader.readAsDataURL(compressedFile)
        }
      }
    } catch (err: any) {
      console.error('Error al procesar la imagen:', err)
      setEditError(err.message || 'Error al comprimir o procesar la imagen.')
      setUploadingFile(false)
    }
  }


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUsername.trim() || !profile) return
    setSavingProfile(true)
    setEditError('')

    const isMock = USE_MOCKS && profileId.startsWith('mock-')

    if (isMock) {
      setTimeout(() => {
        const updated: UserProfile = {
          ...profile,
          username: editUsername.trim(),
          city: editCity.trim() || null,
          avatar_url: editAvatarUrl.trim() || null
        }
        setProfile(updated)
        localStorage.setItem(`boardgame_social_mock_profile_${profileId}`, JSON.stringify(updated))
        MOCK_PROFILES[profileId] = updated
        window.dispatchEvent(new Event('profile_update'))
        setSavingProfile(false)
        setIsEditing(false)
      }, 600)
    } else {
      try {
        if (!user) throw new Error('Usuario no autenticado.')

        const { error: dbError } = await supabase
          .from('users')
          .update({
            username: editUsername.trim(),
            city: editCity.trim() || null,
            avatar_url: editAvatarUrl.trim() || null
          })
          .eq('id', user.id)

        if (dbError) throw dbError

        const { error: authError } = await supabase.auth.updateUser({
          data: {
            username: editUsername.trim(),
            avatar_url: editAvatarUrl.trim() || null
          }
        })

        if (authError) throw authError

        const updated: UserProfile = {
          ...profile,
          username: editUsername.trim(),
          city: editCity.trim() || null,
          avatar_url: editAvatarUrl.trim() || null
        }
        setProfile(updated)
        window.dispatchEvent(new Event('profile_update'))
        setIsEditing(false)
      } catch (err: any) {
        console.error('Error updating profile:', err)
        setEditError(err.message || 'Error al guardar los cambios de perfil.')
      } finally {
        setSavingProfile(false)
      }
    }
  }
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [meetups, setMeetups] = useState<Meetup[]>([])
  const [stats, setStats] = useState<UserStats>({ played: 0, won: 0, winRate: 0, karma: 100, missed: 0 })
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'rankings'>('upcoming')

  // Saved Rankings State
  const [savedRankings, setSavedRankings] = useState<any[]>([])
  const [loadingRankings, setLoadingRankings] = useState(true)
  const [selectedRanking, setSelectedRanking] = useState<any | null>(null)
  const [exportingRanking, setExportingRanking] = useState(false)
  const exportModalRef = useRef<HTMLDivElement>(null)
  const [showXpHelp, setShowXpHelp] = useState(false)
  const [activeAchId, setActiveAchId] = useState<string>('host')
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)

  useEffect(() => {
    if (rankingIdParam && savedRankings.length > 0) {
      const found = savedRankings.find(r => r.id === rankingIdParam)
      if (found) {
        setSelectedRanking(found)
      }
    }
  }, [rankingIdParam, savedRankings])

  useEffect(() => {
    async function loadProfileData() {
      if (!profileId) {
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMsg('')

      const isMock = USE_MOCKS && profileId.startsWith('mock-')

      // 1. Fetch Rankings (Supabase with LocalStorage fallback)
      setLoadingRankings(true)
      if (isMock) {
        setSavedRankings(MOCK_RANKINGS[profileId] || [])
        setLoadingRankings(false)
      } else {
        try {
          const { data: rankData, error: rankError } = await supabase
            .from('user_rankings')
            .select('*')
            .eq('user_id', profileId)
            .order('created_at', { ascending: false })

          if (rankError) throw rankError
          setSavedRankings(rankData || [])
        } catch (err) {
          console.warn("Error querying user_rankings from Supabase, loading from localStorage:", err)
          const localKey = `boardgame_social_saved_rankings_${profileId}`
          const localStr = localStorage.getItem(localKey)
          if (localStr) {
            try {
              setSavedRankings(JSON.parse(localStr))
            } catch {
              setSavedRankings([])
            }
          } else {
            setSavedRankings([])
          }
        } finally {
          setLoadingRankings(false)
        }
      }

      // 2. Fetch User Profile and Meetups
      if (isMock) {
        const localMockStr = localStorage.getItem(`boardgame_social_mock_profile_${profileId}`)
        let mockProf = localMockStr ? JSON.parse(localMockStr) : MOCK_PROFILES[profileId]
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
            .select('*, meetup_games(game_id, winner_user_id, winner_guest_id, games(*)), users:users!meetups_creator_id_fkey(*)')
            .contains('joined_players', [profileId])

          if (meetupsError) throw meetupsError
          
          const formatted = (meetupsData || []).map((m: any) => {
            const mg = m.meetup_games || []
            const mGames = mg.map((item: any) => {
              if (!item.games) return null
              return {
                ...item.games,
                winner_user_id: item.winner_user_id,
                winner_guest_id: item.winner_guest_id
              }
            }).filter(Boolean) as Game[]
            return {
              ...m,
              games: mGames
            }
          })
          
          setMeetups(formatted as Meetup[])
          calculateStats(formatted as Meetup[], profileId)
        } catch (err: any) {
          console.error("Error loading profile:", err)
          setErrorMsg(err.message || 'Error al obtener el perfil de usuario.')
        } finally {
          setLoading(false)
        }
      }
    }

    loadProfileData()

    const handleProfileUpdate = () => {
      loadProfileData()
    }
    window.addEventListener('profile_update', handleProfileUpdate)
    return () => {
      window.removeEventListener('profile_update', handleProfileUpdate)
    }
  }, [profileId])

  const calculateStats = (userMeetups: Meetup[], userId: string) => {
    const completed = userMeetups.filter(m => m.completed)
    const attended = completed.filter(m => m.attended_players?.includes(userId))
    const missed = completed.filter(m => !m.attended_players?.includes(userId))

    let totalPlayedGames = 0
    let totalWonGames = 0

    attended.forEach(m => {
      const games = m.games || []
      if (games.length === 0) {
        totalPlayedGames += 1
        // No per-game winner data for this meetup — skip win tracking
      } else {
        totalPlayedGames += games.length
        games.forEach(g => {
          if (g.winner_user_id === userId) {
            totalWonGames += 1
          }
        })
      }
    })

    const winRate = totalPlayedGames > 0 ? Math.round((totalWonGames / totalPlayedGames) * 100) : 0
    const karma = completed.length > 0 ? Math.round((attended.length / completed.length) * 100) : 100

    setStats({
      played: totalPlayedGames,
      won: totalWonGames,
      winRate,
      karma,
      missed: missed.length
    })
  }

  // Handle delete ranking
  const handleDeleteRanking = async (e: React.MouseEvent, rankingId: string) => {
    e.stopPropagation()
    e.preventDefault()

    if (!confirm('¿Estás seguro de que quieres eliminar este ranking de tu perfil?')) return

    try {
      // 1. Supabase delete attempt (RLS secures only owner can delete)
      const { error } = await supabase
        .from('user_rankings')
        .delete()
        .eq('id', rankingId)

      if (error) console.warn("Supabase delete failed, relying on localStorage fallback delete:", error)

      // 2. LocalStorage delete fallback
      const localKey = `boardgame_social_saved_rankings_${profileId}`
      const localStr = localStorage.getItem(localKey)
      if (localStr) {
        try {
          const list = JSON.parse(localStr) as any[]
          const updated = list.filter(item => item.id !== rankingId)
          localStorage.setItem(localKey, JSON.stringify(updated))
        } catch (err) {
          console.error("Error updating localStorage list:", err)
        }
      }

      setSavedRankings(prev => prev.filter(r => r.id !== rankingId))
    } catch (err) {
      console.error("Error deleting ranking:", err)
    }
  }

  // Export Modal as Image
  const handleExportModalImage = async () => {
    if (!exportModalRef.current || !selectedRanking) return
    setExportingRanking(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 180))

      const dataUrl = await toPng(exportModalRef.current, {
        quality: 0.95,
        pixelRatio: 3,
        backgroundColor: '#030712',
        cacheBust: true,
        includeQueryParams: true,
        style: {
          margin: '0',
          transform: 'none',
        },
      })

      const filename = `${selectedRanking.title.replace(/\s+/g, '-').toLowerCase() || 'ranking'}.png`
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Error exporting image from modal:", err)
    } finally {
      setExportingRanking(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando escaparate de jugador...</p>
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

  const upcomingMeetups = meetups.filter(m => !m.completed && new Date(m.date).getTime() >= Date.now())
  const completedMeetups = meetups.filter(m => m.completed || new Date(m.date).getTime() < Date.now())
  const organizedCount = meetups.filter(m => m.creator_id === profileId).length

  // Gamer Progression Level Formulas
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

  // Achievements calculation
  const achievements = [
    {
      id: 'host',
      name: 'Gran Anfitrión',
      description: 'Organiza al menos 3 partidas en el tablero.',
      icon: Crown,
      color: 'from-amber-400 to-yellow-600 shadow-amber-500/20 text-amber-400',
      unlocked: organizedCount >= 3,
      value: `${organizedCount}/3`
    },
    {
      id: 'winner',
      name: 'Espada de Victoria',
      description: 'Gana al menos una partida registrada.',
      icon: Swords,
      color: 'from-rose-500 to-red-600 shadow-rose-500/20 text-rose-400',
      unlocked: stats.won >= 1,
      value: `${stats.won} vic`
    },
    {
      id: 'veteran',
      name: 'Veterano Lúdico',
      description: 'Completa al menos 5 partidas jugadas.',
      icon: Award,
      color: 'from-violet-500 to-indigo-600 shadow-violet-500/20 text-violet-400',
      unlocked: stats.played >= 5,
      value: `${stats.played}/5`
    },
    {
      id: 'reliable',
      name: 'Karma de Acero',
      description: 'Mantén una asistencia impecable (Karma >= 90%) con al menos 2 partidas.',
      icon: UserCheck,
      color: 'from-emerald-400 to-teal-600 shadow-emerald-500/20 text-emerald-400',
      unlocked: stats.karma >= 90 && stats.played >= 2,
      value: `${stats.karma}%`
    },
    {
      id: 'critic',
      name: 'Crítico del Tablero',
      description: 'Crea y guarda al menos un ranking personalizado en tu perfil.',
      icon: Sparkles,
      color: 'from-cyan-400 to-blue-600 shadow-cyan-500/20 text-cyan-400',
      unlocked: savedRankings.length >= 1,
      value: `${savedRankings.length}/1`
    }
  ]

  const getKarmaInfo = (val: number) => {
    if (val >= 90) return { color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10', circleColor: 'text-emerald-500', label: 'Confiable' }
    if (val >= 70) return { color: 'text-amber-500 border-amber-500/20 bg-amber-500/10', circleColor: 'text-amber-500', label: 'Frecuente' }
    return { color: 'text-destructive border-destructive/20 bg-destructive/10', circleColor: 'text-destructive', label: 'Ausente habitual' }
  }

  const karmaInfo = getKarmaInfo(stats.karma)

  return (
    <section className="space-y-6 max-w-xl mx-auto p-0 pb-6 md:p-4 md:pb-24 relative">
      
      {/* Header bar (sticky on mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-2 -mx-4 px-4 md:-mx-8 md:px-8 bg-background/85 backdrop-blur-md border-b border-border/20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="rounded-xl flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 border border-border/20 hover:bg-muted/50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Atrás
        </Button>
        <div className="flex items-center gap-2">
          {isOwnProfileEditable && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenEdit}
              className="rounded-xl flex items-center gap-1.5 font-bold text-xs h-9 border border-border/20 hover:bg-muted/50 cursor-pointer text-foreground"
            >
              <Edit className="w-3.5 h-3.5 text-primary" /> Editar Datos
            </Button>
          )}
          {isOwnProfile ? (
            <span className="text-[10px] font-black text-primary uppercase bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-wider">
              Tu Escaparate
            </span>
          ) : (
            <span className="text-[10px] font-black text-muted-foreground uppercase bg-muted border border-border/40 px-3 py-1 rounded-full tracking-wider">
              Escaparate de Jugador
            </span>
          )}
        </div>
      </div>

      {/* Showcase Profile Card with premium gaming card aesthetic */}
      <Card className="border-border/30 bg-card shadow-2xl overflow-hidden rounded-3xl relative">
        {/* Sleek retro-futuristic backdrop glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-primary/15 to-violet-500/5 rounded-full blur-[80px] -z-10" />
        <div className="absolute top-10 left-10 w-28 h-28 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full blur-[60px] -z-10" />

        {/* Banner backdrop */}
        <div className="h-32 bg-gradient-to-r from-primary/30 via-[#260f38]/20 to-[#0e271a]/30 border-b border-white/5 relative overflow-hidden">
        </div>
        
        <CardContent className="p-4 pb-6 sm:p-6 sm:pb-6 relative flex flex-col items-center sm:items-start sm:flex-row gap-5">
          {/* Avatar container overlapping banner with dynamic colored status ring */}
          <div className="relative -mt-16 z-10 shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400 via-primary to-emerald-400 opacity-80 animate-spin [animation-duration:15s]" />
            <Avatar className="w-28 h-28 border-[6px] border-card relative z-10 shadow-xl">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-violet-500/10 text-primary text-3xl font-black">
                {profile.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 z-20 bg-primary border-4 border-card text-white text-[11px] font-black rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
              {playerLevel}
            </div>
          </div>
          
          <div className="pt-2 sm:pt-4 space-y-3 text-center sm:text-left flex-1 min-w-0 w-full">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground truncate flex items-center justify-center sm:justify-start gap-2">
                {profile.username}
                {profile.is_premium ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Tag variant="default" className="shrink-0">
                      <Crown className="w-3 h-3 shrink-0" /> PRO
                    </Tag>
                    {isOwnProfileEditable && (
                      <>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setIsDeactivateModalOpen(true)}
                          className="h-auto p-0 text-[10px] font-extrabold text-muted-foreground hover:text-destructive cursor-pointer hover:no-underline"
                        >
                          (Desactivar)
                        </Button>
                        <PremiumDeactivateModal
                          isOpen={isDeactivateModalOpen}
                          onClose={() => setIsDeactivateModalOpen(false)}
                          onSuccess={() => {
                            setProfile(prev => prev ? { ...prev, is_premium: false } : null)
                          }}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  isOwnProfileEditable && (
                    <>
                      <Button
                        variant="premium"
                        size="sm"
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="h-7 rounded-full shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors animate-pulse"
                      >
                        <Crown className="w-3.5 h-3.5" /> Obtener PRO
                      </Button>
                      <PremiumUpgradeModal 
                        isOpen={isUpgradeModalOpen}
                        onClose={() => setIsUpgradeModalOpen(false)}
                        onSuccess={() => {
                          setProfile(prev => prev ? { ...prev, is_premium: true } : null)
                        }}
                      />
                    </>
                  )
                )}
              </h2>
              <span className="text-xs font-extrabold text-primary block mt-0.5 tracking-wider uppercase">
                {playerTitle}
              </span>
            </div>

            {/* Experience Bar layout */}
            <div className="space-y-1.5 w-full bg-muted/40 p-2.5 rounded-xl border border-border/20 relative">
              <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  Experiencia del Jugador
                  <button 
                    type="button"
                    onClick={() => setShowXpHelp(!showXpHelp)}
                    className="p-0.5 rounded hover:bg-muted text-primary transition-colors cursor-pointer"
                    title="¿Cómo conseguir XP?"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </span>
                <span className="text-foreground font-black">{xpCurrent} / {xpRange} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-background border border-border/30 overflow-hidden relative">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-primary via-violet-500 to-indigo-500 transition-all duration-1000 ease-out"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-[8.5px] text-muted-foreground/80 block leading-none font-semibold">
                ¡Total acumulado de {totalXp} XP de partidas, victorias y tops!
              </span>

              <AnimatePresence>
                {showXpHelp && (
                  <MotionDiv
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border/10 mt-1.5 pt-1.5"
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] text-zinc-300 font-extrabold select-none">
                      <div className="flex items-center justify-between">
                        <span>🎲 Partida Jugada:</span>
                        <span className="text-emerald-400 font-black">+100 XP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>⚔️ Victoria:</span>
                        <span className="text-rose-400 font-black">+250 XP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>👑 Partida Master:</span>
                        <span className="text-amber-400 font-black">+150 XP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>✨ Ranking Creado:</span>
                        <span className="text-cyan-400 font-black">+200 XP</span>
                      </div>
                    </div>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs font-bold pt-0.5">
              {profile.city && (
                <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg border border-border/40 text-foreground/80 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-lg border border-border/40 text-foreground/80 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> {(() => {
                  const dStr = new Date(profile.created_at || Date.now()).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                  return dStr.charAt(0).toUpperCase() + dStr.slice(1);
                })()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamified Achievements Grid & Details card layout */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
          <Award className="w-4 h-4 text-primary" /> Vitrina de Logros
        </h3>
        <div className="grid grid-cols-5 gap-2.5">
          {achievements.map((ach) => {
            const Icon = ach.icon
            const isActive = activeAchId === ach.id
            return (
              <div 
                key={ach.id} 
                onClick={() => setActiveAchId(ach.id)}
                onMouseEnter={() => setActiveAchId(ach.id)}
                className="flex flex-col items-center select-none cursor-pointer"
              >
                {/* Achievement Badge Container */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                  ach.unlocked 
                    ? `bg-gradient-to-br bg-background/80 shadow-md ${ach.color} ${
                        isActive ? 'ring-2 ring-primary border-primary/40 scale-105' : 'border-white/10 hover:scale-105'
                      }`
                    : `bg-zinc-950/30 border-dashed border-border/40 opacity-40 filter grayscale ${
                        isActive ? 'ring-2 ring-muted border-muted-foreground/40 scale-105' : ''
                      }`
                }`}>
                  <Icon className={`w-6 h-6 ${ach.unlocked ? '' : 'text-zinc-500'}`} />
                </div>
                
                {/* Mini label below */}
                <span className={`text-[8px] font-extrabold uppercase tracking-wide mt-1.5 text-center truncate w-full ${
                  ach.unlocked 
                    ? isActive ? 'text-primary font-black' : 'text-foreground font-black'
                    : 'text-zinc-500'
                }`}>
                  {ach.unlocked ? ach.name : 'Bloqueado'}
                </span>
                
                <span className="text-[7.5px] font-semibold text-muted-foreground/80 scale-90">
                  {ach.value}
                </span>
              </div>
            )
          })}
        </div>

        {/* Selected Achievement Detail Sub-card (Clean Mobile tooltips replacement) */}
        {(() => {
          const activeAch = achievements.find(a => a.id === activeAchId) || achievements[0]
          if (!activeAch) return null

          return (
            <AnimatePresence mode="wait">
              <MotionDiv
                key={activeAch.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="p-3.5 rounded-2xl border bg-muted/20 border-border/30 text-left relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9.5px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    {activeAch.unlocked ? '🏆 Logro Desbloqueado' : '🔒 Logro Bloqueado'}
                  </span>
                  <span className={`text-[9px] font-black uppercase bg-muted px-2 py-0.5 rounded border border-border/40 ${
                    activeAch.unlocked ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {activeAch.value}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-foreground mt-1">{activeAch.name}</h4>
                <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{activeAch.description}</p>
              </MotionDiv>
            </AnimatePresence>
          )
        })()}
      </div>

      {/* Stats Dashboard Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Win Rate Card */}
        <Card className="border-border/30 bg-card/65 backdrop-blur-3xl shadow-lg relative overflow-hidden group rounded-2xl hover:border-rose-500/30 hover:shadow-rose-500/5 transition-all duration-300">
          <div className="absolute -right-3 -bottom-5 opacity-10 dark:opacity-[0.06] group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none">
            <Swords className="w-28 h-28 text-rose-500 stroke-[1.25] rotate-12" />
          </div>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Tasa de Victoria</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-foreground">{stats.winRate}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold leading-normal truncate">
                {stats.won} victorias de {stats.played} partidas
              </p>
            </div>
            
            <div className="drop-shadow-[0_0_8px_rgba(244,63,94,0.25)] shrink-0">
              <CircularProgress 
                value={stats.winRate} 
                colorClass="text-rose-500" 
                size={64}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="border-border/30 bg-card/65 backdrop-blur-3xl shadow-lg relative overflow-hidden group rounded-2xl hover:border-emerald-500/30 hover:shadow-emerald-500/5 transition-all duration-300">
          <div className="absolute -right-3 -bottom-5 opacity-10 dark:opacity-[0.06] group-hover:scale-110 group-hover:opacity-15 transition-all duration-500 pointer-events-none">
            <Dices className="w-28 h-28 text-emerald-500 stroke-[1.25] -rotate-12" />
          </div>
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4 relative z-10">
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

      <Tabs
        options={[
          { id: 'upcoming', label: 'Próximas', icon: CalendarDays, count: upcomingMeetups.length },
          { id: 'completed', label: 'Historial', icon: History, count: completedMeetups.length },
          { id: 'rankings', label: 'Rankings', icon: ListOrdered, count: savedRankings.length }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tabs Content Sections */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' && (
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
                  <p className="text-sm font-bold text-muted-foreground">No hay partidas programadas.</p>
                  {isOwnProfile && <p className="text-xs text-muted-foreground/80 mt-1">Busca mesas abiertas en el tablero para unerte.</p>}
                </div>
              ) : (
                upcomingMeetups.map(meetup => {
                  const gamesList = Array.isArray(meetup.games) ? meetup.games : (meetup.games ? [meetup.games] : [])
                  const mainGame = gamesList[0] || null

                  return (
                    <Link key={meetup.id} to={`/tablero/${meetup.id}`}>
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/45 hover:bg-muted/40 hover:border-primary/20 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-12 h-12 shrink-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-background/60 border border-border/20 p-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 group-hover:border-primary/30 transition-all duration-300">
                              {mainGame?.image_url ? (
                                <img src={mainGame.image_url} alt={mainGame.title} className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105 duration-300" />
                              ) : (
                                <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">?</div>
                              )}
                            </div>
                            {gamesList.length > 1 && (
                              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-md border border-background shadow-sm z-10 select-none">
                                +{gamesList.length - 1}
                              </div>
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
          )}

          {activeTab === 'completed' && (
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
                  <p className="text-sm font-bold text-muted-foreground">Aún no hay partidas completadas en el historial.</p>
                </div>
              ) : (
                completedMeetups.map(meetup => {
                  const gamesList = Array.isArray(meetup.games) ? meetup.games : (meetup.games ? [meetup.games] : [])
                  const mainGame = gamesList[0] || null
                  const isWinner = gamesList.some(g => g.winner_user_id === profileId)
                  const didAttend = meetup.attended_players?.includes(profileId)

                  return (
                    <Link key={meetup.id} to={`/tablero/${meetup.id}`}>
                      <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md group ${
                        isWinner 
                          ? 'border-rose-500/25 bg-rose-500/[0.02] hover:bg-rose-500/[0.04] hover:border-rose-500/40' 
                          : !didAttend 
                            ? 'border-destructive/25 bg-destructive/[0.01] opacity-70 hover:opacity-100 hover:bg-destructive/[0.03]'
                            : 'border-border/40 bg-card/45 hover:bg-muted/40 hover:border-primary/20'
                      }`}>
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative w-12 h-12 shrink-0">
                            <div className={`w-12 h-12 rounded-xl shrink-0 overflow-hidden p-1 flex items-center justify-center transition-all duration-300 ${
                              isWinner 
                                ? 'bg-rose-500/10 border border-rose-500/20 group-hover:border-rose-500/40' 
                                : 'bg-background/60 border border-border/20 group-hover:border-primary/30'
                            }`}>
                              {mainGame?.image_url ? (
                                <img src={mainGame.image_url} alt={mainGame.title} className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105 duration-300" />
                              ) : (
                                <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center text-xs font-black text-muted-foreground">?</div>
                              )}
                            </div>
                            {gamesList.length > 1 && (
                              <div className={`absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-md border shadow-sm z-10 select-none ${
                                isWinner
                                  ? 'bg-rose-500 text-rose-foreground border-rose-950'
                                  : 'bg-primary text-primary-foreground border-background'
                              }`}>
                                +{gamesList.length - 1}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 text-left space-y-1">
                            <span className="font-extrabold text-sm block text-foreground truncate group-hover:text-primary transition-colors">{meetup.title}</span>
                            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1">
                              <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                {new Date(meetup.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              
                              {/* Winner Badge using Swords Icon */}
                              {isWinner && (
                                <Badge variant="destructive" className="flex items-center gap-0.5 shrink-0">
                                  <Swords className="w-2.5 h-2.5 fill-current" /> GANADO
                                </Badge>
                              )}

                              {/* Pending Closure warning badges */}
                              {!meetup.completed && new Date(meetup.date).getTime() < Date.now() && (
                                meetup.creator_id === user?.id ? (
                                  <Badge variant="warning" pulse className="shrink-0">
                                    ⚠️ PENDIENTE DE CIERRE
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="shrink-0">
                                    ⏳ Pendiente de reporte
                                  </Badge>
                                )
                              )}

                              {/* No attendance badge */}
                              {meetup.completed && !didAttend && (
                                <Badge variant="destructive" className="shrink-0">
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

          {activeTab === 'rankings' && (
            <MotionDiv
              key="rankings-tab"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {loadingRankings ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>Obteniendo rankings creados...</span>
                </div>
              ) : savedRankings.length === 0 ? (
                <div className="text-center py-12 px-4 bg-muted/10 rounded-2xl border border-dashed border-border/40">
                  <p className="text-sm font-bold text-muted-foreground">No hay rankings guardados en este perfil.</p>
                  {isOwnProfile && (
                    <div className="mt-3">
                      <Link to="/tops">
                        <Button size="sm" className="rounded-xl text-xs font-bold gap-1">
                          <Plus className="w-3.5 h-3.5" /> Crear Ranking
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                savedRankings.map((ranking) => {
                  const mode = ranking.mode

                  return (
                    <div 
                      key={ranking.id} 
                      onClick={() => setSelectedRanking(ranking)}
                      className="p-4 rounded-2xl border border-border/40 bg-card/45 hover:bg-muted/40 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group text-left"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                        <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{ranking.title || 'Ranking sin título'}</span>
                          <Badge variant="primary-soft" className="shrink-0">
                            {mode === 'tier' ? 'Tier List' : 'Top 10'}
                          </Badge>
                        </h4>
                        
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold">
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>Guardado el {new Date(ranking.created_at || Date.now()).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1">
                          {isOwnProfile && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => handleDeleteRanking(e, ranking.id)}
                              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Eliminar ranking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </MotionDiv>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Visualizer Modal (Reconstructing TopsCanvas view) */}
      <AnimatePresence>
        {selectedRanking && (() => {
          const rData = selectedRanking.data || {}
          const mode = selectedRanking.mode
          const bgClass = BACKGROUNDS[rData.selectedBg] || BACKGROUNDS.default;
          const glow = GLOWS[rData.selectedBg] || GLOWS.default;
          const effectiveAspectRatio = exportingRanking ? rData.aspectRatio : 'standard';
          const isLandscape = effectiveAspectRatio === 'landscape';

          // Set aspect classes dynamically
          let aspectClass = "min-h-[350px] w-full p-5 text-sm";
          if (effectiveAspectRatio === 'square') {
            aspectClass = "w-full max-w-[480px] aspect-square p-5 mx-auto justify-between";
          } else if (effectiveAspectRatio === 'story') {
            aspectClass = "w-full max-w-[340px] aspect-[9/16] p-6 mx-auto justify-between";
          } else if (effectiveAspectRatio === 'landscape') {
            aspectClass = "w-full max-w-[750px] aspect-[16/9] p-4 mx-auto justify-between text-xs";
          }

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
              <MotionDiv 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0b0f19] border-0 lg:border border-white/10 rounded-none lg:rounded-2xl max-w-3xl w-full h-full lg:h-auto overflow-hidden shadow-2xl flex flex-col max-h-screen lg:max-h-[95vh]"
              >
                {/* Modal Header bar */}
                <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] lg:pt-4 border-b border-white/5 flex justify-between items-center bg-zinc-950/60 z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <h3 className="font-extrabold text-sm text-white truncate max-w-xs sm:max-w-md">
                      Escaparate: {selectedRanking.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleExportModalImage}
                      disabled={exportingRanking}
                      className="font-bold text-xs h-8 px-2 sm:px-3 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      {exportingRanking ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                          <span className="hidden sm:inline">Generando...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden sm:inline">Guardar Foto</span>
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedRanking(null)}
                      className="h-8 w-8 p-0 rounded-xl border border-white/10 hover:bg-white/10 text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Printable container view */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:pb-6 flex justify-center items-center bg-[#070b13]/85 custom-scrollbar min-h-0">
                  <div 
                    ref={exportModalRef} 
                    className={`border border-white/10 rounded-2xl bg-gradient-to-br ${bgClass} shadow-2xl relative overflow-hidden flex flex-col justify-between select-none ${aspectClass}`}
                  >
                    {/* Ambient Glow nodes inside print card */}
                    <div className={`absolute top-0 right-0 w-[60%] h-[50%] bg-gradient-to-br ${glow.g1} rounded-full blur-[70px] -z-10 pointer-events-none`} />
                    <div className={`absolute bottom-0 left-0 w-[60%] h-[50%] bg-gradient-to-tr ${glow.g2} rounded-full blur-[70px] -z-10 pointer-events-none`} />
                    <div className={`absolute top-[35%] left-[25%] w-[35%] h-[35%] ${glow.g3} rounded-full blur-[70px] -z-10 pointer-events-none`} />

                    {/* Branding text inside printed graphic */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-4 border-b border-white/5 pb-2.5">
                      <h3 className={`font-black text-white px-1 leading-snug truncate w-full flex-1 ${isLandscape ? 'text-xs' : 'text-sm sm:text-base'}`}>
                        {selectedRanking.title}
                      </h3>
                      <span className="text-[8.5px] sm:text-[9.5px] font-black text-primary uppercase tracking-widest flex items-center gap-1 select-none self-end sm:self-auto px-1">
                        <Sparkles className="w-2.5 h-2.5" /> boardgamesocial.app
                      </span>
                    </div>

                    {/* Content Area Rendering list structure details */}
                    <div className="flex-1 mt-3">
                      {mode === 'tier' ? (
                        <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 bg-zinc-900/90 shadow-lg">
                          {Array.isArray(rData.tiers) && rData.tiers.map((tier: any) => (
                            <div key={tier.id} className={`flex ${isLandscape ? 'min-h-[44px]' : 'min-h-[76px]'}`}>
                              <div className={`flex items-center justify-center font-extrabold text-center select-none ${tier.color} text-white shrink-0 ${
                                isLandscape ? 'w-12 text-[10px] p-1' : 'w-16 sm:w-20 text-xs p-2'
                              }`}>
                                {tier.name}
                              </div>
                              <div className={`flex-1 flex flex-wrap items-center ${isLandscape ? 'p-1 gap-1' : 'p-2.5 gap-2'}`}>
                                {Array.isArray(tier.games) && tier.games.map((g: any) => (
                                  <div 
                                    key={g.bgg_id} 
                                    className={`relative rounded-lg overflow-hidden border border-white/10 shadow bg-zinc-950 shrink-0 ${
                                      isLandscape ? 'w-8 h-8' : 'w-12 h-12 sm:w-14 sm:h-14'
                                    }`}
                                  >
                                    {g.image_url ? (
                                      <img 
                                        src={`https://images.weserv.nl/?url=${encodeURIComponent(g.image_url)}&w=65&h=65&fit=cover`} 
                                        alt={g.title} 
                                        className="h-full w-full object-cover" 
                                        crossOrigin="anonymous"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center p-0.5 text-[8px] font-black text-center bg-black/60 text-white">
                                        {g.title}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`grid gap-1.5 ${isLandscape ? 'grid-cols-5' : 'grid-cols-1 sm:grid-cols-2'}`}>
                          {Array.isArray(rData.top10) && rData.top10.map((game: any, idx: number) => (
                            <div 
                              key={idx}
                              className={`flex items-center ${isLandscape ? 'gap-1.5 p-1' : 'gap-2.5 p-2'} rounded-xl border border-white/5 bg-white/5`}
                            >
                              <div className={`rounded-lg flex items-center justify-center font-extrabold border shrink-0 bg-primary/20 border-primary/35 text-primary ${
                                isLandscape ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs'
                              }`}>
                                {idx + 1}
                              </div>
                              {game ? (
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className={`rounded overflow-hidden border border-white/10 bg-zinc-950 shrink-0 relative flex items-center justify-center ${isLandscape ? 'w-6 h-6' : 'w-8 h-8'}`}>
                                    {game.image_url ? (
                                      <img 
                                        src={`https://images.weserv.nl/?url=${encodeURIComponent(game.image_url)}&w=40&h=40&fit=cover`} 
                                        alt={game.title} 
                                        className="w-full h-full object-cover" 
                                        crossOrigin="anonymous"
                                      />
                                    ) : (
                                      <span className="text-[7px] text-zinc-500 font-extrabold">{game.title.slice(0,2)}</span>
                                    )}
                                  </div>
                                  <span className="font-extrabold text-zinc-100 truncate text-[11px] sm:text-xs">
                                    {getGameTitle(game)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-zinc-650 font-bold italic">Vacante</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer watermark details inside canvas */}
                    <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[9px] text-zinc-400">
                      <span>Perfiles y Mesas Abiertas</span>
                      <span className="font-extrabold text-white">#BoardgameSocial</span>
                    </div>

                  </div>
                </div>
              </MotionDiv>
            </div>
          )
        })()}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border/50 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 relative space-y-4 text-left"
            >
              <div className="flex justify-between items-center pb-2 border-b border-border/20">
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Editar Perfil Lúdico
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-8 w-8 p-0 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {editError && (
                <div className="text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="edit-username" className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider">Nombre de Usuario</Label>
                  <Input
                    id="edit-username"
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="h-10 text-xs font-medium"
                    placeholder="Escribe tu username..."
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="edit-city" className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider">Ciudad</Label>
                  <Input
                    id="edit-city"
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="h-10 text-xs font-medium"
                    placeholder="Escribe tu ciudad..."
                  />
                </div>

                <div className="space-y-2 text-left">
                  <Label className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider block">Personalizar Avatar</Label>
                  <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border/20">
                    {/* Interactive Clickable Avatar Preview */}
                    <div 
                      onClick={() => !uploadingFile && document.getElementById('avatar-upload')?.click()}
                      className="relative w-14 h-14 rounded-full border-2 border-primary/30 shrink-0 overflow-hidden group cursor-pointer shadow-sm active:scale-95 transition-all"
                      title="Subir foto de perfil"
                    >
                      <Avatar className="w-full h-full">
                        <AvatarImage src={editAvatarUrl || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                          {editUsername.slice(0, 2).toUpperCase() || 'US'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      
                      {/* Loading state indicator */}
                      {uploadingFile && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <Input
                        type="text"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        className="h-9 text-[10px] font-medium"
                        placeholder="URL de imagen o semilla..."
                        disabled={uploadingFile}
                      />
                      <div className="flex flex-wrap gap-1.5">
                        <input 
                          type="file" 
                          id="avatar-upload" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange}
                          disabled={uploadingFile}
                        />
                        <Button
                          type="button"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          disabled={uploadingFile}
                          variant="secondary"
                          size="sm"
                          className="text-[10px] font-extrabold h-7 rounded-lg px-2 flex items-center gap-1 cursor-pointer"
                        >
                          {uploadingFile ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Camera className="w-3.5 h-3.5" />
                          )}
                          Subir Foto
                        </Button>
                        <Button
                          type="button"
                          onClick={handleRandomAvatar}
                          disabled={uploadingFile}
                          variant="secondary"
                          size="sm"
                          className="text-[10px] font-extrabold h-7 rounded-lg px-2 flex items-center gap-1 cursor-pointer"
                        >
                          <Dices className="w-3.5 h-3.5" /> Cambiar Semilla
                        </Button>
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-semibold block leading-normal mt-1">
                    Puedes subir una foto de tu dispositivo, pegar un enlace directo a tu imagen de perfil, o usar un avatar de Dicebear ingresando cualquier palabra (semilla).
                  </span>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    disabled={savingProfile || uploadingFile}
                    className="rounded-xl font-bold text-xs h-9 cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingProfile || uploadingFile || !editUsername.trim()}
                    className="rounded-xl font-bold text-xs h-9 px-4 cursor-pointer shadow-sm shadow-primary/25"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </div>
              </form>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>

    </section>
  )
}
export default ProfilePage;
