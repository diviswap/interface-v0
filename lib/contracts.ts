import { ethers } from "ethers"
import {
  FACTORY_ADDRESS,
  ROUTER_ADDRESS,
  COMPETITION_ROUTER_ADDRESS,
  PEPPER_TOKEN_ADDRESS,
  WCHZ_ADDRESS,
  FACTORY_ABI,
  ERC20_ABI,
  PAIR_ABI,
  WETH_ABI,
  WETH_ADDRESS,
} from "@/lib/constants"

// Función para obtener el contrato del router de DiviSwap
const COMPETITION_ROUTER_ABI = [
  // Standard router functions
  "function factory() external view returns (address)",
  "function WETH() external view returns (address)",
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
  "function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",

  // Competition-specific functions
  "function pepperToken() external view returns (address)",
  "function wchzToken() external view returns (address)",
  "function currentDayIndex() external view returns (uint256)",
  "function currentDayStart() external view returns (uint256)",
  "function competitionDuration() external view returns (uint256)",
  "function dailyRewardPool() external view returns (uint256)",
  "function getUserVolume(uint256 dayIndex, address user) external view returns (uint256)",
  "function getLeaderboard(uint256 dayIndex) external view returns (address[] memory users, uint256[] memory volumes)",
  "function estimateReward(uint256 dayIndex, address user) external view returns (uint256)",
  "function claimRewards(uint256[] calldata dayIndices) external",
  "function claimAllRewards() external",
  "function lastClaimedDay(address user) external view returns (uint256)",
  "function claimed(uint256 dayIndex, address user) external view returns (bool)",
  // Added pendingRewards function to ABI
  "function pendingRewards(address user) external view returns (uint256)",
]

// Function to determine if swap should use competition router
function shouldUseCompetitionRouter(path: string[]): boolean {
  if (path.length < 2) return false

  const outputToken = path[path.length - 1].toLowerCase()
  const inputToken = path[0].toLowerCase()

  // Use competition router if buying PEPPER with wCHZ or WETH
  return (
    outputToken === PEPPER_TOKEN_ADDRESS.toLowerCase() &&
    (inputToken === WCHZ_ADDRESS.toLowerCase() || inputToken === WETH_ADDRESS.toLowerCase())
  )
}

// Modified function to get appropriate router contract
export function getRouterContract(signer: ethers.Signer, routerAddress?: string, path?: string[]) {
  let contractAddress = routerAddress || ROUTER_ADDRESS
  let abi = [
    // Factory functions
    "function factory() external view returns (address)",
    "function WETH() external view returns (address)",

    // Add liquidity functions
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",

    // Remove liquidity functions
    "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
    "function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)",

    // Swap functions
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",

    // Price calculation functions
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
    "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
  ]

  // Use competition router for PEPPER/wCHZ swaps
  if (path && shouldUseCompetitionRouter(path)) {
    contractAddress = COMPETITION_ROUTER_ADDRESS
    abi = COMPETITION_ROUTER_ABI
    console.log("Usando Competition Router en:", contractAddress)
  } else {
    console.log("Usando DiviSwap Router en:", contractAddress)
  }

  return new ethers.Contract(contractAddress, abi, signer)
}

// New function to get competition router specifically
export function getCompetitionRouterContract(signer: ethers.Signer) {
  console.log("Usando Competition Router en:", COMPETITION_ROUTER_ADDRESS)
  return new ethers.Contract(COMPETITION_ROUTER_ADDRESS, COMPETITION_ROUTER_ABI, signer)
}

export function getFactoryContract(provider: ethers.Provider | ethers.Signer) {
  console.log("Usando DiviSwap Factory en:", FACTORY_ADDRESS)
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
}

export function getERC20Contract(tokenAddress: string, provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(tokenAddress, ERC20_ABI, provider)
}

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
      // Para token nativo (CHZ)
      const balance = await provider.getBalance(accountAddress)
      return ethers.formatUnits(balance, 18)
    } else {
      // Para tokens ERC20
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
  // Si la dirección del token es la dirección cero (token nativo), devolver allowance máximo
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
    // Devolver 0 allowance en caso de error
    return BigInt(0)
  }
}

