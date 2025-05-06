"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { formatCurrency } from "@/lib/utils"
import { checkAllowance, approveToken, removeLiquidity, removeLiquidityETH } from "@/lib/contracts"
import { WETH_ADDRESS, ROUTER_ADDRESS } from "@/lib/constants"
import { RemoveLiquidityConfirmationDialog } from "@/components/remove-liquidity-confirmation-dialog"

interface RemoveLiquidityFormProps {
  pools: any[]
  initialPairAddress?: string | null
}

export function RemoveLiquidityForm({ pools, initialPairAddress = null }: RemoveLiquidityFormProps) {
  const { provider, signer, account, isConnected, refreshBalance } = useWeb3()
  const { toast } = useToast()

  const [selectedPool, setSelectedPool] = useState(pools[0])
  const [amount, setAmount] = useState("")
  const [isRemoving, setIsRemoving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [maxLiquidity, setMaxLiquidity] = useState("0")
  const [expectedToken0, setExpectedToken0] = useState("0")
  const [expectedToken1, setExpectedToken1] = useState("0")
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmationDetails, setConfirmationDetails] = useState({
    token0: null,
    token1: null,
    amount0: "",
    amount1: "",
    lpAmount: "",
  })

  // Update selected pool when pools change
  useEffect(() => {
    if (pools.length > 0 && (!selectedPool || !pools.find((p) => p.id === selectedPool.id))) {
      setSelectedPool(pools[0])
    }
  }, [pools, selectedPool])

  // Set initial pool based on initialPairAddress
  useEffect(() => {
    if (initialPairAddress && pools.length > 0) {
      const pool = pools.find((p) => p.id.toLowerCase() === initialPairAddress.toLowerCase())
      if (pool) {
        setSelectedPool(pool)
      }
    }
  }, [initialPairAddress, pools])

  // Check approval and get maximum balance
  useEffect(() => {
    const checkApprovalAndBalance = async () => {
      if (!isConnected || !provider || !signer || !selectedPool || !account) {
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

        // If there's a specific amount, check against that amount
        if (amount) {
          const amountWei = ethers.parseUnits(amount, 18)
          setIsApproved(allowance >= amountWei)
        } else {
          // If no amount, check against total balance
          setIsApproved(allowance >= balance)
        }
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
  }, [isConnected, provider, signer, selectedPool, account, amount])

  // Calculate expected tokens when removing liquidity
  useEffect(() => {
    const calculateExpectedTokens = async () => {
      if (!selectedPool || !amount || !provider) {
        setExpectedToken0("0")
        setExpectedToken1("0")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log("Calculating expected tokens for amount:", amount)
        // Get reserves and total supply
        const pairContract = new ethers.Contract(
          selectedPool.id,
          [
            "function getReserves() view returns (uint112, uint112, uint32)",
            "function totalSupply() view returns (uint256)",
          ],
          provider,
        )

        const [reserves, totalSupply] = await Promise.all([pairContract.getReserves(), pairContract.totalSupply()])
        console.log("Pair reserves:", reserves[0].toString(), reserves[1].toString())
        console.log("Total supply:", totalSupply.toString())

        // Calculate the proportion of tokens to receive
        const amountWei = ethers.parseUnits(amount, 18)
        const token0Amount = (amountWei * reserves[0]) / totalSupply
        const token1Amount = (amountWei * reserves[1]) / totalSupply

        console.log("Expected token0 amount:", token0Amount.toString())
        console.log("Expected token1 amount:", token1Amount.toString())

        setExpectedToken0(ethers.formatUnits(token0Amount, selectedPool.token0.decimals))
        setExpectedToken1(ethers.formatUnits(token1Amount, selectedPool.token1.decimals))
      } catch (error) {
        console.error("Error calculating expected tokens:", error)
        setError("Error calculating expected tokens. Please try again.")
        setExpectedToken0("0")
        setExpectedToken1("0")
      } finally {
        setIsLoading(false)
      }
    }

    calculateExpectedTokens()
  }, [selectedPool, amount, provider])

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleSetMaxAmount = () => {
    setAmount(maxLiquidity)
  }

  const handleApprove = async () => {
    if (!isConnected || !signer || !selectedPool || !account) {
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
    if (!isConnected || !signer || !selectedPool || !amount || !account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (!isApproved) {
      toast({
        title: "Error",
        description: "Please approve the liquidity tokens first.",
        variant: "destructive",
      })
      return
    }

    setIsRemoving(true)
    setError(null)

    try {
      console.log("Removing liquidity for pair:", selectedPool.id)
      const deadlineTime = Math.floor(Date.now() / 1000) + 20 * 60 // 20 minutes
      console.log("Deadline:", deadlineTime)

      const liquidityAmount = ethers.parseUnits(amount, 18) // Assuming 18 decimals for LP tokens
      console.log("Liquidity amount:", liquidityAmount.toString())

      // Calculate minimum amounts (with 1% slippage)
      // Convert expected amounts to BigInt with 1% slippage
      const token0Decimals = Number(selectedPool.token0.decimals)
      const token1Decimals = Number(selectedPool.token1.decimals)

      // Calculate minimum amounts safely
      const expectedToken0Value = Number.parseFloat(expectedToken0)
      const expectedToken1Value = Number.parseFloat(expectedToken1)

      const minToken0 = expectedToken0Value * 0.99
      const minToken1 = expectedToken1Value * 0.99

      // Format as strings with the correct number of decimals
      const minToken0Str = minToken0.toFixed(token0Decimals)
      const minToken1Str = minToken1.toFixed(token1Decimals)

      // Parse to BigInt with the correct decimals
      const amountAMin = ethers.parseUnits(minToken0Str, token0Decimals)
      const amountBMin = ethers.parseUnits(minToken1Str, token1Decimals)

      console.log("Min token0 amount:", amountAMin.toString())
      console.log("Min token1 amount:", amountBMin.toString())

      let tx

      // If one of the tokens is native CHZ or WCHZ
      if (selectedPool.token0.address === ethers.ZeroAddress || selectedPool.token0.address === WETH_ADDRESS) {
        // If token0 is CHZ/WCHZ, use removeLiquidityETH with token1
        console.log("Removing liquidity with ETH (token0 is native)")
        tx = await removeLiquidityETH(
          selectedPool.token1.address,
          liquidityAmount,
          amountBMin,
          amountAMin,
          account,
          deadlineTime,
          signer,
        )
      } else if (selectedPool.token1.address === ethers.ZeroAddress || selectedPool.token1.address === WETH_ADDRESS) {
        // If token1 is CHZ/WCHZ, use removeLiquidityETH with token0
        console.log("Removing liquidity with ETH (token1 is native)")
        tx = await removeLiquidityETH(
          selectedPool.token0.address,
          liquidityAmount,
          amountAMin,
          amountBMin,
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
          amountAMin,
          amountBMin,
          account,
          deadlineTime,
          signer,
        )
      }

      console.log("Remove liquidity transaction:", tx)

      // Guardar los detalles para la confirmación
      setConfirmationDetails({
        token0: selectedPool.token0,
        token1: selectedPool.token1,
        amount0: expectedToken0,
        amount1: expectedToken1,
        lpAmount: amount,
      })

      // Guardar el hash de la transacción
      setTxHash(tx.hash)

      // Mostrar el diálogo de confirmación
      setIsConfirmationOpen(true)

      toast({
        title: "Success",
        description: "Liquidity removed successfully!",
      })

      // Después de quitar liquidez exitosamente, actualizar el balance
      if (isConnected && provider && account) {
        // Usar setTimeout para asegurar que la actualización ocurra fuera del ciclo de renderizado actual
        setTimeout(async () => {
          try {
            // Actualizar el balance global
            await refreshBalance()
          } catch (error) {
            console.error("Error refreshing balance after removing liquidity:", error)
          }
        }, 100)
      }

      // No reseteamos el formulario aquí, lo haremos cuando se cierre el diálogo
    } catch (error) {
      console.error("Error removing liquidity:", error)
      setError("Error removing liquidity. Please try again.")
      toast({
        title: "Error",
        description: "Failed to remove liquidity. Please try again.",
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

  // If there are no pools, show a message
  if (pools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Remove Liquidity</CardTitle>
          <CardDescription>Remove liquidity from a pool</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p>You don't have any liquidity positions yet. Add liquidity first to be able to remove it.</p>
          <Button
            variant="link"
            className="text-primary"
            onClick={() => document.querySelector('[data-value="add"]')?.click()}
          >
            Add Liquidity
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remove Liquidity</CardTitle>
        <CardDescription>Remove liquidity from a pool</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

        <div className="space-y-2">
          <Label htmlFor="pool-select">Select pool</Label>
          <select
            id="pool-select"
            value={selectedPool?.id}
            onChange={(e) => setSelectedPool(pools.find((pool) => pool.id === e.target.value))}
            className="w-full border border-input bg-input text-foreground rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          >
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id}>
                {pool.token0.symbol}/{pool.token1.symbol}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount">Amount</Label>
            {account && selectedPool && (
              <span className="text-xs text-muted-foreground">
                {isLoading ? (
                  <RefreshCw className="h-3 w-3 inline animate-spin mr-1" />
                ) : (
                  `Balance: ${formatCurrency(Number(maxLiquidity))} LP`
                )}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              id="amount"
              placeholder="0.0"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full pr-16"
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 text-xs"
              onClick={handleSetMaxAmount}
              disabled={isLoading}
            >
              MAX
            </Button>
          </div>
        </div>

        {selectedPool && amount && Number(amount) > 0 && (
          <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
            <div className="text-muted-foreground mb-2">
              {isLoading ? (
                <div className="flex items-center">
                  <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                  Calculating...
                </div>
              ) : (
                "You will receive approximately:"
              )}
            </div>
            <div className="flex justify-between">
              <span>{selectedPool.token0.symbol}</span>
              <span>{formatCurrency(Number(expectedToken0))}</span>
            </div>
            <div className="flex justify-between">
              <span>{selectedPool.token1.symbol}</span>
              <span>{formatCurrency(Number(expectedToken1))}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!isConnected ? (
          <Button className="w-full" disabled>
            Connect wallet to continue
          </Button>
        ) : !isApproved ? (
          <Button
            className="w-full"
            onClick={handleApprove}
            disabled={isApproving || isLoading || !selectedPool || !amount || Number(amount) === 0}
          >
            {isApproving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              "Approve LP tokens"
            )}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleRemoveLiquidity}
            disabled={isRemoving || isLoading || !selectedPool || !amount || Number(amount) === 0}
          >
            {isRemoving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Removing...
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
        token0={confirmationDetails.token0}
        token1={confirmationDetails.token1}
        amount0={confirmationDetails.amount0}
        amount1={confirmationDetails.amount1}
        lpAmount={confirmationDetails.lpAmount}
        txHash={txHash}
      />
    </Card>
  )
}
