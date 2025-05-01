"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface PresaleStatsProps {
  presaleStats: {
    endTime: number
    totalTokens: number
    soldTokens: number
    remainingTokens: number
    tokenPrice: number
  }
  userInfo: {
    tokenBalance: number
    usdcFromChzSwap: number
    chzPaid: number
    stableCoinDirectContribution: number
  }
  isConnected: boolean
}

export function PresaleStats({ presaleStats, userInfo, isConnected }: PresaleStatsProps) {
  // Calculate total raised in USD
  const totalRaised = presaleStats.soldTokens * presaleStats.tokenPrice

  // Data for token distribution chart
  const tokenDistributionData = [
    { name: "Sold", value: presaleStats.soldTokens },
    { name: "Remaining", value: presaleStats.remainingTokens },
  ]

  // Colors for the chart
  const COLORS = ["#ff4d00", "#333333"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Presale Statistics</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Tokens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{formatCurrency(presaleStats.totalTokens)} FTK</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Tokens Sold</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{formatCurrency(presaleStats.soldTokens)} FTK</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Funds Raised</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">${formatCurrency(totalRaised)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Token Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">${presaleStats.tokenPrice}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Token Distribution</h2>
          <div className="bg-card/50 p-4 rounded-lg h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {tokenDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${formatCurrency(Number(value))} FTK`, "Amount"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isConnected && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Participation</h2>
          <div className="bg-card/50 p-6 rounded-lg">
            {userInfo.tokenBalance > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens Purchased</p>
                    <p className="text-xl font-bold">{formatCurrency(userInfo.tokenBalance)} FTK</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CHZ Contributed</p>
                    <p className="text-xl font-bold">{formatCurrency(userInfo.chzPaid)} CHZ</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stablecoin Contributed</p>
                    <p className="text-xl font-bold">${formatCurrency(userInfo.stableCoinDirectContribution)}</p>
                  </div>
                </div>

                <div className="bg-secondary/30 p-4 rounded-lg">
                  <p className="font-medium mb-1">Estimated Bonus Tokens</p>
                  <p className="text-sm text-muted-foreground">
                    Based on your contribution, you may be eligible for bonus tokens after the presale ends. The exact
                    amount will depend on which tier your purchase falls into.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-lg mb-4">You haven't participated in the presale yet</p>
                <Button onClick={() => document.querySelector('[data-value="purchase"]')?.click()}>
                  Purchase Tokens Now
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
