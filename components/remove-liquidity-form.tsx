"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAccount, useWalletClient, usePublicClient } from "wagmi"
import { formatCurrency } from "@/lib/utils"
import { checkAllowance, approveToken, removeLiquidity, removeLiquidityETH } from "@/lib/contracts"
import { ROUTER_ADDRESS } from "@/lib/constants"
import { RemoveLiquidityConfirmationDialog } from "@/components/remove-liquidity-confirmation-dialog"

interface RemoveLiquidityFormProps {
  pools: any[]
  initialPairAddress?: string | null
}

export function RemoveLiquidityForm({ pools, initialPairAddress = null }: RemoveLiquidityFormProps) {
  const { address: account, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { toast } = useToast()

  const provider = publicClient
    ? new ethers.JsonRpcProvider(publicClient.transport.url, {
        chainId: publicClient.chain.id,
        name: publicClient.chain.name,
      })
    : null

  // Updated getSigner to use walletClient instead of window.ethereum
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

  const [selectedPool, setSelectedPool] = useState(pools[0])
  const [amount, setAmount] = useState("")
  const [isRemoving, setIsRemoving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [maxLiquidity, setMaxLiquidity] = useState("0")
  const [expectedToken0, setExpectedToken0] = useState("0")
  const [expectedToken1, setExpectedToken1] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [confirmationDetails, setConfirmationDetails] = useState({
    pool: null,
    amount: "",
    expectedToken0: "",
    expectedToken1: "",
  })

  // Set initial pool if provided
  useEffect(() => {
    if (initialPairAddress && pools.length > 0) {
      const foundPool = pools.find((pool) => pool.id.toLowerCase() === initialPairAddress.toLowerCase())
      if (foundPool) {
        setSelectedPool(foundPool)
      }
    }
  }, [initialPairAddress, pools])

  // Check approval and get maximum balance
  useEffect(() => {
    const checkApprovalAndBalance = async () => {
      if (!isConnected || !provider || !selectedPool || !account) {
        setIsApproved(false)
        setMaxLiquidity("0")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log("Checking LP token balance for pair:", selectedPool.id)
        // Get LP token balance
        const pairContract = new ethers.Contract(
          selectedPool.id,
          ["function balanceOf(address) view returns (uint256)"],
          provider,
        )

        const balance = await pairContract.balanceOf(account)
        console.log("LP token balance:", balance.toString())
        setMaxLiquidity(ethers.formatUnits(balance, 18)) // LP tokens usually have 18 decimals

        // Check approval
        console.log("Checking allowance for LP token:", selectedPool.id)
        const allowance = await checkAllowance(selectedPool.id, account, ROUTER_ADDRESS, provider)
        console.log("LP token allowance:", allowance.toString())

        // Always check against total balance instead of specific amount
        setIsApproved(allowance >= balance)
      } catch (error) {
        console.error("Error checking approval and balance:", error)
        setError("Error checking approval and balance. Please try again.")
        setIsApproved(false)
        setMaxLiquidity("0")
      } finally {
        setIsLoading(false)
      }
    }

    checkApprovalAndBalance()
    // Removed 'amount' from dependencies to prevent infinite re-renders
  }, [isConnected, provider, selectedPool, account])

  // Added separate useEffect to check approval when amount changes
  useEffect(() => {
    const checkAmountApproval = async () => {
      if (!amount || !selectedPool || !account || !provider) {
        return
      }

      try {
        const allowance = await checkAllowance(selectedPool.id, account, ROUTER_ADDRESS, provider)
        const amountWei = ethers.parseUnits(amount, 18)
        setIsApproved(allowance >= amountWei)
      } catch (error) {
        console.error("Error checking amount approval:", error)
        setIsApproved(false)
      }
    }

    if (amount && Number(amount) > 0) {
      checkAmountApproval()
    }
  }, [amount, selectedPool, account, provider])

  // Calculate expected tokens when removing liquidity
  useEffect(() => {
    const calculateExpectedTokens = async () => {
      if (!selectedPool || !amount || !provider || Number(amount) === 0) {
        setExpectedToken0("0")
        setExpectedToken1("0")
        return
      }

      try {
        const pairContract = new ethers.Contract(
          selectedPool.id,
          [
            "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
            "function totalSupply() external view returns (uint256)",
          ],
          provider,
        )

        const [reserves, totalSupply] = await Promise.all([pairContract.getReserves(), pairContract.totalSupply()])

        const liquidityAmount = ethers.parseUnits(amount, 18)
        const reserve0 = reserves[0]
        const reserve1 = reserves[1]

        // Calculate expected tokens based on liquidity share
        const expectedAmount0 = (liquidityAmount * reserve0) / totalSupply
        const expectedAmount1 = (liquidityAmount * reserve1) / totalSupply

        setExpectedToken0(ethers.formatUnits(expectedAmount0, selectedPool.token0.decimals))
        setExpectedToken1(ethers.formatUnits(expectedAmount1, selectedPool.token1.decimals))
      } catch (error) {
        console.error("Error calculating expected tokens:", error)
        setExpectedToken0("0")
        setExpectedToken1("0")
      }
    }

    calculateExpectedTokens()
  }, [selectedPool, amount, provider])

  const handleAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleSetMaxAmount = () => {
    setAmount(maxLiquidity)
  }

  const handleApprove = async () => {
    if (!isConnected || !selectedPool || !account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    setIsApproving(true)
    setError(null)

    try {
      const signer = await getSigner()
      if (!signer) {
        throw new Error("Failed to get signer")
      }

      console.log("Approving LP tokens:", selectedPool.id)
      // Aprobar exactamente la cantidad necesaria en lugar de un monto ilimitado
      const liquidityAmount = ethers.parseUnits(amount, 18) // LP tokens suelen tener 18 decimales
      console.log("Approval amount:", liquidityAmount.toString())

      const tx = await approveToken(selectedPool.id, ROUTER_ADDRESS, liquidityAmount, signer)
      console.log("Approval transaction:", tx)

      toast({
        title: "Success",
        description: "Liquidity tokens approved successfully!",
      })

      setIsApproved(true)
    } catch (error) {
      console.error("Error approving liquidity tokens:", error)
      setError("Error approving liquidity tokens. Please try again.")
      toast({
        title: "Error",
        description: "Failed to approve liquidity tokens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!isConnected || !selectedPool || !amount || !account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    setIsRemoving(true)
    setError(null)

    try {
      const signer = await getSigner()
      if (!signer) {
        throw new Error("Failed to get signer")
      }

      const deadlineTime = Math.floor(Date.now() / 1000) + 20 * 60 // 20 minutes
      const liquidityAmount = ethers.parseUnits(amount, 18)

      // Calculate minimum amounts (with 1% slippage)
      const expectedAmount0Wei = ethers.parseUnits(expectedToken0, selectedPool.token0.decimals)
      const expectedAmount1Wei = ethers.parseUnits(expectedToken1, selectedPool.token1.decimals)
      const amount0Min = (expectedAmount0Wei * BigInt(99)) / BigInt(100)
      const amount1Min = (expectedAmount1Wei * BigInt(99)) / BigInt(100)

      console.log("Removing liquidity with parameters:", {
        token0: selectedPool.token0.address,
        token1: selectedPool.token1.address,
        liquidity: liquidityAmount.toString(),
        amount0Min: amount0Min.toString(),
        amount1Min: amount1Min.toString(),
        account,
        deadlineTime,
      })

      let tx

      // Check if one of the tokens is native CHZ (address zero)
      if (selectedPool.token0.address === ethers.ZeroAddress) {
        console.log("Removing liquidity with ETH as token0")
        tx = await removeLiquidityETH(
          selectedPool.token1.address,
          liquidityAmount,
          amount1Min,
          amount0Min,
          account,
          deadlineTime,
          signer,
        )
      } else if (selectedPool.token1.address === ethers.ZeroAddress) {
        console.log("Removing liquidity with ETH as token1")
        tx = await removeLiquidityETH(
          selectedPool.token0.address,
          liquidityAmount,
          amount0Min,
          amount1Min,
          account,
          deadlineTime,
          signer,
        )
      } else {
        // Both are ERC20 tokens
        console.log("Removing liquidity with two ERC20 tokens")
        tx = await removeLiquidity(
          selectedPool.token0.address,
          selectedPool.token1.address,
          liquidityAmount,
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
        pool: selectedPool,
        amount,
        expectedToken0,
        expectedToken1,
      })

      // Guardar el hash de la transacción
      setTxHash(tx.hash)

      // Mostrar el diálogo de confirmación
      setIsConfirmationOpen(true)

      toast({
        title: "Success",
        description: "Liquidity removed successfully!",
      })

      // Después de remover liquidez exitosamente, actualizar el balance
      if (isConnected && provider && account) {
        // Usar setTimeout para asegurar que la actualización ocurra fuera del ciclo de renderizado actual
        setTimeout(async () => {
          try {
            // Placeholder for refreshBalance function
          } catch (error) {
            console.error("Error refreshing balance after removing liquidity:", error)
          }
        }, 100)
      }

      // No reseteamos el formulario aquí, lo haremos cuando se cierre el diálogo
    } catch (error) {
      console.error("Error removing liquidity:", error)

      // Provide more detailed error message
      let errorMessage = "Failed to remove liquidity. Please try again."

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

      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false)
    // Resetear formulario después de cerrar el diálogo
    setAmount("")
  }

  if (pools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Remove Liquidity</CardTitle>
          <CardDescription>Remove your liquidity from pools</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No liquidity positions found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remove Liquidity</CardTitle>
        <CardDescription>Remove your liquidity from pools</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Pool Selection */}
        <div className="space-y-2">
          <Label>Select Pool</Label>
          <select
            className="w-full p-2 border rounded-md bg-background"
            value={selectedPool?.id || ""}
            onChange={(e) => {
              const pool = pools.find((p) => p.id === e.target.value)
              if (pool) setSelectedPool(pool)
            }}
          >
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {pool.token0.symbol}/{pool.token1.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="liquidity-amount">Amount to Remove</Label>
            {account && (
              <span className="text-xs text-muted-foreground">
                Max: {formatCurrency(Number(maxLiquidity))} LP tokens
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                id="liquidity-amount"
                placeholder="0.0"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pr-20"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 text-xs"
                onClick={handleSetMaxAmount}
              >
                MAX
              </Button>
            </div>
          </div>
        </div>

        {/* Expected Output */}
        {selectedPool && amount && Number(amount) > 0 && (
          <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">You will receive</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{selectedPool.token0.symbol}</span>
              <span>{formatCurrency(Number(expectedToken0))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{selectedPool.token1.symbol}</span>
              <span>{formatCurrency(Number(expectedToken1))}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {!isConnected ? (
          <Button className="w-full" disabled>
            Connect wallet to continue
          </Button>
        ) : isLoading ? (
          <Button className="w-full" disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        ) : !isApproved ? (
          <Button className="w-full" onClick={handleApprove} disabled={isApproving || !amount || Number(amount) === 0}>
            {isApproving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              "Approve LP Tokens"
            )}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleRemoveLiquidity}
            disabled={isRemoving || !amount || Number(amount) === 0}
          >
            {isRemoving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Removing liquidity...
              </>
            ) : (
              "Remove liquidity"
            )}
          </Button>
        )}
      </CardFooter>
      <RemoveLiquidityConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={handleConfirmationClose}
        token0={confirmationDetails.pool?.token0}
        token1={confirmationDetails.pool?.token1}
        amount0={confirmationDetails.expectedToken0}
        amount1={confirmationDetails.expectedToken1}
        lpAmount={confirmationDetails.amount}
        txHash={txHash}
      />
    </Card>
  )
}
