"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TOKEN_LIST } from "@/lib/constants"
import {
  getCompetitionStats,
  getLeaderboard,
  getUserCompetitionData,
  getClaimableDays,
  claimRewards,
  getPendingRewards,
  type LeaderboardEntry,
} from "@/lib/competition"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import {
  Copy,
  Trophy,
  Medal,
  Wallet,
  Repeat,
  ArrowLeftRight,
  Info,
  ShieldCheck,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n/context"

interface CompetitionStats {
  currentDay: number
  totalVolume: string
  participantCount: number
  dailyRewardPool: string
  timeRemaining: number
  leaderboard: LeaderboardEntry[]
}

interface UserData {
  volume: string
  estimatedReward: string
  hasClaimed: boolean
}

function LeaderboardTable({ data, userAddress }: { data: LeaderboardEntry[]; userAddress?: string }) {
  const { t } = useTranslation()

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400"
    if (rank === 2) return "text-gray-400"
    if (rank === 3) return "text-yellow-600"
    return "text-muted-foreground"
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{t.competition.rank}</TableHead>
            <TableHead>{t.competition.user}</TableHead>
            <TableHead className="text-right">{t.competition.volume}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={row.user}
              className={row.user.toLowerCase() === userAddress?.toLowerCase() ? "bg-primary/10" : ""}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Medal className={`h-5 w-5 ${getMedalColor(index + 1)}`} />
                  <span>{index + 1}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  {formatAddress(row.user)}
                  {row.user.toLowerCase() === userAddress?.toLowerCase() && (
                    <Badge variant="secondary">{t.competition.you}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">{Number.parseFloat(row.volume).toLocaleString()} PEPPER</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TimeRemaining({ seconds }: { seconds: number }) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const secs = timeLeft % 60

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4" />
      <span>
        {hours}h {minutes}m {secs}s remaining
      </span>
    </div>
  )
}

export default function CompetitionPageClient() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [competitionStats, setCompetitionStats] = useState<CompetitionStats | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [claimableDays, setClaimableDays] = useState<number[]>([])
  const [totalClaimableRewards, setTotalClaimableRewards] = useState("0")
  const [isClaiming, setIsClaiming] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<{ [key: string]: LeaderboardEntry[] }>({})
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [maxDay, setMaxDay] = useState<number>(1)
  const [showClaimDialog, setShowClaimDialog] = useState(false)

  const pepperToken = TOKEN_LIST.find((token) => token.symbol === "PEPPER")

  useEffect(() => {
    const loadCompetitionData = async () => {
      if (!publicClient) return

      try {
        if (competitionStats?.currentDay === 0) {
          setIsInitialLoading(true)
        } else {
          setIsRefreshing(true)
        }

        const stats = await getCompetitionStats(publicClient)
        setCompetitionStats(stats)
        setMaxDay(stats.currentDay)
        setSelectedDay(stats.currentDay)

        const currentLeaderboard = await getLeaderboard(stats.currentDay, publicClient)
        setLeaderboardData((prev) => ({ ...prev, daily: currentLeaderboard }))

        if (address) {
          const userCompData = await getUserCompetitionData(stats.currentDay, address, publicClient)
          setUserData(userCompData)

          const claimable = await getClaimableDays(address, publicClient)
          setClaimableDays(claimable)

          const pendingRewards = await getPendingRewards(address, publicClient)
          setTotalClaimableRewards(pendingRewards)
        }
      } catch (error) {
        console.error("Error loading competition data:", error)
        toast({
          title: "Error",
          description: t.competition.errors.loadFailed,
          variant: "destructive",
        })
      } finally {
        setIsInitialLoading(false)
        setIsRefreshing(false)
      }
    }

    loadCompetitionData()

    const interval = setInterval(loadCompetitionData, 30000)
    return () => clearInterval(interval)
  }, [publicClient, address, toast])

  useEffect(() => {
    const loadDayLeaderboard = async () => {
      if (!publicClient) return

      try {
        const dayLeaderboard = await getLeaderboard(selectedDay, publicClient)
        setLeaderboardData((prev) => ({ ...prev, [`daily-${selectedDay}`]: dayLeaderboard }))
      } catch (error) {
        console.error("Error loading day leaderboard:", error)
      }
    }

    loadDayLeaderboard()
  }, [selectedDay, publicClient])

  const goToPreviousDay = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1)
    }
  }

  const goToNextDay = () => {
    if (selectedDay < maxDay) {
      setSelectedDay(selectedDay + 1)
    }
  }

  const handleClaimClick = () => {
    setShowClaimDialog(true)
  }

  const handleConfirmClaim = async () => {
    if (!walletClient) return

    try {
      setIsClaiming(true)
      setShowClaimDialog(false)
      toast({
        title: t.competition.claiming,
        description: t.competition.messages.claimingRewards,
      })

      const tx = await claimRewards([], walletClient)
      await tx.wait()

      toast({
        title: "Success!",
        description: t.competition.messages.claimSuccess,
      })

      setClaimableDays([])
      setTotalClaimableRewards("0")

      if (publicClient && address) {
        const stats = await getCompetitionStats(publicClient)
        setCompetitionStats(stats)

        const userCompData = await getUserCompetitionData(stats.currentDay, address, publicClient)
        setUserData(userCompData)
      }
    } catch (error) {
      console.error("Error claiming rewards:", error)
      toast({
        title: "Error",
        description: t.competition.errors.claimFailed,
        variant: "destructive",
      })
    } finally {
      setIsClaiming(false)
    }
  }

  if (!pepperToken) {
    return <div>PEPPER token not found in configuration.</div>
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(pepperToken.address)
    toast({
      title: t.common.copied,
      description: t.competition.messages.addressCopied,
    })
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-muted-foreground">{t.competition.messages.loadingData}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-background border rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="text-sm text-muted-foreground">Refreshing...</span>
          </div>
        </div>
      )}

      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6 text-center">
          <div className="inline-block bg-yellow-400/10 p-3 rounded-full">
            <Trophy className="h-10 w-10 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mt-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-yellow-400">
            {t.competition.title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{t.competition.subtitle}</p>

          {competitionStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 max-w-4xl mx-auto">
              <div className="bg-card/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">Day {competitionStats.currentDay}</div>
                <div className="text-sm text-muted-foreground">{t.competition.currentCompetition}</div>
              </div>
              <div className="bg-card/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">
                  {Number.parseFloat(competitionStats.totalVolume).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">{t.competition.totalVolume}</div>
              </div>
              <div className="bg-card/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{competitionStats.participantCount}</div>
                <div className="text-sm text-muted-foreground">{t.competition.activeTraders}</div>
              </div>
              <div className="bg-card/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">
                  {Number.parseFloat(competitionStats.dailyRewardPool).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">{t.competition.dailyRewards}</div>
              </div>
            </div>
          )}

          {competitionStats && competitionStats.timeRemaining > 0 && (
            <div className="mt-4">
              <TimeRemaining seconds={competitionStats.timeRemaining} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.competition.leaderboards}</CardTitle>
              <CardDescription>{t.competition.rankingDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" onClick={goToPreviousDay} disabled={selectedDay <= 1}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t.competition.previousDay}
                </Button>
                <div className="text-center">
                  <div className="text-lg font-semibold">Day {selectedDay}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedDay === maxDay ? "Current Day" : "Historical"}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={goToNextDay} disabled={selectedDay >= maxDay}>
                  Next Day
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <LeaderboardTable
                data={leaderboardData[`daily-${selectedDay}`] || leaderboardData.daily || []}
                userAddress={address}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image src={pepperToken.logoURI || "/placeholder.svg"} alt="PEPPER logo" width={28} height={28} />
                <span>{t.competition.competitionToken}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">$PEPPER</p>
                <p className="text-xs text-muted-foreground">{t.competition.contractAddress}:</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono break-all">{pepperToken.address}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={copyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button asChild className="w-full mt-4">
                <Link href={`/swap?outputCurrency=${pepperToken.address}`}>{t.competition.tradePepper}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.competition.yourRewards}</CardTitle>
              <CardDescription>{t.competition.availableToClaim}</CardDescription>
            </CardHeader>
            <CardContent>
              {address ? (
                <>
                  <div className="text-3xl font-bold">
                    {Number.parseFloat(totalClaimableRewards).toLocaleString()} $PEPPER
                  </div>
                  <p className="text-sm text-muted-foreground">Available rewards from trading</p>
                  <Button className="w-full mt-4" onClick={handleClaimClick} disabled={isClaiming}>
                    {isClaiming ? t.competition.claiming : t.competition.claimRewards}
                  </Button>

                  {userData && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t.competition.todaysVolume}:</span>
                        <span className="font-medium">
                          {Number.parseFloat(userData.volume).toLocaleString()} PEPPER
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t.competition.estimatedReward}:</span>
                        <span className="font-medium text-green-500">
                          {Number.parseFloat(userData.estimatedReward).toLocaleString()} PEPPER
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">{t.competition.connectWalletToViewRewards}</p>
                  <Button className="w-full" disabled>
                    Connect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" /> {t.competition.howToParticipate}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{t.competition.connectYourWallet}</h4>
                <p className="text-sm text-muted-foreground">{t.competition.connectWalletDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Repeat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{t.competition.getTokens}</h4>
                <p className="text-sm text-muted-foreground">{t.competition.getTokensDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{t.competition.tradeToken}</h4>
                <p className="text-sm text-muted-foreground">{t.competition.buyPepperDescription}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> {t.competition.termsConditions}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>{t.competition.termsConditionsList.rewardsDistribution}</li>
              <li>{t.competition.termsConditionsList.onlySwapsCount}</li>
              <li>{t.competition.termsConditionsList.manualClaim}</li>
              <li>{t.competition.termsConditionsList.competitionRuns}</li>
            </ul>
            <Alert variant="destructive">
              <AlertTitle>{t.competition.fairPlayPolicy}</AlertTitle>
              <AlertDescription>{t.competition.fairPlayDescription}</AlertDescription>
            </Alert>
            <div className="flex items-center gap-2 pt-4 border-t mt-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-semibold">{t.competition.organizedBy}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              {t.competition.dialog.claimTitle}
            </DialogTitle>
            <DialogDescription>{t.competition.dialog.claimDescription}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.competition.totalRewards}:</span>
                <span className="text-lg font-bold text-green-600">
                  {Number.parseFloat(totalClaimableRewards).toLocaleString()} PEPPER
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t.competition.claimableDays}:</span>
                <span>{claimableDays.length} days</span>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">{t.competition.dialog.claimAlertDescription}</AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowClaimDialog(false)}>
              {t.competition.dialog.cancel}
            </Button>
            <Button onClick={handleConfirmClaim} disabled={isClaiming}>
              {isClaiming ? t.competition.claiming : t.competition.dialog.confirmClaim}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
