import { AdvancedSwapDetails, type AdvancedSwapDetailsProps } from "./AdvancedSwapDetails"

export function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
  return (
    <div className="mt-4 bg-secondary p-4 rounded-lg">
      <AdvancedSwapDetails {...rest} trade={trade} />
    </div>
  )
}
