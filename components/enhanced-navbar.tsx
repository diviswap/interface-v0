"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAccount, useBalance } from "wagmi"
import { Home, ArrowLeftRight, Droplets, LineChart, BookOpen, Menu, X, MoreHorizontal, Rocket } from 'lucide-react'
import { ConnectWallet } from "@/components/connect-wallet-new"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/lib/i18n/context"

export function EnhancedNavbar() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const { t } = useTranslation()
  
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  const navItems = [
    { name: t.nav.home, url: "/", icon: Home },
    { name: t.nav.swap, url: "/swap", icon: ArrowLeftRight },
    { name: t.nav.pool, url: "/pool", icon: Droplets },
    { name: t.nav.launchpad, url: "/launchpad", icon: Rocket },
    { name: t.nav.charts, url: "/charts", icon: LineChart },
    { name: t.nav.academy, url: "https://academy.diviswap.io", icon: BookOpen, external: true },
  ]

  const getVisibleItemCount = (width: number) => {
    if (width >= 1280) return 6 // xl screens - reduced from 7 to 6
    if (width >= 1024) return 5 // lg screens - reduced from 6 to 5
    if (width >= 768) return 4 // md screens
    return 0 // mobile - handled separately
  }

  useEffect(() => {
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Check if click is inside a dropdown menu content (Radix UI portals)
      const isInsideDropdown = target.closest('[data-radix-dropdown-menu-content]') ||
                              target.closest('[data-radix-popper-content-wrapper]') ||
                              target.closest('[role="menu"]')
      
      if (isMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target as Node) &&
          menuToggleRef.current && 
          !menuToggleRef.current.contains(event.target as Node) &&
          !isInsideDropdown) {
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
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center px-3 md:px-4">
        <div className="flex items-center gap-3 md:gap-6 mr-2 md:mr-4">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 duration-200">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_DIVISWAP_O-SBYxC1CzGyvFtnmNSsSK6EBVQAbhtH.png"
              alt="DiviSwap Logo"
              width={150}
              height={40}
              className="h-6 md:h-8 w-auto"
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
                  <Button variant="ghost" size="icon" className="ml-1">
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                          <Icon className="h-4 w-4" />
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
                              className="ml-auto"
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

        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          <ConnectWallet />

          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-9 w-9" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            ref={menuToggleRef}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden border-t border-border/10 bg-background/95 backdrop-blur-lg"
        >
          <div className="container py-3 px-3">
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
                    className="flex items-center gap-3 p-4 rounded-lg text-base font-medium transition-colors hover:bg-muted active:bg-muted/80"
                  >
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
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
              <div className="border-t border-primary/20 pt-3 mt-2">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Language:</span>
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            </nav>
          </div>
          <div className="border-b-2 border-b-primary"></div>
        </div>
      )}
    </header>
  )
}

export default EnhancedNavbar
