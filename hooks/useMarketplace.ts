"use client"

import { useState, useCallback } from "react"
import { useAccount, useWalletClient, usePublicClient, useWriteContract, useReadContract } from "wagmi"
import { parseEther, formatEther, zeroAddress, type Address } from "viem"
import marketplaceABI from "@/lib/marketplace-abi.json"

const MARKETPLACE_ADDRESS = "0x8358cFA660e5638988f1b3403885A9B116cA87C1" as Address

export interface NFTListing {
  listingId: string
  tokenContract: string
  tokenId: string
  seller: string
  price: string
  currency: string
  startTime: number
  endTime: number
  reserved: boolean
  tokenType: "ERC721" | "ERC1155"
  quantity: string
  status: number
}

export interface AuctionListing {
  auctionId: string
  tokenContract: string
  tokenId: string
  seller: string
  minimumBidAmount: string
  buyoutBidAmount: string
  currency: string
  startTime: number
  endTime: number
  tokenType: "ERC721" | "ERC1155"
  quantity: string
  status: number
}

export interface OfferData {
  offerId: string
  tokenContract: string
  tokenId: string
  offeror: string
  quantityWanted: string
  currency: string
  pricePerToken: string
  expirationTimestamp: number
  status: number
}

export function useMarketplace() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const { data: totalListingsData } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceABI,
    functionName: "totalListings",
  })

  const { data: totalAuctionsData } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceABI,
    functionName: "totalAuctions",
  })

  const { data: totalOffersData } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceABI,
    functionName: "totalOffers",
  })

  const { data: listingsData, refetch: refetchListings } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceABI,
    functionName: "getAllListings",
    args: totalListingsData && totalListingsData > 0 ? [BigInt(0), BigInt(Number(totalListingsData) - 1)] : undefined,
    enabled: !!totalListingsData && totalListingsData > 0,
  })

  const { data: auctionsData, refetch: refetchAuctions } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceABI,
    functionName: "getAllAuctions",
    args: totalAuctionsData && totalAuctionsData > 0 ? [BigInt(0), BigInt(Number(totalAuctionsData) - 1)] : undefined,
    enabled: !!totalAuctionsData && totalAuctionsData > 0,
  })

  const { data: offersData, refetch: refetchOffers } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: marketplaceABI,
    functionName: "getAllOffers",
    args: totalOffersData && totalOffersData > 0 ? [BigInt(0), BigInt(Number(totalOffersData) - 1)] : undefined,
    enabled: !!totalOffersData && totalOffersData > 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createListing = useCallback(
    async (params: {
      assetContract: string
      tokenId: string
      price: string
      currency: string
      startTime?: number
      endTime?: number
      reserved?: boolean
    }) => {
      if (!isConnected || !walletClient) {
        throw new Error("Please connect your wallet first")
      }

      if (!params.assetContract || !params.tokenId || !params.price) {
        throw new Error("Asset contract, token ID, and price are required")
      }

      if (isNaN(Number(params.tokenId)) || params.tokenId === "") {
        throw new Error("Token ID must be a valid number")
      }

      if (isNaN(Number(params.price)) || Number(params.price) <= 0) {
        throw new Error("Price must be a valid positive number")
      }

      setIsLoading(true)
      setError(null)

      try {
        const currentTime = Math.floor(Date.now() / 1000)
        console.log("[v0] Current time:", currentTime)

        const startTime = params.startTime || currentTime
        console.log("[v0] Start time:", startTime)

        const endTime = params.endTime || currentTime + 86400 * 30 // 30 days default
        console.log("[v0] End time:", endTime)

        const timeDifference = endTime - currentTime
        console.log("[v0] Time difference:", timeDifference)

        // Validate all values before BigInt conversion
        if (isNaN(startTime) || isNaN(endTime)) {
          throw new Error("Invalid time values calculated")
        }

        const listingParams = {
          assetContract: params.assetContract as Address,
          tokenId: BigInt(params.tokenId),
          quantity: BigInt(1), // Always 1 for ERC721
          currency: (params.currency === "ETH" ? zeroAddress : params.currency) as Address,
          pricePerToken: parseEther(params.price),
          startTimestamp: BigInt(startTime),
          endTimestamp: BigInt(endTime),
          reserved: params.reserved || false,
        }

        console.log("[v0] Creating listing with correct params:", listingParams)

        const hash = await writeContractAsync({
          address: MARKETPLACE_ADDRESS,
          abi: marketplaceABI,
          functionName: "createListing",
          args: [listingParams],
        })

        console.log("[v0] Listing created successfully:", hash)
        return hash
      } catch (err: any) {
        console.error("[v0] Create listing error:", err)
        const errorMessage = err.message || "Failed to create listing"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, walletClient, writeContractAsync],
  )

  const buyFromListing = useCallback(
    async (listingId: string, price: string) => {
      if (!isConnected || !walletClient || !address) {
        throw new Error("Please connect your wallet first")
      }

      if (!listingId || !price) {
        throw new Error("Listing ID and price are required")
      }

      if (isNaN(Number(listingId)) || isNaN(Number(price))) {
        throw new Error("Listing ID and price must be valid numbers")
      }

      setIsLoading(true)
      setError(null)

      try {
        const hash = await writeContractAsync({
          address: MARKETPLACE_ADDRESS,
          abi: marketplaceABI,
          functionName: "buy",
          args: [
            BigInt(listingId),
            address,
            BigInt(1), // quantity
            zeroAddress, // currency (CHZ)
            parseEther(price),
          ],
          value: parseEther(price),
        })

        return hash
      } catch (err: any) {
        const errorMessage = err.message || "Failed to buy NFT"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, walletClient, address, writeContractAsync],
  )

  const createAuction = useCallback(
    async (params: {
      assetContract: string
      tokenId: string
      minimumBid: string
      buyoutPrice?: string
      currency: string
      startTime?: number
      endTime?: number
    }) => {
      if (!isConnected || !walletClient) {
        throw new Error("Please connect your wallet first")
      }

      setIsLoading(true)
      setError(null)

      try {
        const auctionParams = {
          assetContract: params.assetContract as Address,
          tokenId: BigInt(params.tokenId),
          startTime: BigInt(params.startTime || Math.floor(Date.now() / 1000)),
          secondsUntilEndTime: BigInt(params.endTime ? params.endTime - Math.floor(Date.now() / 1000) : 86400 * 7),
          quantityToList: BigInt(1),
          currencyToAccept: (params.currency === "ETH" ? zeroAddress : params.currency) as Address,
          reservePricePerToken: parseEther(params.minimumBid),
          buyoutPricePerToken: params.buyoutPrice
            ? parseEther(params.buyoutPrice)
            : BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
          listingType: 1, // Auction
        }

        const hash = await writeContractAsync({
          address: MARKETPLACE_ADDRESS,
          abi: marketplaceABI,
          functionName: "createListing",
          args: [auctionParams],
        })

        return hash
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create auction"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, walletClient, writeContractAsync],
  )

  const placeBid = useCallback(
    async (auctionId: string, bidAmount: string) => {
      if (!isConnected || !walletClient) {
        throw new Error("Please connect your wallet first")
      }

      setIsLoading(true)
      setError(null)

      try {
        const hash = await writeContractAsync({
          address: MARKETPLACE_ADDRESS,
          abi: marketplaceABI,
          functionName: "offer",
          args: [
            BigInt(auctionId),
            BigInt(1), // quantity
            zeroAddress, // currency (CHZ)
            parseEther(bidAmount),
            BigInt(Math.floor(Date.now() / 1000) + 86400), // expires in 24 hours
          ],
          value: parseEther(bidAmount),
        })

        return hash
      } catch (err: any) {
        const errorMessage = err.message || "Failed to place bid"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, walletClient, writeContractAsync],
  )

  const cancelListing = useCallback(
    async (listingId: string) => {
      if (!isConnected || !walletClient) {
        throw new Error("Please connect your wallet first")
      }

      setIsLoading(true)
      setError(null)

      try {
        const hash = await writeContractAsync({
          address: MARKETPLACE_ADDRESS,
          abi: marketplaceABI,
          functionName: "cancelDirectListing",
          args: [BigInt(listingId)],
        })

        return hash
      } catch (err: any) {
        const errorMessage = err.message || "Failed to cancel listing"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, walletClient, writeContractAsync],
  )

  const approveNFT = useCallback(
    async (tokenContract: string, tokenId: string) => {
      if (!isConnected || !walletClient || !address) {
        throw new Error("Please connect your wallet first")
      }

      if (!tokenContract || !tokenId) {
        throw new Error("Token contract and token ID are required")
      }

      if (isNaN(Number(tokenId))) {
        throw new Error("Token ID must be a valid number")
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log("[v0] Checking NFT ownership and approval:", { tokenContract, tokenId })

        const ownerResult = await publicClient?.readContract({
          address: tokenContract as Address,
          abi: [
            {
              name: "ownerOf",
              type: "function",
              stateMutability: "view",
              inputs: [{ name: "tokenId", type: "uint256" }],
              outputs: [{ name: "", type: "address" }],
            },
          ],
          functionName: "ownerOf",
          args: [BigInt(tokenId)],
        })

        if (ownerResult !== address) {
          throw new Error("You don't own this NFT")
        }

        const isApprovedForAll = await publicClient?.readContract({
          address: tokenContract as Address,
          abi: [
            {
              name: "isApprovedForAll",
              type: "function",
              stateMutability: "view",
              inputs: [
                { name: "owner", type: "address" },
                { name: "operator", type: "address" },
              ],
              outputs: [{ name: "", type: "bool" }],
            },
          ],
          functionName: "isApprovedForAll",
          args: [address, MARKETPLACE_ADDRESS],
        })

        if (isApprovedForAll) {
          console.log("[v0] Marketplace already approved for all NFTs")
          return "already-approved"
        }

        console.log("[v0] Setting approval for all NFTs to marketplace")

        const hash = await writeContractAsync({
          address: tokenContract as Address,
          abi: [
            {
              name: "setApprovalForAll",
              type: "function",
              stateMutability: "nonpayable",
              inputs: [
                { name: "operator", type: "address" },
                { name: "approved", type: "bool" },
              ],
              outputs: [],
            },
          ],
          functionName: "setApprovalForAll",
          args: [MARKETPLACE_ADDRESS, true],
        })

        console.log("[v0] NFT approval for all set successfully:", hash)
        return hash
      } catch (err: any) {
        console.error("[v0] Approve NFT error:", err)
        const errorMessage = err.message || "Failed to approve NFT"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, walletClient, address, publicClient, writeContractAsync],
  )

  const getListings = useCallback((): NFTListing[] => {
    console.log("[v0] Total listings count:", totalListingsData?.toString())
    console.log(
      "[v0] Listings query args:",
      totalListingsData && totalListingsData > 0 ? [0, Number(totalListingsData) - 1] : "disabled",
    )
    console.log("[v0] Raw listings data:", listingsData)
    console.log("[v0] Listings data type:", typeof listingsData)
    console.log("[v0] Is listings data array:", Array.isArray(listingsData))

    if (!listingsData) {
      console.log("[v0] No listings data received from contract")
      return []
    }

    if (!Array.isArray(listingsData)) {
      console.log("[v0] Listings data is not an array, received:", listingsData)
      return []
    }

    console.log("[v0] Processing", listingsData.length, "listings from contract")

    const mappedListings = (listingsData as any[])
      .map((listing: any, index: number) => {
        console.log(`[v0] Processing listing ${index}:`, listing)

        if (!listing) {
          console.log(`[v0] Listing ${index} is null/undefined`)
          return null
        }

        const mappedListing = {
          listingId: listing.listingId?.toString() || index.toString(),
          tokenContract: listing.assetContract || "",
          tokenId: listing.tokenId?.toString() || "0",
          seller: listing.listingCreator || "",
          price: listing.pricePerToken ? formatEther(listing.pricePerToken) : "0",
          currency: listing.currency === zeroAddress ? "CHZ" : listing.currency,
          startTime: Number(listing.startTimestamp || 0),
          endTime: Number(listing.endTimestamp || 0),
          reserved: listing.reserved || false,
          tokenType: listing.tokenType === 0 ? "ERC721" : "ERC1155",
          quantity: listing.quantity?.toString() || "1",
          status: Number(listing.status || 0),
        }

        console.log(`[v0] Mapped listing ${index}:`, mappedListing)
        return mappedListing
      })
      .filter((listing: any) => listing !== null) // Remove null entries
      .filter((listing: any) => listing.status === 1) // Only active listings

    console.log("[v0] Final filtered listings:", mappedListings)
    return mappedListings
  }, [listingsData, totalListingsData])

  const getAuctions = useCallback((): AuctionListing[] => {
    console.log("[v0] Total auctions count:", totalAuctionsData?.toString())
    console.log("[v0] Raw auctions data:", auctionsData)

    if (!auctionsData || !Array.isArray(auctionsData)) {
      console.log("[v0] No auctions data or not an array")
      return []
    }

    const mappedAuctions = (auctionsData as any[])
      .filter((auction: any) => auction && auction.status === 1) // Only active auctions
      .map((auction: any) => ({
        auctionId: auction.auctionId?.toString() || "0",
        tokenContract: auction.assetContract || "",
        tokenId: auction.tokenId?.toString() || "0",
        seller: auction.auctionCreator || "",
        minimumBidAmount: auction.minimumBidAmount ? formatEther(auction.minimumBidAmount) : "0",
        buyoutBidAmount: auction.buyoutBidAmount ? formatEther(auction.buyoutBidAmount) : "0",
        currency: auction.currency === zeroAddress ? "CHZ" : auction.currency,
        startTime: Number(auction.startTimestamp || 0),
        endTime: Number(auction.endTimestamp || 0),
        tokenType: auction.tokenType === 0 ? "ERC721" : "ERC1155",
        quantity: auction.quantity?.toString() || "1",
        status: Number(auction.status || 0),
      }))

    return mappedAuctions
  }, [auctionsData, totalAuctionsData])

  const getOffers = useCallback((): OfferData[] => {
    console.log("[v0] Total offers count:", totalOffersData?.toString())
    console.log("[v0] Raw offers data:", offersData)

    if (!offersData || !Array.isArray(offersData)) {
      console.log("[v0] No offers data or not an array")
      return []
    }

    const mappedOffers = (offersData as any[])
      .filter((offer: any) => offer && offer.status === 1) // Only active offers
      .map((offer: any) => ({
        offerId: offer.offerId?.toString() || "0",
        tokenContract: offer.assetContract || "",
        tokenId: offer.tokenId?.toString() || "0",
        offeror: offer.offeror || "",
        quantityWanted: offer.quantityWanted?.toString() || "1",
        currency: offer.currency === zeroAddress ? "CHZ" : offer.currency,
        pricePerToken: offer.pricePerToken ? formatEther(offer.pricePerToken) : "0",
        expirationTimestamp: Number(offer.expirationTimestamp || 0),
        status: Number(offer.status || 0),
      }))

    return mappedOffers
  }, [offersData, totalOffersData])

  const getUserNFTs = useCallback((): (NFTListing | AuctionListing)[] => {
    if (!address) return []

    const userListings = getListings().filter((listing) => listing.seller.toLowerCase() === address.toLowerCase())

    const userAuctions = getAuctions().filter((auction) => auction.seller.toLowerCase() === address.toLowerCase())

    return [...userListings, ...userAuctions]
  }, [address, getListings, getAuctions])

  const getCollections = useCallback(() => {
    const allItems = [...getListings(), ...getAuctions()]
    const collections = new Map()

    allItems.forEach((item) => {
      const contract = item.tokenContract
      if (!collections.has(contract)) {
        collections.set(contract, {
          contract,
          items: [],
          floorPrice: Number.POSITIVE_INFINITY,
          totalVolume: 0,
          owners: new Set(),
        })
      }

      const collection = collections.get(contract)
      collection.items.push(item)
      collection.owners.add(item.seller)

      const price = Number.parseFloat(item.price || "0")
      if (price > 0 && price < collection.floorPrice) {
        collection.floorPrice = price
      }
    })

    return Array.from(collections.values()).map((collection) => ({
      ...collection,
      itemCount: collection.items.length,
      ownerCount: collection.owners.size,
      floorPrice: collection.floorPrice === Number.POSITIVE_INFINITY ? 0 : collection.floorPrice,
      owners: undefined, // Remove Set from return
    }))
  }, [getListings, getAuctions])

  const getActivity = useCallback(() => {
    const listings = getListings().map((item) => ({
      ...item,
      type: "listing" as const,
      timestamp: item.startTime,
    }))

    const auctions = getAuctions().map((item) => ({
      ...item,
      type: "auction" as const,
      timestamp: item.startTime,
    }))

    const offers = getOffers().map((item) => ({
      ...item,
      type: "offer" as const,
      timestamp: item.expirationTimestamp,
    }))

    return [...listings, ...auctions, ...offers].sort((a, b) => b.timestamp - a.timestamp)
  }, [getListings, getAuctions, getOffers])

  const refetchAll = useCallback(() => {
    refetchListings()
    refetchAuctions()
    refetchOffers()
  }, [refetchListings, refetchAuctions, refetchOffers])

  return {
    // State
    isLoading,
    error,

    // Actions
    createListing,
    buyFromListing,
    createAuction,
    placeBid,
    cancelListing,
    approveNFT,

    // Data getters
    getListings,
    getAuctions,
    getOffers,
    getUserNFTs,
    getCollections,
    getActivity,

    // Refresh functions
    refetchListings,
    refetchAuctions,
    refetchOffers,
    refetchAll,

    // Utils
    marketplaceAddress: MARKETPLACE_ADDRESS,
  }
}
