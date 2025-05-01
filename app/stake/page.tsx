import type { Metadata } from "next"
import StakePageContent from "./StakePageContent"

export const metadata: Metadata = {
  title: "DiviSwap | Stake Tokens for Rewards",
  description:
    "Stake your tokens on DiviSwap and earn passive income. Participate in the governance and growth of the DiviSwap ecosystem on Chiliz Chain.",
  keywords: "DiviSwap, staking, passive income, DeFi rewards, Chiliz Chain, token governance",
  openGraph: {
    title: "DiviSwap | Earn Rewards by Staking",
    description:
      "Maximize your returns by staking tokens on DiviSwap. Earn passive income and participate in the future of decentralized finance on Chiliz Chain.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        width: 1200,
        height: 630,
        alt: "DiviSwap Staking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stake and Earn on DiviSwap",
    description:
      "Start earning passive income today by staking your tokens on DiviSwap. Secure the network, earn rewards, and shape the future of DeFi on Chiliz Chain.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png"],
  },
}

export default function StakePageWrapper() {
  return <StakePageContent />
}
