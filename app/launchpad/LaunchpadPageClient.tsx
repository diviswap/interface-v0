"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useWeb3 } from "@/components/web3-provider"
import { formatCurrency } from "@/lib/utils"
import { PresaleInfo } from "@/components/presale-info"
import { PresalePurchase } from "@/components/presale-purchase"
import { PresaleStats } from "@/components/presale-stats"
import { PresaleTimer } from "@/components/presale-timer"
import { PresaleABI } from "@/lib/presale-abi"
import Image from "next/image"
import { AlertTriangle } from "lucide-react"

// Presale contract address on Chiliz Chain
const PRESALE_CONTRACT_ADDRESS = "0x6F9e228813380e00a9A5CE49207B03bD283Cd80E" // FintSport Token Presale Contract
const USDC_ADDRESS = "0xa37936f56249965d407e39347528a1a91eb1cbef"
const USDT_ADDRESS = "0x14a634bf2d5be1c6ad7790d958e748174d8a2d43"
const WCHZ_ADDRESS = "0x677f7e16c7dd57be1d4c8ad1244883214953dc47"
const KAYEN_ROUTER_ADDRESS = "0x1918EbB39492C8b98865c5E53219c3f1AE79e76F"
const TREASURY_ADDRESS = "0x721c7d63159Fcd18F283F0Dd8aDC30C02E4e087a"

