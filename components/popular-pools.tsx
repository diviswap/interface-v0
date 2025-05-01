"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ethers } from "ethers"
import { FACTORY_ADDRESS, FACTORY_ABI, PAIR_ABI, ERC20_ABI, WCHZ_ADDRESS } from "@/lib/constants"
import { useWeb3 } from "@/components/web3-provider"

export function PopularPools() {
  const { provider } = useWeb3()
  const [pools, setPools] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPools = async () => {
      if (!provider) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Create factory contract instance
        const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)

        // Get total number of pairs
        const pairsLength = await factory.allPairsLength()
        console.log(`Total pairs in factory: ${pairsLength}`)

        // We'll check the most recent pairs (up to 20)
        const pairsToCheck = Math.min(Number(pairsLength), 20)
        const poolsData = []

        // Check each pair
        for (let i = 0; i < pairsToCheck; i++) {
          try {
            // Get pair address
            const pairAddress = await factory.allPairs(i)

            // Create pair contract instance
            const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider)

            // Get pair data
            const [token0Address, token1Address, reserves, totalSupply] = await Promise.all([
              pairContract.token0(),
              pairContract.token1(),
              pairContract.getReserves(),
              pairContract.totalSupply(),
            ])

            // Skip pairs with no liquidity
            if (reserves[0] === BigInt(0) && reserves[1] === BigInt(0)) {
              continue
            }

            // Get token info
            const [token0Contract, token1Contract] = [
              new ethers.Contract(token0Address, ERC20_ABI, provider),
              new ethers.Contract(token1Address, ERC20_ABI, provider),
            ]

            // Get token details
            const [token0Symbol, token0Decimals, token1Symbol, token1Decimals] = await Promise.all([
              token0Contract.symbol().catch(() => "Unknown"),
              token0Contract.decimals().catch(() => 18),
              token1Contract.symbol().catch(() => "Unknown"),
              token1Contract.decimals().catch(() => 18),
            ])

            // Calculate TVL (Total Value Locked)
            // For simplicity, we'll use a price estimate for CHZ and other tokens
            // In a real app, you would fetch actual token prices from an oracle or API
            const chzPrice = 0.12 // Example price in USD
            const reserve0USD =
              token0Address.toLowerCase() === WCHZ_ADDRESS.toLowerCase()
                ? Number(ethers.formatUnits(reserves[0], token0Decimals)) * chzPrice
                : Number(ethers.formatUnits(reserves[0], token0Decimals)) * 0.5 // Estimate for other tokens

            const reserve1USD =
              token1Address.toLowerCase() === WCHZ_ADDRESS.toLowerCase()
                ? Number(ethers.formatUnits(reserves[1], token1Decimals)) * chzPrice
                : Number(ethers.formatUnits(reserves[1], token1Decimals)) * 0.5 // Estimate for other tokens

            const tvl = reserve0USD + reserve1USD

            // Simulate 24h volume (in a real app, you would track this over time)
            const volume24h = tvl * (Math.random() * 0.5 + 0.1) // 10-60% of TVL

            // Simulate 24h change (in a real app, you would calculate this from historical data)
            const change24h = (Math.random() * 20 - 10).toFixed(2) // -10% to +10%

            // Add to pools data
            poolsData.push({
              id: pairAddress,
              name: `${token0Symbol}/${token1Symbol}`,
              volume24h,
              tvl,
              change24h: Number.parseFloat(change24h),
              token0Symbol,
              token1Symbol,
              reserve0: reserves[0],
              reserve1: reserves[1],
            })
          } catch (error) {
            console.error(`Error processing pair ${i}:`, error)
          }
        }

        // Sort pools by TVL (highest first)
        poolsData.sort((a, b) => b.tvl - a.tvl)

        // Take top 4 pools
        setPools(poolsData.slice(0, 4))
      } catch (error) {
        console.error("Error fetching pools:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPools()
  }, [provider])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Pools</CardTitle>
        <CardDescription>Most active pools on DiviSwap</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pool</TableHead>
                <TableHead className="text-right">Volume (24h)</TableHead>
                <TableHead className="text-right">TVL</TableHead>
                <TableHead className="text-right">Change (24h)</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pools.map((pool) => (
                <TableRow key={pool.id}>
                  <TableCell className="font-medium">{pool.name}</TableCell>
                  <TableCell className="text-right">${formatCurrency(pool.volume24h, 0)}</TableCell>
                  <TableCell className="text-right">${formatCurrency(pool.tvl, 0)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`flex items-center justify-end ${
                        pool.change24h >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {pool.change24h >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(pool.change24h)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/charts?address=${pool.id}`}
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      View chart
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
