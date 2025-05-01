import { ethers } from "ethers"

export class UniswapV2Library {
  static sortTokens(tokenA: string, tokenB: string): [string, string] {
    return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]
  }

  static pairFor(factory: string, tokenA: string, tokenB: string): string {
    const [token0, token1] = this.sortTokens(tokenA, tokenB)
    const salt = ethers.solidityPackedKeccak256(["address", "address"], [token0, token1])
    return ethers.getCreate2Address(factory, salt, "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f") // init code hash
  }

  static getReserves = async (
    factory: string,
    tokenA: string,
    tokenB: string,
    provider: ethers.Provider,
  ): Promise<[bigint, bigint]> => {
    const [token0] = this.sortTokens(tokenA, tokenB)
    const pairAddress = this.pairFor(factory, tokenA, tokenB)

    try {
      const pairContract = new ethers.Contract(
        pairAddress,
        [
          "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
        ],
        provider,
      )

      const reserves = await pairContract.getReserves()
      return tokenA === token0 ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]]
    } catch (error) {
      console.error("Error getting reserves:", error)
      return [BigInt(0), BigInt(0)]
    }
  }

  static quote(amountA: bigint, reserveA: bigint, reserveB: bigint): bigint {
    if (amountA <= 0) throw new Error("UniswapV2Library: INSUFFICIENT_AMOUNT")
    if (reserveA <= 0 || reserveB <= 0) throw new Error("UniswapV2Library: INSUFFICIENT_LIQUIDITY")
    return (amountA * reserveB) / reserveA
  }

  static getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
    if (amountIn <= 0) throw new Error("UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT")
    if (reserveIn <= 0 || reserveOut <= 0) throw new Error("UniswapV2Library: INSUFFICIENT_LIQUIDITY")

    const amountInWithFee = amountIn * BigInt(997)
    const numerator = amountInWithFee * reserveOut
    const denominator = reserveIn * BigInt(1000) + amountInWithFee
    return numerator / denominator
  }

  static getAmountIn(amountOut: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
    if (amountOut <= 0) throw new Error("UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT")
    if (reserveIn <= 0 || reserveOut <= 0) throw new Error("UniswapV2Library: INSUFFICIENT_LIQUIDITY")

    const numerator = reserveIn * amountOut * BigInt(1000)
    const denominator = (reserveOut - amountOut) * BigInt(997)
    return numerator / denominator + BigInt(1)
  }

  static getAmountsOut = async (
    factory: string,
    amountIn: bigint,
    path: string[],
    provider: ethers.Provider,
  ): Promise<bigint[]> => {
    if (path.length < 2) throw new Error("UniswapV2Library: INVALID_PATH")

    const amounts: bigint[] = [amountIn]
    for (let i = 0; i < path.length - 1; i++) {
      const [reserveIn, reserveOut] = await this.getReserves(factory, path[i], path[i + 1], provider)
      amounts.push(this.getAmountOut(amounts[i], reserveIn, reserveOut))
    }

    return amounts
  }

  static getAmountsIn = async (
    factory: string,
    amountOut: bigint,
    path: string[],
    provider: ethers.Provider,
  ): Promise<bigint[]> => {
    if (path.length < 2) throw new Error("UniswapV2Library: INVALID_PATH")

    const amounts: bigint[] = Array(path.length).fill(BigInt(0))
    amounts[amounts.length - 1] = amountOut

    for (let i = path.length - 1; i > 0; i--) {
      const [reserveIn, reserveOut] = await this.getReserves(factory, path[i - 1], path[i], provider)
      amounts[i - 1] = this.getAmountIn(amounts[i], reserveIn, reserveOut)
    }

    return amounts
  }
}
