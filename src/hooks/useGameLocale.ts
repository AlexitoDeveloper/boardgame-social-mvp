import { useTranslation } from 'react-i18next'
import { Game } from '../types'
import { getGameTitle as getGameTitleFn, getGamePublisher as getGamePublisherFn, AppLanguage } from '../lib/gameLocale'

export function useGameLocale() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language as AppLanguage

  const getGameTitle = (game: Game) => {
    return getGameTitleFn(game, currentLang)
  }

  const getGamePublisher = (game: Game) => {
    return getGamePublisherFn(game, currentLang)
  }

  return {
    getGameTitle,
    getGamePublisher,
    language: currentLang
  }
}
