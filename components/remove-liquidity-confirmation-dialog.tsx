"use client"

import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ExternalLink, Minus } from 'lucide-react'
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

interface RemoveLiquidityConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  token0: any
  token1: any
  amount0: string
  amount1: string
  txHash: string | null
  lpAmount: string
}

export function RemoveLiquidityConfirmationDialog({
  isOpen,
  onClose,
  token0,
  token1,
  amount0,
  amount1,
  txHash,
  lpAmount,
}: RemoveLiquidityConfirmationDialogProps) {
  const explorerUrl = txHash ? `https://chiliscan.com/tx/${txHash}` : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      {/* Made dialog responsive and handle overflow better */}
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full p-0 overflow-hidden border-none rounded-xl shadow-lg bg-gradient-to-b from-background to-background/95 backdrop-blur-sm text-card-foreground max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 rounded-t-xl border-b border-primary/10 flex-shrink-0">
          <DialogHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-2 sm:p-3 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mb-3 sm:mb-4 border border-primary/20 shadow-md shadow-primary/10">
              <CheckCircle2 className="h-6 w-6 sm:h-10 sm:w-10 text-primary" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">Liquidity Removed!</DialogTitle>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">Your transaction has been confirmed</p>
          </DialogHeader>
        </div>

        {/* Made content scrollable and responsive */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center w-full bg-card/50 rounded-xl p-3 sm:p-5 border border-border/50 shadow-sm">
              {/* Made token display sections responsive with proper text wrapping */}
              <div className="text-center flex-1 min-w-0 px-2">
                <div className="mb-2 flex items-center justify-center">
                  {token0?.logoURI ? (
                    <Image
                      src={token0.logoURI || "/placeholder.svg"}
                      alt={token0.symbol}
                      width={32}
                      height={32}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary/10 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/10 shadow-sm text-xs sm:text-sm">
                      {token0?.symbol?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">You received</p>
                {/* Added responsive text sizing and break-all for large numbers */}
                <p className="text-sm sm:text-lg lg:text-xl font-bold break-all leading-tight">
                  {amount0 ? formatCurrency(amount0) : "0"}
                </p>
                <p className="text-xs sm:text-sm font-medium text-primary truncate">{token0?.symbol}</p>
              </div>

              <div className="px-2 flex-shrink-0">
                <div className="bg-primary/10 rounded-full p-1.5 sm:p-2 border border-primary/20">
                  <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>

              {/* Made token display sections responsive with proper text wrapping */}
              <div className="text-center flex-1 min-w-0 px-2">
                <div className="mb-2 flex items-center justify-center">
                  {token1?.logoURI ? (
                    <Image
                      src={token1.logoURI || "/placeholder.svg"}
                      alt={token1.symbol}
                      width={32}
                      height={32}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary/10 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/10 shadow-sm text-xs sm:text-sm">
                      {token1?.symbol?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">You received</p>
                {/* Added responsive text sizing and break-all for large numbers */}
                <p className="text-sm sm:text-lg lg:text-xl font-bold break-all leading-tight">
                  {amount1 ? formatCurrency(amount1) : "0"}
                </p>
                <p className="text-xs sm:text-sm font-medium text-primary truncate">{token1?.symbol}</p>
              </div>
            </div>

            {/* Made transaction details responsive */}
            <div className="w-full rounded-xl bg-card/50 p-3 sm:p-5 text-xs sm:text-sm space-y-2 sm:space-y-3 border border-border/50 shadow-sm">
              <h3 className="font-medium text-center mb-2 sm:mb-3 text-sm sm:text-base">Transaction Details</h3>
              <div className="flex justify-between py-1 gap-2">
                <span className="text-muted-foreground flex-shrink-0">LP Tokens Burned</span>
                <span className="font-medium text-primary break-all min-w-0 text-right">
                  {lpAmount ? formatCurrency(lpAmount) : "0"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">Chiliz Chain</span>
              </div>
              {txHash && (
                <div className="flex justify-between items-center pt-2 sm:pt-3 mt-1 border-t border-border/50 gap-2">
                  <span className="text-muted-foreground flex-shrink-0">Transaction Hash</span>
                  <span className="font-medium text-xs truncate max-w-[120px] sm:max-w-[150px] text-primary">
                    {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 6)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Made footer responsive and fixed to bottom */}
        <DialogFooter className="p-4 sm:p-6 pt-0 flex-shrink-0">
          {explorerUrl && (
            <Button
              variant="outline"
              asChild
              className="w-full rounded-lg border-primary/20 hover:bg-primary/5 transition-all duration-200 text-sm sm:text-base bg-transparent"
            >
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                View on ChiliScan
                <ExternalLink className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
