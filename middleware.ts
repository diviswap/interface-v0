import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url

  // Redirect all academy paths to the external academy site
  if (pathname.startsWith("/academy")) {
    // Extract the path after /academy to maintain the same structure
    const academyPath = pathname.replace("/academy", "") || "/"
    return NextResponse.redirect(`https://academy.diviswap.io${academyPath}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/academy/:path*"],
}
