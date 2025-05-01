import type { Metadata } from "next"
import PoolPage from "./PoolPageClient"

export const metadata: Metadata = {
  title: "DiviSwap | Liquidity Pools on Chiliz Chain",
  description:
    "Provide liquidity and earn rewards on DiviSwap. Join our liquidity pools on Chiliz Chain and participate in the growth of decentralized finance.",
  keywords: "DiviSwap, liquidity pools, yield farming, DeFi, Chiliz Chain, passive income",
  openGraph: {
    title: "DiviSwap | Earn Rewards with Liquidity Pools",
    description:
      "Become a liquidity provider on DiviSwap. Earn fees and rewards by adding your tokens to our diverse range of liquidity pools on Chiliz Chain.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        width: 1200,
        height: 630,
        alt: "DiviSwap Liquidity Pools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Provide Liquidity on DiviSwap",
    description:
      "Maximize your crypto assets by providing liquidity on DiviSwap. Earn fees and participate in the growth of DeFi on Chiliz Chain.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png"],
  },
}

export default function PoolPageWrapper() {
  return <PoolPage />
}
