"use client"

import { useState, useEffect, useRef } from "react"
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

export function RemoveLiquidityForm({ pools, initialPairAddress }: RemoveLiquidityFormProps) {
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
  const [isInitialLoading, setIsInitialLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [confirmationDetails, setConfirmationDetails] = useState({
    pool: null,
    amount: "",
    expectedToken0: "",
    expectedToken1: "",
  })

  const lastPoolRef = useRef<string>("")
  const lastAmountRef = useRef("")
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  // Set initial pool if provided
  useEffect(() => {
    if (initialPairAddress && pools.length > 0) {
      const foundPool = pools.find((pool) => pool.id.toLowerCase() === initialPairAddress.toLowerCase())
      if (foundPool) {
        setSelectedPool(foundPool)
      }
    }
  }, [initialPairAddress, pools])

  useEffect(() => {
    const loadInitialData = async () => {
      if (!isConnected || !provider || !selectedPool || !account) {
        setIsApproved(false)
        setMaxLiquidity("0")
        return
      }

      // Only load if pool changed
      if (selectedPool.id === lastPoolRef.current) return

      setIsInitialLoading(true)
      setError(null)
      console.log("[v0] Loading initial data for pool:", selectedPool.id)

      try {
        // Get LP token balance
        const pairContract = new ethers.Contract(
          selectedPool.id,
          ["function balanceOf(address) view returns (uint256)"],
          provider,
        )

        const balance = await pairContract.balanceOf(account)
        console.log("[v0] LP token balance:", balance.toString())
        setMaxLiquidity(ethers.formatUnits(balance, 18))

        // Reset approval state when pool changes
        setIsApproved(false)
        lastPoolRef.current = selectedPool.id
      } catch (error) {
        console.error("[v0] Error loading initial data:", error)
        setError("Error loading pool data. Please try again.")
        setIsApproved(false)
        setMaxLiquidity("0")
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadInitialData()
  }, [isConnected, provider, selectedPool, account])

  useEffect(() => {
    const checkApprovalForAmount = async () => {
      if (!amount || !selectedPool || !account || !provider || Number(amount) === 0) {
        return
      }

      // Skip if amount hasn't changed
      if (amount === lastAmountRef.current) return

      try {
        console.log("[v0] Checking approval for amount:", amount)
        const allowance = await checkAllowance(selectedPool.id, account, ROUTER_ADDRESS, provider)
        const amountWei = ethers.parseUnits(amount, 18)
        const approved = allowance >= amountWei
        console.log("[v0] Approval check result:", approved)
        setIsApproved(approved)
        lastAmountRef.current = amount
      } catch (error) {
        console.error("[v0] Error checking approval:", error)
        setIsApproved(false)
      }
    }

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (amount && Number(amount) > 0) {
      debounceTimeoutRef.current = setTimeout(checkApprovalForAmount, 800)
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [amount, selectedPool, account, provider])

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
        console.error("[v0] Error calculating expected tokens:", error)
        setExpectedToken0("0")
        setExpectedToken1("0")
      }
    }

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (selectedPool && amount && Number(amount) > 0) {
      debounceTimeoutRef.current = setTimeout(calculateExpectedTokens, 500)
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [selectedPool, amount, provider])

  const handleAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      // Validate the value doesn't exceed max liquidity
      if (value && Number(value) > Number(maxLiquidity) && Number(maxLiquidity) > 0) {
        setAmount(maxLiquidity)
      } else {
        setAmount(value)
      }
      if (value !== lastAmountRef.current) {
        setIsApproved(false)
      }
    }
  }

  const handleSetMaxAmount = () => {
    setAmount(maxLiquidity)
  }

  const handleApprove = async () => {
    if (!isConnected || !selectedPool || !account || !amount || Number(amount) === 0) {
      toast({
        title: "Error",
        description: "Please connect your wallet and enter an amount first.",
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

      console.log("[v0] Approving LP tokens:", selectedPool.id)
      const tx = await approveToken(selectedPool.id, ROUTER_ADDRESS, ethers.MaxUint256, signer)
      console.log("[v0] Approval transaction:", tx)

      toast({
        title: "Success",
        description: "Liquidity tokens approved successfully!",
      })

      setIsApproved(true)
    } catch (error) {
      console.error("[v0] Error approving liquidity tokens:", error)
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
      // Truncate expected values to avoid too many decimal places for parseUnits
      const decimals0 = Number(selectedPool.token0.decimals)
      const decimals1 = Number(selectedPool.token1.decimals)
      const truncated0 = Number(expectedToken0).toFixed(decimals0)
      const truncated1 = Number(expectedToken1).toFixed(decimals1)
      const expectedAmount0Wei = ethers.parseUnits(truncated0, decimals0)
      const expectedAmount1Wei = ethers.parseUnits(truncated1, decimals1)
      const amount0Min = (expectedAmount0Wei * BigInt(99)) / BigInt(100)
      const amount1Min = (expectedAmount1Wei * BigInt(99)) / BigInt(100)

      console.log("[v0] Removing liquidity with parameters:", {
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
        console.log("[v0] Removing liquidity with ETH as token0")
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
        console.log("[v0] Removing liquidity with ETH as token1")
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
        console.log("[v0] Removing liquidity with two ERC20 tokens")
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

      console.log("[v0] Transaction successful:", tx)

      // Save details for confirmation
      setConfirmationDetails({
        pool: selectedPool,
        amount,
        expectedToken0,
        expectedToken1,
      })

      setTxHash(tx.hash)
      setIsConfirmationOpen(true)

      toast({
        title: "Success",
        description: "Liquidity removed successfully!",
      })
    } catch (error) {
      console.error("[v0] Error removing liquidity:", error)

      let errorMessage = "Failed to remove liquidity. Please try again."

      if (error instanceof Error) {
        console.error("[v0] Error details:", error.message)

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
    // Reset form after closing dialog
    setAmount("")
    setIsApproved(false)
    lastAmountRef.current = ""
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

  const canRemove = isConnected && isApproved && amount && Number(amount) > 0 && !isRemoving
  const needsApproval = isConnected && amount && Number(amount) > 0 && !isApproved && !isApproving
  const showLoading = isInitialLoading || (!isConnected && isInitialLoading)

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
              if (pool) {
                setSelectedPool(pool)
                setAmount("")
                setIsApproved(false)
                lastAmountRef.current = ""
              }
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

          {/* Percentage buttons for quick selection */}
          <div className="flex gap-2 mb-2">
            {[25, 50, 75, 100].map((percentage) => (
              <Button
                key={percentage}
                variant="outline"
                size="sm"
                className="flex-1 text-xs bg-transparent"
                onClick={() => {
                  if (maxLiquidity) {
                    const percentageAmount = (Number(maxLiquidity) * percentage) / 100
                    handleAmountChange(percentageAmount.toString())
                  }
                }}
              >
                {percentage}%
              </Button>
            ))}
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
        ) : showLoading ? (
          <Button className="w-full" disabled>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        ) : needsApproval ? (
          <Button className="w-full" onClick={handleApprove} disabled={isApproving}>
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
          <Button className="w-full" onClick={handleRemoveLiquidity} disabled={!canRemove}>
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
