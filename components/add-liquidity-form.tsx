"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { TokenSelector } from "@/components/token-selector"
import { COMMON_TOKENS, ROUTER_ADDRESS, ERC20_ABI, WCHZ_ADDRESS, TOKEN_LIST, FACTORY_ADDRESS } from "@/lib/constants"
import { checkAllowance, approveToken, addLiquidity, addLiquidityETH, getFactoryContract } from "@/lib/contracts"
import { formatCurrency } from "@/lib/utils"
import { getPairAddress } from "@/lib/swap-utils"
import { AddLiquidityConfirmationDialog } from "@/components/add-liquidity-confirmation-dialog"

interface AddLiquidityFormProps {
  onAddLiquidity: (token0: any, token1: any, amount0: string, amount1: string) => void
  initialTokens?: {
    token0Address: string | null
    token1Address: string | null
  }
}

export function AddLiquidityForm({
  onAddLiquidity,
  initialTokens = { token0Address: null, token1Address: null },
}: AddLiquidityFormProps) {
  const { provider, signer, account, isConnected, refreshBalance } = useWeb3()
  const { toast } = useToast()

  const [token0, setToken0] = useState(COMMON_TOKENS[0])
  const [token1, setToken1] = useState(null)
  const [amount0, setAmount0] = useState("")
  const [amount1, setAmount1] = useState("")
  const [isApproved0, setIsApproved0] = useState(false)
  const [isApproved1, setIsApproved1] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [token0Balance, setToken0Balance] = useState("0")
  const [token1Balance, setToken1Balance] = useState("0")
  const [pairExists, setPairExists] = useState(false)
  const [isCheckingPair, setIsCheckingPair] = useState(false)
  const [poolShare, setPoolShare] = useState("0")
  const [activeInput, setActiveInput] = useState(0) // 0 for token0, 1 for token1
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [confirmationDetails, setConfirmationDetails] = useState({
    token0: null,
    token1: null,
    amount0: "",
    amount1: "",
    poolShare: "0",
  })

  useEffect(() => {
    const loadInitialTokens = async () => {
      if (!provider || (!initialTokens.token0Address && !initialTokens.token1Address)) {
        return
      }

      try {
        // Cargar token0 si se proporciona
        if (initialTokens.token0Address) {
          // Buscar en la lista de tokens
          const foundToken = TOKEN_LIST.find(
            (t) => t.address.toLowerCase() === initialTokens.token0Address.toLowerCase(),
          )

          if (foundToken) {
            setToken0(foundToken)
          } else if (initialTokens.token0Address === ethers.ZeroAddress) {
            // Si es el token nativo (CHZ)
            setToken0(TOKEN_LIST.find((t) => t.address === ethers.ZeroAddress) || COMMON_TOKENS[0])
          }
        }

        // Cargar token1 si se proporciona
        if (initialTokens.token1Address) {
          // Buscar en la lista de tokens
          const foundToken = TOKEN_LIST.find(
            (t) => t.address.toLowerCase() === initialTokens.token1Address.toLowerCase(),
          )

          if (foundToken) {
            setToken1(foundToken)
          } else if (initialTokens.token1Address === ethers.ZeroAddress) {
            // Si es el token nativo (CHZ)
            setToken1(TOKEN_LIST.find((t) => t.address === ethers.ZeroAddress) || COMMON_TOKENS[0])
          }
        }
      } catch (error) {
        console.error("Error loading initial tokens:", error)
      }
    }

    loadInitialTokens()
  }, [provider, initialTokens])

  // Check if pair exists and get information
  useEffect(() => {
    const checkPairAndReserves = async () => {
      if (!token0 || !token1 || !provider) {
        setPairExists(false)
        setPoolShare("0")
        return
      }

      setIsCheckingPair(true)

      try {
        // For native tokens, use WCHZ instead for pair queries
        const token0Address = token0.address === ethers.ZeroAddress ? WCHZ_ADDRESS : token0.address
        const token1Address = token1.address === ethers.ZeroAddress ? WCHZ_ADDRESS : token1.address

        // Check if pair exists
        const pairAddress = await getPairAddress(token0Address, token1Address, FACTORY_ADDRESS, provider)
        const exists = pairAddress !== ethers.ZeroAddress
        setPairExists(exists)

        if (exists) {
          // Get pair reserves
          const pairContract = new ethers.Contract(
            pairAddress,
            [
              "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
              "function token0() external view returns (address)",
              "function totalSupply() external view returns (uint256)",
            ],
            provider,
          )

          const [reserves, token0FromPair, totalSupply] = await Promise.all([
            pairContract.getReserves(),
            pairContract.token0(),
            pairContract.totalSupply(),
          ])

          // Determine which reserve corresponds to which token
          const isToken0 = token0Address.toLowerCase() === token0FromPair.toLowerCase()
          const reserve0 = isToken0 ? reserves[0] : reserves[1]
          const reserve1 = isToken0 ? reserves[1] : reserves[0]

          // Calculate the other token amount based on which input is active
          if (activeInput === 0 && amount0 && Number(amount0) > 0) {
            try {
              const amountIn = ethers.parseUnits(amount0, token0.decimals)

              if (reserve0 > 0 && reserve1 > 0) {
                const estimatedAmount = (amountIn * reserve1) / reserve0
                // Usar un valor temporal para evitar actualizaciones infinitas
                const newAmount1 = ethers.formatUnits(estimatedAmount, token1.decimals)
                // Solo actualizar si hay una diferencia significativa para evitar bucles
                if (Math.abs(Number(newAmount1) - Number(amount1)) > 0.000001) {
                  setAmount1(newAmount1)
                }

                // Calculate pool share
                if (totalSupply > 0) {
                  const newLiquidity = (amountIn * totalSupply) / reserve0
                  const sharePercentage = (Number(newLiquidity) / (Number(totalSupply) + Number(newLiquidity))) * 100
                  setPoolShare(sharePercentage.toFixed(2))
                }
              }
            } catch (error) {
              console.error("Error calculating token amounts:", error)
            }
          } else if (activeInput === 1 && amount1 && Number(amount1) > 0) {
            try {
              const amountIn = ethers.parseUnits(amount1, token1.decimals)

              if (reserve0 > 0 && reserve1 > 0) {
                const estimatedAmount = (amountIn * reserve0) / reserve1
                // Usar un valor temporal para evitar actualizaciones infinitas
                const newAmount0 = ethers.formatUnits(estimatedAmount, token0.decimals)
                // Solo actualizar si hay una diferencia significativa para evitar bucles
                if (Math.abs(Number(newAmount0) - Number(amount0)) > 0.000001) {
                  setAmount0(newAmount0)
                }

                // Calculate pool share
                if (totalSupply > 0) {
                  const newLiquidity = (amountIn * totalSupply) / reserve1
                  const sharePercentage = (Number(newLiquidity) / (Number(totalSupply) + Number(newLiquidity))) * 100
                  setPoolShare(sharePercentage.toFixed(2))
                }
              }
            } catch (error) {
              console.error("Error calculating token amounts:", error)
            }
          } else {
            setPoolShare("0")
          }
        } else {
          // If pair doesn't exist
          setPoolShare(amount0 && amount1 ? "100" : "0")
        }
      } catch (error) {
        console.error("Error checking pair:", error)
        setPairExists(false)
        setPoolShare("0")
      } finally {
        setIsCheckingPair(false)
      }
    }

    checkPairAndReserves()
  }, [token0, token1, provider, activeInput, amount0, amount1])

  // Check approvals
  useEffect(() => {
    const checkTokenAllowances = async () => {
      if (!isConnected || !signer || !token0 || !token1 || !amount0 || !amount1) {
        setIsApproved0(false)
        setIsApproved1(false)
        return
      }

      try {
        const amount0Wei = ethers.parseUnits(amount0, token0.decimals)
        const amount1Wei = ethers.parseUnits(amount1, token1.decimals)

        // No need to check approval for native token (CHZ)
        const allowance0Promise =
          token0.address === ethers.ZeroAddress
            ? Promise.resolve(ethers.MaxUint256)
            : checkAllowance(token0.address, account, ROUTER_ADDRESS, provider)

        const allowance1Promise =
          token1.address === ethers.ZeroAddress
            ? Promise.resolve(ethers.MaxUint256)
            : checkAllowance(token1.address, account, ROUTER_ADDRESS, provider)

        const [allowance0, allowance1] = await Promise.all([allowance0Promise, allowance1Promise])

        setIsApproved0(BigInt(allowance0) >= amount0Wei)
        setIsApproved1(BigInt(allowance1) >= amount1Wei)
      } catch (error) {
        console.error("Error checking allowances:", error)
        setIsApproved0(false)
        setIsApproved1(false)
      }
    }

    checkTokenAllowances()
  }, [isConnected, provider, signer, account, token0, token1, amount0, amount1])

  // Fetch token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !provider || !account) {
        setToken0Balance("0")
        setToken1Balance("0")
        return
      }

      try {
        // Fetch token0 balance
        if (token0) {
          let balance
          if (token0.address === ethers.ZeroAddress) {
            // Native CHZ token
            balance = await provider.getBalance(account)
            setToken0Balance(ethers.formatUnits(balance, token0.decimals))
          } else {
            // ERC20 token
            const tokenContract = new ethers.Contract(token0.address, ERC20_ABI, provider)
            balance = await tokenContract.balanceOf(account)
            setToken0Balance(ethers.formatUnits(balance, token0.decimals))
          }
        }

        // Fetch token1 balance
        if (token1) {
          let balance
          if (token1.address === ethers.ZeroAddress) {
            // Native CHZ token
            balance = await provider.getBalance(account)
            setToken1Balance(ethers.formatUnits(balance, token1.decimals))
          } else {
            // ERC20 token
            const tokenContract = new ethers.Contract(token1.address, ERC20_ABI, provider)
            balance = await tokenContract.balanceOf(account)
            setToken1Balance(ethers.formatUnits(balance, token1.decimals))
          }
        }
      } catch (error) {
        console.error("Error fetching token balances:", error)
        toast({
          title: "Error",
          description: "Failed to fetch token balances",
          variant: "destructive",
        })
      }
    }

    fetchBalances()
  }, [isConnected, provider, account, token0, token1, toast])

  const handleApprove = async (tokenIndex: number) => {
    if (!isConnected || !signer) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    const token = tokenIndex === 0 ? token0 : token1
    const amount = tokenIndex === 0 ? amount0 : amount1

    if (!token || !amount) {
      return
    }

    // No need to approve native token (CHZ)
    if (token.address === ethers.ZeroAddress) {
      if (tokenIndex === 0) {
        setIsApproved0(true)
      } else {
        setIsApproved1(true)
      }
      return
    }

    setIsApproving(true)

    try {
      // Aprobar exactamente la cantidad necesaria
      const amountWei = ethers.parseUnits(amount, token.decimals)
      await approveToken(token.address, ROUTER_ADDRESS, amountWei, signer)

      toast({
        title: "Success",
        description: `${token.symbol} approved successfully!`,
      })

      if (tokenIndex === 0) {
        setIsApproved0(true)
      } else {
        setIsApproved1(true)
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

  const handleAddLiquidity = async () => {
    if (!isConnected || !signer || !token0 || !token1) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (
      (!isApproved0 && token0.address !== ethers.ZeroAddress) ||
      (!isApproved1 && token1.address !== ethers.ZeroAddress)
    ) {
      toast({
        title: "Error",
        description: "Please approve both tokens first.",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)

    try {
      // Check if pair exists, and if not, create it.
      if (!pairExists) {
        console.log("Pair does not exist. Creating pair...")
        const factory = getFactoryContract(signer)
        const token0AddressForPair = token0.address === ethers.ZeroAddress ? WCHZ_ADDRESS : token0.address
        const token1AddressForPair = token1.address === ethers.ZeroAddress ? WCHZ_ADDRESS : token1.address

        try {
          const createPairTx = await factory.createPair(token0AddressForPair, token1AddressForPair)
          toast({
            title: "Creating Pair",
            description: "Transaction sent to create the new liquidity pair.",
          })
          await createPairTx.wait()
          console.log("Pair created successfully:", createPairTx.hash)
          toast({
            title: "Pair Created",
            description: "The liquidity pair has been created. Now adding liquidity.",
          })
        } catch (pairError) {
          console.error("Error creating pair:", pairError)
          toast({
            title: "Error Creating Pair",
            description: "Could not create the liquidity pair. The transaction may have been reverted.",
            variant: "destructive",
          })
          setIsAdding(false)
          return
        }
      }

      const deadlineTime = Math.floor(Date.now() / 1000) + 20 * 60 // 20 minutes

      const amount0Wei = ethers.parseUnits(amount0, token0.decimals)
      const amount1Wei = ethers.parseUnits(amount1, token1.decimals)

      // Calculate minimum amounts (with 1% slippage)
      const amount0Min = (amount0Wei * BigInt(99)) / BigInt(100)
      const amount1Min = (amount1Wei * BigInt(99)) / BigInt(100)

      console.log("Adding liquidity with parameters:", {
        token0: token0.address,
        token1: token1.address,
        amount0Wei: amount0Wei.toString(),
        amount1Wei: amount1Wei.toString(),
        amount0Min: amount0Min.toString(),
        amount1Min: amount1Min.toString(),
        account,
        deadlineTime,
      })

      let tx

      // If one of the tokens is native CHZ
      if (token0.address === ethers.ZeroAddress) {
        console.log("Adding liquidity with ETH as token0")
        tx = await addLiquidityETH(
          token1.address,
          amount1Wei,
          amount1Min,
          amount0Min,
          account,
          deadlineTime,
          amount0Wei,
          signer,
        )
      } else if (token1.address === ethers.ZeroAddress) {
        console.log("Adding liquidity with ETH as token1")
        tx = await addLiquidityETH(
          token0.address,
          amount0Wei,
          amount0Min,
          amount1Min,
          account,
          deadlineTime,
          amount1Wei,
          signer,
        )
      } else {
        // Both are ERC20 tokens
        console.log("Adding liquidity with two ERC20 tokens")
        tx = await addLiquidity(
          token0.address,
          token1.address,
          amount0Wei,
          amount1Wei,
          amount0Min,
          amount1Min,
          account,
          deadlineTime,
          signer,
        )
      }

      console.log("Transaction successful:", tx)

      // Guardar los detalles para la confirmación
      setConfirmationDetails({
        token0,
        token1,
        amount0,
        amount1,
        poolShare,
      })

      // Guardar el hash de la transacción
      setTxHash(tx.hash)

      // Mostrar el diálogo de confirmación
      setIsConfirmationOpen(true)

      toast({
        title: "Success",
        description: "Liquidity added successfully!",
      })

      // Después de añadir liquidez exitosamente, actualizar el balance
      if (isConnected && provider && account) {
        // Usar setTimeout para asegurar que la actualización ocurra fuera del ciclo de renderizado actual
        setTimeout(async () => {
          try {
            // Actualizar el balance global
            await refreshBalance()
          } catch (error) {
            console.error("Error refreshing balance after adding liquidity:", error)
          }
        }, 100)
      }

      // Call the parent component's onAddLiquidity function
      onAddLiquidity(token0, token1, amount0, amount1)

      // No reseteamos el formulario aquí, lo haremos cuando se cierre el diálogo
    } catch (error) {
      console.error("Error adding liquidity:", error)

      // Provide more detailed error message
      let errorMessage = "Failed to add liquidity. Please try again."

      if (error instanceof Error) {
        console.error("Error details:", error.message)

        // Extract useful information from common error messages
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to complete this transaction."
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected in your wallet."
        } else if (error.message.includes("gas required exceeds")) {
          errorMessage = "Transaction would exceed gas limit. Try a smaller amount."
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false)
    // Resetear formulario después de cerrar el diálogo
    setAmount0("")
    setAmount1("")
  }

  const handleSetMaxAmount = (tokenIndex: number) => {
    if (tokenIndex === 0 && token0) {
      // If native token, leave some for gas
      if (token0.address === ethers.ZeroAddress) {
        const balance = Number.parseFloat(token0Balance)
        const maxAmount = Math.max(0, balance - 0.01) // Leave 0.01 CHZ for gas
        setAmount0(maxAmount.toString())
      } else {
        setAmount0(token0Balance)
      }
      setActiveInput(0)
    } else if (tokenIndex === 1 && token1) {
      // If native token, leave some for gas
      if (token1.address === ethers.ZeroAddress) {
        const balance = Number.parseFloat(token1Balance)
        const maxAmount = Math.max(0, balance - 0.01) // Leave 0.01 CHZ for gas
        setAmount1(maxAmount.toString())
      } else {
        setAmount1(token1Balance)
      }
      setActiveInput(1)
    }
  }

  const handleAmount0Change = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount0(value)
      // Establecer el input activo sin causar actualizaciones adicionales
      if (activeInput !== 0) {
        setActiveInput(0)
      }
    }
  }

  const handleAmount1Change = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount1(value)
      // Establecer el input activo sin causar actualizaciones adicionales
      if (activeInput !== 1) {
        setActiveInput(1)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Liquidity</CardTitle>
        <CardDescription>Add liquidity to earn trading fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token 0 input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="token0-amount">Token 1</Label>
            {account && token0 && (
              <span className="text-xs text-muted-foreground">
                Balance: {formatCurrency(Number(token0Balance))} {token0.symbol}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                id="token0-amount"
                placeholder="0.0"
                value={amount0}
                onChange={(e) => handleAmount0Change(e.target.value)}
                className="pr-20"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 text-xs"
                onClick={() => handleSetMaxAmount(0)}
              >
                MAX
              </Button>
            </div>
            <TokenSelector selectedToken={token0} onSelectToken={setToken0} otherToken={token1} />
          </div>
        </div>

        <div className="flex justify-center">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Token 1 input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="token1-amount">Token 2</Label>
            {account && token1 && (
              <span className="text-xs text-muted-foreground">
                Balance: {formatCurrency(Number(token1Balance))} {token1.symbol}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                id="token1-amount"
                placeholder="0.0"
                value={amount1}
                onChange={(e) => handleAmount1Change(e.target.value)}
                className="pr-20"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 text-xs"
                onClick={() => handleSetMaxAmount(1)}
              >
                MAX
              </Button>
            </div>
            <TokenSelector selectedToken={token1} onSelectToken={setToken1} otherToken={token0} />
          </div>
        </div>

        {/* Show estimated information if pair exists */}
        {token0 && token1 && (amount0 || amount1) && (
          <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pool share</span>
              <span>{poolShare}%</span>
            </div>
            {!pairExists && (
              <div className="text-yellow-500 text-xs mt-1">
                This will be a new liquidity pair. Make sure the prices are correct.
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!isConnected ? (
          <Button className="w-full" disabled>
            Connect wallet to continue
          </Button>
        ) : !isApproved0 || !isApproved1 ? (
          <div className="flex flex-col w-full gap-2">
            {!isApproved0 && token0 && amount0 && token0.address !== ethers.ZeroAddress && (
              <Button className="w-full" onClick={() => handleApprove(0)} disabled={isApproving}>
                {isApproving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  `Approve ${token0.symbol}`
                )}
              </Button>
            )}
            {!isApproved1 && token1 && amount1 && token1.address !== ethers.ZeroAddress && (
              <Button className="w-full" onClick={() => handleApprove(1)} disabled={isApproving}>
                {isApproving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  `Approve ${token1.symbol}`
                )}
              </Button>
            )}
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={handleAddLiquidity}
            disabled={
              isAdding || !token0 || !token1 || !amount0 || !amount1 || Number(amount0) === 0 || Number(amount1) === 0
            }
          >
            {isAdding ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Adding liquidity...
              </>
            ) : (
              "Add liquidity"
            )}
          </Button>
        )}
      </CardFooter>
      <AddLiquidityConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={handleConfirmationClose}
        token0={confirmationDetails.token0}
        token1={confirmationDetails.token1}
        amount0={confirmationDetails.amount0}
        amount1={confirmationDetails.amount1}
        txHash={txHash}
        poolShare={confirmationDetails.poolShare}
      />
    </Card>
  )
}
