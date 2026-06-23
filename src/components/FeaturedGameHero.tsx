import { motion } from 'framer-motion'
import { Sparkles, Plus, Star, Users, Hourglass, BarChart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Game } from '../types'
import { getGameTitle } from '../lib/gameLocale'

interface FeaturedGameHeroProps {
  game: Game | null;
}

export function FeaturedGameHero({ game }: FeaturedGameHeroProps) {
  if (!game) return null

  const displayTitle = getGameTitle(game)
  const isSpanish = game.has_spanish_edition || !!game.title_es
  
  // Format complexity (averageweight) to 1 decimal place or show placeholder
  const formattedComplexity = game.complexity 
    ? Number(game.complexity).toFixed(1) 
    : 'N/A'

  // Format rating (average) to 1 decimal place
  const formattedRating = game.rating_average 
    ? Number(game.rating_average).toFixed(1) 
    : (game.rating_geek ? Number(game.rating_geek).toFixed(1) : 'N/A')

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', damping: 25 }}
      className="w-full relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-950/40 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center shadow-xl group"
    >
      {/* Decorative Neon Glows in background */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-br from-primary/10 to-teal-500/5 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-purple-500/5 to-primary/5 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Game Cover on Left */}
      <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-44 md:h-44 shrink-0 rounded-2xl overflow-hidden border border-white/15 bg-zinc-900 shadow-2xl relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="text-4xl">🎲</div>
        )}
      </div>

      {/* Info on Right */}
      <div className="flex-1 min-w-0 text-center md:text-left flex flex-col justify-between h-full space-y-4">
        <div className="space-y-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] sm:text-xs font-black uppercase tracking-wider select-none animate-pulse">
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>Recomendación del Día</span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight break-words text-pretty">
            {displayTitle}
            {game.year_published && (
              <span className="text-muted-foreground/60 text-sm sm:text-base md:text-lg font-normal ml-2">
                ({game.year_published})
              </span>
            )}
          </h2>

          {/* Subtitle / Edition */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-zinc-400">
            {isSpanish && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase text-[10px]">
                Edición en Español
              </span>
            )}
            {game.es_publisher && (
              <span className="text-zinc-500">Editado por {game.es_publisher}</span>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-2 border-y border-white/5 max-w-xl mx-auto md:mx-0">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-zinc-300">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 leading-none">BGG Rating</span>
              <span className="font-extrabold text-white text-sm sm:text-base leading-tight mt-0.5">{formattedRating}</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-zinc-300">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 leading-none">Jugadores</span>
              <span className="font-extrabold text-white text-sm sm:text-base leading-tight mt-0.5">
                {game.min_players === game.max_players 
                  ? game.min_players 
                  : `${game.min_players}-${game.max_players}`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-zinc-300">
            <Hourglass className="w-4 h-4 text-teal-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 leading-none">Duración</span>
              <span className="font-extrabold text-white text-sm sm:text-base leading-tight mt-0.5">
                {game.playing_time ? `${game.playing_time}'` : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-zinc-300">
            <BarChart className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 leading-none">Dificultad</span>
              <span className="font-extrabold text-white text-sm sm:text-base leading-tight mt-0.5">{formattedComplexity} <span className="text-[10px] text-zinc-500">/5</span></span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
          <Link to={`/tablero/new?gameId=${game.bgg_id}`} className="shrink-0">
            <Button size="sm" className="font-bold cursor-pointer rounded-xl h-10 px-5 flex items-center gap-1.5 shadow-lg shadow-primary/10 hover:shadow-primary/20">
              <Plus className="w-4.5 h-4.5" />
              <span>Abrir Mesa</span>
            </Button>
          </Link>
          <Link to={`/juegos/${game.bgg_id}`} className="shrink-0">
            <Button size="sm" variant="outline" className="font-semibold cursor-pointer rounded-xl h-10 px-5 border-white/10 bg-white/5 hover:bg-white/10">
              Ver Detalles
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
