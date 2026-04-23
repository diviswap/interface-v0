"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAccount, usePublicClient } from "wagmi"
import { ethers } from "ethers"
import { RefreshCw, Search, Droplets } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { AddLiquidityForm } from "@/components/add-liquidity-form"
import { RemoveLiquidityForm } from "@/components/remove-liquidity-form"
import PoolCard from "@/components/pool-card"
import { AllPoolCard } from "@/components/all-pool-card"
import { FACTORY_ABI, PAIR_ABI, ERC20_ABI, FACTORY_ADDRESS, WCHZ_ADDRESS, TOKEN_LIST } from "@/lib/constants"
import { useTranslation } from "@/lib/i18n/context"
import { ConnectWallet } from "@/components/connect-wallet-new"

const getTokenLogoURI = (tokenAddress: string) => {
  const token = TOKEN_LIST.find((t) => t.address.toLowerCase() === tokenAddress.toLowerCase())
  return token?.logoURI || null
}

export default function PoolPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { address: account, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { t } = useTranslation()

  // Memoize provider to prevent recreation on every render
  const provider = useMemo(() => {
    if (!publicClient) return null
    return new ethers.BrowserProvider(publicClient as any)
  }, [publicClient])

  const [userPools, setUserPools] = useState([])
  const [allPools, setAllPools] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAllPools, setIsLoadingAllPools] = useState(false)
  const [activeTab, setActiveTab] = useState("positions")
  const [searchTerm, setSearchTerm] = useState("")
  const [initialTokens, setInitialTokens] = useState({
    token0: null,
    token1: null,
  })
  const [initialPairAddress, setInitialPairAddress] = useState<string | null>(null)
  const [innerTab, setInnerTab] = useState<"add" | "remove">("add")

  // Track previous search params to detect real changes
  const prevSearchParamsRef = useRef<string>("")

  // Handle search params - runs on every searchParams change to support in-app navigation
  useEffect(() => {
    const currentParamsStr = searchParams.toString()
    // Skip if params haven't changed
    if (currentParamsStr === prevSearchParamsRef.current) return
    prevSearchParamsRef.current = currentParamsStr

    const tab = searchParams.get("tab")
    const token0 = searchParams.get("token0")
    const token1 = searchParams.get("token1")
    const remove = searchParams.get("remove")
    const pair = searchParams.get("pair")

    // Handle remove parameter to switch to add tab and set remove mode
    if (remove === "true" && pair) {
      setActiveTab("add")
      setInnerTab("remove")
      setInitialPairAddress(pair)
      return
    }

    if (tab && ["positions", "add", "all-pools"].includes(tab)) {
      setActiveTab(tab as "positions" | "add" | "all-pools")
    }

    if (token0 && token1) {
      setInitialTokens({ token0, token1 })
      setActiveTab("add")
    }
  }, [searchParams])

  // Stabilize fetchUserPools with proper dependencies and prevent unnecessary recreations
  const fetchUserPools = useCallback(async () => {
    if (!isConnected || !provider || !account) {
      setUserPools([])
      return
    }

    setIsLoading(true)
    console.log("Fetching user pools...")

    try {
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
      const pairsLength = await factory.allPairsLength()
      console.log(`Total pairs in factory: ${pairsLength}`)

      const pairsToCheck = Math.min(Number(pairsLength), 100)
      const userPoolsData = []

      for (let i = 0; i < pairsToCheck; i++) {
        try {
          const pairAddress = await factory.allPairs(i)
          console.log(`Checking pair ${i}: ${pairAddress}`)

          const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider)
          const balance = await pairContract.balanceOf(account)

          if (balance > BigInt(0)) {
            console.log(`Found user position in pair ${pairAddress}: ${balance.toString()}`)

            const [token0Address, token1Address, reserves, totalSupply] = await Promise.all([
              pairContract.token0(),
              pairContract.token1(),
              pairContract.getReserves(),
              pairContract.totalSupply(),
            ])

            const [token0Contract, token1Contract] = [
              new ethers.Contract(token0Address, ERC20_ABI, provider),
              new ethers.Contract(token1Address, ERC20_ABI, provider),
            ]

            const [token0Symbol, token0Decimals, token0Name, token1Symbol, token1Decimals, token1Name] =
              await Promise.all([
                token0Contract.symbol().catch((e) => {
                  console.error("Error getting token0 symbol:", e)
                  return "Unknown"
                }),
                token0Contract.decimals().catch((e) => {
                  console.error("Error getting token0 decimals:", e)
                  return 18
                }),
                token0Contract.name().catch((e) => {
                  console.error("Error getting token0 name:", e)
                  return "Unknown Token"
                }),
                token1Contract.symbol().catch((e) => {
                  console.error("Error getting token1 symbol:", e)
                  return "Unknown"
                }),
                token1Contract.decimals().catch((e) => {
                  console.error("Error getting token1 decimals:", e)
                  return 18
                }),
                token1Contract.name().catch((e) => {
                  console.error("Error getting token1 name:", e)
                  return "Unknown Token"
                }),
              ])

            const token0 = {
              address: token0Address,
              symbol: token0Symbol,
              name: token0Name,
              decimals: token0Decimals,
              logoURI: getTokenLogoURI(token0Address),
            }

            const token1 = {
              address: token1Address,
              symbol: token1Symbol,
              name: token1Name,
              decimals: token1Decimals,
              logoURI: getTokenLogoURI(token1Address),
            }

            if (token0Address.toLowerCase() === WCHZ_ADDRESS.toLowerCase()) {
              token0.address = ethers.ZeroAddress
              token0.symbol = "CHZ"
              token0.name = "Chiliz"
              token0.logoURI = getTokenLogoURI(WCHZ_ADDRESS)
            }

            if (token1Address.toLowerCase() === WCHZ_ADDRESS.toLowerCase()) {
              token1.address = ethers.ZeroAddress
              token1.symbol = "CHZ"
              token1.name = "Chiliz"
              token1.logoURI = getTokenLogoURI(WCHZ_ADDRESS)
            }

            const balanceNum = Number(balance)
            const totalSupplyNum = Number(totalSupply)
            const reserve0Num = Number(reserves[0])
            const reserve1Num = Number(reserves[1])

            const token0Amount = totalSupplyNum > 0 ? (balanceNum * reserve0Num) / totalSupplyNum : 0
            const token1Amount = totalSupplyNum > 0 ? (balanceNum * reserve1Num) / totalSupplyNum : 0

            const liquidityTokensFormatted = balanceNum > 0 ? ethers.formatUnits(balance, 18) : "0"

            userPoolsData.push({
              id: pairAddress,
              token0,
              token1,
              liquidityTokens: liquidityTokensFormatted,
              // Adding raw balance for accurate pool share calculation
              liquidityTokensRaw: balance,
              token0Amount:
                token0Amount > 0 ? ethers.formatUnits(BigInt(Math.floor(token0Amount)), token0.decimals) : "0",
              token1Amount:
                token1Amount > 0 ? ethers.formatUnits(BigInt(Math.floor(token1Amount)), token1.decimals) : "0",
              reserve0: reserves[0],
              reserve1: reserves[1],
              totalSupply,
            })

            console.log(`Added pool: ${token0.symbol}/${token1.symbol}`)
          }
        } catch (error) {
          console.error(`Error processing pair ${i}:`, error)
        }
      }

      console.log(`Found ${userPoolsData.length} pools where user has liquidity`)
      setUserPools(userPoolsData)
    } catch (error) {
      console.error("Error fetching user pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your liquidity positions.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, provider, account, toast])

  // Stabilize fetchAllPools with proper dependencies
  const fetchAllPools = useCallback(async () => {
    if (!provider) {
      setAllPools([])
      return
    }

    setIsLoadingAllPools(true)
    console.log("Fetching all pools...")

    try {
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
      const pairsLength = await factory.allPairsLength()
      console.log(`Total pairs in factory: ${pairsLength}`)

      const pairsToCheck = Math.min(Number(pairsLength), 100)
      const allPoolsData = []

      for (let i = 0; i < pairsToCheck; i++) {
        try {
          const pairAddress = await factory.allPairs(i)
          console.log(`Checking pair ${i}: ${pairAddress}`)

          const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider)

          const [token0Address, token1Address, reserves, totalSupply] = await Promise.all([
            pairContract.token0(),
            pairContract.token1(),
            pairContract.getReserves(),
            pairContract.totalSupply(),
          ])

          if (reserves[0] === BigInt(0) && reserves[1] === BigInt(0)) {
            continue
          }

          const [token0Contract, token1Contract] = [
            new ethers.Contract(token0Address, ERC20_ABI, provider),
            new ethers.Contract(token1Address, ERC20_ABI, provider),
          ]

          const [token0Symbol, token0Decimals, token0Name, token1Symbol, token1Decimals, token1Name] =
            await Promise.all([
              token0Contract.symbol().catch((e) => {
                console.error("Error getting token0 symbol:", e)
                return "Unknown"
              }),
              token0Contract.decimals().catch((e) => {
                console.error("Error getting token0 decimals:", e)
                return 18
              }),
              token0Contract.name().catch((e) => {
                console.error("Error getting token0 name:", e)
                return "Unknown Token"
              }),
              token1Contract.symbol().catch((e) => {
                console.error("Error getting token1 symbol:", e)
                return "Unknown"
              }),
              token1Contract.decimals().catch((e) => {
                console.error("Error getting token1 decimals:", e)
                return 18
              }),
              token1Contract.name().catch((e) => {
                console.error("Error getting token1 name:", e)
                return "Unknown Token"
              }),
            ])

          const token0 = {
            address: token0Address,
            symbol: token0Symbol,
            name: token0Name,
            decimals: token0Decimals,
            logoURI: getTokenLogoURI(token0Address),
          }

          const token1 = {
            address: token1Address,
            symbol: token1Symbol,
            name: token1Name,
            decimals: token1Decimals,
            logoURI: getTokenLogoURI(token1Address),
          }

          if (token0Address.toLowerCase() === WCHZ_ADDRESS.toLowerCase()) {
            token0.address = ethers.ZeroAddress
            token0.symbol = "CHZ"
            token0.name = "Chiliz"
            token0.logoURI = getTokenLogoURI(WCHZ_ADDRESS)
          }

          if (token1Address.toLowerCase() === WCHZ_ADDRESS.toLowerCase()) {
            token1.address = ethers.ZeroAddress
            token1.symbol = "CHZ"
            token1.name = "Chiliz"
            token1.logoURI = getTokenLogoURI(WCHZ_ADDRESS)
          }

          allPoolsData.push({
            id: pairAddress,
            token0,
            token1,
            reserve0: reserves[0],
            reserve1: reserves[1],
            totalSupply,
          })

          console.log(`Added pool: ${token0.symbol}/${token1.symbol}`)
        } catch (error) {
          console.error(`Error processing pair ${i}:`, error)
        }
      }

      console.log(`Found ${allPoolsData.length} pools with liquidity`)

      allPoolsData.sort((a, b) => {
        const aHasCHZ =
          a.token0.symbol === "CHZ" ||
          a.token1.symbol === "CHZ" ||
          a.token0.symbol === "WCHZ" ||
          a.token1.symbol === "WCHZ"
        const bHasCHZ =
          b.token0.symbol === "CHZ" ||
          b.token1.symbol === "CHZ" ||
          b.token0.symbol === "WCHZ" ||
          b.token1.symbol === "WCHZ"

        if (aHasCHZ && bHasCHZ) {
          let aChzAmount = BigInt(0)
          if (a.token0.symbol === "CHZ" || a.token0.symbol === "WCHZ") {
            aChzAmount = a.reserve0
          } else {
            aChzAmount = a.reserve1
          }

          let bChzAmount = BigInt(0)
          if (b.token0.symbol === "CHZ" || b.token0.symbol === "WCHZ") {
            bChzAmount = b.reserve0
          } else {
            bChzAmount = b.reserve1
          }

          return bChzAmount > aChzAmount ? 1 : -1
        }

        if (aHasCHZ && !bHasCHZ) return -1
        if (!aHasCHZ && bHasCHZ) return 1

        return Number(b.totalSupply) - Number(a.totalSupply)
      })

      setAllPools(allPoolsData)
    } catch (error) {
      console.error("Error fetching all pools:", error)
      toast({
        title: "Error",
        description: "Failed to fetch all liquidity pools.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAllPools(false)
    }
  }, [provider, toast])

  // Fetch user pools when on positions tab OR add tab (needed for remove liquidity form)
  useEffect(() => {
    if (isConnected && provider && account && (activeTab === "positions" || activeTab === "add")) {
      fetchUserPools()
    }
  }, [isConnected, account, fetchUserPools, activeTab])

  // Only fetch all pools when tab changes to all-pools and provider is available
  useEffect(() => {
    if (activeTab === "all-pools" && provider) {
      fetchAllPools()
    }
  }, [activeTab, fetchAllPools])

  const handleAddLiquidityClick = () => {
    setActiveTab("add")
    setInnerTab("add")
    router.push("/pool?tab=add")
  }

  const handleRemoveLiquidity = (pairAddress: string) => {
    setActiveTab("add")
    setInnerTab("remove")
    setInitialPairAddress(pairAddress)
    router.push(`/pool?remove=true&pair=${pairAddress}`, { scroll: false })
  }

  const handleAddLiquidity = async (tokenA, tokenB, amountA, amountB) => {
    await fetchUserPools()
    await fetchAllPools()
    setActiveTab("positions")
  }

  const filteredAllPools = allPools.filter((pool) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      pool.token0.symbol.toLowerCase().includes(searchLower) ||
      pool.token1.symbol.toLowerCase().includes(searchLower) ||
      pool.token0.name.toLowerCase().includes(searchLower) ||
      pool.token1.name.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div aria-hidden className="absolute inset-x-0 top-16 -z-10 h-[500px] hero-radial pointer-events-none" />

      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="text-gradient-primary">{t.pool.title}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          {t.pool.subtitle ?? "Add liquidity to earn trading fees and manage your positions."}
        </p>
      </div>

      <Card className="glass-panel-strong border-border/40">
        <CardContent className="p-5 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full gap-1 h-auto p-1 rounded-full border border-border/50 bg-background/40 mb-6 overflow-x-auto">
              <TabsTrigger
                value="positions"
                className="flex-1 min-w-max rounded-full px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              >
                {t.pool.yourLiquidityPositions}
              </TabsTrigger>
              <TabsTrigger
                value="all-pools"
                className="flex-1 min-w-max rounded-full px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              >
                {t.pool.allPools}
              </TabsTrigger>
              <TabsTrigger
                value="add"
                className="flex-1 min-w-max rounded-full px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              >
                {t.pool.addLiquidity}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="space-y-4">
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
                    <Droplets className="h-6 w-6" />
                  </div>
                  <p className="text-base text-muted-foreground max-w-sm">{t.pool.connectWalletToView}</p>
                  <ConnectWallet />
                </div>
              ) : isLoading ? (
                <div className="flex justify-center py-14">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userPools.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/30">
                    <Droplets className="h-6 w-6" />
                  </div>
                  <p className="text-base text-muted-foreground max-w-sm">{t.pool.noLiquidityPositions}</p>
                  <Button
                    onClick={handleAddLiquidityClick}
                    className="h-11 rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40"
                  >
                    <Droplets className="mr-2 h-4 w-4" />
                    {t.pool.addLiquidity}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {userPools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} onRemove={handleRemoveLiquidity} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all-pools" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder={t.pool.searchPools}
                  className="pl-10 h-11 rounded-full bg-background/40 border-border/50 focus-visible:border-primary/50 focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoadingAllPools ? (
                <div className="flex justify-center py-14">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredAllPools.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground ring-1 ring-border/50">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? t.pool.poolNotFound : t.pool.noLiquidityFound}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredAllPools.map((pool) => (
                    <AllPoolCard key={pool.id} pool={pool} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Tabs value={innerTab} onValueChange={(v) => setInnerTab(v as "add" | "remove")}>
                <TabsList className="grid w-full grid-cols-2 gap-1 p-1 rounded-full border border-border/50 bg-background/40 mb-5 h-auto">
                  <TabsTrigger
                    value="add"
                    className="rounded-full py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                  >
                    {t.pool.add}
                  </TabsTrigger>
                  <TabsTrigger
                    value="remove"
                    className="rounded-full py-2 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
                  >
                    {t.pool.remove}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="add">
                  <AddLiquidityForm onAddLiquidity={handleAddLiquidity} initialTokens={initialTokens} />
                </TabsContent>

                <TabsContent value="remove">
                  <RemoveLiquidityForm pools={userPools} initialPairAddress={initialPairAddress} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
