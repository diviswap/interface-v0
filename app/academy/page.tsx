import { redirect } from "next/navigation"

export default function AcademyRedirectPage() {
  redirect("https://academy.diviswap.io")

  // This won't be rendered, but we include it for completeness
  return null
}
