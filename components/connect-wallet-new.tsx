"use client"

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, Wallet, ExternalLink, Copy, Check, CheckCircle } from "lucide-react"
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
  const { data: balance, isLoading } = useBalance({
    address,
  })
  const [copied, setCopied] = useState(false)
  const [detectedWallets, setDetectedWallets] = useState<Set<string>>(new Set())
  const { t } = useTranslation()

  useEffect(() => {
    const detected = new Set<string>()

    if (typeof window !== "undefined") {
      // Check for MetaMask
      if (window.ethereum?.isMetaMask) {
        detected.add("MetaMask")
      }

      // Check for OKX Wallet
      if ((window as any).okxwallet) {
        detected.add("OKX Wallet")
      }

      // Check for Binance Wallet
      if ((window as any).BinanceChain) {
        detected.add("Binance Wallet")
      }

      // WalletConnect and Socios are always available (they don't need to be "installed")
      detected.add("WalletConnect")
      detected.add("Socios.com")
    }

    setDetectedWallets(detected)
  }, [])

  const avatarSvg = useMemo(() => {
    if (!address) return null
    const avatar = createAvatar(identicon, {
      seed: address,
      size: 32,
    })
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
    } catch (err) {
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
      // Check if this is the Socios.com specific connector
      if (connectorName.includes("Socios")) {
        return {
          name: "Socios.com",
          description: t.common.walletDescriptions.socios,
          detected: true, // Always available
          icon: "/images/wallets/socios.png",
        }
      }
      return {
        name: "WalletConnect",
        description: t.common.walletDescriptions.walletconnect,
        detected: true, // Always available
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

  // Creando función para obtener conectores únicos incluyendo Socios.com como opción separada
  const getUniqueConnectors = () => {
    const walletOrder = ["MetaMask", "WalletConnect", "OKX Wallet", "Socios.com", "Binance Wallet"]
    const walletMap = new Map()

    // Agregar conectores regulares
    for (const connector of connectors) {
      const walletInfo = getWalletInfo(connector.name, connector.id)
      const key = walletInfo.name

      if (walletOrder.includes(key) && !walletMap.has(key)) {
        walletMap.set(key, { connector, walletInfo })
      }
    }

    // Agregar Socios.com como opción separada usando el conector de WalletConnect
    const walletConnectConnector = connectors.find((c) => c.name.toLowerCase().includes("walletconnect"))
    if (walletConnectConnector && !walletMap.has("Socios.com")) {
      walletMap.set("Socios.com", {
        connector: walletConnectConnector,
        walletInfo: {
          name: "Socios.com",
          description: t.common.walletDescriptions.socios,
          detected: true, // Always available
          icon: "/images/wallets/socios.png",
        },
      })
    }

    const orderedWallets = []
    const detectedFirst = []
    const notDetected = []

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

  if (isConnected) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 px-3 py-2 h-auto transition-all duration-300"
          >
            {avatarSvg && (
              <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                <img src={avatarSvg || "/placeholder.svg"} alt="Wallet Avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {address?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col items-start min-w-0">
              <span className="text-xs font-mono text-muted-foreground leading-tight truncate">
                {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md mx-auto bg-popover border-border shadow-2xl backdrop-blur-md">
          <div className="px-3 py-2 border-b border-border mb-4">
            <div className="flex items-center gap-3">
              {avatarSvg && (
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-primary/30">
                  <img src={avatarSvg || "/placeholder.svg"} alt="Wallet Avatar" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {address?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-semibold text-primary">
                  {isLoading
                    ? t.common.loading
                    : `${balance ? Number.parseFloat(balance.formatted).toFixed(6) : "0.000000"} ${balance?.symbol || "CHZ"}`}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-mono truncate">{address}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={copyAddress}
              variant="ghost"
              className="w-full justify-start hover:bg-accent text-foreground rounded-lg transition-colors duration-200 h-12"
            >
              {copied ? <Check className="h-4 w-4 text-primary mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? t.common.copied : t.common.copyAddress}
            </Button>

            <Button
              onClick={() => window.open(`https://scan.chiliz.com/address/${address}`, "_blank")}
              variant="ghost"
              className="w-full justify-start hover:bg-accent text-foreground rounded-lg transition-colors duration-200 h-12"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t.common.viewOnExplorer}
            </Button>

            <div className="h-px bg-border my-4" />

            <Button
              onClick={() => disconnect()}
              variant="ghost"
              className="w-full justify-start hover:bg-destructive/10 text-destructive hover:text-destructive rounded-lg transition-colors duration-200 h-12"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {t.common.disconnect}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Reemplazando Dialog con DropdownMenu para un diseño más profesional
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 sm:px-6 py-2.5 h-auto transition-all duration-300 shadow-lg hover:shadow-xl border-0 text-sm sm:text-base">
          <Wallet className="w-4 h-4 mr-2" />
          <span className="hidden xs:inline">{t.common.connectWallet}</span>
          <span className="xs:hidden">{t.common.connect}</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 p-2 bg-popover border-border shadow-2xl backdrop-blur-md"
        align="end"
        sideOffset={8}
      >
        <div className="px-3 py-2 border-b border-border mb-2">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            {t.common.connectWallet}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{t.common.chooseWallet}</p>
        </div>

        {getUniqueConnectors().map(({ connector, walletInfo }) => (
          <DropdownMenuItem
            key={`${connector.uid}-${walletInfo.name}`}
            onClick={() => connect({ connector })}
            className="p-3 cursor-pointer hover:bg-accent rounded-lg transition-all duration-200 focus:bg-accent"
          >
            <div className="flex items-center gap-3 w-full">
              <img
                src={walletInfo.icon || "/placeholder.svg"}
                alt={walletInfo.name}
                className="w-8 h-8 object-contain flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm truncate">{walletInfo.name}</span>
                  {walletInfo.detected && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">Detected</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{walletInfo.description}</p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}

        <div className="px-3 py-2 mt-2 border-t border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">{t.common.termsAgreement}</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
