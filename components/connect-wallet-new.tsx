"use client"

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronDown, Wallet, ExternalLink, Copy, Check, CheckCircle2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createAvatar } from "@dicebear/core"
import { identicon } from "@dicebear/collection"
import { useMemo, useState, useEffect } from "react"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n/context"

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance, isLoading } = useBalance({ address })
  const [copied, setCopied] = useState(false)
  const [detectedWallets, setDetectedWallets] = useState<Set<string>>(new Set())
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const detected = new Set<string>()

    if (typeof window !== "undefined") {
      if (window.ethereum?.isMetaMask) detected.add("MetaMask")
      if ((window as any).okxwallet) detected.add("OKX Wallet")
      if ((window as any).BinanceChain) detected.add("Binance Wallet")
      detected.add("WalletConnect")
      detected.add("Socios.com")
    }

    setDetectedWallets(detected)
  }, [])

  const avatarSvg = useMemo(() => {
    if (!address) return null
    const avatar = createAvatar(identicon, { seed: address, size: 32 })
    const svgString = avatar.toString()
    const base64Svg = btoa(
      encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g, (match, p1) =>
        String.fromCharCode(Number.parseInt(p1, 16)),
      ),
    )
    return `data:image/svg+xml;base64,${base64Svg}`
  }, [address])

  const copyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success(t.common.addressCopied)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t.common.failedToCopy)
    }
  }

  const getWalletInfo = (connectorName: string, connectorId: string) => {
    const name = connectorName.toLowerCase()
    const id = connectorId.toLowerCase()

    if (name.includes("metamask")) {
      return {
        name: "MetaMask",
        description: t.common.walletDescriptions.metamask,
        detected: detectedWallets.has("MetaMask"),
        icon: "/images/wallets/metamask.png",
      }
    }

    if (name.includes("okx") || id.includes("okx")) {
      return {
        name: "OKX Wallet",
        description: t.common.walletDescriptions.okx,
        detected: detectedWallets.has("OKX Wallet"),
        icon: "/images/wallets/okx.png",
      }
    }

    if (name.includes("binance") || id.includes("binance")) {
      return {
        name: "Binance Wallet",
        description: t.common.walletDescriptions.binance,
        detected: detectedWallets.has("Binance Wallet"),
        icon: "/images/wallets/binance.png",
      }
    }

    if (name.includes("walletconnect")) {
      if (connectorName.includes("Socios")) {
        return {
          name: "Socios.com",
          description: t.common.walletDescriptions.socios,
          detected: true,
          icon: "/images/wallets/socios.png",
        }
      }
      return {
        name: "WalletConnect",
        description: t.common.walletDescriptions.walletconnect,
        detected: true,
        icon: "/images/wallets/walletconnect.png",
      }
    }

    return {
      name: connectorName,
      description: t.common.walletDescriptions.default,
      detected: false,
      icon: "",
    }
  }

  const getUniqueConnectors = () => {
    const walletOrder = ["MetaMask", "WalletConnect", "OKX Wallet", "Socios.com", "Binance Wallet"]
    const walletMap = new Map()

    for (const connector of connectors) {
      const walletInfo = getWalletInfo(connector.name, connector.id)
      const key = walletInfo.name
      if (walletOrder.includes(key) && !walletMap.has(key)) {
        walletMap.set(key, { connector, walletInfo })
      }
    }

    const walletConnectConnector = connectors.find((c) => c.name.toLowerCase().includes("walletconnect"))
    if (walletConnectConnector && !walletMap.has("Socios.com")) {
      walletMap.set("Socios.com", {
        connector: walletConnectConnector,
        walletInfo: {
          name: "Socios.com",
          description: t.common.walletDescriptions.socios,
          detected: true,
          icon: "/images/wallets/socios.png",
        },
      })
    }

    const detectedFirst: any[] = []
    const notDetected: any[] = []

    for (const walletName of walletOrder) {
      const wallet = walletMap.get(walletName)
      if (wallet) {
        if (wallet.walletInfo.detected) {
          detectedFirst.push(wallet)
        } else {
          notDetected.push(wallet)
        }
      }
    }

    return [...detectedFirst, ...notDetected]
  }

  // Connected state: compact pill + account dialog
  if (isConnected) {
    return (
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="group flex items-center gap-2 rounded-full border-border/50 bg-card/50 pl-1.5 pr-3 py-1.5 h-10 hover:border-primary/40 hover:bg-card/70 transition-all"
          >
            {avatarSvg && (
              <Avatar className="h-7 w-7 ring-1 ring-primary/30 transition-all group-hover:ring-primary/50">
                <img src={avatarSvg || "/placeholder.svg"} alt="Wallet Avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {address?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-mono text-foreground/90">
                {`${address?.slice(0, 4)}...${address?.slice(-4)}`}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md mx-auto glass-panel-strong border-border/60 p-0 overflow-hidden">
          {/* Header with glow */}
          <div className="relative p-6 border-b border-border/40">
            <div
              aria-hidden
              className="absolute inset-0 -z-0 opacity-40"
              style={{
                background:
                  "radial-gradient(400px circle at 50% 0%, hsl(var(--primary) / 0.18), transparent 60%)",
              }}
            />
            <div className="relative flex items-center gap-4">
              {avatarSvg && (
                <Avatar className="h-14 w-14 ring-2 ring-primary/40 shadow-lg shadow-primary/20">
                  <img src={avatarSvg || "/placeholder.svg"} alt="Wallet Avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {address?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t.common.balance ?? "Balance"}
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading
                    ? t.common.loading
                    : `${balance ? Number.parseFloat(balance.formatted).toFixed(4) : "0.0000"}`}
                  <span className="ml-1 text-base font-medium text-primary">
                    {balance?.symbol || "CHZ"}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground font-mono truncate">{address}</div>
              </div>
            </div>
          </div>

          <div className="p-3 space-y-1">
            <Button
              onClick={copyAddress}
              variant="ghost"
              className="w-full justify-start h-11 rounded-xl hover:bg-primary/10 hover:text-primary"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-3 text-primary" />
              ) : (
                <Copy className="h-4 w-4 mr-3" />
              )}
              {copied ? t.common.copied : t.common.copyAddress}
            </Button>

            <Button
              onClick={() => window.open(`https://scan.chiliz.com/address/${address}`, "_blank")}
              variant="ghost"
              className="w-full justify-start h-11 rounded-xl hover:bg-primary/10 hover:text-primary"
            >
              <ExternalLink className="h-4 w-4 mr-3" />
              {t.common.viewOnExplorer}
            </Button>

            <div className="h-px bg-border/40 my-2" />

            <Button
              onClick={() => {
                disconnect()
                setAccountOpen(false)
              }}
              variant="ghost"
              className="w-full justify-start h-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Wallet className="h-4 w-4 mr-3" />
              {t.common.disconnect}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Not connected: CTA + wallet selector dialog
  return (
    <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
      <DialogTrigger asChild>
        <Button className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 sm:px-5 h-10 text-sm transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 border-0">
          <Wallet className="w-4 h-4 mr-2" />
          <span className="hidden xs:inline">{t.common.connectWallet}</span>
          <span className="xs:hidden">{t.common.connect}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md mx-auto glass-panel-strong border-border/60 p-0 overflow-hidden">
        <div className="relative p-6 border-b border-border/40">
          <div
            aria-hidden
            className="absolute inset-0 -z-0 opacity-40"
            style={{
              background:
                "radial-gradient(400px circle at 50% 0%, hsl(var(--primary) / 0.18), transparent 60%)",
            }}
          />
          <DialogHeader className="relative space-y-1">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30">
              <Wallet className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl">{t.common.connectWallet}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t.common.chooseWallet}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-3 space-y-1.5 max-h-[60vh] overflow-y-auto">
          {getUniqueConnectors().map(({ connector, walletInfo }) => (
            <button
              key={`${connector.uid}-${walletInfo.name}`}
              onClick={() => {
                connect({ connector })
                setSelectorOpen(false)
              }}
              className="group w-full flex items-center gap-3 p-3 rounded-xl border border-transparent bg-background/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-card ring-1 ring-border/50 overflow-hidden">
                <img
                  src={walletInfo.icon || "/placeholder.svg"}
                  alt={walletInfo.name}
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm truncate">
                    {walletInfo.name}
                  </span>
                  {walletInfo.detected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/20">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {t.common.detected ?? "Detected"}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {walletInfo.description}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </button>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {t.common.termsAgreement}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
