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
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
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
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png"],
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
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
    shortcut: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#000000",
}

export default function Home() {
  return <HomePage />
}
