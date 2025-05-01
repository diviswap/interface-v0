import type { Metadata } from "next"
import BridgePage from "./BridgePage"

export const metadata: Metadata = {
  title: "DiviSwap | Cross-Chain Bridge for Chiliz Chain",
  description:
    "Bridge tokens seamlessly to and from Chiliz Chain with DiviSwap. Connect with other blockchains and expand your DeFi possibilities.",
  keywords: "DiviSwap, cross-chain bridge, token bridge, Chiliz Chain, interoperability, multi-chain DeFi",
  openGraph: {
    title: "DiviSwap | Seamless Cross-Chain Bridge",
    description:
      "Experience smooth cross-chain transactions with DiviSwap's bridge. Move your assets to and from Chiliz Chain securely and efficiently.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        width: 1200,
        height: 630,
        alt: "DiviSwap Cross-Chain Bridge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bridge Tokens Easily with DiviSwap",
    description:
      "Connect your assets across blockchains with DiviSwap's secure bridge. Seamlessly move tokens to and from Chiliz Chain and unlock multi-chain DeFi opportunities.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png"],
  },
}

export default function BridgePageWrapper() {
  return <BridgePage />
}
