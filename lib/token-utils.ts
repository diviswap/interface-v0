// Token logo utilities
export function getTokenLogoURI(address: string): string {
  const tokenLogos: { [key: string]: string } = {
    // CHZ and WCHZ
    "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47": "/tokens/chz.png",
    "0x0000000000000000000000000000000000000000": "/tokens/chz.png",

    // Common tokens (add more as needed)
    "0xA0b86a33E6441b8435b662303c0f479c7e1d5b1e": "/tokens/usdt.png",
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": "/tokens/usdc.png",
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063": "/tokens/dai.png",
  }

  const normalizedAddress = address.toLowerCase()

  // Return specific logo if available
  if (tokenLogos[normalizedAddress]) {
    return tokenLogos[normalizedAddress]
  }

  // Return placeholder for unknown tokens
  return `/placeholder.svg?height=32&width=32&query=token+logo`
}

export function formatTokenAmount(amount: string | number, decimals = 18): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (num === 0) return "0"
  if (num < 0.0001) return "< 0.0001"
  if (num < 1) return num.toFixed(6)
  if (num < 1000) return num.toFixed(4)
  if (num < 1000000) return (num / 1000).toFixed(2) + "K"

  return (num / 1000000).toFixed(2) + "M"
}