export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint,
  signer: ethers.Signer,
) {
  console.log(`Aprobando ${amount} tokens en ${tokenAddress} para ${spenderAddress}`)
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)

  try {
    // Obtener el precio del gas actual
    const feeData = await signer.provider.getFeeData()
    const gasPrice = feeData.gasPrice || ethers.parseUnits("5", "gwei")

    console.log("Usando precio de gas:", gasPrice.toString())

    const tx = await tokenContract.approve(spenderAddress, amount, {
      gasLimit: 300000,
      gasPrice: gasPrice,
      type: 0, // Explícitamente establecer a tipo de transacción legacy
    })

    console.log("Transacción de aprobación enviada:", tx.hash)
    const receipt = await tx.wait()
    console.log("Aprobación confirmada:", receipt.hash)
    return receipt
  } catch (error) {
    console.error("Error aprobando token:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

export async function getAmountsOut(router: ethers.Contract, amountIn: bigint, path: string[]): Promise<bigint[]> {
  try {
    console.log(`Obteniendo cantidades de salida para ${amountIn} con ruta:`, path)
    const amounts = await router.getAmountsOut(amountIn, path)
    console.log("Cantidades de salida:", amounts)
    return amounts
  } catch (error) {
    console.error("Error getting amounts out:", error)
    throw error
  }
}

export async function getAmountsIn(router: ethers.Contract, amountOut: bigint, path: string[]): Promise<bigint[]> {
  try {
    console.log(`Obteniendo cantidades de entrada para ${amountOut} con ruta:`, path)
    const amounts = await router.getAmountsIn(amountOut, path)
    console.log("Cantidades de entrada:", amounts)
    return amounts
  } catch (error) {
    console.error("Error getting amounts in:", error)
    throw error
  }
}

// Modified swap functions to use appropriate router
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
    // Use competition router if swapping to PEPPER
    const actualRouter = shouldUseCompetitionRouter(path) ? getCompetitionRouterContract(signer) : router

    console.log(`Swapping ${amountIn} tokens con ruta:`, path)
    console.log("Usando router:", shouldUseCompetitionRouter(path) ? "Competition" : "Standard")

    // Obtener el precio del gas actual
    const feeData = await signer.provider?.getFeeData()
    const gasPrice = feeData?.gasPrice || ethers.parseUnits("5", "gwei")

    console.log("Usando precio de gas:", gasPrice.toString())

    const tx = await actualRouter.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline, {
      gasLimit: 500000,
      gasPrice: gasPrice,
      type: 0, // Explícitamente establecer a tipo de transacción legacy
    })

    console.log("Transacción de swap enviada:", tx.hash)
    // Return transaction object instead of receipt to allow caller to handle wait()
    return tx
  } catch (error) {
    console.error("Error swapping tokens:", error)
    throw error
  }
}

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
    // Use competition router if swapping to PEPPER
    const actualRouter = shouldUseCompetitionRouter(path) ? getCompetitionRouterContract(signer) : router

    console.log(`Swapping ${amountIn} ETH por tokens con ruta:`, path)
    console.log("Usando router:", shouldUseCompetitionRouter(path) ? "Competition" : "Standard")

    // Obtener el precio del gas actual
    const feeData = await signer.provider?.getFeeData()
    const gasPrice = feeData?.gasPrice || ethers.parseUnits("5", "gwei")

    console.log("Usando precio de gas:", gasPrice.toString())

    const tx = await actualRouter.swapExactETHForTokens(amountOutMin, path, to, deadline, {
      value: amountIn,
      gasLimit: 500000,
      gasPrice: gasPrice,
      type: 0, // Explícitamente establecer a tipo de transacción legacy
    })

    console.log("Transacción de swap ETH enviada:", tx.hash)
    // Return transaction object instead of receipt to allow caller to handle wait()
    return tx
  } catch (error) {
    console.error("Error swapping ETH for tokens:", error)
    throw error
  }
}

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
    console.log(`Swapping ${amountIn} tokens por ETH con ruta:`, path)

    // Obtener el precio del gas actual
    const feeData = await signer.provider?.getFeeData()
    const gasPrice = feeData?.gasPrice || ethers.parseUnits("5", "gwei")

    console.log("Usando precio de gas:", gasPrice.toString())

    const tx = await router.swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline, {
      gasLimit: 500000,
      gasPrice: gasPrice,
      type: 0, // Explícitamente establecer a tipo de transacción legacy
    })

    console.log("Transacción de swap tokens por ETH enviada:", tx.hash)
    // Return transaction object instead of receipt to allow caller to handle wait()
    return tx
  } catch (error) {
    console.error("Error swapping tokens for ETH:", error)
    throw error
  }
}

