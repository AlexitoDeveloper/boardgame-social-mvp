import { useState, useEffect, FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Tabs } from '../components/ui/tabs'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CalendarDays, MapPin, Users, ArrowLeft, Laptop, PhoneCall, Trash2, X } from 'lucide-react'
import { CalendarDatePicker } from '../components/CalendarDatePicker'
import { MOCK_MEETUPS, MOCK_BGG_GAMES } from '../lib/mockData'
import { USE_MOCKS } from '../lib/config'
import { Game } from '../types'
import { GameSearchBar } from '../components/GameSearchBar'

const MotionDiv = motion.div;
const MotionForm = motion.form;

const ESP_CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 
  'Palma de Mallorca', 'Las Palmas de Gran Canaria', 'Bilbao', 'Alicante', 'Córdoba', 
  'Valladolid', 'Vigo', 'Gijón', 'L\'Hospitalet de Llobregat', 'Vitoria-Gasteiz', 
  'A Coruña', 'Granada', 'Elche', 'Oviedo', 'Terrassa', 'Badalona', 'Cartagena', 
  'Sabadell', 'Jerez de la Frontera', 'Móstoles', 'Santa Cruz de Tenerife', 
  'Pamplona', 'Almería', 'Alcalá de Henares', 'Fuenlabrada', 'Leganés', 
  'San Sebastián', 'Getafe', 'Burgos', 'Alcorcón', 'Santander', 'Castelló de la Plana', 
  'Badajoz', 'Logroño', 'Huelva', 'Salamanca', 'Marbella', 'Lleida', 'Tarragona', 
  'Dos Hermanas', 'Parla', 'Torrejón de Ardoz', 'Mataró', 'León', 'Algeciras', 
  'Santa Coloma de Gramenet', 'Cádiz', 'Alcobendas', 'Jaén', 'Ourense', 'Reus', 
  'Telde', 'Barakaldo', 'Roquetas de Mar', 'Girona', 'Santiago de Compostela', 
  'Cáceres', 'Lorca', 'San Fernando', 'Las Rozas de Madrid', 'Melilla', 
  'Sant Cugat del Vallès', 'San Sebastián de los Reyes', 'El Puerto de Santa María', 
  'Rivas-Vaciamadrid', 'Ceuta', 'Gandía', 'Manresa', 'Ciudad Real', 'Ávila', 
  'Palencia', 'Segovia', 'Teruel', 'Soria', 'Huesca', 'Cuenca', 'Guadalajara', 
  'Toledo', 'Zamora', 'Pontevedra', 'Lugo'
];

