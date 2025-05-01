"use client"

import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ExternalLink, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

interface PresaleConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  paymentMethod: string
  tokenAmount: string
  paymentAmount: string
  tokenPrice: number
  isPurchasing: boolean
  txHash: string | null
  isSuccess: boolean
}

export function PresaleConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  paymentMethod,
  tokenAmount,
  paymentAmount,
  tokenPrice,
  isPurchasing,
  txHash,
  isSuccess,
}: PresaleConfirmationDialogProps) {
  const explorerUrl = txHash ? `https://chiliscan.com/tx/${txHash}` : null

  // If transaction is complete and successful
  if (isSuccess && txHash) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none rounded-xl shadow-lg bg-gradient-to-b from-background to-background/95 backdrop-blur-sm text-card-foreground max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-t-xl border-b border-primary/10">
            <DialogHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 border border-primary/20 shadow-md shadow-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold text-foreground">Purchase Successful!</DialogTitle>
              <p className="text-muted-foreground mt-2">Your transaction has been confirmed</p>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center justify-center w-full bg-card/50 rounded-xl p-5 border border-border/50 shadow-sm">
                <div className="text-center px-4">
                  <div className="mb-2 flex items-center justify-center">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3HGJCRbhw7y7WB9MvgqiCHlI72OUmA.png"
                      alt="FintSport Token"
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-primary/10 shadow-sm"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">You purchased</p>
                  <p className="text-xl font-bold">{formatCurrency(Number(tokenAmount))}</p>
                  <p className="text-sm font-medium text-primary">FTK</p>
                </div>
              </div>

              <div className="w-full rounded-xl bg-card/50 p-5 text-sm space-y-3 border border-border/50 shadow-sm">
                <h3 className="font-medium text-center mb-3 text-base">Transaction Details</h3>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-medium">
                    {paymentMethod === "CHZ" ? `${paymentAmount} CHZ` : `$${paymentAmount}`}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Token Price</span>
                  <span className="font-medium">${tokenPrice}</span>
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

  // Confirmation dialog before purchase
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none rounded-xl shadow-lg bg-gradient-to-b from-background to-background/95 backdrop-blur-sm text-card-foreground">
        <DialogHeader className="p-6 border-b border-border/10">
          <DialogTitle className="text-xl font-bold">Confirm Purchase</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3HGJCRbhw7y7WB9MvgqiCHlI72OUmA.png"
              alt="FintSport Token"
              width={80}
              height={80}
              className="rounded-full"
            />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">You are about to purchase</p>
              <p className="text-2xl font-bold">{formatCurrency(Number(tokenAmount))} FTK</p>
              <p className="text-sm text-muted-foreground">
                for {paymentMethod === "CHZ" ? `${paymentAmount} CHZ` : `$${paymentAmount}`}
              </p>
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p>
                Please review the details carefully. Once confirmed, this transaction cannot be reversed. Make sure you
                have sufficient funds in your wallet.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Token Price</span>
              <span>${tokenPrice}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Amount to Pay</span>
              <span>{paymentMethod === "CHZ" ? `${paymentAmount} CHZ` : `$${paymentAmount} ${paymentMethod}`}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Network</span>
              <span>Chiliz Chain</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-1/2" disabled={isPurchasing}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full sm:w-1/2 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <>
                <span className="animate-pulse">Processing...</span>
              </>
            ) : (
              "Confirm Purchase"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
