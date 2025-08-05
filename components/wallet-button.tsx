"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { Identicon } from "@/components/identicon"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/context"

interface WalletButtonProps {
  className?: string
}

export function WalletButton({ className }: WalletButtonProps) {
  const { account, isConnected, connect, disconnect } = useWeb3()
  const [mounted, setMounted] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (isConnected && account) {
    return (
      <Button variant="outline" onClick={disconnect} className={cn("flex items-center gap-2", className)}>
        <Identicon address={account} size={20} />
        <span className="hidden sm:inline">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <span className="sm:hidden">{account.slice(0, 4)}...</span>
      </Button>
    )
  }

  return (
    <Button onClick={connect} className={className}>
      {t.common.connectWallet}
    </Button>
  )
}
