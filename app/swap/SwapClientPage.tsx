"use client"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Settings, RefreshCw, AlertTriangle, ArrowUpDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, useWalletClient, usePublicClient } from "wagmi"
import { TokenSelector } from "@/components/token-selector"
import { SettingsDialog } from "@/components/settings-dialog"
import { useTranslation } from "@/lib/i18n/context"
import {
  ROUTER_ADDRESS,
  DEFAULT_SLIPPAGE,
  DEFAULT_TOKEN,
  WCHZ_ADDRESS,
  ERC20_ABI,
  KAYEN_ROUTER_ADDRESS,
} from "@/lib/constants"
import {
  getRouterContract,
  checkAllowance,
  swapExactTokensForTokens,
  swapExactETHForTokens,
  swapExactTokensForETH,
} from "@/lib/contracts"
import { formatCurrency } from "@/lib/utils"
import { findBestRoute, createTrade, getMinimumAmountOut, type TokenInfo } from "@/lib/swap-utils"
import { SwapConfirmationDialog } from "@/components/swap-confirmation-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { TOKEN_LIST } from "@/lib/token-list"

function SwapPage() {
  const { address: account, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { toast } = useToast()
  const { t } = useTranslation()

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE)
  const [deadline, setDeadline] = useState(20) // 20 minutes

  const [fromToken, setFromToken] = useState(DEFAULT_TOKEN)
  const [toToken, setToToken] = useState(() => {
    // Get DSwap token from the TOKEN_LIST (index 2)
    const dswapToken = TOKEN_LIST.find((token) => token.symbol === "DSwap")
    return dswapToken || null
  })
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [exchangeRate, setExchangeRate] = useState(0)
  const [priceImpact, setPriceImpact] = useState(0)
  const [isApproved, setIsApproved] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [fromBalance, setFromBalance] = useState<string>("0")
  const [toBalance, setToBalance] = useState<string>("0")
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [currentTrade, setCurrentTrade] = useState<any>(null)
  const [tradePath, setTradePath] = useState<string[]>([])
  const [isMultiHopRoute, setIsMultiHopRoute] = useState(false)
  const [routeDescription, setRouteDescription] = useState<string>("")
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null)
  const [swapDetails, setSwapDetails] = useState({
    fromToken: null,
    toToken: null,
    fromAmount: "",
    toAmount: "",
  })
  const [activeInput, setActiveInput] = useState<number | null>(null)
  const [isUsingKayenRouter, setIsUsingKayenRouter] = useState(false)
  const [isApprovedForKayen, setIsApprovedForKayen] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [lastUserInput, setLastUserInput] = useState(Date.now())
  const [networkFee, setNetworkFee] = useState<string>("0")

  const provider = publicClient
    ? new ethers.JsonRpcProvider(publicClient.transport.url, {
        chainId: publicClient.chain.id,
        name: publicClient.chain.name,
      })
    : null

  const getSigner = async () => {
    if (!walletClient) return null
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport)
      return await provider.getSigner()
    } catch (error) {
      console.error("Error getting signer:", error)
      return null
    }
  }

  const calculateNetworkFee = async () => {
    if (!provider) return "0"

    try {
      const feeData = await provider.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits("5", "gwei")
      const gasLimit = BigInt(500000) // Standard gas limit for swaps
      const gasCost = gasPrice * gasLimit

      // Convert to CHZ (assuming 18 decimals) and then to USD equivalent
      const gasCostInCHZ = Number(ethers.formatUnits(gasCost, 18))
      // Assuming 1 CHZ = $0.10 for estimation (this could be fetched from an API)
      const gasCostInUSD = gasCostInCHZ * 0.1

      return gasCostInUSD.toFixed(4)
    } catch (error) {
      console.error("Error calculating network fee:", error)
      return "0.0050" // Fallback value
    }
  }

  useEffect(() => {
    const checkTokenAllowance = async () => {
      if (!isConnected || !provider || !fromToken || !fromAmount || !account) {
        setIsApproved(false)
        setIsApprovedForKayen(false)
        return
      }

      if (fromToken.address === ethers.ZeroAddress) {
        setIsApproved(true)
        setIsApprovedForKayen(true)
        return
      }

      try {
        const amountWei = ethers.parseUnits(fromAmount, fromToken.decimals)

        const allowance = await checkAllowance(fromToken.address, account, ROUTER_ADDRESS, provider)
        setIsApproved(BigInt(allowance) >= amountWei)

        const kayenAllowance = await checkAllowance(fromToken.address, account, KAYEN_ROUTER_ADDRESS, provider)
        setIsApprovedForKayen(BigInt(kayenAllowance) >= amountWei)
      } catch (error) {
        console.error("Error checking allowance:", error)
        setIsApproved(false)
        setIsApprovedForKayen(false)
        toast({
          title: "Error",
          description: "Failed to check token allowance. Please try again.",
          variant: "destructive",
        })
      }
    }

    checkTokenAllowance()
  }, [isConnected, provider, account, fromToken, fromAmount, toast])

  useEffect(() => {
    const getQuote = async () => {
      if (!isConnected || !account) {
        setToAmount("")
        setExchangeRate(0)
        setPriceImpact(0)
        setCurrentTrade(null)
        setQuoteError(null)
        setIsLoadingQuote(false)
        return
      }

      if (!fromToken || !toToken || !fromAmount || Number(fromAmount) === 0 || !provider) {
        setToAmount("")
        setExchangeRate(0)
        setPriceImpact(0)
        setCurrentTrade(null)
        setQuoteError(null)
        setIsLoadingQuote(false)
        return
      }

      setIsLoadingQuote(true)
      setQuoteError(null)

      try {
        const tokenA: TokenInfo = {
          address: fromToken.address,
          symbol: fromToken.symbol,
          name: fromToken.name,
          decimals: fromToken.decimals,
        }

        const tokenB: TokenInfo = {
          address: toToken.address,
          symbol: toToken.symbol,
          name: toToken.name,
          decimals: toToken.decimals,
        }

        const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals)

        const bestRoute = await findBestRoute(tokenA, tokenB, provider, amountIn)

        if (bestRoute.exists) {
          const trade = createTrade(
            amountIn,
            bestRoute.path,
            bestRoute.reserves,
            bestRoute.isKayenRouter,
            bestRoute.outputAmount,
            bestRoute.priceImpact,
          )

          setCurrentTrade(trade)
          setTradePath(trade.path)
          setIsMultiHopRoute(bestRoute.path.length > 2)
          setIsUsingKayenRouter(bestRoute.isKayenRouter || false)

          if (bestRoute.path.length > 2) {
            const routeSymbols = bestRoute.path.map((token) => token.symbol).join(" → ")
            setRouteDescription(routeSymbols)
          } else {
            setRouteDescription("")
          }

          setToAmount(ethers.formatUnits(trade.outputAmount, toToken.decimals))
          setExchangeRate(trade.executionPrice)
          setPriceImpact(trade.priceImpact)

          console.log(
            `Trade Info - Price Impact: ${trade.priceImpact.toFixed(2)}%, Router: ${bestRoute.isKayenRouter ? "FanX" : "Main"}`,
          )
        } else {
          throw new Error("NO_ROUTE_FOUND")
        }
      } catch (error: any) {
        console.error("Error getting quote:", error)
        setToAmount("")
        setExchangeRate(0)
        setPriceImpact(0)
        setCurrentTrade(null)
        setTradePath([])
        setRouteDescription("")
        setIsUsingKayenRouter(false)

        if (error instanceof Error) {
          if (error.message === "PAIR_DOES_NOT_EXIST" || error.message === "NO_ROUTE_FOUND") {
            setQuoteError(t.swap.errors.pairDoesNotExist)
          } else if (error.message === "INSUFFICIENT_LIQUIDITY") {
            setQuoteError(t.swap.errors.insufficientLiquidity)
          } else {
            setQuoteError(t.swap.errors.unableToGetQuote)
          }
        } else {
          setQuoteError(t.swap.errors.unableToGetQuote)
        }
      } finally {
        setIsLoadingQuote(false)
      }
    }

    let debounceTimeout: NodeJS.Timeout
    let priceUpdateInterval: NodeJS.Timeout

    const debouncedGetQuote = () => {
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(() => {
        getQuote()
        setIsUserTyping(false)
      }, 500)
    }

    const setupPriceUpdateInterval = () => {
      priceUpdateInterval = setInterval(() => {
        const timeSinceLastInput = Date.now() - lastUserInput
        if (!isUserTyping && timeSinceLastInput > 2000) {
          console.log("Auto-updating prices (30s interval)")
          getQuote()
        }
      }, 30000) // 30 seconds
    }

    debouncedGetQuote()
    setupPriceUpdateInterval()

    return () => {
      clearTimeout(debounceTimeout)
      clearInterval(priceUpdateInterval)
    }
  }, [fromToken, toToken, fromAmount, provider, isUserTyping, lastUserInput])

  useEffect(() => {
    const updateBalances = async () => {
      if (isConnected && provider && account) {
        try {
          if (fromToken) {
            let fromBalance
            try {
              if (fromToken.address === ethers.ZeroAddress) {
                let retries = 0
                const maxRetries = 3
                let success = false

                while (retries < maxRetries && !success) {
                  try {
                    fromBalance = await provider.getBalance(account)
                    setFromBalance(ethers.formatUnits(fromBalance, fromToken.decimals))
                    success = true
                  } catch (error) {
                    console.warn(`Attempt ${retries + 1}/${maxRetries} failed to fetch native CHZ balance:`, error)
                    retries++
                    if (retries < maxRetries) {
                      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
                    } else {
                      console.error("Failed to fetch native CHZ balance after multiple attempts")
                      setFromBalance("0")
                    }
                  }
                }
              } else {
                const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, provider)
                fromBalance = await tokenContract.balanceOf(account)
                setFromBalance(ethers.formatUnits(fromBalance, fromToken.decimals))
              }
            } catch (error) {
              console.error("Error fetching from token balance:", error)
              setFromBalance("0")
            }
          }

          if (toToken) {
            let toBalance
            try {
              if (toToken.address === ethers.ZeroAddress) {
                let retries = 0
                const maxRetries = 3
                let success = false

                while (retries < maxRetries && !success) {
                  try {
                    toBalance = await provider.getBalance(account)
                    setToBalance(ethers.formatUnits(toBalance, toToken.decimals))
                    success = true
                  } catch (error) {
                    console.warn(`Attempt ${retries + 1}/${maxRetries} failed to fetch native CHZ balance:`, error)
                    retries++
                    if (retries < maxRetries) {
                      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
                    } else {
                      console.error("Failed to fetch native CHZ balance after multiple attempts")
                      setToBalance("0")
                    }
                  }
                }
              } else {
                const tokenContract = new ethers.Contract(toToken.address, ERC20_ABI, provider)
                toBalance = await tokenContract.balanceOf(account)
                setToBalance(ethers.formatUnits(toBalance, toToken.decimals))
              }
            } catch (error) {
              console.error("Error fetching to token balance:", error)
              setToBalance("0")
            }
          }
        } catch (error) {
          console.error("Error updating balances:", error)
          toast({
            title: "Warning",
            description: "Failed to fetch some token balances. They may display as zero.",
            variant: "warning",
          })
        }
      } else {
        setFromBalance("0")
        setToBalance("0")
      }
    }

    updateBalances()
  }, [isConnected, provider, account, fromToken, toToken, toast])

  useEffect(() => {
    if (provider) {
      calculateNetworkFee().then(setNetworkFee)
    }
  }, [provider])

  const handleFromAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value)
      setActiveInput(0)
      setIsUserTyping(true)
      setLastUserInput(Date.now())
    }
  }

  const handleToAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value)
      setActiveInput(1)
      setIsUserTyping(true)
      setLastUserInput(Date.now())
    }
  }

  const handleTokenSwap = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const handleApprove = async () => {
    if (!isConnected || !fromToken || !account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (fromToken.address === ethers.ZeroAddress) {
      setIsApproved(true)
      setIsApprovedForKayen(true)
      return
    }

    setIsApproving(true)

    try {
      const signer = await getSigner()
      if (!signer) {
        throw new Error("No signer available")
      }

      const routerAddress = isUsingKayenRouter ? KAYEN_ROUTER_ADDRESS : ROUTER_ADDRESS
      const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer)
      const amountWei = ethers.parseUnits(fromAmount, fromToken.decimals)

      const tx = await tokenContract.approve(routerAddress, amountWei)

      await tx.wait()

      toast({
        title: "Success",
        description: `Token approved successfully for ${isUsingKayenRouter ? "Kayen" : "main"} router!`,
      })

      if (isUsingKayenRouter) {
        setIsApprovedForKayen(true)
      } else {
        setIsApproved(true)
      }
    } catch (error) {
      console.error("Error approving token:", error)
      toast({
        title: "Error",
        description: "Failed to approve token. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleSwap = async () => {
    if (!isConnected || !fromToken || !toToken || !currentTrade || !account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    const needsApproval = isUsingKayenRouter ? !isApprovedForKayen : !isApproved

    if (needsApproval && fromToken.address !== ethers.ZeroAddress) {
      toast({
        title: "Error",
        description: "Please approve the token first.",
        variant: "destructive",
      })
      return
    }

    setIsSwapping(true)

    try {
      const signer = await getSigner()
      if (!signer) {
        throw new Error("Failed to get signer")
      }

      const routerAddress = isUsingKayenRouter ? KAYEN_ROUTER_ADDRESS : ROUTER_ADDRESS
      const router = getRouterContract(signer, routerAddress)
      const deadlineTime = Math.floor(Date.now() / 1000) + deadline * 60

      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals)
      const minAmountOut = getMinimumAmountOut(currentTrade.outputAmount, slippage)

      let tx

      const path = tradePath.map((addr) => (addr === ethers.ZeroAddress ? WCHZ_ADDRESS : addr))

      if (fromToken.address === ethers.ZeroAddress) {
        tx = await swapExactETHForTokens(router, amountIn, minAmountOut, path, account, deadlineTime, signer)
      } else if (toToken.address === ethers.ZeroAddress) {
        tx = await swapExactTokensForETH(router, amountIn, minAmountOut, path, account, deadlineTime, signer)
      } else {
        tx = await swapExactTokensForTokens(router, amountIn, minAmountOut, path, account, deadlineTime, signer)
      }

      // Esperar confirmación de la transacción antes de mostrar el modal
      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      })

      // Esperar a que la transacción sea confirmada
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        setSwapTxHash(tx.hash)

        // Actualizar swapDetails con los datos reales del swap antes de mostrar el modal
        setSwapDetails({
          fromToken: fromToken,
          toToken: toToken,
          fromAmount: fromAmount,
          toAmount: toAmount,
        })

        // Mostrar el modal de confirmación después del swap exitoso y confirmado
        setIsConfirmationOpen(true)

        toast({
          title: "Success",
          description: "Swap completed successfully!",
        })
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error) {
      console.error("Error executing swap:", error)
      toast({
        title: "Error",
        description: "Failed to execute swap. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSwapping(false)
    }
  }

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false)
    setFromAmount("")
    setToAmount("")
    setCurrentTrade(null)
    setTradePath([])
    setIsMultiHopRoute(false)
    setRouteDescription("")
    setIsUsingKayenRouter(false)
  }

  const getTokenBalance = async (token: any, account: string, provider: ethers.Provider): Promise<string> => {
    const maxRetries = 3
    let retries = 0

    while (retries < maxRetries) {
      try {
        if (token.address === ethers.ZeroAddress) {
          const balance = await provider.getBalance(account)
          return ethers.formatUnits(balance, token.decimals)
        } else {
          const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await tokenContract.balanceOf(account)
          return ethers.formatUnits(balance, token.decimals)
        }
      } catch (error) {
        console.warn(`Attempt ${retries + 1}/${maxRetries} failed to fetch balance:`, error)
        retries++
        if (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
        } else {
          console.error(`Failed to fetch balance for token after ${maxRetries} attempts`)
          return "0"
        }
      }
    }
    return "0"
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center mb-6">
          <h1 className="text-4xl font-bold text-white text-center">{t.swap.title}</h1>
        </div>

        <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-b from-background to-background/50 shadow-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg text-white">{t.swap.tradeDescription}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsSettingsOpen(true)}
                      className="rounded-full h-8 w-8 bg-secondary hover:bg-secondary/80"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t.swap.transactionSettings}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="from-amount" className="text-sm font-medium text-primary mb-1 sm:mb-0">
                  {t.swap.from}
                </Label>
                {account && fromToken && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {t.swap.balance}: {formatCurrency(Number(fromBalance))}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                      onClick={() => setFromAmount(fromBalance)}
                    >
                      MAX
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-secondary p-3 sm:p-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      id="from-amount"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="border-0 bg-transparent text-xl sm:text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                    />
                  </div>
                  <TokenSelector selectedToken={fromToken} onSelectToken={setFromToken} otherToken={toToken} />
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2 sm:-my-3 relative z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={handleTokenSwap}
                disabled={!toToken}
                className="rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-background bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                aria-label="Swap tokens"
              >
                <ArrowUpDown className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <div className="space-y-2 sm:space-y-4 mt-2 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="to-amount" className="text-sm font-medium text-primary mb-1 sm:mb-0">
                  {t.swap.to}
                </Label>
                {account && toToken && (
                  <span className="text-xs text-muted-foreground">
                    {t.swap.balance}: {formatCurrency(Number(toBalance))}
                  </span>
                )}
              </div>

              <div className="rounded-xl bg-secondary p-3 sm:p-4 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    {isLoading ? (
                      <Skeleton className="h-8 sm:h-9 w-full bg-muted/50" />
                    ) : (
                      <Input
                        id="to-amount"
                        placeholder="0.0"
                        value={toAmount}
                        onChange={(e) => handleToAmountChange(e.target.value)}
                        className="border-0 bg-transparent text-xl sm:text-2xl font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                        disabled={isLoading}
                      />
                    )}
                  </div>
                  <TokenSelector selectedToken={toToken} onSelectToken={setToToken} otherToken={fromToken} />
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span>Fetching best price...</span>
                </div>
              </div>
            )}

            {/* Made CHZ/PEPPER competition badge clickable and improved text */}
            {((fromToken?.symbol === "CHZ" && toToken?.symbol === "PEPPER") ||
              (fromToken?.symbol === "PEPPER" && toToken?.symbol === "CHZ")) && (
              <button
                onClick={() => window.location.href = "/competition"}
                className="w-full my-4 p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-orange-200">{t.swap.competitionBadge.title}</span>
                </div>
                <p className="text-xs text-orange-300/80 mt-1 ml-4">{t.swap.competitionBadge.description}</p>
              </button>
            )}

            {quoteError && (
              <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p>{quoteError}</p>
                    {(quoteError.includes("No liquidity") || quoteError.includes("NO_ROUTE_FOUND")) && (
                      <p className="text-xs mt-1 opacity-80">
                        You can create a new liquidity pool by adding liquidity in the Pool section.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(currentTrade || (fromAmount && toAmount && exchangeRate > 0)) && (
              <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border/50 mt-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className="text-foreground">
                    {currentTrade ? `${currentTrade.priceImpact.toFixed(3)}%` : "< 0.01%"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Slippage Tolerance</span>
                  <span className="text-foreground">{slippage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum Received</span>
                  <span className="text-foreground">
                    {(() => {
                      if (currentTrade && currentTrade.outputAmount) {
                        try {
                          const minAmount = getMinimumAmountOut(currentTrade.outputAmount, slippage)
                          return `${formatCurrency(Number(ethers.formatUnits(minAmount, toToken.decimals)), 6)} ${toToken.symbol}`
                        } catch (error) {
                          console.error("Error calculating minimum amount:", error)
                        }
                      }

                      // Fallback calculation when no currentTrade
                      if (toAmount && !isNaN(Number(toAmount)) && Number(toAmount) > 0) {
                        const minReceived = Number(toAmount) * (1 - slippage / 100)
                        return `${formatCurrency(minReceived, 6)} ${toToken.symbol}`
                      }

                      return "0"
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="text-foreground">~${networkFee}</span>
                </div>
              </div>
            )}

            <div className="mt-6">
              {!isConnected ? (
                <Button className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
                  Connect your wallet to continue
                </Button>
              ) : !isApproved && !isApprovedForKayen && fromToken && fromToken.address !== ethers.ZeroAddress ? (
                <Button
                  className="w-full py-6 text-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                  onClick={handleApprove}
                  disabled={isApproving || !fromToken || !fromAmount || Number(fromAmount) === 0}
                >
                  {isApproving ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      {t.swap.approving} {fromToken?.symbol || ""}...
                    </>
                  ) : (
                    `${t.swap.approve} ${fromToken?.symbol || ""}`
                  )}
                </Button>
              ) : (
                <Button
                  className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSwap}
                  disabled={
                    isSwapping ||
                    !fromToken ||
                    !toToken ||
                    !fromAmount ||
                    !toAmount ||
                    Number(fromAmount) === 0 ||
                    quoteError !== null ||
                    (isUsingKayenRouter && !isApprovedForKayen && fromToken.address !== ethers.ZeroAddress) ||
                    (!isUsingKayenRouter && !isApproved && fromToken.address !== ethers.ZeroAddress)
                  }
                >
                  {isSwapping ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      {t.swap.swapping}
                    </>
                  ) : (
                    t.swap.swap
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <a
            href="https://www.chiliz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jKLx0f8SHem72P4rTOAS2E5OtISne0.png"
              alt="Built on Chiliz Chain - No affiliation with or endorsement by Chiliz"
              className="h-16 w-auto"
            />
          </a>
        </div>
      </div>

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        slippage={slippage}
        onSlippageChange={setSlippage}
        deadline={deadline}
        onDeadlineChange={setDeadline}
      />

      <SwapConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={handleConfirmationClose}
        fromToken={swapDetails.fromToken}
        toToken={swapDetails.toToken}
        fromAmount={swapDetails.fromAmount}
        toAmount={swapDetails.toAmount}
        txHash={swapTxHash}
      />
    </div>
  )
}

export default SwapPage
