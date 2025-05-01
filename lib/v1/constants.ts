import { Interface } from "@ethersproject/abi"
import { ChainId } from "@uniswap/sdk"
import V1_EXCHANGE_ABI from "./v1_exchange.json"
import V1_FACTORY_ABI from "./v1_factory.json"

export const V1_FACTORY_ADDRESSES: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95",
  [ChainId.CHILIZ]: "0x...", // Replace with the correct address for Chiliz Chain
}

export const V1_FACTORY_INTERFACE = new Interface(V1_FACTORY_ABI)
export const V1_EXCHANGE_INTERFACE = new Interface(V1_EXCHANGE_ABI)

export { V1_FACTORY_ABI, V1_EXCHANGE_ABI }
