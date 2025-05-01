"use client"

import { useState, useEffect } from "react"
import { type Currency, Pair, TokenAmount } from "@uniswap/sdk"
import { useWeb3 } from "@/components/web3-provider"
import { wrappedCurrency } from "@/lib/uniswap"
import { FACTORY_ADDRESS } from "@/lib/constants"
import { ethers } from "ethers"

export function usePair(currencyA: Currency | undefined, currencyB: Currency | undefined): [boolean, Pair | null] {
  const { provider, chainId } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [pair, setPair] = useState<Pair | null>(null)

  useEffect(() => {
    async function fetchPair() {
      if (!currencyA || !currencyB || !provider || !chainId) {
        setPair(null)
        return
      }

      const tokenA = wrappedCurrency(currencyA, chainId)
      const tokenB = wrappedCurrency(currencyB, chainId)

      if (!tokenA || !tokenB || tokenA.equals(tokenB)) {
        setPair(null)
        return
      }

      setLoading(true)

      try {
        const factoryContract = new ethers.Contract(
          FACTORY_ADDRESS,
          ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
          provider,
        )

        const pairAddress = await factoryContract.getPair(tokenA.address, tokenB.address)

        if (pairAddress === ethers.constants.AddressZero) {
          setPair(null)
        } else {
          const pairContract = new ethers.Contract(
            pairAddress,
            [
              "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
            ],
            provider,
          )

          const reserves = await pairContract.getReserves()
          const [reserve0, reserve1] = reserves

          const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

          setPair(
            new Pair(new TokenAmount(tokens[0], reserve0.toString()), new TokenAmount(tokens[1], reserve1.toString())),
          )
        }
      } catch (error) {
        console.error("Failed to fetch pair", error)
        setPair(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPair()
  }, [currencyA, currencyB, provider, chainId])

  return [loading, pair]
}
