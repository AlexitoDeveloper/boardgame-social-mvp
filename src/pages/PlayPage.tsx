import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Dices, Users, Clock, Sparkles, MessageSquare, Plus, ArrowRight, Play, CheckCircle2, RotateCw, PackageCheck, Vote } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useAuth } from '../lib/authContext'
import { useGroups } from '../hooks/useGroups'
import { supabase } from '../lib/supabaseClient'
import { USE_MOCKS } from '../lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../lib/dateLocale'
import { ExpressVotingModal } from '../components/play/ExpressVotingModal'
import { cn } from '../lib/utils'
import { BggOnboardingModal } from '../components/onboarding/BggOnboardingModal'

interface SimpleGame {
  bgg_id: number;
  title: string;
  title_es?: string | null;
  image_url?: string | null;
  year_published?: number | null;
  min_players?: number | null;
  max_players?: number | null;
  playing_time?: number | null;
  complexity?: number | null;
  is_expansion?: boolean | null;
  base_game_id?: string | null;
  bgg_base_game_id?: number | null;
  is_unplayed?: boolean;
}

function isGameExpansion(game: SimpleGame): boolean {
  if (game.is_expansion === true) return true
  if (game.base_game_id || game.bgg_base_game_id) return true
  const lowerTitle = (game.title || '').toLowerCase()
  const lowerEsTitle = (game.title_es || '').toLowerCase()
  const expRegex = /\b(expansi[oó]n|expansion)\b|\(exp\.?\)/i
  return expRegex.test(lowerTitle) || expRegex.test(lowerEsTitle)
}

function mapToSimpleGame(g: any): SimpleGame {
  return {
    bgg_id: g.bgg_id,
    title: g.title,
    title_es: g.title_es,
    image_url: g.image_url,
    year_published: g.year_published,
    min_players: g.min_players || 2,
    max_players: g.max_players || 5,
    playing_time: g.playing_time || 45,
    complexity: g.complexity,
    is_expansion: g.is_expansion ?? false,
    base_game_id: g.base_game_id,
    bgg_base_game_id: g.bgg_base_game_id,
    is_unplayed: g.is_unplayed ?? false,
  }
}

