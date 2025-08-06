import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client"

export const metadata: Metadata = {
  title: "DiviSwap | Chiliz Chain DEX",
  description: "Trade and provide liquidity on Chiliz Chain",
  manifest: "/manifest.json",
  themeColor: "#ff6b35",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DiviSwap"
  },
  icons: {
    icon: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        type: "image/png",
      },
    ],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout children={children} />
}


import './globals.css'