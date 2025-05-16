"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { Home, ArrowLeftRight, Droplets, LineChart, BookOpen, Menu, X, MoreHorizontal, Rocket } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { WalletButton } from "@/components/wallet-button"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function EnhancedNavbar() {
  const { account, isConnected, provider } = useWeb3()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [balance, setBalance] = useState<string>("0")
  const [windowWidth, setWindowWidth] = useState(0)

  // Navigation items for the tubelight navbar
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Swap", url: "/swap", icon: ArrowLeftRight },
    { name: "Pool", url: "/pool", icon: Droplets },
    { name: "Launchpad", url: "/launchpad", icon: Rocket },
    { name: "Charts", url: "/charts", icon: LineChart },
    { name: "Academy", url: "https://academy.diviswap.io", icon: BookOpen, external: true },
  ]

  // Determine how many items to show based on screen width
  const getVisibleItemCount = (width: number) => {
    if (width >= 1280) return 6 // xl screens - show all items
    if (width >= 1024) return 5 // lg screens
    if (width >= 768) return 4 // md screens
    return 0 // mobile - handled separately
  }

  // Initialize these values in useEffect to avoid SSR issues
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth)

    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const visibleItemCount = getVisibleItemCount(windowWidth)
  const visibleItems = navItems.slice(0, visibleItemCount)
  const overflowItems = navItems.slice(visibleItemCount)

  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && provider && account) {
        try {
          const balance = await provider.getBalance(account)
          setBalance(ethers.formatEther(balance))
        } catch (error) {
          console.error("Error fetching balance:", error)
          setBalance("0")
        }
      }
    }

    fetchBalance()

    // Add listener for balanceUpdated event
    const handleBalanceUpdate = () => {
      fetchBalance()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("balanceUpdated", handleBalanceUpdate)

      // Clean up listeners when component unmounts
      return () => {
        window.removeEventListener("balanceUpdated", handleBalanceUpdate)
      }
    }

    return undefined
  }, [isConnected, provider, account])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-6 mr-4">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 duration-200">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_DIVISWAP_O-SBYxC1CzGyvFtnmNSsSK6EBVQAbhtH.png"
              alt="DiviSwap Logo"
              width={150}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Desktop: Responsive tubelight navbar */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center">
            {/* Visible navigation items */}
            <NavBar items={visibleItems} className="static transform-none mb-0 mt-0 pt-0" />

            {/* Overflow menu for additional items */}
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

        {/* Wallet button and balance */}
        <div className="flex items-center gap-4 ml-auto">
          {isConnected && (
            <span className="hidden md:inline text-sm text-muted-foreground">
              {formatCurrency(Number(balance))} CHZ
            </span>
          )}
          <WalletButton />

          {/* Mobile: Menu toggle button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/10 bg-background/95 backdrop-blur-lg">
          <div className="container py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.url}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-md text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    {item.name}
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
                        className="ml-auto h-4 w-4 text-muted-foreground"
                      >
                        <path d="M7 7h10v10" />
                        <path d="M7 17 17 7" />
                      </svg>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Show balance in mobile menu */}
            {isConnected && (
              <div className="mt-4 pt-4 border-t border-border/10">
                <div className="text-sm text-muted-foreground">Balance: {formatCurrency(Number(balance))} CHZ</div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

// Exportar el componente como default para dynamic import
export default { EnhancedNavbar }
