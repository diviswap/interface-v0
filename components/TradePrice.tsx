"use client"

import type { Price } from "@uniswap/sdk"
import { Button } from "@/components/ui/button"
import { Repeat } from "lucide-react"

interface TradePriceProps {
  price?: Price
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export function TradePrice({ price, showInverted, setShowInverted }: TradePriceProps) {
  const formattedPrice = showInverted ? price?.toSignificant(6) : price?.invert()?.toSignificant(6)

  const show = Boolean(price?.baseCurrency && price?.quoteCurrency)
  const label = showInverted
    ? `${price?.quoteCurrency?.symbol} per ${price?.baseCurrency?.symbol}`
    : `${price?.baseCurrency?.symbol} per ${price?.quoteCurrency?.symbol}`

  return (
    <div className="flex items-center justify-between">
      <span>{show ? `${formattedPrice} ${label}` : "-"}</span>
      <Button variant="ghost" size="sm" onClick={() => setShowInverted(!showInverted)}>
        <Repeat className="h-4 w-4" />
      </Button>
    </div>
  )
}
