"use client"

import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ExternalLink, Plus } from "lucide-react"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

interface AddLiquidityConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  token0: any
  token1: any
  amount0: string
  amount1: string
  txHash: string | null
  poolShare: string
}

export function AddLiquidityConfirmationDialog({
  isOpen,
  onClose,
  token0,
  token1,
  amount0,
  amount1,
  txHash,
  poolShare,
}: AddLiquidityConfirmationDialogProps) {
  const explorerUrl = txHash ? `https://chiliscan.com/tx/${txHash}` : null

  console.log("Rendering confirmation dialog with props:", {
    isOpen,
    token0: token0?.symbol,
    token1: token1?.symbol,
    amount0,
    amount1,
    txHash,
    poolShare,
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none rounded-xl shadow-lg bg-gradient-to-b from-background to-background/95 backdrop-blur-sm text-card-foreground max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-t-xl border-b border-primary/10">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 border border-primary/20 shadow-md shadow-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">Liquidity Added!</DialogTitle>
            <p className="text-muted-foreground mt-2">Your transaction has been confirmed</p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center justify-center w-full bg-card/50 rounded-xl p-5 border border-border/50 shadow-sm">
              <div className="text-center px-4">
                <div className="mb-2 flex items-center justify-center">
                  {token0?.logoURI ? (
                    <Image
                      src={token0.logoURI || "/placeholder.svg"}
                      alt={token0.symbol}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-primary/10 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/10 shadow-sm">
                      {token0?.symbol?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">You added</p>
                <p className="text-xl font-bold">{formatCurrency(Number(amount0))}</p>
                <p className="text-sm font-medium text-primary">{token0?.symbol}</p>
              </div>

              <div className="px-4">
                <div className="bg-primary/10 rounded-full p-2 border border-primary/20">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="text-center px-4">
                <div className="mb-2 flex items-center justify-center">
                  {token1?.logoURI ? (
                    <Image
                      src={token1.logoURI || "/placeholder.svg"}
                      alt={token1.symbol}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-primary/10 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/10 shadow-sm">
                      {token1?.symbol?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">You added</p>
                <p className="text-xl font-bold">{formatCurrency(Number(amount1))}</p>
                <p className="text-sm font-medium text-primary">{token1?.symbol}</p>
              </div>
            </div>

            <div className="w-full rounded-xl bg-card/50 p-5 text-sm space-y-3 border border-border/50 shadow-sm">
              <h3 className="font-medium text-center mb-3 text-base">Transaction Details</h3>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Pool Share</span>
                <span className="font-medium text-primary">{poolShare}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">Chiliz Chain</span>
              </div>
              {txHash && (
                <div className="flex justify-between items-center pt-3 mt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Transaction Hash</span>
                  <span className="font-medium text-xs truncate max-w-[150px] text-primary">
                    {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 6)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0">
          {explorerUrl && (
            <Button
              variant="outline"
              asChild
              className="w-full rounded-lg border-primary/20 hover:bg-primary/5 transition-all duration-200"
            >
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                View on ChiliScan
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
