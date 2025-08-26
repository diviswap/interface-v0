"use client"

import { useTranslation } from "@/lib/i18n/context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Filter, Grid, List, Activity, Users, TrendingUp } from "lucide-react"
import { useState } from "react"
import { useAccount } from "wagmi"
import { useMarketplace } from "@/hooks/useMarketplace"
import { CreateListingDialog } from "@/components/marketplace/CreateListingDialog"
import { NFTCard } from "@/components/marketplace/NFTCard"

export default function MarketplacePage() {
  const { t } = useTranslation()
  const { address } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("explore")

  const { listings, auctions, offers, collections, activity, userNFTs, isLoading, refetchAll } = useMarketplace()

  console.log("[v0] Marketplace page - listings:", listings)
  console.log("[v0] Marketplace page - listings length:", listings?.length)

  const handleRefresh = () => {
    console.log("[v0] Refreshing marketplace data...")
    refetchAll()
  }

  const filteredListings = (listings || []).filter(
    (listing) =>
      listing.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.tokenContract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCollections = (collections || []).filter((collection) =>
    collection.contract.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredActivity = (activity || []).filter(
    (item) =>
      item.tokenId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tokenContract?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const userListings = (listings || []).filter(
    (listing) => address && listing.seller.toLowerCase() === address.toLowerCase(),
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{t.marketplace.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t.marketplace.subtitle}</p>
          <div className="mt-6 flex gap-4 justify-center">
            <CreateListingDialog />
            <Button onClick={handleRefresh} variant="outline">
              {t.marketplace.refresh || "Refresh"}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t.marketplace.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t.marketplace.filters}
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="explore">{t.marketplace.explore}</TabsTrigger>
            <TabsTrigger value="collections">{t.marketplace.collections}</TabsTrigger>
            <TabsTrigger value="activity">{t.marketplace.activity}</TabsTrigger>
            <TabsTrigger value="my-nfts">{t.marketplace.myNfts}</TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t.marketplace.loadingNfts}</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t.marketplace.noItemsFound}</p>
                <p className="text-sm text-muted-foreground mt-2">Total listings available: {listings?.length || 0}</p>
                <Button onClick={handleRefresh} className="mt-4">
                  {t.marketplace.refresh || "Refresh Data"}
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
              >
                {filteredListings.map((listing) => (
                  <NFTCard key={listing.listingId} listing={listing} onPurchaseSuccess={handleRefresh} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            {filteredCollections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t.marketplace.noCollectionsFound || "No collections found"}</p>
                <Button onClick={handleRefresh} className="mt-4">
                  {t.marketplace.refresh || "Refresh Data"}
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredCollections.map((collection) => (
                  <Card key={collection.contract} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {collection.contract.slice(2, 4).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">Collection</h3>
                          <p className="text-sm text-muted-foreground">
                            {collection.contract.slice(0, 6)}...{collection.contract.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold">{collection.itemCount}</p>
                          <p className="text-xs text-muted-foreground">Items</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{collection.ownerCount}</p>
                          <p className="text-xs text-muted-foreground">Owners</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold">{collection.floorPrice.toFixed(2)} CHZ</p>
                          <p className="text-xs text-muted-foreground">Floor</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            {filteredActivity.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t.marketplace.noActivityFound || "No activity found"}</p>
                <Button onClick={handleRefresh} className="mt-4">
                  {t.marketplace.refresh || "Refresh Data"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivity.slice(0, 20).map((item, index) => (
                  <Card key={`${item.type}-${item.listingId || item.auctionId || item.offerId}-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                            {item.type === "listing" && <TrendingUp className="h-5 w-5 text-white" />}
                            {item.type === "auction" && <Activity className="h-5 w-5 text-white" />}
                            {item.type === "offer" && <Users className="h-5 w-5 text-white" />}
                          </div>
                          <div>
                            <p className="font-medium">
                              {item.type === "listing" && "New Listing"}
                              {item.type === "auction" && "New Auction"}
                              {item.type === "offer" && "New Offer"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Token #{item.tokenId} • {item.tokenContract?.slice(0, 6)}...
                              {item.tokenContract?.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{item.price || item.minimumBidAmount || item.pricePerToken} CHZ</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.timestamp * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-nfts" className="mt-6">
            {!address ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t.marketplace.connectWalletToView}</p>
              </div>
            ) : userListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t.marketplace.noUserNfts || "You don't have any NFTs listed"}</p>
                <Button onClick={handleRefresh} className="mt-4">
                  {t.marketplace.refresh || "Refresh Data"}
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
              >
                {userListings.map((nft) => (
                  <NFTCard key={`${nft.listingId}-${nft.tokenId}`} listing={nft} onPurchaseSuccess={handleRefresh} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold">{listings?.length || 0}</p>
              <p className="text-sm text-muted-foreground">{t.marketplace.items}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold">{listings ? new Set(listings.map((l) => l.seller)).size : 0}</p>
              <p className="text-sm text-muted-foreground">{t.marketplace.owners}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold">
                {listings && listings.length > 0
                  ? Math.min(...listings.map((l) => Number.parseFloat(l.price))).toFixed(2)
                  : "0.00"}{" "}
                CHZ
              </p>
              <p className="text-sm text-muted-foreground">{t.marketplace.floorPrice}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold">
                {listings ? listings.reduce((sum, l) => sum + Number.parseFloat(l.price), 0).toFixed(2) : "0.00"} CHZ
              </p>
              <p className="text-sm text-muted-foreground">{t.marketplace.volume}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
