"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Rocket, Users, Wallet } from "lucide-react"
import { PRESALE_ABI } from "@/lib/presale-abi"
import { PresaleTimer } from "@/components/presale-timer"
import { PresalePurchase } from "@/components/presale-purchase"
import { PresaleInfo } from "@/components/presale-info"

// Updated contract address
const PRESALE_CONTRACT_ADDRESS = "0x0c19d6F5d993031ABa0916894009E34e6964AA88"

interface UserInfo {
  totalContributed: string
  tokensPurchased: string
  chzContributed: string
  stablecoinContributed: string
}

export default function LaunchpadPageClient() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string>("")
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [presaleStats, setPresaleStats] = useState<any | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // Initialize Web3 connection
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        console.log("Initializing Web3 connection...")
        setIsLoading(true)

        if (typeof window !== "undefined" && window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum)
          setProvider(web3Provider)

          // Check if already connected
          const accounts = await web3Provider.listAccounts()
          if (accounts.length > 0) {
            const signer = await web3Provider.getSigner()
            const address = await signer.getAddress()
            setAccount(address)
            setIsConnected(true)

            console.log("Connected to account:", address)
            console.log("Initializing contract with address:", PRESALE_CONTRACT_ADDRESS)

            // Initialize contract
            const presaleContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer)
            setContract(presaleContract)

            // Load initial data
            await loadPresaleData(presaleContract, address)
          }
        }
      } catch (error) {
        console.error("Error initializing Web3:", error)
        setError("Failed to initialize Web3 connection")
      } finally {
        setIsLoading(false)
      }
    }

    initializeWeb3()
  }, [])

  const loadPresaleData = async (contractInstance: ethers.Contract, userAddress: string) => {
    try {
      console.log("Loading presale data...")

      // Load presale statistics
      const stats = await contractInstance.getPresaleStats()
      console.log("Presale stats:", stats)

      setPresaleStats({
        endTime: Number(stats[0]),
        totalTokens: ethers.formatEther(stats[1]),
        soldTokens: ethers.formatEther(stats[2]),
        remainingTokens: ethers.formatEther(stats[3]),
        tokenPrice: ethers.formatUnits(stats[4], 6), // Assuming USDC decimals
      })

      // Load user information
      const userStats = await contractInstance.getUserInfo(userAddress)
      console.log("User stats:", userStats)

      setUserInfo({
        totalContributed: ethers.formatUnits(userStats[0], 6),
        tokensPurchased: ethers.formatEther(userStats[1]),
        chzContributed: ethers.formatEther(userStats[2]),
        stablecoinContributed: ethers.formatUnits(userStats[3], 6),
      })
    } catch (error) {
      console.error("Error loading presale data:", error)
      setError("Failed to load presale data")
    }
  }

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("Please install MetaMask to continue")
        return
      }

      console.log("Connecting wallet...")
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      await web3Provider.send("eth_requestAccounts", [])

      const signer = await web3Provider.getSigner()
      const address = await signer.getAddress()

      setProvider(web3Provider)
      setAccount(address)
      setIsConnected(true)

      console.log("Wallet connected:", address)

      // Initialize contract
      const presaleContract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer)
      setContract(presaleContract)

      // Load data
      await loadPresaleData(presaleContract, address)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      setError("Failed to connect wallet")
    }
  }

  const refreshData = async () => {
    if (contract && account) {
      await loadPresaleData(contract, account)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Launchpad...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">FTK Token Presale</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join the future of decentralized finance with FTK tokens. Early supporters get exclusive benefits and pricing.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-center">{error}</p>
        </div>
      )}

      {!isConnected ? (
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </CardTitle>
            <CardDescription>Connect your wallet to participate in the FTK token presale</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectWallet} className="w-full" size="lg">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Presale Info */}
          <div className="space-y-6">
            {presaleStats && (
              <>
                <PresaleTimer endTime={presaleStats.endTime} />
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-destructive text-center">Presale Stats</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">End Time</Label>
                      <p className="text-lg font-semibold">{new Date(presaleStats.endTime * 1000).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Total Tokens</Label>
                      <p className="text-lg font-semibold">
                        {Number.parseFloat(presaleStats.totalTokens).toLocaleString()} FTK
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Sold Tokens</Label>
                      <p className="text-lg font-semibold">
                        {Number.parseFloat(presaleStats.soldTokens).toLocaleString()} FTK
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Remaining Tokens</Label>
                      <p className="text-lg font-semibold">
                        {Number.parseFloat(presaleStats.remainingTokens).toLocaleString()} FTK
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Token Price</Label>
                      <p className="text-lg font-semibold">${Number.parseFloat(presaleStats.tokenPrice).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <PresaleInfo />
              </>
            )}
          </div>

          {/* Right Column - Purchase Interface */}
          <div className="space-y-6">
            {contract && presaleStats && (
              <PresalePurchase
                contract={contract}
                presaleStats={presaleStats}
                userInfo={userInfo}
                onPurchaseComplete={refreshData}
              />
            )}

            {/* User Stats */}
            {userInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Total Contributed</Label>
                      <p className="text-lg font-semibold">${userInfo.totalContributed}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Tokens Purchased</Label>
                      <p className="text-lg font-semibold">
                        {Number.parseFloat(userInfo.tokensPurchased).toLocaleString()} FTK
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">CHZ Contributed</Label>
                      <p className="text-lg font-semibold">
                        {Number.parseFloat(userInfo.chzContributed).toFixed(4)} CHZ
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Stablecoin Contributed</Label>
                      <p className="text-lg font-semibold">${userInfo.stablecoinContributed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
