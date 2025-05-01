import { Currency, CurrencyAmount, JSBI, Percent, TokenAmount, Trade, Route, Token, type TradeType } from "@uniswap/sdk"
import { ethers } from "ethers"
import { CHILIZ_CHAIN_ID, ROUTER_ADDRESS, WCHZ_ADDRESS } from "./constants"
import { Fetcher } from "@uniswap/sdk"

// Configure ChainId for Chiliz
const CHILIZ_CHAIN_ID_SDK = CHILIZ_CHAIN_ID // We'll use MAINNET as a placeholder, adjust this when Chiliz is supported

// WCHZ token
const WCHZ = new Token(CHILIZ_CHAIN_ID_SDK, WCHZ_ADDRESS, 18, "WCHZ", "Wrapped CHZ")

export function createToken(address: string, decimals: number, symbol: string, name: string): Token {
  return new Token(CHILIZ_CHAIN_ID_SDK, address, decimals, symbol, name)
}

export async function getRoute(tokenA: Token, tokenB: Token, provider: ethers.Provider): Promise<Route> {
  try {
    // Convertir el proveedor de ethers v6 a un formato compatible con el SDK de Uniswap
    // El SDK de Uniswap espera un proveedor de ethers v5
    const providerCompatible = {
      call: async (tx: any) => {
        return await provider.call(tx)
      },
      getNetwork: async () => {
        const network = await provider.getNetwork()
        return { chainId: network.chainId }
      },
      getBlockNumber: async () => {
        return await provider.getBlockNumber()
      },
    }

    const pair = await Fetcher.fetchPairData(tokenA, tokenB, providerCompatible as any)
    return new Route([pair], tokenA)
  } catch (error) {
    console.error("Error getting route:", error)
    throw error
  }
}

export function createTrade(route: Route, amount: string, tradeType: TradeType): Trade {
  const tokenAmount = new TokenAmount(route.input, amount)
  return new Trade(route, tokenAmount, tradeType)
}

export async function executeSwap(trade: Trade, account: string, provider: ethers.Provider): Promise<string> {
  try {
    const signer = await provider.getSigner()
    const router = new ethers.Contract(
      ROUTER_ADDRESS,
      [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      ],
      signer,
    )

    const slippageTolerance = new Percent("50", "10000") // 0.5%
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw.toString()
    const path = trade.route.path.map((token) => token.address)
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

    const tx = await router.swapExactTokensForTokens(
      trade.inputAmount.raw.toString(),
      amountOutMin,
      path,
      account,
      deadline,
      { gasLimit: 300000 },
    )

    const receipt = await tx.wait()
    return receipt.hash
  } catch (error) {
    console.error("Error executing swap:", error)
    throw error
  }
}

export async function addLiquidity(
  tokenA: Token,
  tokenB: Token,
  amountA: string,
  amountB: string,
  account: string,
  provider: ethers.Provider,
): Promise<string> {
  try {
    const signer = await provider.getSigner()
    const router = new ethers.Contract(
      ROUTER_ADDRESS,
      [
        "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
      ],
      signer,
    )

    const slippageTolerance = new Percent("50", "10000") // 0.5%
    const amountADesired = ethers.parseUnits(amountA, tokenA.decimals)
    const amountBDesired = ethers.parseUnits(amountB, tokenB.decimals)
    const amountAMin = (amountADesired * BigInt(9950)) / BigInt(10000)
    const amountBMin = (amountBDesired * BigInt(9950)) / BigInt(10000)
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes

    const tx = await router.addLiquidity(
      tokenA.address,
      tokenB.address,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      account,
      deadline,
      { gasLimit: 300000 },
    )

    const receipt = await tx.wait()
    return receipt.hash
  } catch (error) {
    console.error("Error adding liquidity:", error)
    throw error
  }
}

export async function getTokenBalance(token: Token, account: string, provider: ethers.Provider): Promise<string> {
  try {
    if (token.address.toLowerCase() === WCHZ_ADDRESS.toLowerCase()) {
      // For the native token (CHZ), we get the ETH balance
      const balance = await provider.getBalance(account)
      return ethers.formatUnits(balance, token.decimals)
    } else {
      // Use Contract for ERC20 tokens
      const contract = new ethers.Contract(
        token.address,
        ["function balanceOf(address) view returns (uint256)"],
        provider,
      )

      try {
        const balance = await contract.balanceOf(account)
        return ethers.formatUnits(balance, token.decimals)
      } catch (error) {
        console.warn(`Error calling balanceOf for token ${token.symbol}:`, error)
        return "0"
      }
    }
  } catch (error) {
    console.error("Error fetching token balance:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    return "0"
  }
}

export async function getPairLiquidity(
  tokenA: Token,
  tokenB: Token,
  account: string,
  provider: ethers.Provider,
): Promise<{
  liquidityTokens: string
  tokenAAmount: string
  tokenBAmount: string
}> {
  try {
    // Convertir el proveedor de ethers v6 a un formato compatible con el SDK de Uniswap
    const providerCompatible = {
      call: async (tx: any) => {
        return await provider.call(tx)
      },
      getNetwork: async () => {
        const network = await provider.getNetwork()
        return { chainId: network.chainId }
      },
      getBlockNumber: async () => {
        return await provider.getBlockNumber()
      },
    }

    const pair = await Fetcher.fetchPairData(tokenA, tokenB, providerCompatible as any)
    const liquidityToken = pair.liquidityToken

    // Get liquidity token balance
    const pairContract = new ethers.Contract(
      pair.liquidityToken.address,
      ["function balanceOf(address) view returns (uint256)", "function totalSupply() view returns (uint256)"],
      provider,
    )

    const liquidityBalance = await pairContract.balanceOf(account)
    const totalSupply = await pairContract.totalSupply()

    // Get reserves
    const pairReservesContract = new ethers.Contract(
      pair.liquidityToken.address,
      ["function getReserves() view returns (uint112, uint112, uint32)"],
      provider,
    )

    const reserves = await pairReservesContract.getReserves()

    // Calculate token amounts based on liquidity share
    const liquidityShare = liquidityBalance.toString()
    const tokenAReserve = reserves[0].toString()
    const tokenBReserve = reserves[1].toString()

    if (BigInt(totalSupply) === BigInt(0)) {
      return {
        liquidityTokens: "0",
        tokenAAmount: "0",
        tokenBAmount: "0",
      }
    }

    const tokenAAmount = (BigInt(liquidityShare) * BigInt(tokenAReserve)) / BigInt(totalSupply)
    const tokenBAmount = (BigInt(liquidityShare) * BigInt(tokenBReserve)) / BigInt(totalSupply)

    return {
      liquidityTokens: ethers.formatUnits(liquidityBalance, 18),
      tokenAAmount: ethers.formatUnits(tokenAAmount, tokenA.decimals),
      tokenBAmount: ethers.formatUnits(tokenBAmount, tokenB.decimals),
    }
  } catch (error) {
    console.error("Error getting pair liquidity:", error)
    return {
      liquidityTokens: "0",
      tokenAAmount: "0",
      tokenBAmount: "0",
    }
  }
}

export function wrappedCurrency(currency: Currency, chainId: number): Token | undefined {
  return chainId && currency === Currency.ETHER ? WCHZ : currency instanceof Token ? currency : undefined
}

export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = ethers.parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== "0") {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}
