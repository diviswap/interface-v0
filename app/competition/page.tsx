import CompetitionPageClient from "./CompetitionPageClient"
import { BackgroundWrapper } from "@/components/background-wrapper"
import { NetworkGuard } from "@/components/network-guard"

export default function CompetitionPage() {
  return (
    <NetworkGuard>
      <BackgroundWrapper>
        <div className="container mx-auto py-8 px-4">
          <CompetitionPageClient />
        </div>
      </BackgroundWrapper>
    </NetworkGuard>
  )
}
