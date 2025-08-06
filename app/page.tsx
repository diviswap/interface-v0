import type { Metadata } from "next"
import { HomePage } from "@/components/home-page"

export const metadata: Metadata = {
  title: "DiviSwap | Decentralized Exchange on Chiliz Chain",
  description:
    "DiviSwap is a decentralized exchange (DEX) on Chiliz Chain that allows you to trade tokens and earn rewards by providing liquidity.",
  keywords: [
    "DiviSwap",
    "DEX",
    "Decentralized Exchange",
    "Chiliz Chain",
    "Swap",
    "Liquidity",
    "DeFi",
    "Cryptocurrency",
  ],
  openGraph: {
    title: "DiviSwap | Trade and Provide Liquidity on Chiliz Chain",
    description:
      "Trade tokens and earn rewards by providing liquidity on Chiliz Chain with DiviSwap, a decentralized exchange.",
    url: "https://diviswap.io",
    siteName: "DiviSwap",
    images: [
      {
        url: "/android-chrome-512x512.png?v=3",
        width: 512,
        height: 512,
        alt: "DiviSwap Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DiviSwap | DEX on Chiliz Chain",
    description:
      "Trade and provide liquidity on Chiliz Chain. Frictionless trading, earn rewards, guaranteed security.",
    images: ["/android-chrome-512x512.png?v=3"],
    creator: "@DSwap",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico?v=3",
    shortcut: "/favicon-32x32.png?v=3",
    apple: "/apple-touch-icon.png?v=3",
  },
  manifest: "/manifest.json",
  themeColor: "#000000",
}

export default function Home() {
  return <HomePage />
}
