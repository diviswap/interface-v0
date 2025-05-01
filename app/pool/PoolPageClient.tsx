"use client"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { PoolCard } from "@/components/pool-card"
import { AllPoolCard } from "@/components/all-pool-card"
import { AddLiquidityForm } from "@/components/add-liquidity-form"
import { RemoveLiquidityForm } from "@/components/remove-liquidity-form"
import { FACTORY_ABI, PAIR_ABI, ERC20_ABI, FACTORY_ADDRESS, WCHZ_ADDRESS, TOKEN_LIST } from "@/lib/constants"
import { useSearchParams, useRouter } from "next/navigation"

const getTokenLogoURI = (tokenAddress: string) => {
  const token = TOKEN_LIST.find((t) => t.address.toLowerCase() === tokenAddress.toLowerCase())
  return token?.logoURI || null
}

function PoolPage() {
  const { provider, account, isConnected, refreshBalance } = useWeb3()
  const { toast } = useToast()

  const [userPools, setUserPools] = useState([])
  const [allPools, setAllPools] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAllPools, setIsLoadingAllPools] = useState(false)
  const [activeTab, setActiveTab] = useState("positions")
  const [searchTerm, setSearchTerm] = useState("")
  const [initialTokens, setInitialTokens] = useState({
    token0Address: null,
    token1Address: null,
  })
  const [initialPairAddress, setInitialPairAddress] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tab = searchParams.get("tab")
    const removeParam = searchParams.get("remove")
    const token0Address = searchParams.get("token0")
    const token1Address = searchParams.get("token1")
    const pairAddress = searchParams.get("pair")

    if (tab && ["positions", "all-pools", "add"].includes(tab)) {
      setActiveTab(tab)

      if (removeParam === "true" && tab === "add") {
        setTimeout(() => {
          const removeTab = document.querySelector('[value="remove"]')
          if (removeTab) {
            ;(removeTab as HTMLElement).click()
          }
        }, 100)
      }
    }

    if (token0Address || token1Address) {
      setInitialTokens({
        token0Address: token0Address || null,
        token1Address: token1Address || null,
      })
    }

    if (pairAddress) {
      setInitialPairAddress(pairAddress)
    }
  }, [searchParams])

  const fetchUserPools = async () => {
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
                token0Contract.symbol().catch(() => "Unknown"),
                token0Contract.decimals().catch(() => 18),
                token0Contract.name().catch(() => "Unknown Token"),
                token1Contract.symbol().catch(() => "Unknown"),
                token1Contract.decimals().catch(() => 18),
                token1Contract.name().catch(() => "Unknown Token"),
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

            const token0Amount = (balance * reserves[0]) / totalSupply
            const token1Amount = (balance * reserves[1]) / totalSupply

            userPoolsData.push({
              id: pairAddress,
              token0,
              token1,
              liquidityTokens: ethers.formatUnits(balance, 18),
              token0Amount: ethers.formatUnits(token0Amount, token0.decimals),
              token1Amount: ethers.formatUnits(token1Amount, token1.decimals),
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
  }

  const fetchAllPools = async () => {
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
              token0Contract.symbol().catch(() => "Unknown"),
              token0Contract.decimals().catch(() => 18),
              token0Contract.name().catch(() => "Unknown Token"),
              token1Contract.symbol().catch(() => "Unknown"),
              token1Contract.decimals().catch(() => 18),
              token1Contract.name().catch(() => "Unknown Token"),
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
  }

  useEffect(() => {
    fetchUserPools()
  }, [isConnected, provider, account])

  useEffect(() => {
    if (activeTab === "all-pools") {
      fetchAllPools()
    }
  }, [activeTab, provider])

  const handleAddLiquidityClick = () => {
    setActiveTab("add")
    router.push("/pool?tab=add")
  }

  const handleAddLiquidity = async (tokenA, tokenB, amountA, amountB) => {
    await fetchUserPools()
    await fetchAllPools()

    if (isConnected && provider && account) {
      await refreshBalance()
    }

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
      <h1 className="text-4xl font-bold mb-8 text-center">Liquidity Pools</h1>
      <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="positions"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                My Positions
              </TabsTrigger>
              <TabsTrigger
                value="all-pools"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All Pools
              </TabsTrigger>
              <TabsTrigger
                value="add"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Add Liquidity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="space-y-4">
              {!isConnected ? (
                <div className="text-center py-8">
                  <p className="text-lg mb-4">Connect your wallet to view your liquidity positions</p>
                  <Button
                    onClick={() => {} /* Trigger wallet connect */}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Connect Wallet
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userPools.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg mb-4">You don't have any liquidity positions</p>
                  <Button
                    onClick={handleAddLiquidityClick}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add Liquidity
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
                  placeholder="Search pools by token name or symbol..."
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
                  {searchTerm ? <p>No pools found matching your search</p> : <p>No liquidity pools found</p>}
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
                    Add
                  </TabsTrigger>
                  <TabsTrigger
                    value="remove"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Remove
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

      {/* Chiliz Chain badge */}
    </div>
  )
}

export default PoolPage
