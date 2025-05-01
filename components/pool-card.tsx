import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface PoolCardProps {
  pool: any
}

export function PoolCard({ pool }: PoolCardProps) {
  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <div className="flex -space-x-2 mr-2">
            {pool.token0.logoURI ? (
              <Image
                src={pool.token0.logoURI || "/placeholder.svg"}
                alt={pool.token0.symbol}
                width={24}
                height={24}
                className="rounded-full bg-background border border-border z-10"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center z-10 text-xs font-bold">
                {pool.token0.symbol.charAt(0)}
              </div>
            )}
            {pool.token1.logoURI ? (
              <Image
                src={pool.token1.logoURI || "/placeholder.svg"}
                alt={pool.token1.symbol}
                width={24}
                height={24}
                className="rounded-full bg-background border border-border"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                {pool.token1.symbol.charAt(0)}
              </div>
            )}
          </div>
          <span className="font-bold">
            {pool.token0.symbol}/{pool.token1.symbol}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Your liquidity</p>
              <p className="font-medium">{formatCurrency(Number(pool.liquidityTokens))} LP</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pool share</p>
              <p className="font-medium">
                {((Number(pool.liquidityTokens) / Number(pool.totalSupply)) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {pool.token0.logoURI ? (
                  <Image
                    src={pool.token0.logoURI || "/placeholder.svg"}
                    alt={pool.token0.symbol}
                    width={20}
                    height={20}
                    className="rounded-full mr-2"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-xs font-bold">
                    {pool.token0.symbol.charAt(0)}
                  </div>
                )}
                <span>{pool.token0.symbol}</span>
              </div>
              <span>{formatCurrency(Number(pool.token0Amount))}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {pool.token1.logoURI ? (
                  <Image
                    src={pool.token1.logoURI || "/placeholder.svg"}
                    alt={pool.token1.symbol}
                    width={20}
                    height={20}
                    className="rounded-full mr-2"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-xs font-bold">
                    {pool.token1.symbol.charAt(0)}
                  </div>
                )}
                <span>{pool.token1.symbol}</span>
              </div>
              <span>{formatCurrency(Number(pool.token1Amount))}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={`/pool?tab=add&token0=${pool.token0.address}&token1=${pool.token1.address}`}>Add</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/10">
              <Link href={`/pool?tab=add&remove=true&pair=${pool.id}`}>Remove</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
