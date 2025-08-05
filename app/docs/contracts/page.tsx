import type { Metadata } from "next"
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FACTORY_ADDRESS, ROUTER_ADDRESS, TOKEN_LIST } from "@/lib/constants"

export const metadata: Metadata = {
  title: "DiviSwap Docs | Smart Contracts",
  description: "Official DiviSwap smart contract addresses on the Chiliz Chain mainnet.",
}

const dswapToken = TOKEN_LIST.find((token) => token.symbol === "DSwap")

const contracts = [
  {
    name: "DiviSwap Factory",
    address: FACTORY_ADDRESS,
    description: "Deploys trading pairs and acts as a registry for all pools.",
  },
  {
    name: "DiviSwap Router",
    address: ROUTER_ADDRESS,
    description: "Handles all swaps and liquidity management operations.",
  },
  {
    name: "DiviSwap Token ($DSwap)",
    address: dswapToken?.address || "0x...", // Fallback in case DSwap token is not found in TOKEN_LIST
    description: "The official governance and utility token of the DiviSwap protocol.",
  },
  {
    name: "Wrapped CHZ (wCHZ)",
    address: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47",
    description: "The wrapped version of CHZ, used for interacting with DeFi protocols on Chiliz Chain.",
  },
]

export default function DocsContractsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Smart Contracts</h1>
        <p className="text-xl text-muted-foreground">Official DiviSwap contract addresses on Chiliz Chain.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {contracts.map((contract) => (
          <Card key={contract.name} className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {contract.name}
                <a
                  href={`https://chiliscan.com/address/${contract.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`View ${contract.name} on ChilizScan`}
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{contract.description}</p>
              <div className="flex items-center space-x-2">
                <code className="text-sm break-all p-2 bg-muted rounded-md">{contract.address}</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
