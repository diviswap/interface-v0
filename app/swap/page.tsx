import type { Metadata } from "next"
import SwapPage from "./SwapClientPage"

export const metadata: Metadata = {
  title: "DiviSwap | Swap Tokens on Chiliz Chain",
  description:
    "Swap tokens easily and efficiently on DiviSwap, the leading decentralized exchange on Chiliz Chain. Get the best rates and fast transactions.",
  keywords: "DiviSwap, token swap, DEX, Chiliz Chain, cryptocurrency exchange, decentralized finance",
  openGraph: {
    title: "DiviSwap | Effortless Token Swaps on Chiliz Chain",
    description:
      "Experience seamless token swaps with DiviSwap. Trade a wide range of tokens on Chiliz Chain with low fees and high liquidity.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        width: 1200,
        height: 630,
        alt: "DiviSwap Token Swap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swap Tokens Instantly on DiviSwap",
    description:
      "Trade tokens effortlessly on Chiliz Chain with DiviSwap. Best rates, fast transactions, and user-friendly interface.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png"],
  },
}

export default function SwapPageWrapper() {
  return <SwapPage />
}
