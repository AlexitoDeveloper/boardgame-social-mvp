import { AppLanguage } from './gameLocale'

/**
 * Formats a date using the active language.
 * - 'es' uses the 'es-ES' locale.
 * - 'en' uses the 'en-US' locale.
 */
export function formatDate(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {},
  lang: AppLanguage = 'es'
): string {
  if (!date) return ''
  const locale = lang === 'es' ? 'es-ES' : 'en-US'
  return new Date(date).toLocaleDateString(locale, options)
}

/**
 * Formats a time using the active language.
 * - 'es' uses the 'es-ES' locale.
 * - 'en' uses the 'en-US' locale.
 */
export function formatTime(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {},
  lang: AppLanguage = 'es'
): string {
  if (!date) return ''
  const locale = lang === 'es' ? 'es-ES' : 'en-US'
  return new Date(date).toLocaleTimeString(locale, options)
}
