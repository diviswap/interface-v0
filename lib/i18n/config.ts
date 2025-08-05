import type { Language, LanguageConfig } from './types'

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '/flags/uk.gif'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '/flags/spain.gif'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '/flags/portugal.gif'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '/flags/italy.gif'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '/flags/france.gif'
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '/flags/turkey.gif'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '/flags/japan.gif'
  }
]

export const DEFAULT_LANGUAGE: Language = 'en'

export const LANGUAGE_STORAGE_KEY = 'diviswap-language'
