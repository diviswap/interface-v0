import type { Metadata } from "next"
import LaunchpadPage from "./LaunchpadPageClient"

export const metadata: Metadata = {
  title: "DiviSwap | FintSport Token Launchpad",
  description:
    "Participate in the FintSport Token (FTK) presale on DiviSwap. Get early access to FTK tokens and exclusive benefits.",
  keywords: "DiviSwap, FintSport, FTK, token presale, ICO, Chiliz Chain, launchpad",
  openGraph: {
    title: "DiviSwap | FintSport Token (FTK) Presale",
    description: "Join the FintSport Token presale on DiviSwap. Early investors get exclusive benefits and airdrops.",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3HGJCRbhw7y7WB9MvgqiCHlI72OUmA.png",
        width: 1200,
        height: 630,
        alt: "FintSport Token Presale",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FintSport Token Presale on DiviSwap",
    description:
      "Participate in the FintSport Token (FTK) presale on DiviSwap. Early access, exclusive benefits, and airdrops.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3HGJCRbhw7y7WB9MvgqiCHlI72OUmA.png"],
  },
}

export default function LaunchpadPageWrapper() {
  return <LaunchpadPage />
}
