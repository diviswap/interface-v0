"use client"

import React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { BackgroundWrapper } from "@/components/background-wrapper"
import { Github, MessageCircle } from "lucide-react"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { I18nProvider, useTranslation } from "@/lib/i18n/context"

// Importar Web3Provider y EnhancedNavbar dinámicamente con { ssr: false }
const Web3Provider = dynamic(
  () => import("@/components/web3-provider-new").then((mod) => ({ default: mod.Web3Provider })),
  { ssr: false },
)
const EnhancedNavbar = dynamic(() => import("@/components/enhanced-navbar").then((mod) => mod.EnhancedNavbar), {
  ssr: false,
})

const inter = Inter({ subsets: ["latin"] })

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border/10 py-6 backdrop-blur-sm">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t.common.copyright}
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/diviswap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            href="https://x.com/DSwap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            <span className="sr-only">X (Twitter)</span>
          </a>
          <a
            href="https://t.me/diviswap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Telegram</span>
          </a>
          <a
            href="https://discord.com/invite/NPtd83jvGN"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" className="h-5 w-5 fill-current">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"></path>
            </svg>
            <span className="sr-only">Discord</span>
          </a>
          <a
            href="https://medium.com/@dswap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
            </svg>
            <span className="sr-only">Medium</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script defer src="/_vercel/speed-insights/script.js"></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <I18nProvider>
            <Suspense fallback={<div className="h-16 border-b border-border/10"></div>}>
              <ClientOnly>
                <Web3Provider>
                  <BackgroundWrapper>
                    <div className="flex flex-col min-h-screen">
                      <EnhancedNavbar />
                      <main className="flex-grow container mx-auto px-4 py-8">
                        <Suspense>{children}</Suspense>
                      </main>
                      <Footer />
                    </div>
                  </BackgroundWrapper>
                </Web3Provider>
              </ClientOnly>
            </Suspense>
            <Analytics />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

// Componente ClientOnly para asegurarse de que el contenido solo se renderice en el cliente
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-16 border-b border-border/10"></div>
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-4"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </main>
        <div className="h-16 border-t border-border/10"></div>
      </div>
    )
  }

  return <>{children}</>
}
