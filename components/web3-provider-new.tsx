"use client"

import type * as React from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { chilizMainnet } from "@/lib/chains"
import { walletConnect, injected } from "wagmi/connectors"

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.error("WalletConnect Project ID is not set")
}

const config = createConfig({
  chains: [chilizMainnet],
  connectors: [
    injected({
      target: "metaMask",
    }),
    walletConnect({
      projectId: projectId || "",
      metadata: {
        name: "DiviSwap",
        description: "Decentralized Exchange on Chiliz Chain",
        url: "https://diviswap.io",
        icons: ["/logo.png"],
      },
      showQrModal: true,
    }),
    walletConnect({
      projectId: projectId || "",
      metadata: {
        name: "DiviSwap - Socios.com",
        description: "Connect with Socios.com Wallet",
        url: "https://diviswap.io",
        icons: ["/logo.png"],
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: "dark",
        themeVariables: {
          "--wcm-z-index": "1000",
        },
      },
    }),
    injected({
      target: () => ({
        id: "okx",
        name: "OKX Wallet",
        provider: typeof window !== "undefined" ? (window as any).okxwallet : undefined,
      }),
    }),
    injected({
      target: () => ({
        id: "binance",
        name: "Binance Wallet",
        provider: typeof window !== "undefined" ? (window as any).BinanceChain : undefined,
      }),
    }),
  ],
  transports: {
    [chilizMainnet.id]: http(),
  },
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export { config }
