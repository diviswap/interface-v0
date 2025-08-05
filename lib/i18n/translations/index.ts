import type { Language, TranslationKeys } from '../types'
import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import { it } from './it'
import { fr } from './fr'
import { tr } from './tr'
import { ja } from './ja'

export const translations: Record<Language, TranslationKeys> = {
  en,
  es,
  pt,
  it,
  fr,
  tr,
  ja
}
