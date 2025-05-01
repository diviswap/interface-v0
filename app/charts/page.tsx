import type { Metadata } from "next"
import ChartsPage from "./ChartsPageClient"

export const metadata: Metadata = {
  title: "DiviSwap | Real-Time DeFi Charts and Analytics",
  description:
    "Access real-time charts and analytics for tokens and pools on DiviSwap. Make informed trading decisions with comprehensive market data on Chiliz Chain.",
  keywords: "DiviSwap, DeFi charts, crypto analytics, token prices, liquidity pools, Chiliz Chain",
  openGraph: {
    title: "DiviSwap | Comprehensive DeFi Charts and Analytics",
    description:
      "Dive deep into DeFi markets with DiviSwap's advanced charts and analytics. Track token prices, analyze liquidity pools, and stay ahead in your trading on Chiliz Chain.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        width: 1200,
        height: 630,
        alt: "DiviSwap Charts and Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Real-Time DeFi Analytics on DiviSwap",
    description:
      "Get a competitive edge with DiviSwap's real-time charts and analytics. Monitor market trends, track your favorite tokens, and analyze DeFi opportunities on Chiliz Chain.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png"],
  },
}

export default function ChartsPageWrapper() {
  return <ChartsPage />
}
