"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TOKEN_LIST } from "@/lib/constants"
import { Copy, Trophy, Medal, Wallet, Repeat, ArrowLeftRight, Info, ShieldCheck, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n/context"

const dailyData = [
  { rank: 1, user: "0xAbC...123", volume: 50000, trades: 150, rewards: 1000 },
  { rank: 2, user: "0xDeF...456", volume: 45000, trades: 120, rewards: 750 },
  { rank: 3, user: "0xGHi...789", volume: 40000, trades: 100, rewards: 500 },
  { rank: 4, user: "0xJkL...012", volume: 35000, trades: 90, rewards: 250 },
  { rank: 5, user: "0xMnP...345", volume: 30000, trades: 80, rewards: 100 },
]

const weeklyData = [
  { rank: 1, user: "0xDeF...456", volume: 250000, trades: 600, rewards: 5000 },
  { rank: 2, user: "0xAbC...123", volume: 220000, trades: 550, rewards: 3500 },
  { rank: 3, user: "0xJkL...012", volume: 200000, trades: 500, rewards: 2000 },
  { rank: 4, user: "0xGHi...789", volume: 180000, trades: 450, rewards: 450 },
  { rank: 5, user: "0xMnP...345", volume: 150000, trades: 400, rewards: 500 },
]

const monthlyData = [
  { rank: 1, user: "0xDeF...456", volume: 1000000, trades: 2500, rewards: 20000 },
  { rank: 2, user: "0xAbC...123", volume: 900000, trades: 2200, rewards: 15000 },
  { rank: 3, user: "0xJkL...012", volume: 800000, trades: 2000, rewards: 10000 },
  { rank: 4, user: "0xGHi...789", volume: 700000, trades: 1800, rewards: 5000 },
  { rank: 5, user: "0xMnP...345", volume: 600000, trades: 1500, rewards: 2500 },
]

function LeaderboardTable({ data }: { data: typeof dailyData }) {
  const { t } = useTranslation()

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400"
    if (rank === 2) return "text-gray-400"
    if (rank === 3) return "text-yellow-600"
    return "text-muted-foreground"
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{t.competition.rank}</TableHead>
            <TableHead>{t.competition.user}</TableHead>
            <TableHead className="text-right">{t.competition.volume}</TableHead>
            <TableHead className="text-right">{t.competition.rewards}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.rank} className={row.user === "0xDeF...456" ? "bg-primary/10" : ""}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Medal className={`h-5 w-5 ${getMedalColor(row.rank)}`} />
                  <span>{row.rank}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">
                <div className="flex items-center gap-2">
                  {row.user}
                  {row.user === "0xDeF...456" && <Badge variant="secondary">{t.competition.you}</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(row.volume)}</TableCell>
              <TableCell className="text-right font-semibold text-green-500">{row.rewards.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default function CompetitionPageClient() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [isClaiming, setIsClaiming] = useState(false)
  const pepperToken = TOKEN_LIST.find((token) => token.symbol === "PEPPER")

  if (!pepperToken) {
    return <div>PEPPER token not found in configuration.</div>
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(pepperToken.address)
    toast({
      title: t.common.copied,
      description: "PEPPER contract address copied to clipboard.",
    })
  }

  const handleClaim = () => {
    setIsClaiming(true)
    toast({
      title: "Claiming Rewards...",
      description: "Please confirm the transaction in your wallet.",
    })
    setTimeout(() => {
      setIsClaiming(false)
      toast({
        title: "Success!",
        description: "Your rewards have been claimed.",
      })
    }, 3000)
  }

  return (
    <div className="space-y-8">
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6 text-center">
          <div className="inline-block bg-yellow-400/10 p-3 rounded-full">
            <Trophy className="h-10 w-10 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mt-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-yellow-400">
            {t.competition.title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{t.competition.subtitle}</p>
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
              <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="daily">{t.competition.daily}</TabsTrigger>
                  <TabsTrigger value="weekly">{t.competition.weekly}</TabsTrigger>
                  <TabsTrigger value="monthly">{t.competition.monthly}</TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="mt-4">
                  <LeaderboardTable data={dailyData} />
                </TabsContent>
                <TabsContent value="weekly" className="mt-4">
                  <LeaderboardTable data={weeklyData} />
                </TabsContent>
                <TabsContent value="monthly" className="mt-4">
                  <LeaderboardTable data={monthlyData} />
                </TabsContent>
              </Tabs>
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
              <div className="text-3xl font-bold">1,000 $PEPPER</div>
              <p className="text-sm text-muted-foreground">{t.competition.availableToClaim}</p>
              <Button className="w-full mt-4" onClick={handleClaim} disabled={isClaiming}>
                {isClaiming ? t.competition.claiming : t.competition.claimRewards}
              </Button>
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
                <p className="text-sm text-muted-foreground">{t.competition.tradeTokenDesc}</p>
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
              <li>{t.competition.rules.volumeBased}</li>
              <li>{t.competition.rules.rewardsDistributed}</li>
              <li>{t.competition.rules.manualClaim}</li>
            </ul>
            <Alert variant="destructive">
              <AlertTitle>{t.competition.fairPlayPolicy}</AlertTitle>
              <AlertDescription>{t.competition.fairPlayDesc}</AlertDescription>
            </Alert>
            <div className="flex items-center gap-2 pt-4 border-t mt-4">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-semibold">{t.competition.organizedBy}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
