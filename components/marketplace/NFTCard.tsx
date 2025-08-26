"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMarketplace, type NFTListing } from "@/hooks/useMarketplace"
import { useTranslation } from "@/lib/i18n/context"
import { useAccount } from "wagmi"
import { Loader2, ShoppingCart, Clock, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface NFTCardProps {
  listing: NFTListing
  onPurchaseSuccess?: () => void
}

export function NFTCard({ listing, onPurchaseSuccess }: NFTCardProps) {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { buyFromListing, isLoading } = useMarketplace()
  const [purchasing, setPurchasing] = useState(false)

  const handlePurchase = async () => {
    if (!address) {
      toast({
        title: t.marketplace.error,
        description: t.marketplace.connectWallet,
        variant: "destructive",
      })
      return
    }

    setPurchasing(true)
    try {
      await buyFromListing(listing.listingId, listing.price)

      toast({
        title: t.marketplace.success,
        description: t.marketplace.purchaseSuccessful,
      })

      onPurchaseSuccess?.()
    } catch (error: any) {
      toast({
        title: t.marketplace.error,
        description: error.message || t.marketplace.purchaseFailed,
        variant: "destructive",
      })
    } finally {
      setPurchasing(false)
    }
  }

  const isOwner = address?.toLowerCase() === listing.seller.toLowerCase()
  const isExpired = listing.endTime * 1000 < Date.now()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
        <img
          src={`/nft-placeholder.png?height=300&width=300&text=NFT #${listing.tokenId}`}
          alt={`NFT #${listing.tokenId}`}
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold truncate">NFT #{listing.tokenId}</h3>
          {listing.reserved && <Badge variant="secondary">{t.marketplace.reserved}</Badge>}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="truncate">{listing.seller}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {isExpired
                ? t.marketplace.expired
                : `${t.marketplace.endsIn} ${Math.ceil((listing.endTime * 1000 - Date.now()) / (1000 * 60 * 60 * 24))} ${t.marketplace.days}`}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t.marketplace.price}</span>
            <span className="font-bold text-lg">{listing.price} CHZ</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isOwner ? (
          <Button variant="outline" className="w-full bg-transparent" disabled>
            {t.marketplace.yourListing}
          </Button>
        ) : isExpired ? (
          <Button variant="outline" className="w-full bg-transparent" disabled>
            {t.marketplace.expired}
          </Button>
        ) : (
          <Button onClick={handlePurchase} className="w-full gap-2" disabled={purchasing || isLoading}>
            {purchasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {purchasing ? t.marketplace.purchasing : t.marketplace.buyNow}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
