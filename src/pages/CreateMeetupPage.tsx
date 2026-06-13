import { useState, useEffect, FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Label } from '../components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CalendarDays, MapPin, Users, CheckCircle2, ArrowLeft, Laptop, PhoneCall } from 'lucide-react'
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
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isSearching, setIsSearching] = useState(false)



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
            setSelectedGame({
              bgg_id: Number(foundGame.bgg_id),
              title: foundGame.name,
              year_published: foundGame.year,
              image_url: foundGame.image_url
            })
          } else {
            setSelectedGame({
              bgg_id: 13,
              title: foundMock.game_name,
              year_published: 2020,
              image_url: null
            })
          }
        }
      } else {
        try {
          const { data, error } = await supabase
            .from('meetups')
            .select('*, games(*)')
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
            
            const rawGame = data.games
            const parsedGame = Array.isArray(rawGame) ? rawGame[0] : rawGame
            setSelectedGame((parsedGame as Game) || null)
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedGame) {
      setErrorMsg('Debes seleccionar un juego para la partida.')
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
              game_id: selectedGame.bgg_id,
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
        }
        navigate(`/tablero/${id}`)
      } else {
        const { error: insertError } = await supabase.from('meetups').insert({
          creator_id: userId,
          game_id: selectedGame.bgg_id,
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

        if (insertError) throw new Error(`Error al abrir la mesa: ${insertError.message}`)
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
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-extrabold transition-all duration-300 ${!selectedGame ? 'text-primary' : 'text-success/90'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${!selectedGame ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10' : 'border-success bg-success/15 text-success'}`}>
                  {!selectedGame ? '1' : '✓'}
                </span>
                <span>Seleccionar Juego</span>
              </div>
              <div className="w-8 sm:w-16 h-px bg-border/40" />
              <div className={`flex items-center gap-2 text-xs sm:text-sm font-extrabold transition-all duration-300 ${selectedGame ? 'text-primary' : 'text-muted-foreground/60'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${selectedGame ? 'border-primary bg-primary/10 shadow-sm shadow-primary/10' : 'border-muted bg-muted'}`}>
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
              {!selectedGame ? (
                <MotionDiv 
                  key="search-stage"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="space-y-3">
                    <Label className="text-foreground/80 font-bold text-sm">Busca y selecciona el juego de mesa</Label>
                    <GameSearchBar
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      games={games}
                      setGames={setGames}
                      isSearching={isSearching}
                      placeholder="Buscar juego (ej: Catan, Brass, Terraforming...)"
                      onSelectGame={setSelectedGame}
                    />
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
                  {/* Selected Game Card Header */}
                  <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-primary/5 shadow-inner">
                    <div className="flex items-center gap-3">
                      {selectedGame.image_url ? (
                        <img src={selectedGame.image_url} alt={selectedGame.title} className="w-12 h-12 rounded object-contain bg-background/50 border border-border/30 p-0.5 shadow-sm" />
                      ) : (
                        <div className="bg-primary/20 p-2 rounded-full text-primary">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <Label className="text-xs text-primary uppercase font-bold mb-0.5 block">Juego de la Partida</Label>
                        <p className="font-extrabold text-foreground leading-tight">{selectedGame.title}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" type="button" onClick={() => setSelectedGame(null)} className="rounded-full text-xs h-8 border-border/50">
                      Cambiar Juego
                    </Button>
                  </div>

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
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted/30 backdrop-blur-sm rounded-xl border border-border/40">
                      <button
                        type="button"
                        onClick={() => setIsOnline(false)}
                        className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          !isOnline
                            ? 'bg-background text-primary shadow-sm border border-border/20 font-black'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" /> Presencial
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsOnline(true)}
                        className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isOnline
                            ? 'bg-background text-primary shadow-sm border border-border/20 font-black'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" /> Online
                      </button>
                    </div>
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
