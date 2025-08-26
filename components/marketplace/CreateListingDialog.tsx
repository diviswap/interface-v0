"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMarketplace } from "@/hooks/useMarketplace"
import { useTranslation } from "@/lib/i18n/context"
import { Loader2, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CreateListingDialogProps {
  tokenContract?: string
  tokenId?: string
}

export function CreateListingDialog({ tokenContract = "", tokenId = "" }: CreateListingDialogProps) {
  const { t } = useTranslation()
  const { createListing, approveNFT, isLoading } = useMarketplace()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    assetContract: tokenContract,
    tokenId: tokenId,
    price: "",
    currency: "CHZ",
    duration: "7", // days
    reserved: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.assetContract || !formData.tokenId || !formData.price) {
      toast({
        title: t.marketplace.error,
        description: t.marketplace.fillAllFields,
        variant: "destructive",
      })
      return
    }

    try {
      toast({
        title: t.marketplace.approving,
        description: t.marketplace.approvingNFT,
      })

      // First approve NFT
      await approveNFT(formData.assetContract, formData.tokenId)

      toast({
        title: t.marketplace.creating,
        description: t.marketplace.creatingListing,
      })

      // Then create listing
      const endTime = Math.floor(Date.now() / 1000) + Number.parseInt(formData.duration) * 24 * 60 * 60

      await createListing({
        assetContract: formData.assetContract,
        tokenId: formData.tokenId,
        price: formData.price,
        currency: formData.currency === "CHZ" ? "0x0000000000000000000000000000000000000000" : formData.currency,
        endTime,
        reserved: formData.reserved,
      })

      toast({
        title: t.marketplace.success,
        description: t.marketplace.listingCreated,
      })

      setOpen(false)
      setFormData({
        assetContract: "",
        tokenId: "",
        price: "",
        currency: "CHZ",
        duration: "7",
        reserved: false,
      })
    } catch (error: any) {
      console.error("[v0] Marketplace error:", error)
      toast({
        title: t.marketplace.error,
        description: error.message || t.marketplace.failedToCreateListing,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t.marketplace.createListing || "Create Listing"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.marketplace.createListing || "Create Listing"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract">{t.marketplace.nftContract}</Label>
            <Input
              id="contract"
              placeholder="0x..."
              value={formData.assetContract}
              onChange={(e) => setFormData((prev) => ({ ...prev, assetContract: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenId">{t.marketplace.tokenId}</Label>
            <Input
              id="tokenId"
              placeholder="1"
              value={formData.tokenId}
              onChange={(e) => setFormData((prev) => ({ ...prev, tokenId: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">{t.marketplace.price}</Label>
            <div className="flex gap-2">
              <Input
                id="price"
                placeholder="0.1"
                type="number"
                step="0.001"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHZ">CHZ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">{t.marketplace.duration || "Duration"}</Label>
            <Select
              value={formData.duration}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 {t.marketplace.day || "day"}</SelectItem>
                <SelectItem value="3">3 {t.marketplace.days || "days"}</SelectItem>
                <SelectItem value="7">7 {t.marketplace.days || "days"}</SelectItem>
                <SelectItem value="14">14 {t.marketplace.days || "days"}</SelectItem>
                <SelectItem value="30">30 {t.marketplace.days || "days"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? t.marketplace.creating || "Creating..." : t.marketplace.createListing || "Create Listing"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
