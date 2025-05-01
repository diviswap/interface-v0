import type { Trade } from "@uniswap/sdk"
import { formatCurrency } from "@/lib/utils"

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  if (!trade) return null

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Minimum received</span>
        <span>
          {formatCurrency(Number(trade.outputAmount.toSignificant(6)))} {trade.outputAmount.currency.symbol}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Price Impact</span>
        <span>{trade.priceImpact.toFixed(2)}%</span>
      </div>
      <div className="flex justify-between">
        <span>Liquidity Provider Fee</span>
        <span>
          {formatCurrency(Number(trade.executionPrice.toSignificant(6)))} {trade.inputAmount.currency.symbol}
        </span>
      </div>
    </div>
  )
}
