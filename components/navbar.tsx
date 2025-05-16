"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { Home, ArrowLeftRight, Droplets, Menu, X, LineChart, BookOpen, Rocket } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { WalletButton } from "@/components/wallet-button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { account, isConnected, connect, disconnect, provider } = useWeb3()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [balance, setBalance] = useState<string>("0")

  // Update the navItems array to include the Launchpad
  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Swap", path: "/swap", icon: ArrowLeftRight },
    { name: "Pool", path: "/pool", icon: Droplets },
    { name: "Charts", path: "/charts", icon: LineChart },
    { name: "Launchpad", path: "/launchpad", icon: Rocket },
    { name: "Academy", href: "https://academy.diviswap.io", icon: BookOpen, external: true },
  ]

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

    // Añadir un listener para el evento balanceUpdated
    const handleBalanceUpdate = () => {
      fetchBalance()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("balanceUpdated", handleBalanceUpdate)

      // Limpiar el listener cuando el componente se desmonte
      return () => {
        window.removeEventListener("balanceUpdated", handleBalanceUpdate)
      }
    }

    return undefined
  }, [isConnected, provider, account])

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
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

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {isConnected && (
              <span className="text-sm text-muted-foreground">{formatCurrency(Number(balance))} CHZ</span>
            )}
            <WalletButton />
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/10 bg-background/80 backdrop-blur">
          <div className="container py-4 flex flex-col gap-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path
                return item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors",
                      isActive ? "bg-secondary text-foreground" : "hover:bg-secondary/50 text-muted-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 p-2 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-secondary text-foreground" : "hover:bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="w-full">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
