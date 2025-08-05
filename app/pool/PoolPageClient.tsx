"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAccount, usePublicClient } from "wagmi"
import { ethers } from "ethers"
import { RefreshCw, Search } from "lucide-react"
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
  const hasInitialized = useRef(false)

  // Stabilize handleSearchParams to prevent unnecessary recreations
  const handleSearchParams = useCallback(() => {
    const tab = searchParams.get("tab")
    const token0 = searchParams.get("token0")
    const token1 = searchParams.get("token1")
    // Added handling for remove and pair parameters
    const remove = searchParams.get("remove")
    const pair = searchParams.get("pair")

    // Handle remove parameter to switch to add tab and set remove mode
    if (remove === "true" && pair) {
      setActiveTab("add")
      setInitialPairAddress(pair)
      // Clear the remove parameter from URL after handling
      setTimeout(() => {
        router.push("/pool?tab=add")
      }, 100)
      return
    }

    if (tab && ["positions", "add", "all-pools"].includes(tab)) {
      setActiveTab(tab as "positions" | "add" | "all-pools")
    }

    if (token0 && token1) {
      setInitialTokens({ token0, token1 })
      setTimeout(() => {
        router.push("/pool?tab=add")
      }, 100)
    }
  }, [searchParams, router])

  // Only run handleSearchParams when searchParams actually changes
  useEffect(() => {
    if (!hasInitialized.current) {
      handleSearchParams()
      hasInitialized.current = true
    }
  }, [handleSearchParams])

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

  // Only fetch user pools when dependencies actually change
  useEffect(() => {
    if (isConnected && provider && account && activeTab === "positions") {
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
    router.push("/pool?tab=add")
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
      <h1 className="text-4xl font-bold mb-8 text-center">{t.pool.title}</h1>
      <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="positions"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.pool.yourLiquidityPositions}
              </TabsTrigger>
              <TabsTrigger
                value="all-pools"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.pool.allPools}
              </TabsTrigger>
              <TabsTrigger
                value="add"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.pool.addLiquidity}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="space-y-4">
              {!isConnected ? (
                <div className="text-center py-8">
                  <p className="text-lg mb-4">{t.pool.connectWalletToView}</p>
                  <Button
                    onClick={() => {} /* Trigger wallet connect */}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {t.common.connectWallet}
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userPools.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg mb-4">{t.pool.noLiquidityPositions}</p>
                  <Button
                    onClick={handleAddLiquidityClick}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {t.pool.addLiquidity}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {userPools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all-pools" className="space-y-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.pool.searchPools}
                  className="pl-10 bg-background/50 backdrop-blur-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoadingAllPools ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredAllPools.length === 0 ? (
                <div className="text-center py-8">
                  {searchTerm ? <p>{t.pool.poolNotFound}</p> : <p>{t.pool.noLiquidityFound}</p>}
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
              <Tabs defaultValue={searchParams.get("remove") === "true" ? "remove" : "add"}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="add"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {t.pool.add}
                  </TabsTrigger>
                  <TabsTrigger
                    value="remove"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
