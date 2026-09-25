import { useState } from 'react'
import { Card } from './ui/card'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { ExpansionBadge } from './ui/expansion-badge'
import { MapPin, CalendarDays, Laptop } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { Meetup } from '../types'
import { motion } from 'framer-motion'
import { useGameLocale } from '../hooks/useGameLocale'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../lib/dateLocale'
import { MeetupCardMedia } from './meetup/MeetupCardMedia'
import { MeetupCardActions } from './meetup/MeetupCardActions'

export interface MeetupCardProps {
  meetup: Meetup
  user: User | null
  updatingId: string | null
  onJoinLeave: (meetup: Meetup) => void
  onNavigate: (path: string) => void
}

export function MeetupCard({
  meetup,
  user,
  updatingId,
  onJoinLeave,
  onNavigate,
}: MeetupCardProps) {
  const { t } = useTranslation()
  const { getGameTitle, getGameCover, language } = useGameLocale()
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
  const gamesList = Array.isArray(meetup.games)
    ? meetup.games
    : meetup.games
    ? [meetup.games]
    : []

  // Active game index in carousel
  const [activeGameIdx, setActiveGameIdx] = useState(0)
  const [showFullTitle, setShowFullTitle] = useState(false)

  const currentGame = gamesList[activeGameIdx] || null

  return (
    <Card
      spotlight
      className="overflow-hidden glass-panel spotlight-card transition-[box-shadow,border-color] duration-200 ease-out-custom hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/45 group flex flex-col relative p-0"
    >
      {/* Banner / Poster Showcase with Carousel */}
      <MeetupCardMedia
        gamesList={gamesList}
        activeGameIdx={activeGameIdx}
        setActiveGameIdx={setActiveGameIdx}
        isOnline={Boolean(meetup.is_online)}
        totalAttendees={totalAttendees}
        maxPlayers={meetup.max_players}
        isLastSpot={isLastSpot}
        isCompleted={Boolean(meetup.completed)}
        getGameTitle={getGameTitle}
        getGameCover={getGameCover}
      />

      {/* Card Content */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Meetup Title */}
          <div className="flex items-start justify-between gap-2">
            <h3
              onClick={() => onNavigate(`/mesa/${meetup.id}`)}
              className="text-base sm:text-lg font-extrabold leading-snug tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1 flex items-center gap-2 text-pretty"
            >
              <span>{meetup.title || t('meetup.defaultMeetupTitle')}</span>
              {meetup.completed && (
                <Badge variant="tag-emerald">
                  {t('common.completed')}
                </Badge>
              )}
            </h3>
          </div>

          {/* Game Information */}
          {gamesList.length === 0 ? (
            <div className="text-xs font-bold text-muted-foreground tracking-wide flex items-center gap-1.5">
              <span>{t('common.game')}:</span>
              <Badge variant="secondary">
                {t('create.noGamesSelected')}
              </Badge>
            </div>
          ) : (
            <motion.div layout className="text-xs font-bold text-primary tracking-wide flex flex-wrap items-center gap-1.5">
              <motion.span layout>{t('create.sessionGames')} ({gamesList.length}):</motion.span>
              <motion.span
                layout
                onClick={(e) => {
                  e.stopPropagation()
                  setShowFullTitle(!showFullTitle)
                }}
                className={`text-foreground/90 font-semibold cursor-pointer select-none ${
                  showFullTitle
                    ? "whitespace-normal break-words max-w-full"
                    : "truncate max-w-[120px] md:max-w-[140px]"
                }`}
                title={showFullTitle ? t('common.clickToCollapse') : t('common.clickToExpand')}
              >
                {currentGame ? getGameTitle(currentGame) : meetup.game_name}
              </motion.span>
              {currentGame?.is_expansion && (
                <motion.div layout className="inline-flex">
                  <ExpansionBadge size="sm" />
                </motion.div>
              )}
              {gamesList.length > 1 && (
                <motion.div layout className="inline-flex">
                  <Badge variant="secondary" className="font-mono-tabular">
                    {activeGameIdx + 1} {t('common.of')} {gamesList.length}
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Description */}
          {meetup.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2 pt-1 text-pretty">
              {meetup.description}
            </p>
          )}
        </div>

        {/* Date & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground/90 border-t border-border/30 pt-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate font-mono-tabular">
              {formatDate(meetup.date || meetup.created_at || '', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }, language)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {meetup.is_online ? (
              <>
                <Laptop className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{t('common.online')} • {meetup.platform || t('common.toDecide')}</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{meetup.location || t('common.toDecide')}</span>
              </>
            )}
          </div>
        </div>

        {/* Host Avatar & Name */}
        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <div
            className="flex items-center gap-2 cursor-pointer group/creator"
            onClick={() => onNavigate(`/perfil/${meetup.creator_id}`)}
          >
            <Avatar className="w-7 h-7 border border-background shadow-xs group-hover/creator:scale-105 transition-transform duration-300">
              <AvatarImage src={meetup.users?.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                {meetup.users?.username?.slice(0, 2)?.toUpperCase() || 'H'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground/80 font-medium leading-none mb-0.5">{t('common.host')}</span>
              <span className="text-xs font-extrabold text-foreground group-hover/creator:text-primary transition-colors leading-none">
                {meetup.users?.username || t('common.anonymous')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <MeetupCardActions
          meetup={meetup}
          user={user}
          isLoading={isLoading}
          isJoined={isJoined}
          isCreator={isCreator}
          isFull={isFull}
          onJoinLeave={onJoinLeave}
          onNavigate={onNavigate}
        />
      </div>
    </Card>
  )
}
