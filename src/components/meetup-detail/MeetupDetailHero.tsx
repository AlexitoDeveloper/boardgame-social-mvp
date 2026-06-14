import { useState } from 'react'
import { Calendar, MapPin, Laptop, ChevronLeft, ChevronRight, Dices } from 'lucide-react'
import { Tag } from '../ui/tag'
import { Meetup } from '../../types'
import { USE_MOCKS } from '../../lib/config'
import { motion, AnimatePresence } from 'framer-motion'

interface MeetupDetailHeroProps {
  meetup: Meetup;
  isPast: boolean;
  isFull: boolean;
  spotsRemaining: number;
}

export function MeetupDetailHero({ meetup, isPast, isFull, spotsRemaining }: MeetupDetailHeroProps) {
  const gamesList = meetup.games || [];
  
  // State for active game index in carousel
  const [activeGameIdx, setActiveGameIdx] = useState(0);

  // Get current active game
  const currentGame = gamesList[activeGameIdx] || null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGameIdx((prev) => (prev - 1 + gamesList.length) % gamesList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveGameIdx((prev) => (prev + 1) % gamesList.length);
  };

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setActiveGameIdx(idx);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/30 bg-card/65 backdrop-blur-xl shadow-xl flex flex-col p-0">
      
      {/* Banner / Showcase de Portada */}
      <div className="relative w-full h-52 sm:h-64 overflow-hidden bg-muted/40 border-b border-border/30 flex items-center justify-center">
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
            <div className="absolute inset-0 flex items-center justify-center p-4 z-10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`cover-${currentGame.bgg_id || activeGameIdx}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.3 }}
                  src={currentGame.image_url}
                  alt={currentGame.title || 'Juego'}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-xl border border-white/10 group-hover:scale-[1.02] transition-transform duration-355"
                />
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* Placeholder visual premium cuando no hay portada */
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 shadow-inner">
              {meetup.is_online ? <Laptop className="w-9 h-9" /> : <Dices className="w-9 h-9" />}
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

        {/* Badge superior izquierdo: Estado de la mesa (usando variantes sólidas de Tag) */}
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          {isPast ? (
            <Tag variant="secondary-solid" className="shadow-md">
              Finalizada
            </Tag>
          ) : isFull ? (
            <Tag variant="destructive-solid" className="shadow-md">
              Mesa llena
            </Tag>
          ) : spotsRemaining === 1 ? (
            <Tag variant="warning-solid" className="shadow-md" pulse>
              Última plaza
            </Tag>
          ) : (
            <Tag variant="success-solid" className="shadow-md">
              Mesa abierta
            </Tag>
          )}
          
          {USE_MOCKS && meetup.id.startsWith('mock-') && (
            <Tag variant="secondary-solid" className="shadow-md">
              Demo
            </Tag>
          )}
        </div>
      </div>

      {/* Información e Identidad */}
      <div className="p-6 sm:p-8 space-y-4 flex-1">
        
        {/* Título de la partida */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-foreground">
          {meetup.title || 'Partida de Juego de Mesa'}
        </h1>
        
        {/* Lista de juegos interactiva */}
        {gamesList.length === 0 ? (
          <div className="text-sm font-bold text-amber-500 tracking-wide flex items-center gap-1.5 pt-1">
            <span>Juegos:</span> 
            <Tag variant="warning-solid" className="shadow-sm">
              Por decidir en el chat
            </Tag>
          </div>
        ) : (
          <div className="text-xs sm:text-sm font-bold text-primary tracking-wide flex flex-wrap items-center gap-2 pt-1">
            <span>Juegos en mesa ({gamesList.length}):</span> 
            <div className="flex flex-wrap gap-1.5">
              {gamesList.map((g, idx) => (
                <Tag
                  key={g.bgg_id}
                  onClick={() => setActiveGameIdx(idx)}
                  variant={idx === activeGameIdx ? "default" : "secondary"}
                  className="cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  {g.title}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Detalles: Fecha & Lugar / Plataforma */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-muted-foreground pt-3 border-t border-border/30">
          <span className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
            {new Date(meetup.date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {meetup.is_online ? (
            <span className="flex items-center gap-2">
              <Laptop className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Partida Online • {meetup.platform || 'BGA / TTS'}</span>
            </span>
          ) : (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${meetup.location || ''}, ${meetup.city || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
            >
              <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
              <span className="underline decoration-dotted decoration-primary/50 underline-offset-4">
                {meetup.location}, {meetup.city}
              </span>
            </a>
          )}
        </div>

      </div>
    </div>
  )
}
