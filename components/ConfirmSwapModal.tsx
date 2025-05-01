"use client"

import type { Trade } from "@uniswap/sdk"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface ConfirmSwapModalProps {
  isOpen: boolean
  trade: Trade | undefined
  originalTrade: Trade | undefined
  onAcceptChanges: () => void
  allowedSlippage: number
  onConfirm: () => void
  onDismiss: () => void
  recipient: string | null
  swapErrorMessage: string | undefined
}

export function ConfirmSwapModal({
  isOpen,
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
}: ConfirmSwapModalProps) {
  if (!trade) return null

  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent className="scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full">
        <DialogHeader>
          <DialogTitle>Confirm Swap</DialogTitle>
          <DialogDescription>
            {`You are swapping ${formatCurrency(Number(trade.inputAmount.toSignificant(6)))} ${trade.inputAmount.currency.symbol} for ${formatCurrency(Number(trade.outputAmount.toSignificant(6)))} ${trade.outputAmount.currency.symbol}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Price Impact</span>
            <span>{trade.priceImpact.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Allowed Slippage</span>
            <span>{allowedSlippage.toFixed(2)}%</span>
          </div>
          {swapErrorMessage && <div className="text-red-500">{swapErrorMessage}</div>}
          <Button onClick={onConfirm} className="w-full">
            Confirm Swap
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
