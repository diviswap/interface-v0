"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { TokenSelector } from "@/components/token-selector"
import { ArrowRight } from "lucide-react"

const NETWORKS = [
  { id: "chiliz", name: "Chiliz Chain" },
  { id: "bsc", name: "BNB Smart Chain" },
  { id: "ethereum", name: "Ethereum" },
]

function BridgePageComponent() {
  const [fromNetwork, setFromNetwork] = useState(NETWORKS[0])
  const [toNetwork, setToNetwork] = useState(NETWORKS[1])
  const [fromToken, setFromToken] = useState(null)
  const [amount, setAmount] = useState("")
  const { toast } = useToast()

  const handleBridge = async () => {
    // Here you would implement the actual bridging logic
    // This is just a placeholder to show how it might work
    toast({
      title: "Bridge initiated",
      description: `Bridging ${amount} ${fromToken?.symbol} from ${fromNetwork.name} to ${toNetwork.name}`,
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Bridge</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bridge Tokens</CardTitle>
          <CardDescription>Transfer tokens between Chiliz Chain, BNB Smart Chain, and Ethereum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">From</label>
              <Select
                value={fromNetwork.id}
                onValueChange={(value) => setFromNetwork(NETWORKS.find((n) => n.id === value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      {network.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="w-6 h-6" />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">To</label>
              <Select
                value={toNetwork.id}
                onValueChange={(value) => setToNetwork(NETWORKS.find((n) => n.id === value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      {network.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Token</label>
            <TokenSelector selectedToken={fromToken} onSelectToken={setFromToken} />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button onClick={handleBridge} className="w-full">
            Bridge Tokens
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default BridgePageComponent
