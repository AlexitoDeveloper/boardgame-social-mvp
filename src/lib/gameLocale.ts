import { Game } from '../types'

/**
 * Supported UI languages.
 */
export type AppLanguage = 'es' | 'en'

/**
 * Returns the appropriate display title for a game based on the active language.
 *
 * - 'es': returns `game.title_es` if available, otherwise falls back to `game.title` (English).
 * - 'en': always returns `game.title` (the original English/international title).
 *
 * `game.title` is always the original English title and is NEVER overwritten with Spanish.
 * `game.title_es` is the Spanish title set by the BGG backfill cron job (nullable).
 *
 * Usage:
 *   import { getGameTitle } from '../lib/gameLocale'
 *   <span>{getGameTitle(game, language)}</span>
 */
export function getGameTitle(game: Game, lang: AppLanguage = 'es'): string {
  if (lang === 'es') {
    return game.title_es || game.title
  }
  // English mode: always the original title
  return game.title
}

/**
 * Returns the appropriate publisher name for a game based on the active language.
 *
 * - 'es': returns `game.es_publisher` if available, otherwise falls back to `game.publisher`.
 * - 'en': returns `game.publisher` (the original publisher).
 *
 * Returns null when no publisher data is available for the selected language.
 *
 * Usage:
 *   import { getGamePublisher } from '../lib/gameLocale'
 *   <span>{getGamePublisher(game, language)}</span>
 */
export function getGamePublisher(game: Game, lang: AppLanguage = 'es'): string | null {
  if (lang === 'es') {
    return game.es_publisher ?? game.publisher ?? null
  }
  return game.publisher ?? null
}
