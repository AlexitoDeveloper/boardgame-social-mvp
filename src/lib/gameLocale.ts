import { Game } from '../types'

/**
 * Supported UI languages.
 * Currently only 'es' is active; 'en' is wired up for future use.
 */
export type AppLanguage = 'es' | 'en'

const LANGUAGE_KEY = 'boardgame_social_language'

/**
 * Returns the currently active language from localStorage.
 * Defaults to 'es'.
 */
export function getLanguage(): AppLanguage {
  const stored = localStorage.getItem(LANGUAGE_KEY)
  if (stored === 'en' || stored === 'es') return stored
  return 'es'
}

/**
 * Persists the user's language choice in localStorage.
 */
export function setLanguage(lang: AppLanguage): void {
  localStorage.setItem(LANGUAGE_KEY, lang)
  window.dispatchEvent(new CustomEvent('language_change', { detail: { lang } }))
}

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
 *   <span>{getGameTitle(game)}</span>
 */
export function getGameTitle(game: Game): string {
  const lang = getLanguage()
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
 */
export function getGamePublisher(game: Game): string | null {
  const lang = getLanguage()
  if (lang === 'es') {
    return game.es_publisher ?? game.publisher ?? null
  }
  return game.publisher ?? null
}
