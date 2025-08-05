"use client"

import type * as React from "react"
import { WagmiProvider, createConfig, http } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { chilizMainnet } from "@/lib/chains"
import { walletConnect, injected } from "wagmi/connectors"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
    },
  },
})

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn("WalletConnect Project ID is not set. WalletConnect functionality will be limited.")
}

const createConnectors = () => {
  const connectors = [
    injected({
      target: "metaMask",
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
  ]

  if (projectId) {
    try {
      connectors.push(
        walletConnect({
          projectId,
          metadata: {
            name: "DiviSwap",
            description: "Decentralized Exchange on Chiliz Chain",
            url: typeof window !== "undefined" ? window.location.origin : "https://diviswap.io",
            icons: ["/logo.png"],
          },
          showQrModal: true,
          qrModalOptions: {
            themeMode: "dark",
            themeVariables: {
              "--wcm-z-index": "1000",
            },
          },
          disableProviderPing: false,
        }),
      )
    } catch (error) {
      console.error("Failed to initialize WalletConnect connector:", error)
    }
  }

  return connectors
}

const config = createConfig({
  chains: [chilizMainnet],
  connectors: createConnectors(),
  transports: {
    [chilizMainnet.id]: http(),
  },
  ssr: false,
  batch: {
    multicall: true,
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
