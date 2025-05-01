"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Check, ChevronDown, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { fetchTokenList, DEFAULT_TOKEN, ERC20_ABI } from "@/lib/constants"
import { cn, formatCurrency } from "@/lib/utils"
import { useWeb3 } from "@/components/web3-provider"
import { ethers } from "ethers"

interface TokenSelectorProps {
  selectedToken: any
  onSelectToken: (token: any) => void
  otherToken?: any
  showBalance?: boolean
}

export function TokenSelector({ selectedToken, onSelectToken, otherToken, showBalance = true }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [tokens, setTokens] = useState([DEFAULT_TOKEN])
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const { provider, account, isConnected } = useWeb3()

  // Function to fetch a single token balance with retry mechanism
  const fetchTokenBalance = useCallback(
    async (token: any) => {
      if (!isConnected || !provider || !account) return "0"

      // Maximum number of retry attempts
      const maxRetries = 3
      let retries = 0

      while (retries < maxRetries) {
        try {
          if (token.address === ethers.ZeroAddress) {
            // Native CHZ token
            try {
              const balance = await provider.getBalance(account)
              return ethers.formatUnits(balance, token.decimals)
            } catch (error) {
              console.warn(`Attempt ${retries + 1}/${maxRetries} failed to fetch native CHZ balance:`, error)
              // If this is the last retry, return "0" instead of throwing
              if (retries === maxRetries - 1) {
                console.error(`Failed to fetch balance for ${token.symbol} after ${maxRetries} attempts`)
                return "0"
              }
            }
          } else {
            // ERC20 token
            try {
              const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
              const balance = await tokenContract.balanceOf(account)
              return ethers.formatUnits(balance, token.decimals)
            } catch (error) {
              console.warn(`Attempt ${retries + 1}/${maxRetries} failed to fetch ${token.symbol} balance:`, error)
              // If this is the last retry, return "0" instead of throwing
              if (retries === maxRetries - 1) {
                console.error(`Failed to fetch balance for ${token.symbol} after ${maxRetries} attempts`)
                return "0"
              }
            }
          }

          // If we reach here, we need to retry
          retries++
          // Add exponential backoff delay
          await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
        } catch (error) {
          console.error(`Unexpected error fetching balance for ${token.symbol}:`, error)
          return "0"
        }
      }

      return "0" // Default return if all retries fail
    },
    [isConnected, provider, account],
  )

  // Function to fetch token balances
  const fetchTokenBalances = useCallback(async () => {
    if (!isConnected || !provider || !account) return

    setIsLoadingBalances(true)
    const balances: Record<string, string> = {}

    // Use Promise.allSettled to handle failures gracefully
    const balancePromises = tokens.map(async (token) => {
      try {
        const balance = await fetchTokenBalance(token)
        return { token, balance }
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error)
        return { token, balance: "0" }
      }
    })

    const results = await Promise.allSettled(balancePromises)

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { token, balance } = result.value
        balances[token.address] = balance
      }
    })

    setTokenBalances(balances)
    setIsLoadingBalances(false)
  }, [tokens, isConnected, provider, account, fetchTokenBalance])

  useEffect(() => {
    const loadTokens = async () => {
      const fetchedTokens = await fetchTokenList()
      setTokens(fetchedTokens)
    }
    loadTokens()
  }, [])

  useEffect(() => {
    if (showBalance && tokens.length > 1 && open) {
      fetchTokenBalances()
    }
  }, [tokens, isConnected, open, showBalance, fetchTokenBalances])

  // Filter out the other selected token
  const availableTokens = tokens.filter((token) => !otherToken || token.address !== otherToken.address)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[80px] md:min-w-[140px] justify-between"
        >
          {selectedToken ? (
            <div className="flex items-center gap-2">
              {selectedToken.logoURI ? (
                <Image
                  src={selectedToken.logoURI || "/placeholder.svg"}
                  alt={selectedToken.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  {selectedToken.symbol.charAt(0)}
                </div>
              )}
              <span className="hidden md:inline">{selectedToken.symbol}</span>
            </div>
          ) : (
            <span>Select</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search token..." className="h-9" />
          <CommandList>
            <CommandEmpty>No tokens found.</CommandEmpty>
            <CommandGroup>
              {availableTokens.map((token) => (
                <CommandItem
                  key={token.address}
                  value={token.symbol}
                  onSelect={() => {
                    onSelectToken(token)
                    setOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {token.logoURI ? (
                      <Image
                        src={token.logoURI || "/placeholder.svg"}
                        alt={token.symbol}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        {selectedToken.symbol.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col flex-grow">
                      <span>{token.symbol}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">{token.name}</span>
                    </div>
                    {showBalance && isConnected && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[60px] sm:min-w-[80px] justify-end">
                        <Wallet className="h-3 w-3" />
                        <span>
                          {isLoadingBalances && !tokenBalances[token.address]
                            ? "..."
                            : tokenBalances[token.address]
                              ? formatCurrency(Number(tokenBalances[token.address]), 4)
                              : "0"}
                        </span>
                      </div>
                    )}
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 flex-shrink-0",
                        selectedToken?.address === token.address ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