export function CreateMeetupPage() {
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()

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
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [platform, setPlatform] = useState('')
  const [voiceLink, setVoiceLink] = useState('')
  const [date, setDate] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('4')

  // City Autocomplete State
  const [allCities, setAllCities] = useState<string[]>(ESP_CITIES)
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

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
      .ilike('title', `%${searchQuery}%`)
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

  // Filter city suggestions based on input
  const suggestions = city.trim()
    ? allCities.filter(c => c.toLowerCase().includes(city.toLowerCase()) && c.toLowerCase() !== city.toLowerCase())
    : []

  return (
    <section className="space-y-4 max-w-xl mx-auto p-0 pb-6 md:p-4 md:pb-24 relative">
      
      {/* Header bar (sticky on mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between py-2 -mx-4 px-4 bg-background/85 backdrop-blur-md border-b border-border/20 md:relative md:top-auto md:z-10 md:bg-transparent md:backdrop-blur-none md:border-b-0 md:-mx-0 md:px-0 md:py-0">
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(isEditMode ? `/tablero/${id}` : '/')} 
          className="rounded-xl flex items-center gap-1.5 text-muted-foreground hover:text-foreground h-9 border border-border/20 hover:bg-muted/50 px-3 flex-shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>
        <span className="text-[10px] font-black text-primary uppercase bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-wider select-none">
          {isEditMode ? 'Editar Mesa' : 'Abrir Mesa'}
        </span>
      </div>

      <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-2xl">
          <CardHeader className="p-4 pb-4 sm:p-6 sm:pb-4 border-b border-border/30">
            <div className="min-w-0">
              <CardTitle className="text-2xl font-extrabold tracking-tight text-primary truncate">
                {isEditMode ? 'Editar Mesa' : 'Abrir Mesa'}
              </CardTitle>
              <CardDescription className="font-medium text-foreground/80 truncate">
                {isEditMode ? 'Modifica los detalles de tu partida.' : 'Abre una mesa de juego para reunir jugadores en tu zona.'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-6 sm:p-6 sm:pt-6">
            
            {/* Stepper Wizard Header */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 border-b border-border/20 pb-5">
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-extrabold transition-all duration-300 ${!showDetails ? 'text-primary' : 'text-success/90'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${!showDetails ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10' : 'border-success bg-success/15 text-success'}`}>
                  {selectedGames.length > 0 ? '✓' : '1'}
                </span>
                <span>Seleccionar Juegos</span>
              </div>
              <div className="w-8 sm:w-16 h-px bg-border/40" />
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-extrabold transition-all duration-300 ${showDetails ? 'text-primary' : 'text-muted-foreground/60'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${showDetails ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10' : 'border-muted bg-muted'}`}>
                  2
                </span>
                <span>Detalles de la Partida</span>
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
                <MotionDiv 
                  key="search-stage"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <Label className="text-foreground/80 font-bold text-sm">Busca y añade juegos de mesa a la sesión</Label>
                    <GameSearchBar
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      games={games}
                      setGames={setGames}
                      isSearching={isSearching}
                      placeholder="Buscar juego (ej: Catan, Brass, Terraforming...)"
                      onSelectGame={handleSelectGame}
                      isGameDisabled={(game) => selectedGames.some(g => g.bgg_id === game.bgg_id)}
                      closeOnSelect={false}
                      onSearchBgg={handleSearchBgg}
                      isShowingBggResults={isShowingBggResults}
                      isImporting={isImporting}
                    />

                    {isImporting && (
                      <div className="text-primary bg-primary/5 border border-primary/20 px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-pulse shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                        <span>Importando metadatos y portada del juego desde BoardGameGeek. Por favor, espera...</span>
                      </div>
                    )}
                  </div>

                  {/* Shelf (Bandeja de Juegos) */}
                  <div className="p-4 border border-border/40 rounded-xl bg-muted/20 backdrop-blur-sm shadow-inner space-y-3 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground font-black uppercase tracking-wider block">Juegos en Bandeja ({selectedGames.length})</Label>
                      {selectedGames.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          type="button"
                          onClick={() => setSelectedGames([])}
                          className="h-7 px-2 text-[10px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Vaciar
                        </Button>
                      )}
                    </div>

                    {selectedGames.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-border/50 rounded-lg bg-background/30 text-muted-foreground text-xs font-semibold">
                        Los juegos añadidos aparecerán aquí.
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent min-h-[72px] border border-transparent rounded-lg">
                        <AnimatePresence initial={false}>
                          {selectedGames.map((game) => (
                            <motion.div
                              key={game.bgg_id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              layout
                              className="group relative w-14 h-14 rounded-lg overflow-hidden border border-border bg-background/60 hover:border-primary flex items-center justify-center shrink-0 transition-colors shadow-sm"
                            >
                              {game.image_url ? (
                                <img src={game.image_url} alt={game.title} className="w-full h-full object-cover pointer-events-none" />
                              ) : (
                                <div className="absolute inset-0 bg-muted/40 text-[9px] font-bold text-center flex items-center justify-center p-0.5 line-clamp-2">
                                  {game.title}
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => setSelectedGames(prev => prev.filter(g => g.bgg_id !== game.bgg_id))}
                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-background/90 hover:bg-destructive hover:text-destructive-foreground border border-border rounded-full flex items-center justify-center text-[9px] text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                                title={`Quitar ${game.title}`}
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Continue Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/20">
                    <Button 
                      type="button"
                      onClick={() => setShowDetails(true)}
                      className="flex-1 h-11 text-xs font-bold shadow-md cursor-pointer"
                    >
                      {selectedGames.length > 0 ? 'Continuar con estos juegos' : 'Continuar sin juego'}
                    </Button>
                  </div>
                </MotionDiv>
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
                      <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Juegos de la Sesión</Label>
                      <Button variant="outline" size="sm" type="button" onClick={() => setShowDetails(false)} className="rounded-full text-xs h-8 border-border/50 cursor-pointer">
                        Añadir/Cambiar
                      </Button>
                    </div>
                    {selectedGames.length === 0 ? (
                      <p className="text-xs font-medium text-muted-foreground italic">Por decidir en el chat (ningún juego fijo aún).</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedGames.map(game => (
                          <div key={game.bgg_id} className="flex items-center gap-1.5 bg-background/60 border border-border/60 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            {game.image_url && <img src={game.image_url} className="w-4 h-4 object-contain rounded" />}
                            <span>{game.title}</span>
                            {game.is_expansion && (
                              <span className="ml-1 px-1 py-0.5 text-[8px] font-black uppercase text-purple-500 bg-purple-500/10 border border-purple-500/20 rounded-md shrink-0">
                                Expansión
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
                      <button
                        type="button"
                        onClick={() => setShowExpansions(!showExpansions)}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer bg-transparent border-0 p-0"
                      >
                        {showExpansions ? '− Ocultar Expansiones' : `+ Añadir Expansiones (${availableExpansions.length} disponibles)`}
                      </button>
                      
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
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleExpansion(exp)}
                                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                    />
                                    {exp.image_url ? (
                                      <img src={exp.image_url} alt={exp.title} className="w-8 h-8 rounded-lg object-cover shadow-sm shrink-0" />
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
                    <Label htmlFor="title" className="font-bold">Título de la mesa</Label>
                    <Input 
                      id="title"
                      placeholder="Ej: Tarde de Eurogames, Campaña Gloomhaven..."
                      className="bg-background/50 focus-visible:ring-primary/40 border-border/50 h-11"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required 
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="font-bold">Descripción (Opcional)</Label>
                    <Textarea 
                      id="description"
                      placeholder="Explica detalles como el nivel de experiencia requerido, si hay que llevar comida, etc."
                      className="min-h-[100px] resize-none bg-background/50 focus-visible:ring-primary/40 border-border/50 p-3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Modality Selector */}
                  <div className="space-y-1.5">
                    <Label className="font-bold">Modalidad de la Partida</Label>
                    <Tabs
                      options={[
                        { id: 'presencial', label: 'Presencial', icon: MapPin },
                        { id: 'online', label: 'Online', icon: Laptop }
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
                        {/* City Input with Autocomplete */}
                        <div className="space-y-1.5 relative">
                          <Label htmlFor="city" className="font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> Ciudad
                          </Label>
                          <Input 
                            id="city"
                            placeholder="Ej: Madrid, Barcelona..."
                            className="bg-background/50 focus-visible:ring-primary/40 border-border/50 h-11"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value)
                              setShowCitySuggestions(true)
                            }}
                            onFocus={() => setShowCitySuggestions(true)}
                            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                            required 
                            autoComplete="off"
                          />
                          <AnimatePresence>
                            {showCitySuggestions && suggestions.length > 0 && (
                              <MotionDiv
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-card border border-border/50 rounded-xl shadow-lg divide-y divide-border/20 custom-scrollbar"
                              >
                                {suggestions.slice(0, 8).map((suggestion, idx) => (
                                  <div
                                    key={idx}
                                    className="px-4 py-2 text-sm text-foreground/90 hover:bg-primary/10 cursor-pointer font-medium transition-colors"
                                    onMouseDown={() => {
                                      setCity(suggestion)
                                      setShowCitySuggestions(false)
                                    }}
                                  >
                                    {suggestion}
                                  </div>
                                ))}
                              </MotionDiv>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="location" className="font-bold">Dirección / Lugar</Label>
                          <Input 
                            id="location"
                            placeholder="Ej: Café Central, Calle Mayor 5..."
                            className="bg-background/50 focus-visible:ring-primary/40 border-border/50 h-11"
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
                            <Laptop className="w-3.5 h-3.5 text-primary" /> Plataforma Online
                          </Label>
                          <Input 
                            id="platform"
                            placeholder="Ej: Board Game Arena, TTS, Discord..."
                            className="bg-background/50 focus-visible:ring-primary/40 border-border/50 h-11"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value)}
                            required 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="voiceLink" className="font-bold flex items-center gap-1">
                            <PhoneCall className="w-3.5 h-3.5 text-primary" /> Enlace de Voz (Opcional)
                          </Label>
                          <Input 
                            id="voiceLink"
                            placeholder="Ej: https://discord.gg/... o meet.google.com/..."
                            className="bg-background/50 focus-visible:ring-primary/40 border-border/50 h-11"
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
                        <CalendarDays className="w-3.5 h-3.5 text-primary" /> Fecha y Hora
                      </Label>
                      <CalendarDatePicker value={date} onChange={setDate} />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="maxPlayers" className="font-bold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-primary" /> Jugadores Máximos
                      </Label>
                      <Input 
                        id="maxPlayers"
                        type="number" 
                        min="2" 
                        max="50"
                        className="bg-background/50 focus-visible:ring-primary/40 border-border/50 h-11"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <Button type="submit" className="w-full h-12 text-md font-bold shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin"/> {isEditMode ? 'Guardando cambios...' : 'Abriendo mesa...'}
                        </span>
                      ) : (
                        isEditMode ? 'Guardar Cambios' : 'Abrir Mesa en el Tablero'
                      )}
                    </Button>
                  </div>
                </MotionForm>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </MotionDiv>
    </section>
  )
}
export default CreateMeetupPage;
