import { defineChain } from "viem"

export const chilizMainnet = defineChain({
  id: 88888,
  name: "Chiliz Chain",
  nativeCurrency: {
    decimals: 18,
    name: "CHZ",
    symbol: "CHZ",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.chiliz.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Chiliz Explorer",
      url: "https://explorer.chiliz.com",
    },
  },
})
