"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Language, TranslationKeys } from './types'
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY } from './config'
import { translations } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: TranslationKeys
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

// Added function to detect browser language and map to supported languages
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  
  // Get browser languages in order of preference
  const browserLanguages = navigator.languages || [navigator.language]
  
  // Map of browser locales to supported languages
  const languageMap: Record<string, Language> = {
    'en': 'en',
    'es': 'es', 
    'pt': 'pt',
    'it': 'it',
    'fr': 'fr',
    'tr': 'tr',
    'ja': 'ja'
  }
  
  // Check each browser language preference
  for (const browserLang of browserLanguages) {
    // Extract language code (e.g., 'en' from 'en-US')
    const langCode = browserLang.split('-')[0].toLowerCase()
    
    // Return if we support this language
    if (languageMap[langCode]) {
      return languageMap[langCode]
    }
  }
  
  return DEFAULT_LANGUAGE
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)

  // Enhanced language loading to detect browser language if no saved preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
    
    if (savedLanguage && translations[savedLanguage]) {
      // Use saved language preference
      setLanguageState(savedLanguage)
    } else {
      // Detect and use browser language
      const detectedLanguage = detectBrowserLanguage()
      setLanguageState(detectedLanguage)
      // Save the detected language as user preference
      localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage)
    }
    
    setIsLoading(false)
  }, [])

  // Save language to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
  }

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language] || translations[DEFAULT_LANGUAGE],
    isLoading
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t } = useI18n()
  return { t }
}
