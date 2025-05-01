import type { Metadata } from "next"
import GovernancePage from "./GovernancePage"

export const metadata: Metadata = {
  title: "DiviSwap | Decentralized Governance",
  description:
    "Participate in the governance of DiviSwap. Vote on proposals, shape the future of the protocol, and contribute to decentralized decision-making on Chiliz Chain.",
  keywords: "DiviSwap, governance, DAO, decentralized voting, Chiliz Chain, DeFi protocol",
  openGraph: {
    title: "DiviSwap | Shape the Future with Governance",
    description:
      "Be part of DiviSwap's decentralized governance. Vote on key decisions, propose changes, and help steer the direction of DeFi on Chiliz Chain.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        width: 1200,
        height: 630,
        alt: "DiviSwap Governance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Govern the Future of DeFi on DiviSwap",
    description:
      "Your voice matters in DiviSwap's governance. Participate in decentralized decision-making and shape the future of DeFi on Chiliz Chain.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png"],
  },
}

export default function GovernancePageWrapper() {
  return <GovernancePage />
}
