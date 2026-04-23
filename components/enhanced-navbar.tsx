"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import { Home, ArrowLeftRight, Droplets, LineChart, BookOpen, Menu, X, MoreHorizontal } from "lucide-react"
import { ConnectWallet } from "@/components/connect-wallet-new"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/lib/i18n/context"

export function EnhancedNavbar() {
  const { address, isConnected } = useAccount()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useTranslation()

  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  // Removed launchpad from the navigation items (presale is now finalized).
  const navItems = [
    { name: t.nav.home, url: "/", icon: Home },
    { name: t.nav.swap, url: "/swap", icon: ArrowLeftRight },
    { name: t.nav.pool, url: "/pool", icon: Droplets },
    { name: t.nav.charts, url: "/charts", icon: LineChart },
    { name: t.nav.academy, url: "https://academy.diviswap.io", icon: BookOpen, external: true },
  ]

  const getVisibleItemCount = (width: number) => {
    if (width >= 1280) return 6
    if (width >= 1024) return 5
    if (width >= 768) return 4
    return 0
  }

  useEffect(() => {
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 8)
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      const isInsideDropdown =
        target.closest("[data-radix-dropdown-menu-content]") ||
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest('[role="menu"]')

      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuToggleRef.current &&
        !menuToggleRef.current.contains(event.target as Node) &&
        !isInsideDropdown
      ) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  const visibleItemCount = getVisibleItemCount(windowWidth)
  const visibleItems = navItems.slice(0, visibleItemCount)
  const overflowItems = navItems.slice(visibleItemCount)

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-[0_1px_0_0_hsl(0_0%_100%/0.04)_inset]"
          : "bg-background/40 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container flex h-16 md:h-[72px] items-center px-3 md:px-4">
        <div className="flex items-center gap-3 md:gap-6 mr-2 md:mr-4">
          <Link
            href="/"
            className="relative flex items-center gap-2 transition-transform hover:scale-[1.03] duration-200"
          >
            <span
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-full bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_DIVISWAP_O-SBYxC1CzGyvFtnmNSsSK6EBVQAbhtH.png"
              alt="DiviSwap Logo"
              width={150}
              height={40}
              className="h-7 md:h-9 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center">
            <NavBar items={visibleItems} className="static transform-none mb-0 mt-0 pt-0" />

            {overflowItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48 glass-panel-strong">
                  {overflowItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          href={item.url}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          className="flex items-center gap-2"
                        >
                          <Icon className="h-4 w-4 text-primary" />
                          <span>{item.name}</span>
                          {item.external && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-auto opacity-60"
                            >
                              <path d="M7 7h10v10" />
                              <path d="M7 17 17 7" />
                            </svg>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 ml-auto">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <ConnectWallet />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            ref={menuToggleRef}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
        >
          <div className="container py-4 px-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.url}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center gap-3 p-3.5 rounded-xl text-base font-medium transition-all hover:bg-primary/10 active:bg-primary/15"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="flex-1">{item.name}</span>
                    {item.external && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-muted-foreground flex-shrink-0"
                      >
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                      </svg>
                    )}
                  </Link>
                )
              })}
              <div className="border-t border-border/40 pt-3 mt-2">
                <div className="flex items-center justify-between gap-3 px-1">
                  <span className="text-sm font-medium text-muted-foreground">{t.common.language ?? "Language"}</span>
                  <LanguageSelector />
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default EnhancedNavbar
