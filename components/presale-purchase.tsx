"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"
import { RefreshCw, AlertTriangle, Info } from "lucide-react"
import { PresaleConfirmationDialog } from "@/components/presale-confirmation-dialog"

// Add these constants
const USDC_ADDRESS = "0xa37936f56249965d407e39347528a1a91eb1cbef"
const USDT_ADDRESS = "0x14a634bf2d5be1c6ad7790d958e748174d8a2d43"

interface PresalePurchaseProps {
  presaleContract: ethers.Contract | null
  signer: ethers.Signer | null
  isConnected: boolean
  isPresaleEnded: boolean
  tokenPrice: number
  onPurchaseComplete?: () => Promise<void>
}

export function PresalePurchase({
  presaleContract,
  signer,
  isConnected,
  isPresaleEnded,
  tokenPrice,
  onPurchaseComplete,
}: PresalePurchaseProps) {
  const { toast } = useToast()
  const [purchaseTab, setPurchaseTab] = useState("chz")

  // CHZ purchase state
  const [chzAmount, setChzAmount] = useState("")
  const [estimatedTokens, setEstimatedTokens] = useState("0")
  const [isCalculating, setIsCalculating] = useState(false)

  // Stablecoin purchase state
  const [tokenAmount, setTokenAmount] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("0")
  const [stablecoinType, setStablecoinType] = useState("usdc")

  // Transaction state
  const [isPurchasing, setIsPurchasing] = useState(false)

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [swapTxHash, setSwapTxHash] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [confirmationDetails, setConfirmationDetails] = useState({
    paymentMethod: "",
    tokenAmount: "",
    paymentAmount: "",
  })

  // Calculate estimated tokens for CHZ
  useEffect(() => {
    const calculateTokens = async () => {
      if (!presaleContract || !chzAmount || Number(chzAmount) <= 0) {
        setEstimatedTokens("0")
        return
      }

      setIsCalculating(true)
      try {
        const chzAmountWei = ethers.parseEther(chzAmount)
        const result = await presaleContract.calculateTokensForChz(chzAmountWei)
        setEstimatedTokens(ethers.formatUnits(result.tokensToReceive, 18))
      } catch (error) {
        console.error("Error calculating tokens:", error)
        setEstimatedTokens("0")
      } finally {
        setIsCalculating(false)
      }
    }

    calculateTokens()
  }, [presaleContract, chzAmount])

  // Calculate estimated cost for token amount
  useEffect(() => {
    if (!tokenAmount || Number(tokenAmount) <= 0 || tokenPrice <= 0) {
      setEstimatedCost("0")
      return
    }

    const cost = Number(tokenAmount) * tokenPrice
    setEstimatedCost(cost.toFixed(6))
  }, [tokenAmount, tokenPrice])

  const handleStablecoinPurchase = async () => {
    if (!isConnected || !signer || !presaleContract) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (!tokenAmount || Number(tokenAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid token amount.",
        variant: "destructive",
      })
      return
    }

    if (Number(tokenAmount) < 0.1) {
      toast({
        title: "Error",
        description: "Minimum purchase amount is 0.1 FTK.",
        variant: "destructive",
      })
      return
    }

    // Set confirmation details and open dialog
    setConfirmationDetails({
      paymentMethod: stablecoinType.toUpperCase(),
      tokenAmount: tokenAmount,
      paymentAmount: estimatedCost,
    })
    setIsConfirmationOpen(true)
  }

  const confirmStablecoinPurchase = async () => {
    setIsPurchasing(true)
    setIsSuccess(false)
    try {
      const tokenAmountWei = ethers.parseUnits(tokenAmount, 18)
      const stablecoinAddress = stablecoinType === "usdc" ? USDC_ADDRESS : USDT_ADDRESS

      // Calculate the amount of stablecoin needed (token amount * price)
      const stablecoinAmount = ethers.parseUnits(
        (Number(tokenAmount) * tokenPrice).toFixed(6),
        6, // USDC and USDT both use 6 decimals
      )

      // First approve the presale contract to spend your stablecoins
      const stablecoinContract = new ethers.Contract(
        stablecoinAddress,
        [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)",
        ],
        signer,
      )

      // Check current allowance first
      const currentAllowance = await stablecoinContract.allowance(await signer.getAddress(), presaleContract.target)

      // Only approve if needed
      if (currentAllowance < stablecoinAmount) {
        toast({
          title: "Approving Stablecoin",
          description: `Please confirm the transaction to approve ${stablecoinType.toUpperCase()} spending.`,
        })

        // Approve the presale contract to spend the stablecoin
        const approveTx = await stablecoinContract.approve(presaleContract.target, stablecoinAmount)
        await approveTx.wait()

        toast({
          title: "Approval Successful",
          description: "Now proceeding with the token purchase.",
        })
      }

      // Connect signer to contract
      const contractWithSigner = presaleContract.connect(signer)

      // Log parameters for debugging
      console.log("Purchase parameters:", {
        tokenAmountWei: tokenAmountWei.toString(),
        isUsdc: stablecoinType === "usdc",
        contractAddress: presaleContract.target,
      })

      // Execute the purchase transaction
      const tx = await contractWithSigner.purchaseTokensWithStablecoin(
        tokenAmountWei,
        stablecoinType === "usdc", // true for USDC, false for USDT
        { gasLimit: 500000 },
      )

      toast({
        title: "Transaction Submitted",
        description: "Your purchase transaction has been submitted. Please wait for confirmation.",
      })

      // Save transaction hash
      setSwapTxHash(tx.hash)

      await tx.wait()

      // Set success state
      setIsSuccess(true)
      // Actualizar estadísticas
      if (onPurchaseComplete) {
        try {
          await onPurchaseComplete()
        } catch (error) {
          console.error("Error updating statistics after purchase:", error)
        }
      }

      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased ${formatCurrency(Number(tokenAmount))} FTK tokens.`,
        variant: "success",
      })

      // Reset form after dialog is closed
    } catch (error) {
      console.error("Error purchasing tokens:", error)
      // Log more detailed error information
      if (error.reason) console.error("Error reason:", error.reason)
      if (error.code) console.error("Error code:", error.code)
      if (error.data) console.error("Error data:", error.data)

      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please check console for details and try again.",
        variant: "destructive",
      })
      setIsConfirmationOpen(false)
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleChzPurchase = async () => {
    if (!isConnected || !signer || !presaleContract) {
      toast({
        title: "Error",
        description: "Please connect your wallet first.",
        variant: "destructive",
      })
      return
    }

    if (!chzAmount || Number(chzAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid CHZ amount.",
        variant: "destructive",
      })
      return
    }

    // Set confirmation details and open dialog
    setConfirmationDetails({
      paymentMethod: "CHZ",
      tokenAmount: estimatedTokens,
      paymentAmount: chzAmount,
    })
    setIsConfirmationOpen(true)
  }

  const confirmChzPurchase = async () => {
    setIsPurchasing(true)
    setIsSuccess(false)
    try {
      const chzAmountWei = ethers.parseEther(chzAmount)
      const contractWithSigner = presaleContract.connect(signer)

      const tx = await contractWithSigner.purchaseTokens({
        value: chzAmountWei,
        gasLimit: 500000,
      })

      toast({
        title: "Transaction Submitted",
        description: "Your purchase transaction has been submitted. Please wait for confirmation.",
      })

      // Save transaction hash
      setSwapTxHash(tx.hash)

      await tx.wait()

      // Set success state
      setIsSuccess(true)
      // Actualizar estadísticas
      if (onPurchaseComplete) {
        try {
          await onPurchaseComplete()
        } catch (error) {
          console.error("Error updating statistics after purchase:", error)
        }
      }

      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased approximately ${formatCurrency(Number(estimatedTokens))} FTK tokens.`,
        variant: "success",
      })

      // Reset form after dialog is closed
    } catch (error) {
      console.error("Error purchasing tokens:", error)
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      })
      setIsConfirmationOpen(false)
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleConfirmationClose = () => {
    if (isSuccess) {
      // Reset form if purchase was successful
      if (purchaseTab === "chz") {
        setChzAmount("")
        setEstimatedTokens("0")
      } else {
        setTokenAmount("")
        setEstimatedCost("0")
      }
    }
    setIsConfirmationOpen(false)
    setSwapTxHash(null)
    setIsSuccess(false)
  }

  const handleConfirmPurchase = () => {
    if (purchaseTab === "chz") {
      confirmChzPurchase()
    } else {
      confirmStablecoinPurchase()
    }
  }

  if (isPresaleEnded) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h3 className="text-2xl font-bold mb-2">Presale Ended</h3>
        <p className="text-center text-muted-foreground mb-4">
          The FintSport Token presale has ended. Thank you for your interest.
        </p>
        <p className="text-center text-sm">Stay tuned for token distribution and exchange listing announcements.</p>
      </div>
    )
  }

  return (
    <div>
      <Tabs value={purchaseTab} onValueChange={setPurchaseTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="chz">Pay with CHZ</TabsTrigger>
          <TabsTrigger value="stablecoin">Pay with Stablecoin</TabsTrigger>
        </TabsList>

        <TabsContent value="chz" className="space-y-6">
          <div className="bg-secondary/30 p-4 rounded-lg flex items-start gap-3 mb-6">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p>
                When paying with CHZ, your tokens will be calculated based on the current CHZ/USDC exchange rate. The
                estimated token amount may vary slightly due to price fluctuations and gas fees.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="chz-amount">CHZ Amount</Label>
              <div className="relative mt-1">
                <Input
                  id="chz-amount"
                  type="number"
                  placeholder="0.0"
                  value={chzAmount}
                  onChange={(e) => setChzAmount(e.target.value)}
                  className="pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-muted-foreground">CHZ</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Estimated FTK Tokens</Label>
              <div className="bg-secondary/50 p-3 rounded-lg mt-1 flex justify-between items-center">
                <span className="font-medium text-lg">
                  {isCalculating ? (
                    <RefreshCw className="h-5 w-5 animate-spin inline mr-2" />
                  ) : (
                    formatCurrency(Number(estimatedTokens))
                  )}
                </span>
                <span className="text-muted-foreground">FTK</span>
              </div>
            </div>

            <Button
              className="w-full py-6 text-lg"
              onClick={handleChzPurchase}
              disabled={!isConnected || isPurchasing || Number(chzAmount) <= 0}
            >
              {isPurchasing ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Purchase with CHZ"
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="stablecoin" className="space-y-6">
          <div className="bg-secondary/30 p-4 rounded-lg flex items-start gap-3 mb-6">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p>
                When paying with stablecoins, you'll need to approve the presale contract to spend your tokens. Make
                sure you have sufficient USDC or USDT in your wallet before proceeding.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="token-amount">FTK Token Amount</Label>
              <div className="relative mt-1">
                <Input
                  id="token-amount"
                  type="number"
                  placeholder="0.0"
                  value={tokenAmount}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setTokenAmount(value)
                      // Actualizar el costo estimado inmediatamente
                      if (value && Number(value) > 0) {
                        const cost = Number(value) * tokenPrice
                        setEstimatedCost(cost.toFixed(6))
                      } else {
                        setEstimatedCost("0")
                      }
                    }
                  }}
                  className="pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-muted-foreground">FTK</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum purchase: 0.1 FTK</p>
            </div>

            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <Button
                  type="button"
                  variant={stablecoinType === "usdc" ? "default" : "outline"}
                  className={stablecoinType === "usdc" ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setStablecoinType("usdc")}
                >
                  USDC
                </Button>
                <Button
                  type="button"
                  variant={stablecoinType === "usdt" ? "default" : "outline"}
                  className={stablecoinType === "usdt" ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setStablecoinType("usdt")}
                >
                  USDT
                </Button>
              </div>
            </div>

            <div>
              <Label>Cost</Label>
              <div className="bg-secondary/50 p-3 rounded-lg mt-1 flex justify-between items-center">
                <span className="font-medium text-lg">${formatCurrency(Number(estimatedCost))}</span>
                <span className="text-muted-foreground">{stablecoinType.toUpperCase()}</span>
              </div>
            </div>

            <Button
              className="w-full py-6 text-lg"
              onClick={handleStablecoinPurchase}
              disabled={!isConnected || isPurchasing || Number(tokenAmount) < 0.1}
            >
              {isPurchasing ? (
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Purchase with ${stablecoinType.toUpperCase()}`
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      <PresaleConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmPurchase}
        paymentMethod={confirmationDetails.paymentMethod}
        tokenAmount={confirmationDetails.tokenAmount}
        paymentAmount={confirmationDetails.paymentAmount}
        tokenPrice={tokenPrice}
        isPurchasing={isPurchasing}
        txHash={swapTxHash}
        isSuccess={isSuccess}
      />
    </div>
  )
}
