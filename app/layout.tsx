import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientComponentWrapper from "@/components/client-component-wrapper"
// Import components conditionally in client components
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DiviSwap | Chiliz Chain DEX",
  description: "Trade and provide liquidity on Chiliz Chain",
  icons: {
    icon: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        type: "image/png",
      },
    ],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add the Speed Insights script directly */}
        <script defer src="/_vercel/speed-insights/script.js"></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {/* Move all client components to a client component wrapper */}
          <Suspense>
            <ClientComponentWrapper>{children}</ClientComponentWrapper>
          </Suspense>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
