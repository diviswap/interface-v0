import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client"

export const metadata: Metadata = {
  title: "DiviSwap | Chiliz Chain DEX",
  description: "Trade and provide liquidity on Chiliz Chain",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "DiviSwap"
  },
  other: {
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      {
        type: "image/png",
        sizes: "32x32",
      },
      {
        type: "image/png", 
        sizes: "16x16",
      },
    ],
    shortcut: [
      {
        type: "image/png",
      },
    ],
    apple: [
      {
        type: "image/png",
        sizes: "180x180",
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