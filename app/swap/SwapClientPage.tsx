"use client"
import { useState, useEffect, useMemo } from "react"
import { ethers } from "ethers"
import { Settings, RefreshCw, AlertTriangle, ArrowUpDown } from "lucide-react"
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
    actualAmountIn: "",
    actualMinAmountOut: "",
    actualSlippage: 0,
  })
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null)
  const [isUsingKayenRouter, setIsUsingKayenRouter] = useState(false)
  const [isApprovedForKayen, setIsApprovedForKayen] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [lastUserInput, setLastUserInput] = useState(Date.now())
  const [networkFee, setNetworkFee] = useState<string>("0")

  const provider = useMemo(() => {
    return publicClient
      ? new ethers.JsonRpcProvider(publicClient.transport.url, {
          chainId: publicClient.chain.id,
          name: publicClient.chain.name,
        })
      : null
  }, [publicClient])

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

  const calculateNetworkFee = useMemo(() => {
    return async () => {
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
  }, [provider])

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
        if (activeInput === "from") {
          setToAmount("")
        } else if (activeInput === "to") {
          setFromAmount("")
        }
        setExchangeRate(0)
        setPriceImpact(0)
        setCurrentTrade(null)
        setQuoteError(null)
        setIsLoadingQuote(false)
        return
      }

      if (!fromToken || !toToken || !provider) {
        if (activeInput === "from") {
          setToAmount("")
        } else if (activeInput === "to") {
          setFromAmount("")
        }
        setExchangeRate(0)
        setPriceImpact(0)
        setCurrentTrade(null)
        setQuoteError(null)
        setIsLoadingQuote(false)
        return
      }

      // Determinar qué input está activo y tiene valor
      const hasFromAmount = fromAmount && Number(fromAmount) > 0
      const hasToAmount = toAmount && Number(toAmount) > 0

      if (!hasFromAmount && !hasToAmount) {
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

        // Si el usuario está escribiendo en el campo "from" o solo hay valor en "from"
        if (activeInput === "from" || (hasFromAmount && !hasToAmount)) {
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
          } else {
            throw new Error("NO_ROUTE_FOUND")
          }
        }
        // Si el usuario está escribiendo en el campo "to" o solo hay valor en "to"
        else if (activeInput === "to" || (hasToAmount && !hasFromAmount)) {
          // Calcular la cantidad de entrada requerida para obtener la cantidad de salida deseada
          const calculatedFromAmount = await calculateReverseAmount(toAmount, fromToken, toToken)

          if (calculatedFromAmount && Number(calculatedFromAmount) > 0) {
            setFromAmount(calculatedFromAmount)

            // Ahora calcular el trade normal para obtener todos los detalles
            const amountIn = ethers.parseUnits(calculatedFromAmount, fromToken.decimals)
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

              setExchangeRate(trade.executionPrice)
              setPriceImpact(trade.priceImpact)
            } else {
              throw new Error("NO_ROUTE_FOUND")
            }
          } else {
            throw new Error("UNABLE_TO_CALCULATE_REVERSE")
          }
        }

        console.log(
          `Trade Info - Price Impact: ${priceImpact.toFixed(2)}%, Router: ${isUsingKayenRouter ? "FanX" : "Main"}`,
        )
      } catch (error: any) {
        console.error("Error getting quote:", error)

        if (activeInput === "from") {
          setToAmount("")
        } else if (activeInput === "to") {
          setFromAmount("")
        }

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
  }, [fromToken, toToken, fromAmount, toAmount, activeInput, provider, isUserTyping, lastUserInput])

  const calculateReverseAmount = async (outputAmount: string, tokenA: any, tokenB: any) => {
    if (!outputAmount || !tokenA || !tokenB || !provider || Number(outputAmount) === 0) {
      return "0"
    }

    try {
      const tokenAInfo: TokenInfo = {
        address: tokenA.address,
        symbol: tokenA.symbol,
        name: tokenA.name,
        decimals: tokenA.decimals,
      }

      const tokenBInfo: TokenInfo = {
        address: tokenB.address,
        symbol: tokenB.symbol,
        name: tokenB.name,
        decimals: tokenB.decimals,
      }

      const amountOut = ethers.parseUnits(outputAmount, tokenB.decimals)

      // Buscar la mejor ruta para el cálculo inverso
      const bestRoute = await findBestRoute(tokenAInfo, tokenBInfo, provider, ethers.parseUnits("1", tokenA.decimals))

      if (bestRoute.exists && bestRoute.reserves.length > 0) {
        // Para cálculo inverso, necesitamos usar getAmountIn en lugar de getAmountOut
        let requiredInput: bigint

        if (bestRoute.path.length === 2) {
          // Ruta directa - usar fórmula inversa de Uniswap V2
          const [reserveIn, reserveOut] = bestRoute.reserves[0]
          requiredInput = getAmountIn(amountOut, reserveIn, reserveOut)
        } else {
          // Ruta multi-hop - calcular iterativamente desde el final
          let amount = amountOut
          for (let i = bestRoute.reserves.length - 1; i >= 0; i--) {
            const [reserveIn, reserveOut] = bestRoute.reserves[i]
            amount = getAmountIn(amount, reserveIn, reserveOut)
          }
          requiredInput = amount
        }

        return ethers.formatUnits(requiredInput, tokenA.decimals)
      }

      return "0"
    } catch (error) {
      console.error("Error calculating reverse amount:", error)
      return "0"
    }
  }

  const getAmountIn = (amountOut: bigint, reserveIn: bigint, reserveOut: bigint): bigint => {
    if (amountOut <= BigInt(0)) {
      throw new Error("INSUFFICIENT_OUTPUT_AMOUNT")
    }

    if (reserveIn <= BigInt(0) || reserveOut <= BigInt(0)) {
      throw new Error("INSUFFICIENT_LIQUIDITY")
    }

    // Fórmula de Uniswap V2 para getAmountIn:
    // amountIn = (reserveIn * amountOut * 1000) / ((reserveOut - amountOut) * 997) + 1
    const numerator = reserveIn * amountOut * BigInt(1000)
    const denominator = (reserveOut - amountOut) * BigInt(997)

    return numerator / denominator + BigInt(1)
  }

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
  }, [provider, calculateNetworkFee])

  const handleFromAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value)
      setActiveInput("from")
      setIsUserTyping(true)
      setLastUserInput(Date.now())

      // Si el usuario borra el campo from, limpiar el campo to también
      if (value === "") {
        setToAmount("")
      }
    }
  }

  const handleToAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value)
      setActiveInput("to")
      setIsUserTyping(true)
      setLastUserInput(Date.now())

      // Si el usuario borra el campo to, limpiar el campo from también
      if (value === "") {
        setFromAmount("")
      }
    }
  }

  const handleTokenSwap = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)

    const tempAmount = fromAmount
    setFromAmount(toAmount)
    setToAmount(tempAmount)

    // Mantener el mismo input activo pero invertir la lógica
    if (activeInput === "from") {
      setActiveInput("to")
    } else if (activeInput === "to") {
      setActiveInput("from")
    }
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

      const path = tradePath.map((addr) => (addr === ethers.ZeroAddress ? WCHZ_ADDRESS : addr))
      const router = getRouterContract(signer, undefined, path)
      const deadlineTime = Math.floor(Date.now() / 1000) + deadline * 60

      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals)
      const minAmountOut = getMinimumAmountOut(currentTrade.outputAmount, slippage)

      console.log("[v0] Swap transaction parameters:")
      console.log("[v0] Amount In:", ethers.formatUnits(amountIn, fromToken.decimals), fromToken.symbol)
      console.log("[v0] Min Amount Out:", ethers.formatUnits(minAmountOut, toToken.decimals), toToken.symbol)
      console.log(
        "[v0] Expected Output:",
        ethers.formatUnits(currentTrade.outputAmount, toToken.decimals),
        toToken.symbol,
      )
      console.log("[v0] Slippage:", slippage + "%")
      console.log("[v0] Path:", path)

      let tx

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

        setSwapDetails({
          fromToken: fromToken,
          toToken: toToken,
          fromAmount: ethers.formatUnits(amountIn, fromToken.decimals),
          toAmount: ethers.formatUnits(currentTrade.outputAmount, toToken.decimals),
          actualAmountIn: ethers.formatUnits(amountIn, fromToken.decimals),
          actualMinAmountOut: ethers.formatUnits(minAmountOut, toToken.decimals),
          actualSlippage: slippage,
        })

        console.log("[v0] Swap completed successfully with actual values:")
        console.log("[v0] Actual Amount In:", ethers.formatUnits(amountIn, fromToken.decimals))
        console.log("[v0] Actual Min Amount Out:", ethers.formatUnits(minAmountOut, toToken.decimals))

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
    <div className="container max-w-xl mx-auto px-4 py-8 md:py-12">
      {/* Ambient glow */}
      <div aria-hidden className="absolute inset-x-0 top-16 -z-10 h-[500px] hero-radial pointer-events-none" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center text-center mb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className="text-gradient-primary">{t.swap.title}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t.swap.tradeDescription}</p>
        </div>

        <Card className="overflow-hidden glass-panel-strong border-border/40 shadow-2xl">
          <CardContent className="p-5 sm:p-6">
            <div className="flex justify-between items-center mb-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/40 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {slippage}% {t.swap.slippage ?? "slippage"}
                </span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSettingsOpen(true)}
                      className="rounded-full h-9 w-9 hover:bg-primary/10 hover:text-primary"
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

            {/* FROM */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="from-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.swap.from}
                </Label>
                {account && fromToken && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {t.swap.balance}: <span className="text-foreground/80">{formatCurrency(Number(fromBalance))}</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 rounded-md text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary"
                      onClick={() => setFromAmount(fromBalance)}
                    >
                      MAX
                    </Button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border/40 bg-background/40 p-4 transition-all focus-within:border-primary/50 focus-within:bg-background/60">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Input
                      id="from-amount"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="border-0 bg-transparent text-2xl sm:text-3xl font-semibold placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                    />
                  </div>
                  <TokenSelector selectedToken={fromToken} onSelectToken={setFromToken} otherToken={toToken} />
                </div>
              </div>
            </div>

            {/* Swap direction button */}
            <div className="flex justify-center -my-2.5 relative z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTokenSwap}
                disabled={!toToken}
                className="rounded-xl h-10 w-10 border-4 border-background bg-card text-foreground hover:bg-primary hover:text-primary-foreground shadow-lg transition-all"
                aria-label="Swap tokens"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* TO */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="to-amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.swap.to}
                </Label>
                {account && toToken && (
                  <span className="text-xs text-muted-foreground">
                    {t.swap.balance}: <span className="text-foreground/80">{formatCurrency(Number(toBalance))}</span>
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-border/40 bg-background/40 p-4 transition-all focus-within:border-primary/50 focus-within:bg-background/60">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0 relative">
                    {isLoadingQuote && activeInput === "from" ? (
                      <Skeleton className="h-9 w-2/3 bg-muted/50" />
                    ) : (
                      <Input
                        id="to-amount"
                        placeholder="0.0"
                        value={toAmount}
                        onChange={(e) => handleToAmountChange(e.target.value)}
                        className="border-0 bg-transparent text-2xl sm:text-3xl font-semibold placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                        disabled={isLoadingQuote && activeInput === "from"}
                      />
                    )}
                  </div>
                  <TokenSelector selectedToken={toToken} onSelectToken={setToToken} otherToken={fromToken} />
                </div>
              </div>
            </div>

            {isLoadingQuote && (
              <div className="flex justify-center py-3 mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>{activeInput === "from" ? "Calculating output amount..." : "Calculating input amount..."}</span>
                </div>
              </div>
            )}

            {quoteError && (
              <div className="mt-4 rounded-xl bg-destructive/10 p-3.5 text-sm text-destructive border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{quoteError}</p>
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
              <div className="mt-5 rounded-2xl border border-border/40 bg-background/30 p-4 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span
                    className={`font-medium ${
                      currentTrade && currentTrade.priceImpact > 3
                        ? "text-destructive"
                        : currentTrade && currentTrade.priceImpact > 1
                        ? "text-[hsl(40_100%_60%)]"
                        : "text-foreground"
                    }`}
                  >
                    {currentTrade ? `${currentTrade.priceImpact.toFixed(3)}%` : "< 0.01%"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Slippage Tolerance</span>
                  <span className="font-medium text-foreground">{slippage}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Minimum Received</span>
                  <span className="font-medium text-foreground">
                    {(() => {
                      if (currentTrade && currentTrade.outputAmount) {
                        try {
                          const minAmount = getMinimumAmountOut(currentTrade.outputAmount, slippage)
                          return `${formatCurrency(Number(ethers.formatUnits(minAmount, toToken.decimals)), 6)} ${toToken.symbol}`
                        } catch (error) {
                          console.error("Error calculating minimum amount:", error)
                          if (toAmount && !isNaN(Number(toAmount)) && Number(toAmount) > 0) {
                            const minReceived = Number(toAmount) * (1 - slippage / 100)
                            return `${formatCurrency(minReceived, 6)} ${toToken.symbol}`
                          }
                          return "0"
                        }
                      }

                      if (toAmount && !isNaN(Number(toAmount)) && Number(toAmount) > 0) {
                        const minReceived = Number(toAmount) * (1 - slippage / 100)
                        return `${formatCurrency(minReceived, 6)} ${toToken.symbol}`
                      }

                      return "0"
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Network Fee</span>
                  <span className="font-medium text-foreground">~${networkFee}</span>
                </div>
              </div>
            )}

            <div className="mt-5">
              {!isConnected ? (
                <Button className="w-full h-14 text-base font-semibold rounded-2xl bg-muted text-muted-foreground hover:bg-muted/80 cursor-not-allowed" disabled>
                  Connect your wallet to continue
                </Button>
              ) : !isApproved && !isApprovedForKayen && fromToken && fromToken.address !== ethers.ZeroAddress ? (
                <Button
                  className="w-full h-14 text-base font-semibold rounded-2xl bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border/50"
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
                  className="w-full h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
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

        <div className="flex flex-col items-center gap-2 mt-4">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t.home.poweredBy ?? "Powered by"}
          </span>
          <a
            href="https://www.chiliz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jKLx0f8SHem72P4rTOAS2E5OtISne0.png"
              alt="Built on Chiliz Chain - No affiliation with or endorsement by Chiliz"
              className="h-12 w-auto"
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
        actualAmountIn={swapDetails.actualAmountIn}
        actualMinAmountOut={swapDetails.actualMinAmountOut}
        actualSlippage={swapDetails.actualSlippage}
        txHash={swapTxHash}
      />
    </div>
  )
}

export default SwapPage
