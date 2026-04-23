"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n/context"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/config"
import { Check, ChevronDown, Globe } from "lucide-react"

export function LanguageSelector() {
  const { language, setLanguage } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === language)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="group h-10 gap-2 rounded-full border-border/50 bg-card/40 pl-2 pr-3 hover:border-primary/40 hover:bg-card/70 transition-all"
          aria-label="Change language"
        >
          {currentLanguage ? (
            <>
              <div className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-border/60 bg-card">
                <Image
                  src={currentLanguage.flag || "/placeholder.svg"}
                  alt={currentLanguage.name}
                  fill
                  sizes="24px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="hidden sm:inline text-sm font-semibold uppercase text-foreground/90">
                {currentLanguage.code}
              </span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Language</span>
            </>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-1 glass-panel-strong border-border/60">
        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Globe className="h-3.5 w-3.5" />
          Language
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        <div className="py-1">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = language === lang.code
            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary focus:bg-primary/15"
                    : "focus:bg-muted/70"
                }`}
              >
                <div className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-border/60">
                  <Image
                    src={lang.flag || "/placeholder.svg"}
                    alt={lang.name}
                    fill
                    sizes="24px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground truncate">{lang.name}</span>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
