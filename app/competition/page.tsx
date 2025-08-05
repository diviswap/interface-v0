import CompetitionPageClient from "./CompetitionPageClient"
import { BackgroundWrapper } from "@/components/background-wrapper"

export default function CompetitionPage() {
  return (
    <BackgroundWrapper>
      <div className="container mx-auto py-8 px-4">
        <CompetitionPageClient />
      </div>
    </BackgroundWrapper>
  )
}
