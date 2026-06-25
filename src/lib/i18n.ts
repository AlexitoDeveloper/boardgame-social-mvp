import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { translations } from './translations'

const resources = {
  es: {
    translation: translations.es,
  },
  en: {
    translation: translations.en,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