export function PlayPage() {
  const { user } = useAuth()
  const { groups } = useGroups()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  // Filter States for Decision Engine
  const [selectedPlayers, setSelectedPlayers] = useState<number | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<string>('any')
  const [selectedGroupId, setSelectedGroupId] = useState<string>('personal')
  const [onlyUnplayed, setOnlyUnplayed] = useState<boolean>(false)

  // Available games pool for decision engine
  const [gamesPool, setGamesPool] = useState<SimpleGame[]>([])
  const [loadingGames, setLoadingGames] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showVotingModal, setShowVotingModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Decision outcome
  const [suggestedGame, setSuggestedGame] = useState<SimpleGame | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinError, setSpinError] = useState<string | null>(null)

  // User's active sessions / meetups
  const [activeMeetups, setActiveMeetups] = useState<any[]>([])
  const [loadingMeetups, setLoadingMeetups] = useState(true)

  // Load games for the selected source (personal collection or group ludoteca)
  useEffect(() => {
    let isCancelled = false

    const loadGames = async () => {
      setLoadingGames(true)
      try {
        let loadedGames: SimpleGame[] = []

        if (selectedGroupId === 'personal') {
          // 1. Check local mock storage
          if (user?.id) {
            const localStored = localStorage.getItem(`boardgame_social_mock_collection_${user.id}`)
            if (localStored) {
              try {
                const parsed = JSON.parse(localStored)
                if (Array.isArray(parsed) && parsed.length > 0) {
                  parsed.forEach((g: any) => {
                    loadedGames.push(mapToSimpleGame(g))
                  })
                }
              } catch {}
            }
          }

          // 2. Fetch from Supabase user_collection (Live)
          if (user?.id && !USE_MOCKS) {
            try {
              const { data: collData, error: collErr } = await supabase
                .from('user_collection')
                .select('game_id, games (*)')
                .eq('user_id', user.id)

              if (!collErr && collData && collData.length > 0) {
                const joined = collData
                  .map((item: any) => Array.isArray(item.games) ? item.games[0] : item.games)
                  .filter(Boolean)

                if (joined.length > 0) {
                  joined.forEach((g: any) => {
                    if (!loadedGames.some(existing => existing.bgg_id === g.bgg_id)) {
                      loadedGames.push(mapToSimpleGame(g))
                    }
                  })
                } else {
                  // Direct fetch from games table by game_id
                  const gameIds = Array.from(new Set(collData.map((item: any) => item.game_id).filter(Boolean)))
                  if (gameIds.length > 0) {
                    const { data: directGames } = await supabase
                      .from('games')
                      .select('*')
                      .in('bgg_id', gameIds)

                    if (directGames) {
                      directGames.forEach((g: any) => {
                        if (!loadedGames.some(existing => existing.bgg_id === g.bgg_id)) {
                          loadedGames.push(mapToSimpleGame(g))
                        }
                      })
                    }
                  }
                }
              }
            } catch (supabaseErr) {
              console.warn('Error fetching user_collection:', supabaseErr)
            }
          }

          // If in mock mode and nothing loaded yet, provide standard mock library
          if (USE_MOCKS && loadedGames.length === 0) {
            loadedGames = [
              { bgg_id: 37111, title: 'Dixit', min_players: 3, max_players: 8, playing_time: 30, image_url: 'https://cf.geekdo-images.com/39A865b4-B6BE-4b82-9022-7935E5B9FE6C.png' },
              { bgg_id: 13, title: 'Catan', min_players: 3, max_players: 4, playing_time: 75, image_url: 'https://cf.geekdo-images.com/40B7E05C-CC71-460B-A5DF-F2803CE10599.png' },
              { bgg_id: 30549, title: 'Pandemic', min_players: 2, max_players: 4, playing_time: 45, image_url: 'https://cf.geekdo-images.com/S3ybV1LAp-028x9-v1pd3A__itemrep/img/1m_2n6f4Jz_eFwI8PzM0y6lq5e0=/fit-in/246x300/filters:strip_icc()/pic1534148.jpg' },
              { bgg_id: 68448, title: '7 Wonders', min_players: 2, max_players: 7, playing_time: 30, image_url: 'https://cf.geekdo-images.com/35h9Za_Ka8i0yHiVbIsG8g__itemrep/img/bBqA4d9_kMfsY93p8e_V_o2nCqo=/fit-in/246x300/filters:strip_icc()/pic860217.jpg' },
              { bgg_id: 9209, title: 'Ticket to Ride', min_players: 2, max_players: 5, playing_time: 60, image_url: 'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__itemrep/img/8c9iJ5BvI4i_w89L8Lp8rM_aM_0=/fit-in/246x300/filters:strip_icc()/pic3727516.jpg' }
            ]
          }

          // Fallback: If user has 0 games in collection, load popular games from catalog so the page is ready to play
          if (loadedGames.length === 0) {
            try {
              const { data: catalogGames } = await supabase
                .from('games')
                .select('*')
                .not('image_url', 'is', null)
                .order('bgg_rank', { ascending: true, nullsFirst: false })
                .limit(25)

              if (catalogGames && catalogGames.length > 0) {
                loadedGames = catalogGames.map((g: any) => mapToSimpleGame(g))
              }
            } catch {}
          }
        } else {
          // A specific group is selected
          if (USE_MOCKS) {
            const mockMembersStr = localStorage.getItem('boardgame_social_mock_group_members')
            const allMembers = mockMembersStr ? JSON.parse(mockMembersStr) : []
            const groupMemberIds = allMembers.filter((m: any) => m.group_id === selectedGroupId).map((m: any) => m.user_id)
            if (user?.id && !groupMemberIds.includes(user.id)) groupMemberIds.push(user.id)

            const groupGamesMap = new Map<number, SimpleGame>()
            ;[
              { bgg_id: 224517, title: 'Brass: Birmingham', min_players: 2, max_players: 4, playing_time: 120, image_url: 'https://cf.geekdo-images.com/x3zxztFbRYCgssNZ55ZMnw__micro/img/QDuQwi75tL54enp_8_93K3s97d0=/fit-in/64x64/filters:strip_icc()/pic3490053.jpg' },
              { bgg_id: 13, title: 'Catan', min_players: 3, max_players: 4, playing_time: 75, image_url: 'https://cf.geekdo-images.com/40B7E05C-CC71-460B-A5DF-F2803CE10599.png' },
              { bgg_id: 37111, title: 'Dixit', min_players: 3, max_players: 8, playing_time: 30, image_url: 'https://cf.geekdo-images.com/39A865b4-B6BE-4b82-9022-7935E5B9FE6C.png' },
              { bgg_id: 167791, title: 'Terraforming Mars', min_players: 1, max_players: 5, playing_time: 120, image_url: 'https://cf.geekdo-images.com/yLZJCDgC7y0uJUWSpFd58A__micro/img/z7A4g4dG6NqH2fT0zJc2j6m9V-g=/fit-in/64x64/filters:strip_icc()/pic3536616.png' }
            ].forEach(g => groupGamesMap.set(g.bgg_id, mapToSimpleGame(g)))

            groupMemberIds.forEach((mId: string) => {
              const mStr = localStorage.getItem(`boardgame_social_mock_collection_${mId}`)
              if (mStr) {
                try {
                  JSON.parse(mStr).forEach((g: any) => groupGamesMap.set(g.bgg_id, mapToSimpleGame(g)))
                } catch {}
              }
            })

            loadedGames = Array.from(groupGamesMap.values())
          } else {
            // Live Supabase group members collection
            const { data: members } = await supabase
              .from('group_members')
              .select('user_id')
              .eq('group_id', selectedGroupId)

            if (members && members.length > 0) {
              const memberIds = members.map((m: any) => m.user_id)
              const { data: colData } = await supabase
                .from('user_collection')
                .select('game_id, games (*)')
                .in('user_id', memberIds)

              if (colData && colData.length > 0) {
                const joined = colData
                  .map((item: any) => Array.isArray(item.games) ? item.games[0] : item.games)
                  .filter(Boolean)

                if (joined.length > 0) {
                  const uniqueMap = new Map<number, SimpleGame>()
                  joined.forEach((g: any) => uniqueMap.set(g.bgg_id, mapToSimpleGame(g)))
                  loadedGames = Array.from(uniqueMap.values())
                } else {
                  const gameIds = Array.from(new Set(colData.map((item: any) => item.game_id).filter(Boolean)))
                  if (gameIds.length > 0) {
                    const { data: directGames } = await supabase
                      .from('games')
                      .select('*')
                      .in('bgg_id', gameIds)

                    if (directGames) {
                      loadedGames = directGames.map((g: any) => mapToSimpleGame(g))
                    }
                  }
                }
              }
            }
          }
        }

        if (!isCancelled) {
          setGamesPool(loadedGames)
        }
      } catch (err) {
        console.error('Error fetching games pool for PlayPage:', err)
      } finally {
        if (!isCancelled) setLoadingGames(false)
      }
    }

    loadGames()
    return () => { isCancelled = true }
  }, [user, selectedGroupId, refreshTrigger])

  // Load user's active sessions
  useEffect(() => {
    let isCancelled = false
    const loadActiveMeetups = async () => {
      if (!user) {
        setActiveMeetups([])
        setLoadingMeetups(false)
        return
      }

      setLoadingMeetups(true)
      try {
        let guestMeetupIds: string[] = []
        try {
          const guestResStr = localStorage.getItem('boardgame_social_guest_reservations')
          if (guestResStr) {
            const guestMap = JSON.parse(guestResStr)
            guestMeetupIds = Object.keys(guestMap)
          }
        } catch {}

        if (USE_MOCKS) {
          const stored = localStorage.getItem('boardgame_social_mock_meetups')
          if (stored) {
            const list = JSON.parse(stored)
            const now = Date.now()
            const myMeetups = list.filter((m: any) => 
              (m.creator_id === user.id || m.joined_players?.includes(user.id) || guestMeetupIds.includes(m.id)) &&
              !m.completed &&
              new Date(m.date).getTime() >= now - 1000 * 60 * 60 * 4
            ).map((m: any) => {
              const firstGame = m.games?.[0] || m.meetup_games?.[0]?.games
              return {
                ...m,
                gameTitle: firstGame?.title || m.title,
                gameImg: firstGame?.image_url || null
              }
            })
            if (!isCancelled) setActiveMeetups(myMeetups)
          }
          return
        }

        const orParts = [
          `creator_id.eq.${user.id}`,
          `joined_players.cs.{${user.id}}`
        ]
        if (guestMeetupIds.length > 0) {
          orParts.push(`id.in.(${guestMeetupIds.join(',')})`)
        }

        const nowIso = new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
        const { data, error } = await supabase
          .from('meetups')
          .select(`
            id,
            title,
            date,
            location,
            city,
            max_players,
            joined_players,
            completed,
            is_online,
            meetup_games (
              game_id,
              games (
                title,
                image_url
              )
            )
          `)
          .or(orParts.join(','))
          .eq('completed', false)
          .gte('date', nowIso)
          .order('date', { ascending: true })
          .limit(4)

        if (error) {
          console.error('Error loading active meetups in PlayPage:', error)
        } else if (data && !isCancelled) {
          const formatted = data.map((m: any) => {
            const firstGame = m.meetup_games?.[0]?.games
            return {
              ...m,
              gameTitle: firstGame?.title || m.title,
              gameImg: firstGame?.image_url || null
            }
          })
          setActiveMeetups(formatted)
        }
      } catch (err) {
        console.error('Error loading active meetups in PlayPage:', err)
      } finally {
        if (!isCancelled) setLoadingMeetups(false)
      }
    }

    loadActiveMeetups()
    return () => { isCancelled = true }
  }, [user])

  // Filter games based on player count, duration, shelf of shame, and exclude expansions
  const filteredGames = useMemo(() => {
    return gamesPool.filter((game) => {
      // Exclude expansions: expansions cannot be played without base game and should not be rolled as standalone titles
      if (isGameExpansion(game)) {
        return false
      }

      // Shelf of shame filter (prioritize unplayed games)
      if (onlyUnplayed && !game.is_unplayed) {
        return false
      }

      // Player filter
      if (selectedPlayers !== null) {
        const minP = game.min_players || 1
        const maxP = game.max_players || 10
        if (selectedPlayers < minP || selectedPlayers > maxP) return false
      }

      // Duration filter
      if (selectedDuration !== 'any') {
        const time = game.playing_time || 45
        if (selectedDuration === 'quick' && time > 35) return false
        if (selectedDuration === 'medium' && (time < 30 || time > 75)) return false
        if (selectedDuration === 'long' && (time < 60 || time > 120)) return false
        if (selectedDuration === 'afternoon' && time < 90) return false
      }

      return true
    })
  }, [gamesPool, selectedPlayers, selectedDuration, onlyUnplayed])

  // Spin Roulette with authentic inercial mechanical deceleration
  const handleSpinRoulette = () => {
    setSpinError(null)
    if (filteredGames.length === 0) {
      setSpinError(t('play.noGamesFound'))
      return
    }

    setIsSpinning(true)

    // Mechanical deceleration curve: begins rapid (40ms), slows step-by-step to 430ms
    const delays = [40, 40, 45, 50, 55, 65, 75, 90, 110, 135, 170, 215, 270, 340, 430]
    let step = 0

    const executeStep = () => {
      const randomIdx = Math.floor(Math.random() * filteredGames.length)
      setSuggestedGame(filteredGames[randomIdx])

      step++
      if (step < delays.length) {
        setTimeout(executeStep, delays[step])
      } else {
        setIsSpinning(false)
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'],
          })
        } catch {}
      }
    }

    setTimeout(executeStep, delays[0])
  }

  // Detect owned expansions for the suggested game in the current pool
  const availableExpansionsForSuggested = useMemo(() => {
    if (!suggestedGame) return []
    return gamesPool.filter((g) => {
      if (!isGameExpansion(g)) return false
      if (g.bgg_base_game_id && g.bgg_base_game_id === suggestedGame.bgg_id) return true
      const gTitle = (g.title || '').toLowerCase()
      const sTitle = (suggestedGame.title || '').toLowerCase()
      return gTitle.startsWith(sTitle) || gTitle.includes(sTitle)
    })
  }, [suggestedGame, gamesPool])

  return (
    <section className="space-y-8 max-w-4xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/75 bg-clip-text text-transparent flex items-center gap-2.5 font-display">
            <span className="p-2 rounded-2xl bg-primary/10 text-primary inline-flex">
              <Dices className="w-7 h-7" />
            </span>
            <span>{t('play.title')}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {t('play.subtitle')}
          </p>
        </div>

        <Button
          onClick={() => {
            navigate('/mesa/nueva')
          }}
          className="rounded-2xl font-bold shadow-lg shadow-primary/25 flex items-center gap-2 h-11 px-5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('play.openTable')}</span>
        </Button>
      </div>

      {/* Decision Engine Card ("¿A qué jugamos hoy?") */}
      <div className="rounded-[28px] glass-panel border border-border/40 p-6 sm:p-8 relative overflow-hidden shadow-xl space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('play.decisionTitle')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-display">
            {t('play.decisionTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl">
            {t('play.decisionDesc')}
          </p>
        </div>

        {/* Parametric Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 pt-1">
          {/* 1. Players selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>{t('play.playersLabel')}</span>
            </label>
            <div className="flex gap-2 items-center flex-wrap pt-0.5">
              {[2, 3, 4, 5, 6].map((count) => {
                const isSelected = selectedPlayers === count
                const label = count === 6 ? '6+' : String(count)
                return (
                  <Button
                    key={count}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedPlayers(isSelected ? null : count)
                    }}
                    className={cn(
                      'h-9 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs select-none cursor-pointer',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]'
                        : 'bg-card/50 hover:bg-card border-border/40 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span>{label}</span>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* 2. Duration selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{t('play.durationLabel')}</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'any', label: t('play.anyTime') },
                { id: 'quick', label: t('play.quickTime') },
                { id: 'medium', label: t('play.mediumTime') },
                { id: 'long', label: t('play.longTime') }
              ].map((opt) => (
                <Button
                  key={opt.id}
                  type="button"
                  variant={selectedDuration === opt.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedDuration(opt.id)
                  }}
                  className="rounded-xl font-bold text-[11px] h-9 truncate font-mono-tabular"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 3. Collection / Group selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Dices className="w-3.5 h-3.5 text-primary" />
              <span>{t('play.groupFilterLabel')}</span>
            </label>
            <Select
              value={selectedGroupId}
              onValueChange={setSelectedGroupId}
            >
              <SelectTrigger className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
                <SelectValue placeholder={t('play.allMyGames')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">{t('play.allMyGames')}</SelectItem>
                {groups.map((grp) => (
                  <SelectItem key={grp.id} value={grp.id}>
                    {grp.name} ({grp.member_count || 1})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-muted-foreground font-medium font-mono-tabular">
                {loadingGames ? (
                  'Cargando juegos...'
                ) : (
                  `${filteredGames.length} ${filteredGames.length === 1 ? 'juego disponible' : 'juegos disponibles'}`
                )}
              </p>
              {selectedGroupId === 'personal' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowSyncModal(true)
                  }}
                  className="h-auto p-0 text-[10px] font-bold text-primary hover:underline hover:bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sincronizar BGG</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Shelf of Shame (Estantería de la Vergüenza) Toggle */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/20 relative z-10">
          <Button
            type="button"
            variant={onlyUnplayed ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setOnlyUnplayed((prev) => !prev)
            }}
            className={cn(
              'rounded-xl font-bold text-xs h-9 px-3.5 transition-all flex items-center gap-2',
              onlyUnplayed
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'border-border/40 text-muted-foreground hover:text-foreground'
            )}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>{t('play.shelfOfShame', 'Estantería de la Vergüenza')}</span>
            {onlyUnplayed && (
              <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[9px] font-black uppercase">
                {t('play.active', 'Activo')}
              </span>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground font-medium">
            {onlyUnplayed
              ? t('play.unplayedFilterActive', 'Priorizando juegos no estrenados del grupo')
              : t('play.allLibraryIncluded', 'Explorando toda la ludoteca disponible')}
          </p>
        </div>

        {/* Actions: Spin Roulette & Express Voting */}
        <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={handleSpinRoulette}
            disabled={isSpinning || loadingGames}
            size="lg"
            className="w-full sm:w-auto rounded-2xl font-extrabold text-sm h-12 px-7 shadow-md shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{suggestedGame ? t('play.spinAgain') : t('play.spinRoulette')}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSpinning || loadingGames || filteredGames.length === 0}
            onClick={() => {
              setShowVotingModal(true)
            }}
            className="w-full sm:w-auto rounded-2xl font-bold text-sm h-12 px-6 border-border/40 hover:border-primary/40 flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Vote className="w-4 h-4 text-primary" />
            <span>{t('play.expressVoting', 'Votación Exprés (30s)')}</span>
          </Button>

          {spinError && (
            <p className="text-xs font-semibold text-destructive animate-in fade-in">
              {spinError}
            </p>
          )}
        </div>

        {/* Suggested Game Display */}
        <AnimatePresence>
          {suggestedGame && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="mt-6 p-4 sm:p-5 rounded-2xl bg-primary/10 border border-primary/20 relative z-10 flex flex-col sm:flex-row items-center gap-4"
            >
              {suggestedGame.image_url ? (
                <img
                  src={suggestedGame.image_url}
                  alt={suggestedGame.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shadow-md shrink-0 border border-border/30"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-card flex items-center justify-center border border-border/30 shrink-0 text-primary">
                  <Dices className="w-8 h-8" />
                </div>
              )}

              <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                  {t('play.suggestedTitle')}
                </span>
                <h3 className="text-lg font-black text-foreground truncate">
                  {(i18n.language === 'es' && suggestedGame.title_es) ? suggestedGame.title_es : suggestedGame.title}
                </h3>
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    {suggestedGame.min_players || 2}-{suggestedGame.max_players || 5} jug.
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {suggestedGame.playing_time || 45} min
                  </span>
                </div>

                {availableExpansionsForSuggested.length > 0 && (
                  <div className="pt-0.5 flex flex-wrap gap-1 justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                      <Sparkles className="w-3 h-3" />
                      +{availableExpansionsForSuggested.length} {availableExpansionsForSuggested.length === 1 ? 'expansión compatible en la ludoteca' : 'expansiones compatibles en la ludoteca'}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => navigate(`/mesa/nueva?gameId=${suggestedGame.bgg_id}`)}
                className="rounded-xl font-bold text-xs h-10 px-4 shrink-0 shadow-sm"
              >
                <span>{t('play.startMeetupWithGame')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Meetups / Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            <span>{t('play.activeSessionsTitle')}</span>
          </h2>
          <Link
            to="/chats"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('play.goToChat')}</span>
          </Link>
        </div>

        {loadingMeetups ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-28 rounded-2xl bg-muted/40 animate-pulse border border-border/10" />
            <div className="h-28 rounded-2xl bg-muted/40 animate-pulse border border-border/10" />
          </div>
        ) : activeMeetups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeMeetups.map((meetup) => {
              const gameTitle = meetup.gameTitle || meetup.title
              const gameImg = meetup.gameImg || null
              const isToday = new Date(meetup.date).toDateString() === new Date().toDateString()

              return (
                <div
                  key={meetup.id}
                  onClick={() => navigate(`/mesa/${meetup.id}`)}
                  className="p-4 rounded-2xl glass-panel border border-border/40 hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center gap-3.5 group"
                >
                  {gameImg ? (
                    <img
                      src={gameImg}
                      alt={gameTitle}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border/20 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Dices className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {gameTitle}
                      </h4>
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 font-extrabold text-[9px] uppercase tracking-wider">
                          Hoy
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatDate(meetup.date, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }, i18n.language as any)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 font-semibold truncate">
                      {meetup.is_online ? 'Online' : (meetup.location || meetup.city || 'Mesa presencial')} • {meetup.joined_players?.length || 1}/{meetup.max_players} jug.
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl glass-panel border border-dashed border-border/50 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-xs text-muted-foreground font-medium">
                {t('play.noActiveSessions')}
              </p>
            </div>
            <Button
              onClick={() => navigate('/mesa/nueva')}
              size="sm"
              variant="outline"
              className="rounded-xl font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              {t('play.openTable')}
            </Button>
          </div>
        )}
      </div>

      {/* Your Groups quick strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>{t('play.groupLounges')}</span>
          </h2>
          <Link
            to="/grupos"
            className="text-xs font-bold text-primary hover:underline"
          >
            {t('play.viewGroup')}
          </Link>
        </div>

        {groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {groups.slice(0, 3).map((grp) => (
              <div
                key={grp.id}
                onClick={() => navigate(`/grupos/${grp.id}`)}
                className="p-4 rounded-2xl glass-panel border border-border/40 hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md space-y-1.5 group"
              >
                <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {grp.name}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {grp.description || 'Sin descripción'}
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-muted-foreground">
                  <span>{grp.member_count || 1} miembros</span>
                  <span className="text-primary group-hover:translate-x-0.5 transition-transform flex items-center">
                    Entrar <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground font-medium">
              {t('play.noGroupsPrompt')}
            </p>
            <Button
              onClick={() => navigate('/grupos?create=true')}
              size="sm"
              className="rounded-xl font-bold text-xs shrink-0"
            >
              {t('play.createGroupAction')}
            </Button>
          </div>
        )}
      </div>

      {/* Optional BGG Sync Modal */}
      <BggOnboardingModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onSuccess={() => setRefreshTrigger(v => v + 1)}
      />

      {/* Express Voting Modal (30s Group Quick Vote) */}
      <ExpressVotingModal
        isOpen={showVotingModal}
        onClose={() => setShowVotingModal(false)}
        candidates={filteredGames}
        roomId={selectedGroupId !== 'personal' ? `group-${selectedGroupId}` : 'general'}
        onGameSelected={(game) => {
          setShowVotingModal(false)
          navigate(`/mesa/nueva?gameId=${game.bgg_id}`)
        }}
      />
    </section>
  )
}
export default PlayPage
