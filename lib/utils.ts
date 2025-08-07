import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { keccak256 as ethersKeccak256, toUtf8Bytes } from "ethers"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string, decimals = 6): string {
  // Handle undefined or null values
  if (value === undefined || value === null) return "0";
  
  // Convert string to number if needed, handling scientific notation
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if the value is too small for standard formatting
  if (Math.abs(numValue) > 0 && Math.abs(numValue) < 0.000001) {
    return numValue.toExponential(6);
  }
  
  // For normal ranges, use Intl formatter with appropriate decimals
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(numValue);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`
}

export function calculateSlippage(amount: number, slippage: number): number {
  return amount * (1 - slippage / 100)
}

export function calculatePriceImpact(inputAmount: number, outputAmount: number, exchangeRate: number): number {
  const expectedOutput = inputAmount * exchangeRate
  return ((expectedOutput - outputAmount) / expectedOutput) * 100
}

export function keccak256Hash(message: string): string {
  return ethersKeccak256(toUtf8Bytes(message))
}
