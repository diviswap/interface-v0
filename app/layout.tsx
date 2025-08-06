import type React from "react"
import type { Metadata, Viewport } from "next"
import ClientLayout from "./client"

export const viewport: Viewport = {
  themeColor: "#191919",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

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
        url: "/favicon-32x32.png?v=4",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon-16x16.png?v=4",
        type: "image/png", 
        sizes: "16x16",
      },
    ],
    shortcut: [
      {
        url: "/favicon.ico?v=4",
        type: "image/x-icon",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png?v=4",
        type: "image/png",
        sizes: "180x180",
      },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png?v=4",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/android-chrome-512x512.png?v=4",
        type: "image/png",
        sizes: "512x512",
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