function LaunchpadPage() {
  const { provider, signer, account, isConnected } = useWeb3()
  const { toast } = useToast()
  const [presaleContract, setPresaleContract] = useState<ethers.Contract | null>(null)
  const [presaleStats, setPresaleStats] = useState({
    endTime: 0,
    totalTokens: 0,
    soldTokens: 0,
    remainingTokens: 0,
    tokenPrice: 0,
  })
  const [userInfo, setUserInfo] = useState({
    tokenBalance: 0,
    usdcFromChzSwap: 0,
    chzPaid: 0,
    stableCoinDirectContribution: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isPresaleEnded, setIsPresaleEnded] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  useEffect(() => {
    const initContract = async () => {
      if (provider) {
        try {
          const contract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PresaleABI, provider)
          setPresaleContract(contract)

          // Get presale stats
          const stats = await contract.getPresaleStats()
          setPresaleStats({
            endTime: Number(stats.endTime),
            totalTokens: Number(ethers.formatUnits(stats.totalTokens, 18)),
            soldTokens: Number(ethers.formatUnits(stats.soldTokens, 18)),
            remainingTokens: Number(ethers.formatUnits(stats.remainingTokens, 18)),
            tokenPrice: Number(ethers.formatUnits(stats.tokenPrice, 6)),
          })

          // Check if presale has ended
          const ended = await contract.isPresaleEnded()
          setIsPresaleEnded(ended)

          setIsLoading(false)
        } catch (error) {
          console.error("Error initializing presale contract:", error)
          toast({
            title: "Error",
            description: "Failed to load presale information. Please try again later.",
            variant: "destructive",
          })
          setIsLoading(false)
        }
      }
    }

    initContract()
  }, [provider, toast])

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (presaleContract && account) {
        try {
          const info = await presaleContract.getUserInfo(account)
          setUserInfo({
            tokenBalance: Number(ethers.formatUnits(info[0], 18)),
            usdcFromChzSwap: Number(ethers.formatUnits(info[1], 6)),
            chzPaid: Number(ethers.formatUnits(info[2], 18)),
            stableCoinDirectContribution: Number(ethers.formatUnits(info[3], 6)),
          })
        } catch (error) {
          console.error("Error fetching user info:", error)
        }
      }
    }

    fetchUserInfo()
  }, [presaleContract, account])

  // Calculate progress percentage
  const progressPercentage =
    presaleStats.totalTokens > 0 ? (presaleStats.soldTokens / presaleStats.totalTokens) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col items-center mb-12">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/5 shadow-2xl blur-xl"></div>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3HGJCRbhw7y7WB9MvgqiCHlI72OUmA.png"
              alt="FintSport Token"
              width={340}
              height={340}
              className="relative z-10"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold">FintSport Token (FTK)</h1>
            <p className="text-muted-foreground">Presale ends on July 30, 2025</p>
          </div>
        </div>

        <div className="w-full max-w-3xl">
          <div className="flex justify-between mb-2 text-sm">
            <span>Progress: {formatCurrency(progressPercentage, 2)}%</span>
            <span>
              {formatCurrency(presaleStats.soldTokens)} / {formatCurrency(presaleStats.totalTokens)} FTK
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card/50 backdrop-blur-sm border border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${presaleStats.tokenPrice}</div>
            <p className="text-sm text-muted-foreground">per FTK token</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Time Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <PresaleTimer endTime={presaleStats.endTime} isEnded={isPresaleEnded} />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">{formatCurrency(userInfo.tokenBalance)} FTK</div>
                <p className="text-sm text-muted-foreground">
                  {userInfo.chzPaid > 0 && `${formatCurrency(userInfo.chzPaid)} CHZ + `}
                  {userInfo.stableCoinDirectContribution > 0 &&
                    `$${formatCurrency(userInfo.stableCoinDirectContribution)}`}
                  {userInfo.chzPaid === 0 && userInfo.stableCoinDirectContribution === 0 && "No contribution yet"}
                </p>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground mb-2">Connect your wallet to view your contribution</p>
                <Button size="sm" onClick={() => {}}>
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10 mb-8">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                value="info"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Information
              </TabsTrigger>
              <TabsTrigger
                value="purchase"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Purchase Tokens
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Statistics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <PresaleInfo />
            </TabsContent>

            <TabsContent value="purchase">
              <PresalePurchase
                presaleContract={presaleContract}
                signer={signer}
                isConnected={isConnected}
                isPresaleEnded={isPresaleEnded}
                tokenPrice={presaleStats.tokenPrice}
                onPurchaseComplete={async () => {
                  // Actualizar estadísticas de la preventa
                  if (presaleContract) {
                    try {
                      // Obtener estadísticas actualizadas
                      const stats = await presaleContract.getPresaleStats()
                      setPresaleStats({
                        endTime: Number(stats.endTime),
                        totalTokens: Number(ethers.formatUnits(stats.totalTokens, 18)),
                        soldTokens: Number(ethers.formatUnits(stats.soldTokens, 18)),
                        remainingTokens: Number(ethers.formatUnits(stats.remainingTokens, 18)),
                        tokenPrice: Number(ethers.formatUnits(stats.tokenPrice, 6)),
                      })

                      // Actualizar información del usuario si está conectado
                      if (account) {
                        const info = await presaleContract.getUserInfo(account)
                        setUserInfo({
                          tokenBalance: Number(ethers.formatUnits(info[0], 18)),
                          usdcFromChzSwap: Number(ethers.formatUnits(info[1], 6)),
                          chzPaid: Number(ethers.formatUnits(info[2], 18)),
                          stableCoinDirectContribution: Number(ethers.formatUnits(info[3], 6)),
                        })
                      }

                      toast({
                        title: "Statistics Updated",
                        description: "Presale statistics have been updated with your contribution.",
                      })
                    } catch (error) {
                      console.error("Error updating presale statistics:", error)
                      toast({
                        title: "Warning",
                        description: "Could not update statistics. Please refresh the page.",
                        variant: "warning",
                      })
                    }
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="stats">
              <PresaleStats presaleStats={presaleStats} userInfo={userInfo} isConnected={isConnected} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="bg-secondary/30 p-4 rounded-lg border border-primary/20 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1 text-primary">Disclaimer</p>
            <p className="text-muted-foreground">
              Participating in token presales involves risk. Only invest what you can afford to lose. DiviSwap does not
              guarantee the success of this project or the value of FTK tokens. Please do your own research before
              participating.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LaunchpadPage
