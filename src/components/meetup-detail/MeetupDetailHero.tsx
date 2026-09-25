import { useState } from 'react'
import { Calendar, MapPin, Laptop, Flag } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Meetup } from '../../types'
import { USE_MOCKS } from '../../lib/config'
import { useGameLocale } from '../../hooks/useGameLocale'
import { formatDate } from '../../lib/dateLocale'
import { useTranslation } from 'react-i18next'
import { MeetupHeroCarousel } from './MeetupHeroCarousel'
import { ReportContentDialog } from '../common/ReportContentDialog'

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
  const [isReportOpen, setIsReportOpen] = useState(false)

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
        
        {/* Título de la partida y botón de reporte */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-foreground text-pretty">
            {meetup.title || 'Partida de Juego de Mesa'}
          </h1>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsReportOpen(true)}
            className="text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 shrink-0 mt-0.5 h-8 w-8"
            title={t('reports.reportMeetup', 'Reportar partida')}
            aria-label={t('reports.reportMeetup', 'Reportar partida')}
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Lista de juegos interactiva */}
        {gamesList.length === 0 ? (
          <div className="text-sm font-bold text-amber dark:text-amber-hover flex items-center gap-1.5 pt-1">
            <span>{t('meetup.gamesLabel')}</span> 
            <Badge variant="tag-amber" className="shadow-2xs">
              {t('meetup.toDecideInChat')}
            </Badge>
          </div>
        ) : (
          <div className="text-xs sm:text-sm font-bold text-primary flex flex-wrap items-center gap-2 pt-1">
            <span>{t('meetup.gamesOnTable', { count: gamesList.length })}</span> 
            <div className="flex flex-wrap gap-1.5 items-center">
              {gamesList.map((g, idx) => {
                const title = getGameTitle(g)
                return (
                  <Badge
                    key={g.bgg_id}
                    onClick={() => setActiveGameIdx(idx)}
                    variant={idx === activeGameIdx ? "default" : "secondary"}
                    title={title}
                    className="cursor-pointer transition-all hover:scale-105 active:scale-95 max-w-[200px] sm:max-w-[280px]"
                  >
                    <span className="truncate block">{title}</span>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Detalles: Fecha & Lugar / Plataforma */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-semibold text-muted-foreground pt-3 border-t border-border/30">
          <span className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-primary shrink-0" />
            <span className="font-mono-tabular">
              {formatDate(meetup.date, { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              }, language)}
            </span>
          </span>
          {meetup.is_online ? (
            <span className="flex items-center gap-2">
              <Laptop className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>{ t('meetup.onlineMatch', { platform: meetup.platform || 'BGA / TTS' }) }</span>
            </span>
          ) : (
            meetup.location && meetup.location.toLowerCase() !== 'por acordar' ? (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${meetup.location}, ${meetup.city || ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
              >
                <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                <span className="underline decoration-dotted decoration-primary/50 underline-offset-4">
                  {meetup.location}, {meetup.city}
                </span>
              </a>
            ) : (
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                <span>{meetup.city ? `${meetup.city} • ${t('meetup.toDecideInChat')}` : t('meetup.toDecideInChat')}</span>
              </span>
            )
          )}
        </div>

      </div>

      <ReportContentDialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        contentType="meetup"
        contentId={meetup.id}
        reportedUserId={meetup.creator_id}
        title={t('reports.reportMeetup', 'Reportar partida')}
      />
    </div>
  )
}
