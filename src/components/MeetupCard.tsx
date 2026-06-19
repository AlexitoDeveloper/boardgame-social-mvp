import { useState } from 'react'
import { Card} from './ui/card'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Tag } from './ui/tag'
import { MapPin, CalendarDays, Users, Loader2, Laptop, Dices, ChevronLeft, ChevronRight } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { Meetup } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { getGameTitle } from '../lib/gameLocale'

interface MeetupCardProps {
  meetup: Meetup;
  user: User | null;
  updatingId: string | null;
  onJoinLeave: (meetup: Meetup) => void;
  onNavigate: (path: string) => void;
}

export function MeetupCard({ meetup, user, updatingId, onJoinLeave, onNavigate }: MeetupCardProps) {
  const userId = user?.id
  const isJoined = userId ? meetup.joined_players?.includes(userId) : false
  const isCreator = meetup.creator_id === userId
  const registeredCount = meetup.joined_players?.length || 0
  const guestsCount = meetup.meetup_guests?.length || 0
  const totalAttendees = registeredCount + guestsCount
  const isFull = totalAttendees >= meetup.max_players
  const isLoading = updatingId === meetup.id

  const spotsRemaining = meetup.max_players - totalAttendees
  const isLastSpot = spotsRemaining === 1

  // Extract games list from meetup
  const gamesList = Array.isArray(meetup.games) ? meetup.games : (meetup.games ? [meetup.games] : []);
  
  // State for active game index in carousel
  const [activeGameIdx, setActiveGameIdx] = useState(0);
  const [showFullTitle, setShowFullTitle] = useState(false);

  // Get current active game
  const currentGame = gamesList[activeGameIdx] || null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGameIdx((prev) => (prev - 1 + gamesList.length) % gamesList.length);
    setShowFullTitle(false);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGameIdx((prev) => (prev + 1) % gamesList.length);
    setShowFullTitle(false);
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setActiveGameIdx(idx);
    setShowFullTitle(false);
  };

  const renderJoinButton = () => {
    if (meetup.completed) {
      return (
        <Button 
          disabled 
          variant="secondary" 
          size="sm" 
          className="flex-1 select-none rounded-xl font-bold h-9"
        >
          Finalizada
        </Button>
      )
    }

    if (!user) {
      return (
        <Button 
          onClick={() => onNavigate('/auth')} 
          variant="default" 
          size="sm" 
          className="flex-1 h-9 rounded-xl font-bold"
        >
          Apuntarse
        </Button>
      )
    }

    if (isCreator) {
      return (
        <Button 
          disabled 
          variant="secondary" 
          size="sm" 
          className="flex-1 h-9 rounded-xl font-bold"
        >
          Master
        </Button>
      )
    }

    if (isLoading) {
      return (
        <Button 
          disabled 
          variant="secondary" 
          size="sm" 
          className="flex-1 h-9 rounded-xl font-bold"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        </Button>
      )
    }

    if (isJoined) {
      return (
        <Button 
          onClick={() => onJoinLeave(meetup)} 
          variant="destructive" 
          size="sm" 
          className="flex-1 h-9 rounded-xl font-bold"
        >
          Salirse
        </Button>
      )
    }

    if (isFull) {
      return (
        <Button 
          disabled 
          variant="outline" 
          size="sm" 
          className="flex-1 h-9 rounded-xl font-bold"
        >
          Completo
        </Button>
      )
    }

    return (
      <Button 
        onClick={() => onJoinLeave(meetup)} 
        variant="default" 
        size="sm" 
        className="flex-1 h-9 rounded-xl font-bold"
      >
        Apuntarse
      </Button>
    )
  }

  return (
    <Card className="overflow-hidden bg-card/85 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/45 group border border-border/40 flex flex-col relative p-0">
      {/* Banner / Showcase de Portada */}
      <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-muted/40 border-b border-border/30 flex items-center justify-center">
        {currentGame?.image_url ? (
          <>
            {/* Fondo difuminado ambiental */}
            <AnimatePresence mode="wait">
              <motion.img
                key={`bg-${currentGame.bgg_id || activeGameIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={currentGame.image_url}
                alt=""
                className="w-full h-full object-cover filter blur-2xl scale-125 pointer-events-none select-none absolute inset-0"
              />
            </AnimatePresence>

            {/* Portada del juego centrada y con proporción nativa (perfecta para portadas cuadradas/horizontales) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`cover-wrapper-${currentGame.bgg_id || activeGameIdx}`}
                drag={gamesList.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (gamesList.length <= 1) return;
                  const swipeThreshold = 50;
                  if (info.offset.x < -swipeThreshold) {
                    setActiveGameIdx((prev) => (prev + 1) % gamesList.length);
                  } else if (info.offset.x > swipeThreshold) {
                    setActiveGameIdx((prev) => (prev - 1 + gamesList.length) % gamesList.length);
                  }
                }}
                initial={{ opacity: 0, scale: 0.92, x: 0 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ 
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 },
                  x: { type: "spring", stiffness: 300, damping: 30 }
                }}
                className={`absolute inset-0 flex items-center justify-center p-4 z-10 touch-pan-y ${
                  gamesList.length > 1 ? "cursor-grab active:cursor-grabbing" : ""
                }`}
              >
                <img
                  src={currentGame.image_url}
                  alt={getGameTitle(currentGame) || 'Juego'}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-xl border border-white/10 group-hover:scale-[1.03] transition-transform duration-300 pointer-events-none select-none"
                />
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* Placeholder visual premium cuando no hay portada */
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 shadow-inner">
              {meetup.is_online ? <Laptop className="w-8 h-8" /> : <Dices className="w-8 h-8" />}
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Mesa en el Tablero</span>
          </div>
        )}

        {/* Controles del Carrusel */}
        {gamesList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-background/85 hover:bg-background text-foreground flex items-center justify-center border border-border/40 backdrop-blur-sm shadow transition-all active:scale-90 cursor-pointer opacity-80 hover:opacity-100"
              aria-label="Juego anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-background/85 hover:bg-background text-foreground flex items-center justify-center border border-border/40 backdrop-blur-sm shadow transition-all active:scale-90 cursor-pointer opacity-80 hover:opacity-100"
              aria-label="Siguiente juego"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Puntos de paginación */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 px-2 py-1 rounded-full bg-background/70 backdrop-blur-sm border border-border/30 shadow-sm">
              {gamesList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeGameIdx ? "bg-primary scale-125" : "bg-muted-foreground/45 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Ir al juego ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge superior izquierdo: Presencial / Online (usando Tag con variante de diseño sólida) */}
        <div className="absolute top-3 left-3 z-20 flex gap-1.5">
          <Tag variant="default-solid" className="shadow-md">
            {meetup.is_online ? (
              <>
                <Laptop className="w-3.5 h-3.5 text-primary-foreground" /> Online
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-primary-foreground" /> Presencial
              </>
            )}
          </Tag>
        </div>

        {/* Badge superior derecho: Plazas (usando Tag con variante de diseño sólida) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
          <Tag 
            variant="secondary-solid"
            className="shadow-md"
          >
            <Users className="w-3.5 h-3.5" /> {totalAttendees} / {meetup.max_players} plazas
          </Tag>
          {isLastSpot && !meetup.completed && (
            <Tag variant="warning-solid" pulse className="shadow-md">
              Última plaza
            </Tag>
          )}
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Título de la mesa */}
          <div className="flex items-start justify-between gap-2">
            <h3 
              onClick={() => onNavigate(`/tablero/${meetup.id}`)}
              className="text-base sm:text-lg font-extrabold leading-snug tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1 flex items-center gap-2"
            >
              {meetup.title || 'Partida de Juego de Mesa'}
              {meetup.completed && (
                <Tag variant="success-solid">
                  Completada
                </Tag>
              )}
            </h3>
          </div>

          {/* Información del juego */}
          {gamesList.length === 0 ? (
            <div className="text-[11px] font-bold text-amber-500 tracking-wide flex items-center gap-1.5">
              <span>Juego:</span>
              <Tag variant="warning-solid">
                Por decidir en chat
              </Tag>
            </div>
          ) : (
            <motion.div layout className="text-xs font-bold text-primary tracking-wide flex flex-wrap items-center gap-1.5">
              <motion.span layout>Juegos ({gamesList.length}):</motion.span>
              <motion.span 
                layout
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullTitle(!showFullTitle);
                }}
                className={`text-foreground/90 font-semibold cursor-pointer select-none ${
                  showFullTitle 
                    ? "whitespace-normal break-words max-w-full" 
                    : "truncate max-w-[120px] md:max-w-[140px]"
                }`}
                title={showFullTitle ? "Click para contraer" : "Click para ver completo"}
              >
                {currentGame ? getGameTitle(currentGame) : meetup.game_name}
              </motion.span>
              {currentGame?.is_expansion && (
                <motion.div layout className="inline-flex">
                  <Tag variant="purple">
                    Expansión
                  </Tag>
                </motion.div>
              )}
              {gamesList.length > 1 && (
                <motion.div layout className="inline-flex">
                  <Tag variant="secondary-solid">
                    {activeGameIdx + 1} de {gamesList.length}
                  </Tag>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Descripción */}
          {meetup.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 pt-1">
              {meetup.description}
            </p>
          )}
        </div>

        {/* Detalles: Fecha & Lugar / Plataforma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground/90 border-t border-border/30 pt-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">
              {new Date(meetup.date || meetup.created_at || '').toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {meetup.is_online ? (
              <>
                <Laptop className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Online • {meetup.platform || 'Por definir'}</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{meetup.location || 'Ubicación por definir'}</span>
              </>
            )}
          </div>
        </div>

        {/* Master / Creador de la mesa */}
        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <div 
            className="flex items-center gap-2 cursor-pointer group/creator"
            onClick={() => onNavigate(`/perfil/${meetup.creator_id}`)}
          >
            <Avatar className="w-7 h-7 border border-background shadow-sm group-hover/creator:scale-105 transition-transform duration-300">
              <AvatarImage src={meetup.users?.avatar_url || undefined} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {meetup.users?.username?.slice(0,2)?.toUpperCase() || 'H'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground/80 font-medium leading-none mb-0.5">Anfitrión</span>
              <span className="text-xs font-extrabold text-foreground group-hover/creator:text-primary transition-colors leading-none">
                {meetup.users?.username || 'anónimo'}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          <Button 
            onClick={() => onNavigate(`/tablero/${meetup.id}`)}
            variant="outline" 
            size="sm" 
            className="flex-1 h-9 rounded-xl font-bold transition-all duration-200"
          >
            Ver Detalles
          </Button>
          {renderJoinButton()}
        </div>
      </div>
    </Card>
  )
}
