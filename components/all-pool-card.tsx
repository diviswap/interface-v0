import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ethers } from "ethers"
import Link from "next/link"

interface AllPoolCardProps {
  pool: any
}

export function AllPoolCard({ pool }: AllPoolCardProps) {
  const reserve0 = Number(ethers.formatUnits(pool.reserve0, pool.token0.decimals))
  const reserve1 = Number(ethers.formatUnits(pool.reserve1, pool.token1.decimals))

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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total liquidity</p>
            <div className="space-y-1 mt-1">
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
                <p className="font-medium">
                  {formatCurrency(reserve0)} {pool.token0.symbol}
                </p>
              </div>
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
                <p className="font-medium">
                  {formatCurrency(reserve1)} {pool.token1.symbol}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-end">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href={`/pool?tab=add&token0=${pool.token0.address}&token1=${pool.token1.address}`}>
                Add Liquidity
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
