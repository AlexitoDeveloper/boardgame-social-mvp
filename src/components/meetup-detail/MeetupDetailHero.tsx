import { useState } from 'react'
import { Calendar, MapPin, Laptop } from 'lucide-react'
import { Tag } from '../ui/tag'
import { Meetup } from '../../types'
import { USE_MOCKS } from '../../lib/config'
import { useGameLocale } from '../../hooks/useGameLocale'
import { formatDate } from '../../lib/dateLocale'
import { useTranslation } from 'react-i18next'
import { MeetupHeroCarousel } from './MeetupHeroCarousel'

interface MeetupDetailHeroProps {
  meetup: Meetup
  isPast: boolean
  isFull: boolean
  spotsRemaining: number
}

export function MeetupDetailHero({ meetup, isPast, isFull, spotsRemaining }: MeetupDetailHeroProps) {
  const { getGameTitle, language } = useGameLocale()
  const { t } = useTranslation()
  const gamesList = meetup.games || []
  
  // State for active game index in carousel
  const [activeGameIdx, setActiveGameIdx] = useState(0)

  const isMock = USE_MOCKS && meetup.id.startsWith('mock-')

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/30 bg-card/65 backdrop-blur-xl shadow-xl flex flex-col p-0">
      
      {/* Banner / Showcase de Portada con carrusel optimizado */}
      <MeetupHeroCarousel
        gamesList={gamesList}
        activeGameIdx={activeGameIdx}
        setActiveGameIdx={setActiveGameIdx}
        isPast={isPast}
        isFull={isFull}
        spotsRemaining={spotsRemaining}
        isOnline={!!meetup.is_online}
        isMock={isMock}
      />

      {/* Información e Identidad */}
      <div className="p-6 sm:p-8 space-y-4 flex-1">
        
        {/* Título de la partida */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-foreground text-pretty">
          {meetup.title || 'Partida de Juego de Mesa'}
        </h1>
        
        {/* Lista de juegos interactiva */}
        {gamesList.length === 0 ? (
          <div className="text-sm font-bold text-amber-500 tracking-wide flex items-center gap-1.5 pt-1">
            <span>{t('meetup.gamesLabel')}</span> 
            <Tag variant="warning-solid" className="shadow-sm">
              {t('meetup.toDecideInChat')}
            </Tag>
          </div>
        ) : (
          <div className="text-xs sm:text-sm font-bold text-primary tracking-wide flex flex-wrap items-center gap-2 pt-1">
            <span>{t('meetup.gamesOnTable', { count: gamesList.length })}</span> 
            <div className="flex flex-wrap gap-1.5">
              {gamesList.map((g, idx) => (
                <Tag
                  key={g.bgg_id}
                  onClick={() => setActiveGameIdx(idx)}
                  variant={idx === activeGameIdx ? "default" : "secondary"}
                  className="cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  {getGameTitle(g)}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Detalles: Fecha & Lugar / Plataforma */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-muted-foreground pt-3 border-t border-border/30">
          <span className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
            {formatDate(meetup.date, { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }, language)}
          </span>
          {meetup.is_online ? (
            <span className="flex items-center gap-2">
              <Laptop className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>{ t('meetup.onlineMatch', { platform: meetup.platform || 'BGA / TTS' }) }</span>
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
