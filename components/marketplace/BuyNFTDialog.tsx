"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useTranslation } from "@/lib/i18n/context"
import { TransactionConfirmDialog } from "./TransactionConfirmDialog"
import { useMarketplace } from "@/hooks/useMarketplace"
import { formatEther } from "viem"

interface BuyNFTDialogProps {
  listingId: string
  nftName: string
  price: string
  currency: string
  onSuccess?: () => void
}

export function BuyNFTDialog({ listingId, nftName, price, currency, onSuccess }: BuyNFTDialogProps) {
  const { t } = useTranslation()
  const { buyFromListing } = useMarketplace()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string>()
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState(false)

  const handleBuy = async () => {
    try {
      setLoading(true)
      setError(undefined)

      console.log("[v0] Starting NFT purchase for listing:", listingId)

      const result = await buyFromListing({
        listingId: BigInt(listingId),
        buyFor: "0x0000000000000000000000000000000000000000", // Buy for self
        quantity: BigInt(1),
        currency: currency as `0x${string}`,
        expectedTotalPrice: BigInt(price),
      })

      if (result.hash) {
        setTxHash(result.hash)
        setSuccess(true)
        onSuccess?.()
        console.log("[v0] NFT purchase successful:", result.hash)
      }
    } catch (err: any) {
      console.error("[v0] NFT purchase error:", err)
      setError(err.message || t.marketplace.purchaseError)
    } finally {
      setLoading(false)
    }
  }

  const priceInEth = currency === "0x0000000000000000000000000000000000000000" ? formatEther(BigInt(price)) : price

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t.marketplace.buyNow}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.marketplace.confirmPurchase}</DialogTitle>
            <DialogDescription>{t.marketplace.confirmPurchaseDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{nftName}</h4>
              <p className="text-2xl font-bold text-green-600">
                {priceInEth} {currency === "0x0000000000000000000000000000000000000000" ? "CHZ" : "Tokens"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                {t.common.cancel}
              </Button>
              <Button
                onClick={() => {
                  setOpen(false)
                  setConfirmOpen(true)
                }}
                className="flex-1"
              >
                {t.marketplace.proceedToPurchase}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TransactionConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.marketplace.confirmPurchase}
        description={`${t.marketplace.purchaseConfirmDescription} ${nftName} ${t.common.for} ${priceInEth} CHZ`}
        onConfirm={handleBuy}
        loading={loading}
        txHash={txHash}
        error={error}
        success={success}
      />
    </>
  )
}
