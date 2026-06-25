import { useState, useEffect, FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { useTranslation } from 'react-i18next'
import { useGameLocale } from '../hooks/useGameLocale'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Tabs } from '../components/ui/tabs'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CalendarDays, MapPin, Users, ArrowLeft, Laptop, PhoneCall } from 'lucide-react'
import { CalendarDatePicker } from '../components/CalendarDatePicker'
import { MOCK_MEETUPS, MOCK_BGG_GAMES } from '../lib/mockData'
import { USE_MOCKS } from '../lib/config'
import { OptimizedImage } from '../components/ui/OptimizedImage'
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal'
import { CityAutocomplete, ESP_CITIES } from '../components/meetup-form/CityAutocomplete'
import { GameSelectionSection } from '../components/meetup-form/GameSelectionSection'
import { Game } from '@/types'

const MotionDiv = motion.div;
const MotionForm = motion.form;

export function CreateMeetupPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const { user } = useAuth()
  const { t } = useTranslation()
  const { getGameTitle } = useGameLocale()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const gameIdParam = searchParams.get('gameId') || searchParams.get('game_id')

  // Game Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [games, setGames] = useState<Game[]>([])
  const [selectedGames, setSelectedGames] = useState<Game[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isShowingBggResults, setIsShowingBggResults] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Expansions State
  const [availableExpansions, setAvailableExpansions] = useState<Game[]>([])
  const [showExpansions, setShowExpansions] = useState(false)

  // Form Fields State
  const [title, setTitle] = useState(searchParams.get('title') || '')
  const [description, setDescription] = useState(searchParams.get('description') || '')
  const [isOnline, setIsOnline] = useState(false)
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [platform, setPlatform] = useState('')
  const [voiceLink, setVoiceLink] = useState('')
  const [date, setDate] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('4')

  // City Autocomplete State
  const [allCities, setAllCities] = useState<string[]>(ESP_CITIES)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Meetup Limit Check States
  const [activeMeetupsCount, setActiveMeetupsCount] = useState<number | null>(null)
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false)
  const [loadingLimit, setLoadingLimit] = useState(true)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  useEffect(() => {
    async function checkMeetupLimit() {
      if (!user) {
        setLoadingLimit(false)
        return
      }
      setLoadingLimit(true)
      try {
        const isMock = USE_MOCKS && id?.startsWith('mock-')
        if (isMock) {
          setIsPremiumUser(false)
          setActiveMeetupsCount(0)
          setLoadingLimit(false)
          return
        }

        // 1. Fetch user premium status
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_premium')
          .eq('id', user.id)
          .single()

        if (userError) throw userError
        const isPremium = !!userData?.is_premium
        setIsPremiumUser(isPremium)

        // 2. Count active meetups (non-completed and future date)
        const { count, error: countError } = await supabase
          .from('meetups')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', user.id)
          .eq('completed', false)
          .gte('date', new Date().toISOString())

        if (countError) throw countError
        setActiveMeetupsCount(count || 0)
      } catch (err) {
        console.warn("Could not check meetup limit from DB, using fallback simulated values:", err)
        const simulatedPremium = localStorage.getItem('bgs_pro_simulated') === 'true'
        setIsPremiumUser(simulatedPremium)
        setActiveMeetupsCount(0)
      } finally {
        setLoadingLimit(false)
      }
    }

    if (!isEditMode) {
      checkMeetupLimit()
    } else {
      setLoadingLimit(false)
    }
  }, [user, isEditMode, id])

  // Fetch unique cities from current database on mount
  useEffect(() => {
    async function loadCities() {
      try {
        const { data, error } = await supabase
          .from('meetups')
          .select('city')
        
        if (data && !error) {
          const dbCities = data.map((m: any) => m.city).filter(Boolean) as string[]
          const merged = [...new Set([...dbCities, ...ESP_CITIES])].sort()
          setAllCities(merged)
        }
      } catch (err) {
        console.error("Error al cargar sugerencias de ciudades:", err)
      }
    }
    loadCities()
  }, [])

  // Fetch expansions for selected base games
  useEffect(() => {
    async function fetchExpansions() {
      const baseGames = selectedGames.filter(g => !g.is_expansion);
      if (baseGames.length === 0) {
        setAvailableExpansions([]);
        return;
      }
      
      try {
        const baseGameIds = baseGames.map(bg => bg.id).filter(Boolean);
        if (baseGameIds.length > 0) {
          const { data, error } = await supabase
            .from('games')
            .select('*')
            .in('base_game_id', baseGameIds);
            
          if (data && !error) {
            setAvailableExpansions(data as Game[]);
          }
        }
      } catch (err) {
        console.error("Error fetching expansions:", err);
      }
    }
    
    fetchExpansions();
  }, [selectedGames]);

  const handleToggleExpansion = (exp: Game) => {
    setSelectedGames(prev => {
      if (prev.some(g => g.bgg_id === exp.bgg_id)) {
        return prev.filter(g => g.bgg_id !== exp.bgg_id);
      } else {
        return [...prev, exp];
      }
    });
  };

  // Debounced search on type
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        setGames([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Load pre-populated game from search params if in creation mode
  useEffect(() => {
    if (!gameIdParam || isEditMode) return
    
    async function loadGameFromParam() {
      const bggId = parseInt(gameIdParam!, 10)
      if (isNaN(bggId)) return
      
      setIsImporting(true)
      setErrorMsg('')
      try {
        // 1. Check if the game is in the local database
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('bgg_id', bggId)
          .maybeSingle()
          
        if (error) throw error
        
        if (data) {
          setSelectedGames([data as Game])
        } else {
          // 2. If not, trigger the ingest edge function to load it from BGG
          console.log(`[Param Load] Ingesting game with BGG ID: ${bggId}...`)
          const { data: ingestData, error: ingestError } = await supabase.functions.invoke('bgg-ingest', {
            body: { action: 'ingest', bggIds: [bggId] }
          })
          
          if (ingestError) throw ingestError
          
          if (ingestData && ingestData.success && ingestData.games && ingestData.games.length > 0) {
            setSelectedGames([ingestData.games[0] as Game])
          } else {
            throw new Error('No se pudo encontrar el juego en BoardGameGeek.')
          }
        }
      } catch (err: any) {
        console.error("Error loading pre-populated game:", err)
        setErrorMsg(`Error al precargar el juego: ${err.message || err}`)
      } finally {
        setIsImporting(false)
      }
    }
    
    loadGameFromParam()
  }, [gameIdParam, isEditMode])

  // Load existing meetup details in Edit Mode
  useEffect(() => {
    if (!id) return
    async function loadMeetupForEdit() {
      if (!id) return
      setErrorMsg('')
      const isMock = USE_MOCKS && id.startsWith('mock-')
      
      if (isMock) {
        const foundMock = MOCK_MEETUPS.find(m => m.id === id)
        if (foundMock) {
          setTitle(foundMock.title || '')
          setDescription(foundMock.description || '')
          
          const isOnlineMock = foundMock.is_online || false
          setIsOnline(isOnlineMock)
          if (isOnlineMock) {
            setPlatform(foundMock.platform || '')
            setVoiceLink(foundMock.voice_link || '')
            setCity('')
            setLocation('')
          } else {
            setCity('Madrid') // default city for mocks
            setLocation(foundMock.location || '')
            setPlatform('')
            setVoiceLink('')
          }
          
          setDate(foundMock.date || '')
          setMaxPlayers('4') // default max_players
          
          const foundGame = MOCK_BGG_GAMES.find(g => g.name === foundMock.game_name)
          if (foundGame) {
            setSelectedGames([{
              bgg_id: Number(foundGame.bgg_id),
              title: foundGame.name,
              year_published: foundGame.year,
              image_url: foundGame.image_url
            }])
          } else {
            setSelectedGames([{
              bgg_id: 13,
              title: foundMock.game_name,
              year_published: 2020,
              image_url: null
            }])
          }
          setShowDetails(true)
        }
      } else {
        try {
          const { data, error } = await supabase
            .from('meetups')
            .select('*, meetup_games(game_id, winner_user_id, winner_guest_id, games(*))')
            .eq('id', id)
            .single()

          if (error) throw error
          if (data) {
            setTitle(data.title)
            setDescription(data.description || '')
            
            const isOnlineVal = data.is_online || false
            setIsOnline(isOnlineVal)
            if (isOnlineVal) {
              setPlatform(data.platform || '')
              setVoiceLink(data.voice_link || '')
              setCity('')
              setLocation('')
            } else {
              setCity(data.city || '')
              setLocation(data.location || '')
              setPlatform('')
              setVoiceLink('')
            }
            
            setDate(data.date)
            setMaxPlayers(String(data.max_players))
            
            const mg = data.meetup_games || []
            const mGames = mg.map((item: any) => {
              if (!item.games) return null
              return {
                ...item.games,
                winner_user_id: item.winner_user_id,
                winner_guest_id: item.winner_guest_id
              }
            }).filter(Boolean) as Game[]
            
            setSelectedGames(mGames)
            setShowDetails(true)
          }
        } catch (err) {
          console.error("Error loading meetup for edit:", err)
          setErrorMsg('No se pudo cargar la mesa de juego para editar.')
        }
      }
    }
    loadMeetupForEdit()
  }, [id])

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return
    setErrorMsg('')
    setIsSearching(true)
    setGames([])
    setIsShowingBggResults(false)
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`title.ilike.%${searchQuery}%,title_es.ilike.%${searchQuery}%`)
      .order('year_published', { ascending: false, nullsFirst: false })
      .limit(30)

    setIsSearching(false)
    if (error) {
      console.error(error)
      setErrorMsg('Error buscando juegos en el catálogo.')
    } else {
      setGames((data as Game[]) || [])
    }
  }

  const handleSearchBgg = async () => {
    if (!searchQuery.trim()) return
    setErrorMsg('')
    setIsSearching(true)
    setGames([])
    
    try {
      const { data, error } = await supabase.functions.invoke('bgg-ingest', {
        body: { action: 'search', query: searchQuery.trim() }
      })
      
      if (error) throw error
      
      if (data && data.results) {
        const bggGames: Game[] = data.results.map((item: any) => ({
          bgg_id: item.bgg_id,
          title: item.title,
          year_published: item.year_published,
          is_expansion: item.is_expansion,
          image_url: null,
          isFromBgg: true
        }))
        setGames(bggGames)
        setIsShowingBggResults(true)
      } else {
        setGames([])
      }
    } catch (err: any) {
      console.error('Error searching BGG:', err)
      setErrorMsg('No se pudo buscar en BoardGameGeek. Comprueba tu conexión o si la Edge Function está activa.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectGame = async (game: Game) => {
    if (game.isFromBgg) {
      setIsImporting(true)
      setErrorMsg('')
      try {
        console.log(`[Import] Ingesting game with BGG ID: ${game.bgg_id}...`)
        const { data, error } = await supabase.functions.invoke('bgg-ingest', {
          body: { action: 'ingest', bggIds: [game.bgg_id] }
        })
        
        if (error) throw error
        
        if (data && data.success && data.games && data.games.length > 0) {
          const fullyIngestedGame = data.games[0] as Game
          setSelectedGames(prev => {
            if (prev.some(g => g.bgg_id === fullyIngestedGame.bgg_id)) return prev
            return [...prev, fullyIngestedGame]
          })
          setSearchQuery('')
          setGames([])
        } else {
          throw new Error('La ingesta no devolvió los metadatos del juego.')
        }
      } catch (err: any) {
        console.error('Error importing from BGG:', err)
        setErrorMsg(`Error al importar "${game.title}" desde BGG: ${err.message || err}`)
      } finally {
        setIsImporting(false)
      }
    } else {
      setSelectedGames(prev => {
        if (prev.some(g => g.bgg_id === game.bgg_id)) return prev
        return [...prev, game]
      })
      setSearchQuery('')
      setGames([])
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const selectedDate = new Date(date)
    if (isNaN(selectedDate.getTime())) {
      setErrorMsg('La fecha seleccionada no es válida.')
      return
    }

    if (selectedDate.getTime() < Date.now()) {
      setErrorMsg('No puedes programar una partida en el pasado. Selecciona una fecha y hora futura.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const userId = user?.id
      if (!userId) throw new Error('Debes iniciar sesión para abrir una mesa.')

      if (isEditMode && id) {
        const isMock = USE_MOCKS && id.startsWith('mock-')
        if (isMock) {
          // Simulate editing delay
          await new Promise(resolve => setTimeout(resolve, 500))
        } else {
          const { error: updateError } = await supabase
            .from('meetups')
            .update({
              title: title.trim(),
              description: description.trim() || null,
              is_online: isOnline,
              city: isOnline ? null : city.trim(),
              location: isOnline ? null : location.trim(),
              platform: isOnline ? platform.trim() : null,
              voice_link: isOnline ? voiceLink.trim() : null,
              date: new Date(date).toISOString(),
              max_players: Number(maxPlayers)
            })
            .eq('id', id)

          if (updateError) throw new Error(`Error al actualizar la partida: ${updateError.message}`)

          // Delete existing relations
          const { error: deleteError } = await supabase
            .from('meetup_games')
            .delete()
            .eq('meetup_id', id)

          if (deleteError) console.error("Error deleting old relations:", deleteError)

          // Insert new relations
          if (selectedGames.length > 0) {
            const relationRows = selectedGames.map(g => ({
              meetup_id: id,
              game_id: g.bgg_id
            }))
            const { error: relError } = await supabase.from('meetup_games').insert(relationRows)
            if (relError) throw relError
          }
        }
        navigate(`/tablero/${id}`)
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from('meetups')
          .insert({
            creator_id: userId,
            title: title.trim(),
            description: description.trim() || null,
            is_online: isOnline,
            city: isOnline ? null : city.trim(),
            location: isOnline ? null : location.trim(),
            platform: isOnline ? platform.trim() : null,
            voice_link: isOnline ? voiceLink.trim() : null,
            date: new Date(date).toISOString(),
            max_players: Number(maxPlayers),
            joined_players: [userId] // The creator joins their own meetup automatically
          })
          .select('id')
          .single()

        if (insertError) throw new Error(`Error al abrir la mesa: ${insertError.message}`)

        // Insert relations
        if (insertData && selectedGames.length > 0) {
          const relationRows = selectedGames.map(g => ({
            meetup_id: insertData.id,
            game_id: g.bgg_id
          }))
          const { error: relError } = await supabase.from('meetup_games').insert(relationRows)
          if (relError) throw relError
        }

        navigate('/')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Ocurrió un error inesperado al guardar la partida.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const limit = isPremiumUser ? 10 : 5
  const isLimitExceeded = !isEditMode && activeMeetupsCount !== null && activeMeetupsCount >= limit

  if (loadingLimit) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium">{t('create.checkingLimit')}</p>
      </div>
    )
  }

  return (
    <section className="space-y-4 max-w-xl mx-auto p-0 pb-6 md:p-4 md:pb-24 relative">
      
      {/* Header bar (sticky on mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-2 -mx-4 px-4 md:-mx-8 md:px-8 bg-background/85 backdrop-blur-md border-b border-border/20">
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          onClick={isEditMode ? () => navigate(`/tablero/${id}`) : () => navigate(-1)} 
          className="flex-shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.back')}
        </Button>
        <span className="text-[10px] font-black text-primary uppercase bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-wider select-none">
          {isEditMode ? t('create.editTitle') : `${t('create.activeMeetups')}: ${activeMeetupsCount !== null ? activeMeetupsCount : 0}/${limit}`}
        </span>
      </div>

      <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl">
          <CardHeader className="p-4 pb-4 sm:p-6 sm:pb-4 border-b border-border/30">
            <div className="min-w-0">
              <CardTitle className="text-2xl font-extrabold tracking-tight text-primary truncate">
                {isEditMode ? t('create.editTitle') : t('create.hostTitle')}
              </CardTitle>
              <CardDescription className="font-medium text-foreground/80 truncate">
                {isEditMode ? t('create.editDesc') : t('create.hostDesc')}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-6 sm:p-6 sm:pt-6">
            {isLimitExceeded ? (
              <div className="text-center py-10 px-4 space-y-5">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive border border-destructive/20 animate-pulse">
                  <Laptop className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-foreground">{t('create.limitTitle')}</h3>
                  <p className="text-xs text-muted-foreground leading-normal max-w-sm mx-auto">
                    {t('create.limitDesc', { limit })}
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/')}
                  >
                    {t('meetup.backToBoard')}
                  </Button>
                  {!isPremiumUser && (
                    <>
                      <Button 
                        type="button"
                        variant="premium"
                        size="sm"
                        onClick={() => setIsUpgradeModalOpen(true)}
                      >
                        {t('create.upgradePro')}
                      </Button>
                      <PremiumUpgradeModal 
                        isOpen={isUpgradeModalOpen}
                        onClose={() => setIsUpgradeModalOpen(false)}
                        onSuccess={() => setIsPremiumUser(true)}
                      />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Stepper Wizard Header */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 border-b border-border/20 pb-5">
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-extrabold transition-all duration-300 ${!showDetails ? 'text-primary' : 'text-success/90'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${!showDetails ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10' : 'border-success bg-success/15 text-success'}`}>
                  {selectedGames.length > 0 ? '✓' : '1'}
                </span>
                <span>{t('create.selectGamesStep')}</span>
              </div>
              <div className="w-8 sm:w-16 h-px bg-border/40" />
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-extrabold transition-all duration-300 ${showDetails ? 'text-primary' : 'text-muted-foreground/60'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${showDetails ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10' : 'border-muted bg-muted'}`}>
                  2
                </span>
                <span>{t('create.meetupDetailsStep')}</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {errorMsg && (
                <MotionDiv 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="overflow-hidden"
                >
                  <div className="text-destructive bg-destructive/10 px-4 py-3 rounded-lg font-medium text-sm mb-6 border border-destructive/20">
                    {errorMsg}
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!showDetails ? (
                <GameSelectionSection
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  games={games}
                  setGames={setGames}
                  selectedGames={selectedGames}
                  setSelectedGames={setSelectedGames}
                  isSearching={isSearching}
                  isShowingBggResults={isShowingBggResults}
                  isImporting={isImporting}
                  handleSelectGame={handleSelectGame}
                  handleSearchBgg={handleSearchBgg}
                  onContinue={() => setShowDetails(true)}
                />
              ) : (
                <MotionForm 
                  key="form-stage"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                >
                  {/* Selected Games Showcase Frame */}
                  <div className="p-4 border border-border/40 rounded-xl bg-muted/20 backdrop-blur-sm shadow-inner space-y-3">
                    <div className="flex justify-between items-center border-b border-border/20 pb-2">
                      <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t('create.sessionGames')}</Label>
                      <Button variant="outline" size="sm" type="button" onClick={() => setShowDetails(false)} className="cursor-pointer">
                        {t('create.addChange')}
                      </Button>
                    </div>
                    {selectedGames.length === 0 ? (
                      <p className="text-xs font-medium text-muted-foreground italic">{t('create.noGamesSelected')}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedGames.map(game => (
                          <div key={game.bgg_id} className="flex items-center gap-1.5 bg-background/60 border border-border/60 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            {game.image_url && (
                              <OptimizedImage
                                src={game.image_url}
                                alt={getGameTitle(game)}
                                widthSize={40}
                                heightSize={40}
                                className="w-4 h-4 object-contain rounded"
                              />
                            )}
                            <span>{getGameTitle(game)}</span>
                            {game.is_expansion && (
                              <span className="ml-1 px-1 py-0.5 text-[8px] font-black uppercase text-purple-500 bg-purple-500/10 border border-purple-500/25 rounded-md shrink-0">
                                {t('common.expansion')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expansions Selector */}
                  {availableExpansions.length > 0 && (
                    <div className="space-y-2 p-4 border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setShowExpansions(!showExpansions)}
                        className="cursor-pointer p-0 h-auto text-primary"
                      >
                        {showExpansions ? t('create.hideExpansions') : t('create.showExpansions', { count: availableExpansions.length })}
                      </Button>
                      
                      <AnimatePresence>
                        {showExpansions && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-2 pt-1"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
                              {availableExpansions.map(exp => {
                                const isChecked = selectedGames.some(sg => sg.bgg_id === exp.bgg_id);
                                return (
                                  <label
                                    key={exp.bgg_id}
                                    className={`flex items-center gap-3 p-2 border rounded-xl cursor-pointer transition-all text-xs font-semibold ${
                                      isChecked 
                                        ? 'border-primary/50 bg-primary/5 shadow-sm shadow-primary/5' 
                                        : 'border-border/40 bg-background/20 hover:bg-muted/30 hover:border-border/80'
                                    }`}
                                  >
                                    <Input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleExpansion(exp)}
                                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer shadow-none focus-visible:ring-0 focus-visible:border-transparent flex-none bg-transparent w-auto"
                                    />
                                    {exp.image_url ? (
                                      <OptimizedImage
                                        src={exp.image_url}
                                        alt={exp.title}
                                        widthSize={60}
                                        heightSize={60}
                                        className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-[9px] font-extrabold text-muted-foreground shrink-0">?</div>
                                    )}
                                    <span className="truncate flex-1 select-none text-foreground/95">{exp.title}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="font-bold">{t('create.meetupTitleLabel')}</Label>
                    <Input 
                      id="title"
                      placeholder={t('create.meetupTitlePlaceholder')}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="font-bold">{t('create.descLabel')}</Label>
                    <Textarea 
                      id="description"
                      placeholder={t('create.descPlaceholder')}
                      className="min-h-[100px] resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Modality Selector */}
                  <div className="space-y-1.5">
                    <Label className="font-bold">{t('create.modalityLabel')}</Label>
                    <Tabs
                      options={[
                        { id: 'presencial', label: t('create.presencial'), icon: MapPin },
                        { id: 'online', label: t('create.online'), icon: Laptop }
                      ]}
                      activeTab={isOnline ? 'online' : 'presencial'}
                      onChange={(val) => setIsOnline(val === 'online')}
                    />
                  </div>

                  {/* City/Location vs Platform/Voice Link conditional rendering with animation */}
                  <AnimatePresence mode="wait">
                    {!isOnline ? (
                      <MotionDiv
                        key="presencial-fields"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <CityAutocomplete
                          city={city}
                          setCity={setCity}
                          allCities={allCities}
                        />

                        <div className="space-y-1.5">
                          <Label htmlFor="location" className="font-bold">{t('create.locationLabel')}</Label>
                          <Input 
                            id="location"
                            placeholder={t('create.locationPlaceholder')}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required 
                          />
                        </div>
                      </MotionDiv>
                    ) : (
                      <MotionDiv
                        key="online-fields"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="platform" className="font-bold flex items-center gap-1">
                            <Laptop className="w-3.5 h-3.5 text-primary" /> {t('create.platformLabel')}
                          </Label>
                          <Input 
                            id="platform"
                            placeholder="Ej: Board Game Arena, TTS, Discord..."
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            required 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="voiceLink" className="font-bold flex items-center gap-1">
                            <PhoneCall className="w-3.5 h-3.5 text-primary" /> {t('create.voiceLabel')}
                          </Label>
                          <Input 
                            id="voiceLink"
                            placeholder="Ej: https://discord.gg/... o meet.google.com/..."
                            value={voiceLink}
                            onChange={(e) => setVoiceLink(e.target.value)}
                          />
                        </div>
                      </MotionDiv>
                    )}
                  </AnimatePresence>

                  {/* Date & Max Players Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="date" className="font-bold flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-primary" /> {t('create.dateLabel')}
                      </Label>
                      <CalendarDatePicker value={date} onChange={setDate} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="maxPlayers" className="font-bold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-primary" /> {t('create.maxPlayersLabel')}
                      </Label>
                      <Input 
                        id="maxPlayers"
                        type="number" 
                        min="2" 
                        max="50"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <Button type="submit" variant="premium" className="w-full shadow-lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin"/> {t('create.saving')}
                        </span>
                      ) : (
                        isEditMode ? t('create.saveChanges') : t('create.createButtonFull')
                      )}
                    </Button>
                  </div>
                </MotionForm>
              )}
            </AnimatePresence>
          </>
        )}
      </CardContent>
        </Card>
      </MotionDiv>
    </section>
  )
}
export default CreateMeetupPage;
