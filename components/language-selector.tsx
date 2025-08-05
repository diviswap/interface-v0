"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/lib/i18n/context'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/config'
import { ChevronDown, Globe } from 'lucide-react'

export function LanguageSelector() {
  const { language, setLanguage } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === language)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 gap-2 hover:bg-muted/50 transition-colors"
        >
          {currentLanguage ? (
            <div className="flex items-center gap-2">
              <Image
                src={currentLanguage.flag || "/placeholder.svg"}
                alt={currentLanguage.name}
                width={20}
                height={15}
                className="rounded-sm object-cover"
                unoptimized
              />
              <span className="hidden sm:inline text-sm font-medium">
                {currentLanguage.nativeName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Language</span>
            </div>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code)
              setIsOpen(false)
            }}
            className={`flex items-center gap-3 cursor-pointer ${
              language === lang.code ? 'bg-muted' : ''
            }`}
          >
            <Image
              src={lang.flag || "/placeholder.svg"}
              alt={lang.name}
              width={20}
              height={15}
              className="rounded-sm object-cover"
              unoptimized
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{lang.nativeName}</span>
              <span className="text-xs text-muted-foreground">{lang.name}</span>
            </div>
            {language === lang.code && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
