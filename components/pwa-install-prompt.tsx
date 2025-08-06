"use client"

import React, { useState, useEffect } from "react"
import { X, Download, Share } from 'lucide-react'
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslation } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PwaInstallPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    
    // Check if user has dismissed the prompt before
    const hasDismissed = localStorage.getItem('pwa-install-dismissed') === 'true'
    
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)
    
    // Only show on mobile devices, not already installed, and not dismissed
    if (isMobile && !isStandalone && !hasDismissed) {
      // Delay showing the prompt to avoid immediate popup
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isMobile])

  const dismissPrompt = () => {
    setIsVisible(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={dismissPrompt} />
      
      <Card className="relative w-full max-w-sm bg-card/95 backdrop-blur-md border border-border/50 shadow-xl rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full p-2">
              {isIOS ? (
                <Share className="h-5 w-5 text-white" />
              ) : (
                <Download className="h-5 w-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm">{t.common.installApp || "Install DiviSwap App"}</h3>
              {isIOS ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {t.common.installIOSInstructions || "Tap Share and then 'Add to Home Screen'"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  {t.common.installAndroidInstructions || "Tap the menu and select 'Install App'"}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={dismissPrompt} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
