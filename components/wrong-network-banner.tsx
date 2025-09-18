"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { CHILIZ_CHAIN_ID } from "@/lib/constants"

interface WrongNetworkBannerProps {
  currentChainId: number | null
  onSwitchNetwork: () => void
  isConnected: boolean
}

export function WrongNetworkBanner({ currentChainId, onSwitchNetwork, isConnected }: WrongNetworkBannerProps) {
  if (!isConnected || currentChainId === CHILIZ_CHAIN_ID) {
    return null
  }

  return (
    <Alert className="border-destructive/50 text-destructive bg-destructive/10 mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span>Wrong Network. This platform only works on Chiliz Chain (Chain ID: {CHILIZ_CHAIN_ID}).</span>
        <Button
          onClick={onSwitchNetwork}
          variant="outline"
          size="sm"
          className="ml-4 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Switch Network
        </Button>
      </AlertDescription>
    </Alert>
  )
}
