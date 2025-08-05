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

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
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
