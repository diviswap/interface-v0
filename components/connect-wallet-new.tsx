"use client"

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, Wallet, ExternalLink, Copy, Check } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createAvatar } from "@dicebear/core"
import { identicon } from "@dicebear/collection"
import { useMemo, useState } from "react"
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
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const { t } = useTranslation()

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

  const getWalletDescription = (connectorName: string) => {
    const name = connectorName.toLowerCase()
    if (name.includes("metamask")) return t.common.walletDescriptions.metamask
    if (name.includes("walletconnect")) return t.common.walletDescriptions.walletconnect
    if (name.includes("coinbase")) return t.common.walletDescriptions.coinbase
    return t.common.walletDescriptions.default
  }

  if (isConnected) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-black border-orange-500/30 px-3 py-2 h-auto hover:from-gray-800 hover:to-gray-900 text-white transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border"
          >
            {avatarSvg && (
              <Avatar className="h-7 w-7 ring-2 ring-orange-500/20">
                <img src={avatarSvg || "/placeholder.svg"} alt="Wallet Avatar" />
                <AvatarFallback className="bg-orange-500 text-black text-xs font-bold">
                  {address?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col items-start min-w-0">
              <span className="text-xs font-mono text-gray-400 leading-tight truncate">
                {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md mx-auto bg-gradient-to-b from-gray-900 to-black border-orange-500/30 text-white shadow-2xl backdrop-blur-md">
          <div className="px-3 py-2 border-b border-gray-700/50 mb-4">
            <div className="flex items-center gap-3">
              {avatarSvg && (
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-orange-500/30">
                  <img src={avatarSvg || "/placeholder.svg"} alt="Wallet Avatar" />
                  <AvatarFallback className="bg-orange-500 text-black font-bold">
                    {address?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-semibold text-orange-400">
                  {isLoading
                    ? t.common.loading
                    : `${balance ? Number.parseFloat(balance.formatted).toFixed(6) : "0.000000"} ${balance?.symbol || "CHZ"}`}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 font-mono truncate">{address}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={copyAddress}
              variant="ghost"
              className="w-full justify-start hover:bg-gray-700/50 text-white rounded-lg transition-colors duration-200 h-12"
            >
              {copied ? <Check className="h-4 w-4 text-orange-400 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? t.common.copied : t.common.copyAddress}
            </Button>

            <Button
              onClick={() => window.open(`https://scan.chiliz.com/address/${address}`, "_blank")}
              variant="ghost"
              className="w-full justify-start hover:bg-gray-700/50 text-white rounded-lg transition-colors duration-200 h-12"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t.common.viewOnExplorer}
            </Button>

            <div className="h-px bg-gray-700/50 my-4" />

            <Button
              onClick={() => disconnect()}
              variant="ghost"
              className="w-full justify-start hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg transition-colors duration-200 h-12"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {t.common.disconnect}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold px-4 sm:px-6 py-2.5 h-auto transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-0 text-sm sm:text-base">
          <Wallet className="w-4 h-4 mr-2" />
          <span className="hidden xs:inline">{t.common.connectWallet}</span>
          <span className="xs:hidden">{t.common.connect}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg mx-auto bg-gradient-to-b from-gray-900 via-gray-900 to-black border-orange-500/30 text-white shadow-2xl backdrop-blur-md rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="relative bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-4 sm:p-6 border-b border-orange-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
          <div className="relative">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
              {t.common.connectWallet}
            </h2>
            <p className="text-sm sm:text-base text-gray-300">{t.common.chooseWallet}</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          {connectors.map((connector, index) => (
            <Button
              key={connector.uid}
              onClick={() => {
                connect({ connector })
                setIsWalletModalOpen(false)
              }}
              variant="ghost"
              className="w-full p-3 sm:p-4 h-auto justify-start hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-orange-600/10 border border-gray-700/50 hover:border-orange-500/30 rounded-xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 sm:gap-4 w-full">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center group-hover:from-orange-500/20 group-hover:to-orange-600/20 transition-all duration-300 flex-shrink-0">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-white group-hover:text-orange-400 transition-colors duration-300 text-base sm:text-lg truncate">
                    {connector.name}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300 line-clamp-2">
                    {getWalletDescription(connector.name)}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 rotate-[-90deg] group-hover:text-orange-400 transition-all duration-300 flex-shrink-0" />
              </div>
            </Button>
          ))}
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700/30">
            <p className="text-xs text-gray-400 text-center leading-relaxed">{t.common.termsAgreement}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
