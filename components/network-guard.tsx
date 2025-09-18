"use client"

import type React from "react"

import { useWeb3 } from "@/components/web3-provider"
import { WrongNetworkBanner } from "@/components/wrong-network-banner"
import { CHILIZ_CHAIN_ID } from "@/lib/constants"

interface NetworkGuardProps {
  children: React.ReactNode
  showBanner?: boolean
}

export function NetworkGuard({ children, showBanner = true }: NetworkGuardProps) {
  const { chainId, isConnected, switchToChilizChain, isWrongNetwork } = useWeb3()

  // Show wrong network banner if enabled
  if (showBanner && isConnected && isWrongNetwork) {
    return (
      <div>
        <WrongNetworkBanner currentChainId={chainId} onSwitchNetwork={switchToChilizChain} isConnected={isConnected} />
        {children}
      </div>
    )
  }

  // Block interactions if on wrong network
  if (isConnected && chainId !== CHILIZ_CHAIN_ID) {
    return (
      <div className="opacity-50 pointer-events-none">
        {showBanner && (
          <WrongNetworkBanner
            currentChainId={chainId}
            onSwitchNetwork={switchToChilizChain}
            isConnected={isConnected}
          />
        )}
        {children}
      </div>
    )
  }

  return <>{children}</>
}
