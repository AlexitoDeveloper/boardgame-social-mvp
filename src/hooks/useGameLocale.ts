import { useTranslation } from 'react-i18next'
import { Game } from '../types'
import { 
  getGameTitle as getGameTitleFn, 
  getGamePublisher as getGamePublisherFn,
  getGameCover as getGameCoverFn,
  AppLanguage 
} from '../lib/gameLocale'

export function useGameLocale() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language as AppLanguage

  const getGameTitle = (game: Game) => {
    return getGameTitleFn(game, currentLang)
  }

  const getGamePublisher = (game: Game) => {
    return getGamePublisherFn(game, currentLang)
  }

  const getGameCover = (game: Game) => {
    return getGameCoverFn(game, currentLang)
  }

  return {
    getGameTitle,
    getGamePublisher,
    getGameCover,
    language: currentLang
  }
}