export async function addLiquidity(
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
    console.log("Añadiendo liquidez con DiviSwap Router")
    console.log("TokenA:", tokenA)
    console.log("TokenB:", tokenB)
    console.log("AmountADesired:", amountADesired.toString())
    console.log("AmountBDesired:", amountBDesired.toString())
    console.log("AmountAMin:", amountAMin.toString())
    console.log("AmountBMin:", amountBMin.toString())
    console.log("To:", to)
    console.log("Deadline:", deadline)

    const router = getRouterContract(signer)

    // Obtener el precio del gas actual
    const feeData = await signer.provider?.getFeeData()
    const gasPrice = feeData?.gasPrice || ethers.parseUnits("5", "gwei")

    console.log("Usando precio de gas:", gasPrice.toString())

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
        gasLimit: 2000000, // Increased gas limit
        gasPrice: gasPrice,
        type: 0, // Explícitamente establecer a tipo de transacción legacy
      },
    )

    console.log("Transacción de añadir liquidez enviada:", tx.hash)
    const receipt = await tx.wait()
    console.log("Liquidez añadida confirmada:", receipt.hash)
    return receipt
  } catch (error) {
    console.error("Error adding liquidity:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

export async function addLiquidityETH(
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
    console.log("Añadiendo liquidez ETH con DiviSwap Router")
    console.log("Token:", token)
    console.log("AmountTokenDesired:", amountTokenDesired.toString())
    console.log("AmountTokenMin:", amountTokenMin.toString())
    console.log("AmountETHMin:", amountETHMin.toString())
    console.log("To:", to)
    console.log("Deadline:", deadline)
    console.log("ETH Value:", ethValue.toString())

    const router = getRouterContract(signer)

    // Obtener el precio del gas actual
    const feeData = await signer.provider?.getFeeData()
    const gasPrice = feeData?.gasPrice || ethers.parseUnits("5", "gwei")

    console.log("Usando precio de gas:", gasPrice.toString())

    const tx = await router.addLiquidityETH(token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline, {
      value: ethValue,
      gasLimit: 2000000, // Increased gas limit
      gasPrice: gasPrice,
      type: 0, // Explícitamente establecer a tipo de transacción legacy
    })

    console.log("Transacción de añadir liquidez ETH enviada:", tx.hash)
    const receipt = await tx.wait()
    console.log("Liquidez ETH añadida confirmada:", receipt.hash)
    return receipt
  } catch (error) {
    console.error("Error adding liquidity ETH:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

export async function removeLiquidity(
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
    console.log("Eliminando liquidez con DiviSwap Router")
    console.log("TokenA:", tokenA)
    console.log("TokenB:", tokenB)
    console.log("Liquidity:", liquidity.toString())
    console.log("AmountAMin:", amountAMin.toString())
    console.log("AmountBMin:", amountBMin.toString())
    console.log("To:", to)
    console.log("Deadline:", deadline)

    const router = getRouterContract(signer)

    // Obtener el precio del gas actual
    const feeData = await signer.provider?.getFeeData()
    const gasPrice = feeData?.gasPrice || ethers.parseUnits("5", "gwei")

    console.log("Usando precio de gas:", gasPrice.toString())

    const tx = await router.removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline, {
      gasLimit: 500000,
      gasPrice: gasPrice,
      type: 0, // Explícitamente establecer a tipo de transacción legacy
    })

    console.log("Transacción de eliminar liquidez enviada:", tx.hash)
    const receipt = await tx.wait()
    console.log("Liquidez eliminada confirmada:", receipt.hash)
    return receipt
  } catch (error) {
    console.error("Error removing liquidity:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

export async function removeLiquidityETH(
  token: string,
  liquidity: bigint,
  amountTokenMin: bigint,
  amountETHMin: bigint,
  to: string,
  deadline: number,
  signer: ethers.Signer,
) {
  try {
    console.log("Eliminando liquidez ETH con DiviSwap Router")
    console.log("Token:", token)
    console.log("Liquidity:", liquidity.toString())
    console.log("AmountTokenMin:", amountTokenMin.toString())
    console.log("AmountETHMin:", amountETHMin.toString())
    console.log("To:", to)
    console.log("Deadline:", deadline)

    const router = getRouterContract(signer)

    // Obtener el precio del gas actual
    const feeData = await signer.provider?.getFeeData()
    const gasPrice = feeData?.gasPrice || ethers.parseUnits("5", "gwei")

    console.log("Usando precio de gas:", gasPrice.toString())

    const tx = await router.removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline, {
      gasLimit: 500000,
      gasPrice: gasPrice,
      type: 0, // Explícitamente establecer a tipo de transacción legacy
    })

    console.log("Transacción de eliminar liquidez ETH enviada:", tx.hash)
    const receipt = await tx.wait()
    console.log("Liquidez ETH eliminada confirmada:", receipt.hash)
    return receipt
  } catch (error) {
    console.error("Error removing liquidity ETH:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    }
    throw error
  }
}

// New function to get pending rewards for a user
export async function getPendingRewards(user: string, signer: ethers.Signer) {
  try {
    const competitionRouter = getCompetitionRouterContract(signer)
    console.log("Obteniendo pending rewards para:", user)
    const pendingRewards = await competitionRouter.pendingRewards(user)
    console.log("Pending rewards:", pendingRewards.toString())
    return pendingRewards
  } catch (error) {
    console.error("Error getting pending rewards:", error)
    throw error
  }
}
