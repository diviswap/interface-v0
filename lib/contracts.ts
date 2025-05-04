import { ethers } from "ethers"
import {
  FACTORY_ADDRESS,
  ROUTER_ADDRESS,
  FACTORY_ABI,
  ERC20_ABI,
  PAIR_ABI,
  WETH_ABI,
  WETH_ADDRESS,
} from "@/lib/constants"

// Add a parameter for the router address to the getRouterContract function
export function getRouterContract(signer: ethers.Signer, routerAddress: string = ROUTER_ADDRESS) {
  return new ethers.Contract(
    routerAddress,
    [
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
      "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    ],
    signer,
  )
}

export function getFactoryContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
}

export function getERC20Contract(tokenAddress: string, provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider)
}

// Make sure the getPairContract function is correctly defined
export function getPairContract(pairAddress: string, provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(pairAddress, PAIR_ABI, provider)
}

export function getWETHContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(WETH_ADDRESS, WETH_ABI, provider)
}

export async function getTokenInfo(tokenAddress: string, provider: ethers.Provider) {
  const tokenContract = getERC20Contract(tokenAddress, provider)

  try {
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ])

    return { name, symbol, decimals }
  } catch (error) {
    console.error("Error fetching token info:", error)
    return null
  }
}

export async function getTokenBalance(tokenAddress: string, accountAddress: string, provider: ethers.Provider) {
  try {
    if (tokenAddress === ethers.ZeroAddress) {
      // For native token (CHZ)
      const balance = await provider.getBalance(accountAddress)
      return ethers.formatUnits(balance, 18)
    } else {
      // For ERC20 tokens
      const tokenContract = getERC20Contract(tokenAddress, provider)
      const balance = await tokenContract.balanceOf(accountAddress)
      const decimals = await tokenContract.decimals()
      return ethers.formatUnits(balance, decimals)
    }
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return "0"
  }
}

export async function checkAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  provider: ethers.Provider,
): Promise<bigint> {
  // If the token address is the zero address (native token), return max allowance
  if (tokenAddress === ethers.ZeroAddress) {
    return ethers.MaxUint256
  }

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)

  try {
    const allowance = await tokenContract.allowance(ownerAddress, spenderAddress)
    return allowance
  } catch (error) {
    console.error("Error checking allowance:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    // Return 0 allowance in case of error
    return BigInt(0)
  }
}

// Update the approveToken function to use legacy transaction format
export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint,
  signer: ethers.Signer,
) {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

  try {
    const tx = await tokenContract.approve(spenderAddress, amount, {
      type: 0, // Explicitly set to legacy transaction type
    })
    return await tx.wait()
  } catch (error) {
    console.error("Error approving token:", error)
    throw error
  }
}

export async function getAmountsOut(router: ethers.Contract, amountIn: bigint, path: string[]): Promise<bigint[]> {
  try {
    const amounts = await router.getAmountsOut(amountIn, path)
    return amounts
  } catch (error) {
    console.error("Error getting amounts out:", error)
    throw error
  }
}

export async function getAmountsIn(router: ethers.Contract, amountOut: bigint, path: string[]): Promise<bigint[]> {
  try {
    const amounts = await router.getAmountsIn(amountOut, path)
    return amounts
  } catch (error) {
    console.error("Error getting amounts in:", error)
    throw error
  }
}

export async function getAmountOut(
  router: ethers.Contract,
  amountIn: bigint,
  tokenIn: string,
  tokenOut: string,
): Promise<bigint> {
  try {
    const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut])
    return amounts[1]
  } catch (error) {
    console.error("Error getting amount out:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

// Update the swapExactTokensForTokens function to use legacy transaction format
export async function swapExactTokensForTokens(
  router: ethers.Contract,
  amountIn: bigint,
  amountOutMin: bigint,
  path: string[],
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    // Use legacy transaction format with gasPrice instead of type 2 transaction
    const tx = await router.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline, {
      gasLimit: 300000,
      type: 0, // Explicitly set to legacy transaction type
    })
    return await tx.wait()
  } catch (error) {
    console.error("Error swapping tokens:", error)
    throw error
  }
}

// Update the swapExactETHForTokens function to use legacy transaction format
export async function swapExactETHForTokens(
  router: ethers.Contract,
  amountIn: bigint,
  amountOutMin: bigint,
  path: string[],
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    // Use legacy transaction format with gasPrice instead of type 2 transaction
    const tx = await router.swapExactETHForTokens(amountOutMin, path, to, deadline, {
      value: amountIn,
      gasLimit: 300000,
      type: 0, // Explicitly set to legacy transaction type
    })
    return await tx.wait()
  } catch (error) {
    console.error("Error swapping ETH for tokens:", error)
    throw error
  }
}

// Update the swapExactTokensForETH function to use legacy transaction format
export async function swapExactTokensForETH(
  router: ethers.Contract,
  amountIn: bigint,
  amountOutMin: bigint,
  path: string[],
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    // Use legacy transaction format with gasPrice instead of type 2 transaction
    const tx = await router.swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline, {
      gasLimit: 300000,
      type: 0, // Explicitly set to legacy transaction type
    })
    return await tx.wait()
  } catch (error) {
    console.error("Error swapping tokens for ETH:", error)
    throw error
  }
}

// Update the addLiquidity and removeLiquidity functions as well
export async function addLiquidity(
  router: ethers.Contract,
  tokenA: string,
  tokenB: string,
  amountADesired: bigint,
  amountBDesired: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    const tx = await router.addLiquidity(
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      to,
      deadline,
      {
        gasLimit: 300000,
        type: 0, // Explicitly set to legacy transaction type
      },
    )
    return await tx.wait()
  } catch (error) {
    console.error("Error adding liquidity:", error)
    throw error
  }
}

export async function addLiquidityETH(
  router: ethers.Contract,
  token: string,
  amountTokenDesired: bigint,
  amountTokenMin: bigint,
  amountETHMin: bigint,
  to: string,
  deadline: number,
  ethValue: bigint,
  signer: ethers.Signer,
) {
  try {
    const tx = await router.addLiquidityETH(token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline, {
      value: ethValue,
      gasLimit: 300000,
      type: 0, // Explicitly set to legacy transaction type
    })
    return await tx.wait()
  } catch (error) {
    console.error("Error adding liquidity ETH:", error)
    throw error
  }
}

export async function removeLiquidity(
  router: ethers.Contract,
  tokenA: string,
  tokenB: string,
  liquidity: bigint,
  amountAMin: bigint,
  amountBMin: bigint,
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    const tx = await router.removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline, {
      gasLimit: 300000,
      type: 0, // Explicitly set to legacy transaction type
    })
    return await tx.wait()
  } catch (error) {
    console.error("Error removing liquidity:", error)
    throw error
  }
}

export async function removeLiquidityETH(
  router: ethers.Contract,
  token: string,
  liquidity: bigint,
  amountTokenMin: bigint,
  amountETHMin: bigint,
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    const tx = await router.removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline, {
      gasLimit: 300000,
      type: 0, // Explicitly set to legacy transaction type
    })
    return await tx.wait()
  } catch (error) {
    console.error("Error removing liquidity ETH:", error)
    throw error
  }
}
