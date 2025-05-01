"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

function StakePageContent() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const { toast } = useToast()

  // These values should come from a real contract in a full implementation
  const stakedBalance = 1000
  const rewardBalance = 50
  const apr = 12.5

  const handleStake = () => {
    // Here would go the real staking logic
    toast({
      title: "Stake successful",
      description: `You have staked ${stakeAmount} $DSwap`,
    })
    setStakeAmount("")
  }

  const handleUnstake = () => {
    // Here would go the real unstaking logic
    toast({
      title: "Unstake successful",
      description: `You have unstaked ${unstakeAmount} $DSwap`,
    })
    setUnstakeAmount("")
  }

  const handleClaim = () => {
    // Here would go the real claim logic
    toast({
      title: "Claim successful",
      description: `You have claimed ${rewardBalance} $DSwap`,
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Stake $DSwap</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stake $DSwap</CardTitle>
            <CardDescription>Stake your $DSwap tokens to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-700">
                  Amount to stake
                </label>
                <Input
                  id="stake-amount"
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleStake} className="w-full">
                Stake
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unstake $DSwap</CardTitle>
            <CardDescription>Withdraw your staked $DSwap tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="unstake-amount" className="block text-sm font-medium text-gray-700">
                  Amount to withdraw
                </label>
                <Input
                  id="unstake-amount"
                  type="number"
                  placeholder="0.00"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleUnstake} className="w-full">
                Unstake
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Staking Summary</CardTitle>
            <CardDescription>Your current staking position and rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-semibold">Staked Balance</h3>
                <p className="text-2xl font-bold">{formatCurrency(stakedBalance)} $DSwap</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pending Rewards</h3>
                <p className="text-2xl font-bold">{formatCurrency(rewardBalance)} $DSwap</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">APR</h3>
                <p className="text-2xl font-bold">{apr}%</p>
              </div>
            </div>
            <Button onClick={handleClaim} className="mt-4">
              Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StakePageContent
