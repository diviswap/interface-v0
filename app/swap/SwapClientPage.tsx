"use client"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Settings, Info, RefreshCw, AlertTriangle, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { TokenSelector } from "@/components/token-selector"
import { SettingsDialog } from "@/components/settings-dialog"
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
  approveToken,
  swapExactTokensForTokens,
  swapExactETHForTokens,
  swapExactTokensForETH,
} from "@/lib/contracts"
import { formatCurrency } from "@/lib/utils"
import { findBestRoute, createTrade, getMinimumAmountOut, type TokenInfo } from "@/lib/swap-utils"
import { SwapConfirmationDialog } from "@/components/swap-confirmation-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TOKEN_LIST } from "@/lib/token-list"

function SwapPage() {
  const { provider, signer, account, isConnected, refreshBalance } = useWeb3()
  const { toast } = useToast()

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
  // Add a new state variable to track if we're using the Kayen router
  const [isUsingKayenRouter, setIsUsingKayenRouter] = useState(false)
  // Add a state to track if we need to approve for Kayen router
  const [isApprovedForKayen, setIsApprovedForKayen] = useState(false)

  useEffect(() => {
    const checkTokenAllowance = async () => {
      if (!isConnected || !signer || !fromToken || !fromAmount) {
        setIsApproved(false)
        setIsApprovedForKayen(false)
        return
      }

      // No necesitamos verificar la aprobación para el token nativo (CHZ)
      if (fromToken.address === ethers.ZeroAddress) {
        setIsApproved(true)
        setIsApprovedForKayen(true)
        return
      }

      try {
        const amountWei = ethers.parseUnits(fromAmount, fromToken.decimals)

        // Check allowance for main router
        const allowance = await checkAllowance(fromToken.address, account, ROUTER_ADDRESS, provider)
        setIsApproved(BigInt(allowance) >= amountWei)

        // Check allowance for Kayen router
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
  }, [isConnected, provider, signer, account, fromToken, fromAmount, toast])

  useEffect(() => {
    const getQuote = async () => {
      if (!fromToken || !toToken || !fromAmount || Number(fromAmount) === 0 || !provider) {
        setToAmount("")
        setExchangeRate(0)
        setPriceImpact(0)
        setQuoteError(null)
        setCurrentTrade(null)
        setTradePath([])
        setIsMultiHopRoute(false)
        setRouteDescription("")
        setIsUsingKayenRouter(false)
        return
      }

      setIsLoading(true)
      setQuoteError(null)

      try {
        // Convertir tokens al formato requerido
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

        // Calcular el monto de entrada en wei
        const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals)

        // Buscar la mejor ruta disponible
        const bestRoute = await findBestRoute(tokenA, tokenB, provider, amountIn)

        if (bestRoute.exists) {
          // Crear información del trade con la ruta encontrada
          const trade = createTrade(
            amountIn,
            bestRoute.path,
            bestRoute.reserves,
            bestRoute.isKayenRouter,
            bestRoute.outputAmount,
            bestRoute.priceImpact,
          )

          // Guardar el trade actual
          setCurrentTrade(trade)
          setTradePath(trade.path)
          setIsMultiHopRoute(bestRoute.path.length > 2)
          setIsUsingKayenRouter(bestRoute.isKayenRouter || false)

          // Crear descripción de la ruta
          if (bestRoute.path.length > 2) {
            const routeSymbols = bestRoute.path.map((token) => token.symbol).join(" → ")
            setRouteDescription(routeSymbols)
          } else {
            setRouteDescription("")
          }

          // Actualizar la interfaz de usuario
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

        // Establecer un mensaje de error más específico
        if (error instanceof Error) {
          if (error.message === "PAIR_DOES_NOT_EXIST" || error.message === "NO_ROUTE_FOUND") {
            setQuoteError("No liquidity available for this token pair. Try another pair or add liquidity first.")
          } else if (error.message === "INSUFFICIENT_LIQUIDITY") {
            setQuoteError("Insufficient liquidity for this token pair")
          } else {
            setQuoteError("Unable to get quote. Please try again later.")
          }
        } else {
          setQuoteError("No se pudo obtener la cotización. Intenta de nuevo más tarde.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Use a debounce function to prevent rapid consecutive calls
    const debounce = (func: Function, delay: number) => {
      let timeoutId: NodeJS.Timeout
      return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
      }
    }

    const debouncedGetQuote = debounce(getQuote, 500)

    debouncedGetQuote()

    // Clean up the debounce on component unmount
    return () => clearTimeout(debouncedGetQuote as unknown as NodeJS.Timeout)
  }, [fromToken, toToken, fromAmount, provider])

  useEffect(() => {
    const updateBalances = async () => {
      if (isConnected && provider && account) {
        try {
          if (fromToken) {
            let fromBalance
            try {
              if (fromToken.address === ethers.ZeroAddress) {
                // Native CHZ token - Add retry mechanism
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
                      // Add exponential backoff delay
                      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
                    } else {
                      console.error("Failed to fetch native CHZ balance after multiple attempts")
                      setFromBalance("0")
                    }
                  }
                }
              } else {
                // ERC20 token
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
                // Native CHZ token - Add retry mechanism
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
                      // Add exponential backoff delay
                      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
                    } else {
                      console.error("Failed to fetch native CHZ balance after multiple attempts")
                      setToBalance("0")
                    }
                  }
                }
              } else {
                // ERC20 token
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

  const handleFromAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value)
      setActiveInput(0)
    }
  }

  const handleToAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value)
      setActiveInput(1)
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
    if (!isConnected || !signer || !fromToken) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    // No necesitamos aprobar el token nativo (CHZ)
    if (fromToken.address === ethers.ZeroAddress) {
      setIsApproved(true)
      setIsApprovedForKayen(true)
      return
    }

    setIsApproving(true)

    try {
      // Determine which router to approve for
      const routerAddress = isUsingKayenRouter ? KAYEN_ROUTER_ADDRESS : ROUTER_ADDRESS

      // Aprobar exactamente la cantidad necesaria en lugar de un monto ilimitado
      const amountWei = ethers.parseUnits(fromAmount, fromToken.decimals)
      const tx = await approveToken(fromToken.address, routerAddress, amountWei, signer)

      toast({
        title: "Success",
        description: `Token approved successfully for ${isUsingKayenRouter ? "Kayen" : "main"} router!`,
      })

      // Update the appropriate approval state
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
    if (!isConnected || !signer || !fromToken || !toToken || !currentTrade) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    // Check if we need approval based on which router we're using
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
      // Use the appropriate router based on the trade
      const routerAddress = isUsingKayenRouter ? KAYEN_ROUTER_ADDRESS : ROUTER_ADDRESS
      const router = getRouterContract(signer, routerAddress)
      const deadlineTime = Math.floor(Date.now() / 1000) + deadline * 60

      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals)
      const minAmountOut = getMinimumAmountOut(currentTrade.outputAmount, slippage)

      let tx

      // Usar la ruta correcta según si es un swap directo o multi-hop
      // Para tokens nativos, necesitamos usar WCHZ en la ruta
      const path = tradePath.map((addr) => (addr === ethers.ZeroAddress ? WCHZ_ADDRESS : addr))

      // Si fromToken es native token (CHZ)
      if (fromToken.address === ethers.ZeroAddress) {
        tx = await swapExactETHForTokens(router, amountIn, minAmountOut, path, account, deadlineTime, signer)
      }
      // Si toToken es native token (CHZ)
      else if (toToken.address === ethers.ZeroAddress) {
        tx = await swapExactTokensForETH(router, amountIn, minAmountOut, path, account, deadlineTime, signer)
      }
      // Si ambos son tokens ERC20
      else {
        tx = await swapExactTokensForTokens(router, amountIn, minAmountOut, path, account, deadlineTime, signer)
      }

      // Guardar los detalles del swap para mostrarlos en el diálogo de confirmación
      setSwapDetails({
        fromToken,
        toToken,
        fromAmount,
        toAmount,
      })

      // Guardar el hash de la transacción
      setSwapTxHash(tx.hash)

      // Mostrar el diálogo de confirmación
      setIsConfirmationOpen(true)

      toast({
        title: "Success",
        description: `Swap executed successfully!`,
      })

      // Después de un swap exitoso, actualizar el balance
      if (isConnected && provider && account) {
        // Usar setTimeout para asegurar que la actualización ocurra fuera del ciclo de renderizado actual
        setTimeout(async () => {
          try {
            // Actualizar balances locales
            if (fromToken) {
              const fromBalance = await getTokenBalance(fromToken, account, provider)
              setFromBalance(fromBalance)
            }
            if (toToken) {
              const toBalance = await getTokenBalance(toToken, account, provider)
              setToBalance(toBalance)
            }

            // Actualizar el balance global
            await refreshBalance()
          } catch (error) {
            console.error("Error refreshing balance after swap:", error)
          }
        }, 100)
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
    // Resetear formulario después de cerrar el diálogo
    setFromAmount("")
    setToAmount("")
    setCurrentTrade(null)
    setTradePath([])
    setIsMultiHopRoute(false)
    setRouteDescription("")
    setIsUsingKayenRouter(false)
  }

  // Improved token balance fetching with retry mechanism
  const getTokenBalance = async (token: any, account: string, provider: ethers.Provider): Promise<string> => {
    const maxRetries = 3
    let retries = 0

    while (retries < maxRetries) {
      try {
        if (token.address === ethers.ZeroAddress) {
          // Native CHZ token
          const balance = await provider.getBalance(account)
          return ethers.formatUnits(balance, token.decimals)
        } else {
          // ERC20 token
          const tokenContract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await tokenContract.balanceOf(account)
          return ethers.formatUnits(balance, token.decimals)
        }
      } catch (error) {
        console.warn(`Attempt ${retries + 1}/${maxRetries} failed to fetch balance:`, error)
        retries++
        if (retries < maxRetries) {
          // Add exponential backoff delay
          await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
        } else {
          console.error(`Failed to fetch balance for token after ${maxRetries} attempts`)
          return "0"
        }
      }
    }

    return "0" // Default return if all retries fail
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center mb-6">
          <h1 className="text-4xl font-bold text-white text-center">Swap Tokens Instantly</h1>
        </div>

        <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-b from-background to-background/50 shadow-xl">
          <CardContent className="p-6">
            {/* Card Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg text-white">Trade your tokens with ease and efficiency</p>
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
                    <p>Transaction Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* From Token Section */}
            <div className="space-y-2 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="from-amount" className="text-sm font-medium text-primary mb-1 sm:mb-0">
                  From
                </Label>
                {account && fromToken && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Balance: {formatCurrency(Number(fromBalance))}</span>
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

            {/* Swap Button */}
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

            {/* To Token Section */}
            <div className="space-y-2 sm:space-y-4 mt-2 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="to-amount" className="text-sm font-medium text-primary mb-1 sm:mb-0">
                  To
                </Label>
                {account && toToken && (
                  <span className="text-xs text-muted-foreground">Balance: {formatCurrency(Number(toBalance))}</span>
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

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span>Fetching best price...</span>
                </div>
              </div>
            )}

            {/* Error Message */}
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

            {/* Route Information */}
            {isMultiHopRoute && currentTrade && (
              <div className="mt-4 rounded-lg bg-amber-500/10 dark:bg-amber-900/20 p-3 text-sm text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Using multi-hop route: {routeDescription}</span>
                </div>
              </div>
            )}

            {/* FanX Router Badge */}
            {isUsingKayenRouter && (
              <div className="mt-4 rounded-lg bg-amber-500/10 dark:bg-amber-900/20 p-3 text-sm text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 93 55"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M26.4379 15.542L3.05176e-05 15.542L2.9256e-05 2.31596e-06L28.532 0V7.9219e-05L32.3598 7.89083e-05L46.0227 27.3641H46.0223V54.7281H0V27.3641L32.3407 27.3641L26.4379 15.542ZM46.0227 27.3641V0.0003278H92.1516V27.3645H59.7049L65.6075 39.1862H92.1515V54.7282H63.5132V54.7281H59.6856L46.0229 27.3645H46.0227V27.3641Z"
                    fill="#FFC400"
                  ></path>
                </svg>
                <span>Using FanX liquidity pool</span>
              </div>
            )}

            {/* Price Information */}
            {fromToken && toToken && fromAmount && toAmount && !quoteError && (
              <div className="mt-4 rounded-lg bg-secondary/80 p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price</span>
                  <div className="flex items-center gap-1">
                    <span>
                      1 {fromToken.symbol} = {formatCurrency(exchangeRate)} {toToken.symbol}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Refresh price</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Price Impact</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>The difference between the market price and estimated price due to trade size</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      priceImpact > 3
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : priceImpact > 1
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-green-500/10 text-green-500 border-green-500/20"
                    }`}
                  >
                    {formatCurrency(priceImpact, 2)}%
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Slippage Tolerance</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Your transaction will revert if the price changes unfavorably by more than this percentage
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{slippage}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Minimum Received</span>
                  <span>
                    {formatCurrency(
                      Number(
                        ethers.formatUnits(getMinimumAmountOut(currentTrade.outputAmount, slippage), toToken.decimals),
                      ),
                    )}{" "}
                    {toToken.symbol}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span>~0.001 CHZ</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6">
              {!isConnected ? (
                <Button className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled>
                  Connect your wallet to continue
                </Button>
              ) : !isApproved && !isApprovedForKayen && fromToken && fromToken.address !== ethers.ZeroAddress ? (
                <Button
                  className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleApprove}
                  disabled={isApproving || !fromToken || !toToken || !fromAmount || !toAmount}
                >
                  {isApproving ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Approving {fromToken?.symbol || ""}...
                    </>
                  ) : (
                    `Approve ${fromToken?.symbol || ""} for ${isUsingKayenRouter ? "FanX" : "Main"} Router`
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
                      Swapping...
                    </>
                  ) : (
                    "Swap"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chiliz Chain Badge */}
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

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        slippage={slippage}
        onSlippageChange={setSlippage}
        deadline={deadline}
        onDeadlineChange={setDeadline}
      />

      {/* Swap Confirmation Dialog */}
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
