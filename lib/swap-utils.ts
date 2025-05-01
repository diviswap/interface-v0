import { ethers } from "ethers"
import { FACTORY_ADDRESS, WCHZ_ADDRESS, COMMON_TOKENS, KAYEN_ROUTER_ADDRESS, KAYEN_FACTORY_ADDRESS } from "./constants"

// Interfaces para representar tokens y pares
export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
}

export interface PairInfo {
  address: string
  token0: TokenInfo
  token1: TokenInfo
  reserve0: bigint
  reserve1: bigint
}

// Update the TradeInfo interface to include the router information
export interface TradeInfo {
  inputAmount: bigint
  outputAmount: bigint
  executionPrice: number
  priceImpact: number
  path: string[]
  isKayenRouter?: boolean
}

// Función para obtener la dirección del par desde el contrato de fábrica
export async function getPairAddress(
  tokenA: string,
  tokenB: string,
  factoryAddress: string,
  provider: ethers.Provider,
): Promise<string> {
  try {
    const factoryContract = new ethers.Contract(
      factoryAddress,
      ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
      provider,
    )

    return await factoryContract.getPair(tokenA, tokenB)
  } catch (error) {
    console.error("Error getting pair address:", error)
    return ethers.ZeroAddress
  }
}

// Función para verificar si existe un par directo
export async function pairExists(
  tokenA: string,
  tokenB: string,
  factoryAddress: string,
  provider: ethers.Provider,
): Promise<boolean> {
  try {
    const pairAddress = await getPairAddress(tokenA, tokenB, factoryAddress, provider)
    return pairAddress !== ethers.ZeroAddress
  } catch (error) {
    console.error("Error checking if pair exists:", error)
    return false
  }
}

// Función para verificar si existe una ruta en el router de Kayen
export async function kayenRouteExists(
  tokenA: string,
  tokenB: string,
  provider: ethers.Provider,
  amountIn: bigint = ethers.parseUnits("1", 18),
): Promise<{ exists: boolean; amountOut?: bigint }> {
  try {
    // Instead of trying to get the pair address directly, we'll check if a route exists
    // by using the getAmountsOut function of the router
    const kayenRouterContract = new ethers.Contract(
      KAYEN_ROUTER_ADDRESS,
      ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"],
      provider,
    )

    // Use a small amount for the check
    const path = [tokenA, tokenB]

    try {
      // If this call succeeds, a route exists
      const amounts = await kayenRouterContract.getAmountsOut(amountIn, path)
      return {
        exists: amounts.length > 1 && amounts[1] > 0,
        amountOut: amounts[1],
      }
    } catch (routeError) {
      // If this fails, there's no direct route
      console.log("No direct Kayen route exists:", routeError.message)
      return { exists: false }
    }
  } catch (error) {
    console.error("Error checking if Kayen route exists:", error)
    return { exists: false }
  }
}

// Función para obtener información del par
export async function fetchPairData(
  tokenA: TokenInfo,
  tokenB: TokenInfo,
  provider: ethers.Provider,
  isKayenRouter = false,
): Promise<PairInfo> {
  // Para tokens nativos, usamos WCHZ en su lugar para consultas de pares
  const tokenAAddress = tokenA.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenA.address
  const tokenBAddress = tokenB.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenB.address

  let pairAddress = ethers.ZeroAddress

  if (!isKayenRouter) {
    // Verificar si el par existe directamente en nuestro router
    pairAddress = await getPairAddress(tokenAAddress, tokenBAddress, FACTORY_ADDRESS, provider)
  } else {
    // For Kayen router, we'll try to get the pair address from the Kayen factory if available
    try {
      if (KAYEN_FACTORY_ADDRESS && KAYEN_FACTORY_ADDRESS !== ethers.ZeroAddress) {
        pairAddress = await getPairAddress(tokenAAddress, tokenBAddress, KAYEN_FACTORY_ADDRESS, provider)
      }
    } catch (error) {
      console.error("Error getting Kayen pair address from factory:", error)
    }

    // If we couldn't get the pair address from the factory, we'll use a different approach
    if (pairAddress === ethers.ZeroAddress) {
      // For Kayen router, we'll use a different approach to get pair data
      try {
        // Get reserves directly from the router using getAmountsOut
        const kayenRouterContract = new ethers.Contract(
          KAYEN_ROUTER_ADDRESS,
          ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"],
          provider,
        )

        // Use different amounts to estimate the price curve
        const amountInSmall = ethers.parseUnits("1", tokenA.decimals)
        const amountInLarge = ethers.parseUnits("1000", tokenA.decimals)

        // Get the output amounts for different input amounts
        const [amountsSmall, amountsLarge] = await Promise.all([
          kayenRouterContract.getAmountsOut(amountInSmall, [tokenAAddress, tokenBAddress]),
          kayenRouterContract.getAmountsOut(amountInLarge, [tokenAAddress, tokenBAddress]),
        ])

        // Calculate synthetic reserves based on the constant product formula
        // For a constant product AMM: x * y = k
        // If we know amountIn and amountOut for two different trades, we can estimate the reserves
        const amountOutSmall = amountsSmall[1]
        const amountOutLarge = amountsLarge[1]

        // Calculate price impact: (amountOutSmall/amountInSmall) / (amountOutLarge/amountInLarge)
        const priceRatioSmall = Number(amountOutSmall) / Number(amountInSmall)
        const priceRatioLarge = Number(amountOutLarge) / Number(amountInLarge)

        // If there's a price impact, we can estimate the reserves
        const priceImpact = 1 - priceRatioLarge / priceRatioSmall

        // Estimate reserves based on the price impact
        // For a constant product AMM with fee, the formula is:
        // amountOut = (reserveOut * amountIn * 0.997) / (reserveIn + amountIn * 0.997)

        // We'll use a simplified approach to estimate reserves
        // The larger the reserves, the smaller the price impact
        // We'll use a scale factor to get reasonable reserve sizes
        const scaleFactor = BigInt(1000000)

        // Create synthetic reserves that would produce the observed price impact
        let syntheticReserveA: bigint
        let syntheticReserveB: bigint

        if (priceImpact > 0.001) {
          // If there's a measurable price impact, use it to estimate reserves
          const reserveScale = BigInt(Math.floor(1 / priceImpact)) * scaleFactor
          syntheticReserveA = (amountInLarge * reserveScale) / BigInt(1000)
          syntheticReserveB = (amountOutLarge * reserveScale) / BigInt(1000)
        } else {
          // If price impact is very small, use large reserves
          syntheticReserveA = amountInLarge * BigInt(1000000)
          syntheticReserveB = amountOutLarge * BigInt(1000000)
        }

        // Create a synthetic pair info
        return {
          address: "kayen-synthetic-pair", // We don't have the actual pair address
          token0: tokenA,
          token1: tokenB,
          reserve0: syntheticReserveA,
          reserve1: syntheticReserveB,
        }
      } catch (error) {
        console.error("Error getting Kayen pair data from router:", error)
        throw new Error("FAILED_TO_FETCH_KAYEN_PAIR_DATA")
      }
    }
  }

  if (pairAddress === ethers.ZeroAddress) {
    throw new Error("PAIR_DOES_NOT_EXIST")
  }

  try {
    // Obtener reservas del par
    const pairContract = new ethers.Contract(
      pairAddress,
      [
        "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
        "function token0() external view returns (address)",
        "function token1() external view returns (address)",
      ],
      provider,
    )

    const [reserves, token0Address, token1Address] = await Promise.all([
      pairContract.getReserves(),
      pairContract.token0(),
      pairContract.token1(),
    ])

    // Determinar el orden correcto de los tokens
    // Usamos WCHZ_ADDRESS para comparar cuando el token es nativo
    const tokenAForComparison = tokenAAddress
    const isToken0 = tokenAForComparison.toLowerCase() === token0Address.toLowerCase()

    // Mantenemos los tokens originales para la respuesta
    const token0 = isToken0 ? tokenA : tokenB
    const token1 = isToken0 ? tokenB : tokenA

    return {
      address: pairAddress,
      token0,
      token1,
      reserve0: reserves[0],
      reserve1: reserves[1],
    }
  } catch (error) {
    console.error("Error fetching pair data:", error)
    throw new Error("FAILED_TO_FETCH_PAIR_DATA")
  }
}

// Función para obtener cotización directamente del router de Kayen
export async function getKayenQuote(
  tokenA: TokenInfo,
  tokenB: TokenInfo,
  amountIn: bigint,
  provider: ethers.Provider,
): Promise<{
  outputAmount: bigint
  executionPrice: number
  priceImpact: number
}> {
  try {
    // Para tokens nativos, usamos WCHZ en su lugar para consultas
    const tokenAAddress = tokenA.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenA.address
    const tokenBAddress = tokenB.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenB.address

    const kayenRouterContract = new ethers.Contract(
      KAYEN_ROUTER_ADDRESS,
      ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"],
      provider,
    )

    // Calculamos la cantidad de salida para diferentes cantidades de entrada
    // para estimar el impacto en el precio con precisión
    const baseAmountIn = ethers.parseUnits("1", tokenA.decimals)
    const smallAmountIn = amountIn > baseAmountIn ? baseAmountIn : amountIn / BigInt(10)

    // Si amountIn es muy pequeño, usamos un valor mínimo
    const effectiveSmallAmountIn = smallAmountIn > BigInt(0) ? smallAmountIn : BigInt(1)

    // Obtenemos las cantidades de salida para ambas cantidades de entrada
    const [actualAmounts, baseAmounts] = await Promise.all([
      kayenRouterContract.getAmountsOut(amountIn, [tokenAAddress, tokenBAddress]),
      kayenRouterContract.getAmountsOut(effectiveSmallAmountIn, [tokenAAddress, tokenBAddress]),
    ])

    const outputAmount = actualAmounts[1]
    const baseOutputAmount = baseAmounts[1]

    // Calculamos los precios para cada cantidad
    const executionPrice = Number(outputAmount) / Number(amountIn)
    const basePrice = Number(baseOutputAmount) / Number(effectiveSmallAmountIn)

    // Calculamos el impacto en el precio comparando los precios
    // En un pool con alto impacto, el precio por token disminuye a medida que aumenta la cantidad
    let priceImpact = 0

    if (basePrice > executionPrice) {
      priceImpact = ((basePrice - executionPrice) / basePrice) * 100
    }

    // Eliminamos esta línea:
    // priceImpact = Math.min(priceImpact, 20)

    console.log(`Kayen Quote - Amount: ${amountIn}, Output: ${outputAmount}, Impact: ${priceImpact.toFixed(2)}%`)

    return {
      outputAmount,
      executionPrice,
      priceImpact,
    }
  } catch (error) {
    console.error("Error getting Kayen quote:", error)
    throw error
  }
}

// Función para buscar una ruta a través de tokens intermedios comunes
export async function findBestRoute(
  tokenA: TokenInfo,
  tokenB: TokenInfo,
  provider: ethers.Provider,
  amountIn?: bigint,
): Promise<{
  exists: boolean
  path: TokenInfo[]
  reserves: [bigint, bigint][]
  isKayenRouter?: boolean
  outputAmount?: bigint
  priceImpact?: number
}> {
  console.log(`Finding best route from ${tokenA.symbol} to ${tokenB.symbol}`)

  // Si no se proporciona amountIn, usamos un valor predeterminado
  const actualAmountIn = amountIn || ethers.parseUnits("1", tokenA.decimals)

  // Crear versiones wrapped de los tokens si son nativos
  const wrappedTokenA: TokenInfo = tokenA.address === ethers.ZeroAddress ? { ...tokenA, address: WCHZ_ADDRESS } : tokenA

  const wrappedTokenB: TokenInfo = tokenB.address === ethers.ZeroAddress ? { ...tokenB, address: WCHZ_ADDRESS } : tokenB

  // Primero intentamos una ruta directa en nuestro router
  try {
    console.log("Checking direct pair in main router...")
    // Usamos los tokens wrapped para verificar el par
    const directPairExists = await pairExists(wrappedTokenA.address, wrappedTokenB.address, FACTORY_ADDRESS, provider)

    if (directPairExists) {
      console.log("Direct pair exists in main router!")
      const pairData = await fetchPairData(tokenA, tokenB, provider, false)

      // Determinar las reservas correctas
      const tokenAForComparison = tokenA.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenA.address
      const reserves: [bigint, bigint] =
        tokenAForComparison.toLowerCase() === pairData.token0.address.toLowerCase()
          ? [pairData.reserve0, pairData.reserve1]
          : [pairData.reserve1, pairData.reserve0]

      // Calcular la cantidad de salida
      const outputAmount = getAmountOut(actualAmountIn, reserves[0], reserves[1])

      // Calcular el impacto en el precio
      const priceImpact = calculatePriceImpact(actualAmountIn, outputAmount, reserves[0], reserves[1])

      return {
        exists: true,
        path: [tokenA, tokenB],
        reserves: [reserves],
        isKayenRouter: false,
        outputAmount,
        priceImpact,
      }
    }
  } catch (error) {
    console.error("Error checking direct pair in main router:", error)
  }

  // Si no existe en nuestro router, intentamos en el router de Kayen
  try {
    console.log("Checking direct route in Kayen router...")
    const kayenRouteResult = await kayenRouteExists(
      wrappedTokenA.address,
      wrappedTokenB.address,
      provider,
      actualAmountIn,
    )

    if (kayenRouteResult.exists) {
      console.log("Direct route exists in Kayen router!")
      try {
        // Obtener una cotización precisa del router de Kayen
        const kayenQuote = await getKayenQuote(tokenA, tokenB, actualAmountIn, provider)

        // Intentar obtener datos del par para calcular reservas
        try {
          const pairData = await fetchPairData(tokenA, tokenB, provider, true)

          // Determinar las reservas correctas
          const tokenAForComparison = tokenA.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenA.address
          const reserves: [bigint, bigint] =
            tokenAForComparison.toLowerCase() === pairData.token0.address.toLowerCase()
              ? [pairData.reserve0, pairData.reserve1]
              : [pairData.reserve1, pairData.reserve0]

          return {
            exists: true,
            path: [tokenA, tokenB],
            reserves: [reserves],
            isKayenRouter: true,
            outputAmount: kayenQuote.outputAmount,
            priceImpact: kayenQuote.priceImpact,
          }
        } catch (pairError) {
          console.log("Could not get pair data, using quote directly:", pairError.message)

          // Si no podemos obtener datos del par, creamos reservas sintéticas
          // que producirían la misma cantidad de salida y el mismo impacto en el precio

          // Ajustamos las reservas sintéticas para reflejar el impacto en el precio calculado
          // En un AMM, reservas más grandes = menos impacto en el precio
          const impactFactor = Math.max(0.1, kayenQuote.priceImpact / 100)
          const reserveScale = BigInt(Math.floor(1 / impactFactor)) * BigInt(1000)

          const syntheticReserveA = actualAmountIn * reserveScale
          const syntheticReserveB = kayenQuote.outputAmount * reserveScale

          return {
            exists: true,
            path: [tokenA, tokenB],
            reserves: [[syntheticReserveA, syntheticReserveB]],
            isKayenRouter: true,
            outputAmount: kayenQuote.outputAmount,
            priceImpact: kayenQuote.priceImpact,
          }
        }
      } catch (quoteError) {
        console.error("Error getting Kayen quote:", quoteError)

        // Si tenemos la cantidad de salida del check inicial, la usamos
        if (kayenRouteResult.amountOut) {
          // En este caso, estimamos un impacto en el precio bajo
          const estimatedPriceImpact = 0.5 // 0.5% es una estimación segura para rutas con buen volumen

          const syntheticReserveA = actualAmountIn * BigInt(1000)
          const syntheticReserveB = kayenRouteResult.amountOut * BigInt(1000)

          return {
            exists: true,
            path: [tokenA, tokenB],
            reserves: [[syntheticReserveA, syntheticReserveB]],
            isKayenRouter: true,
            outputAmount: kayenRouteResult.amountOut,
            priceImpact: estimatedPriceImpact,
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking direct route in Kayen router:", error)
  }

  console.log("No direct pair, checking intermediate tokens...")

  // Si uno de los tokens es nativo, intentamos una ruta a través de WCHZ
  if (tokenA.address === ethers.ZeroAddress || tokenB.address === ethers.ZeroAddress) {
    // Si tokenA es nativo, ya tenemos una ruta directa a través de WCHZ
    if (tokenA.address === ethers.ZeroAddress && tokenB.address !== WCHZ_ADDRESS) {
      try {
        const wchzToken: TokenInfo = {
          address: WCHZ_ADDRESS,
          symbol: "WCHZ",
          name: "Wrapped CHZ",
          decimals: 18,
        }

        // Verificar si existe el par WCHZ-tokenB en nuestro router
        let pairWCHZBExists = await pairExists(WCHZ_ADDRESS, tokenB.address, FACTORY_ADDRESS, provider)
        let isKayenPair = false

        // Si no existe en nuestro router, verificar en el router de Kayen
        if (!pairWCHZBExists) {
          const kayenResult = await kayenRouteExists(WCHZ_ADDRESS, tokenB.address, provider)
          pairWCHZBExists = kayenResult.exists
          isKayenPair = pairWCHZBExists
        }

        if (pairWCHZBExists) {
          console.log(
            `Found route via WCHZ for native CHZ to ${tokenB.symbol} in ${isKayenPair ? "Kayen" : "main"} router`,
          )

          // Si usamos Kayen, obtenemos una cotización precisa
          if (isKayenPair) {
            try {
              const kayenQuote = await getKayenQuote(tokenA, tokenB, actualAmountIn, provider)

              // Crear reservas sintéticas para el par
              const syntheticReserveA = actualAmountIn * BigInt(1000)
              const syntheticReserveB = kayenQuote.outputAmount * BigInt(1000)

              return {
                exists: true,
                path: [tokenA, tokenB],
                reserves: [[syntheticReserveA, syntheticReserveB]],
                isKayenRouter: true,
                outputAmount: kayenQuote.outputAmount,
                priceImpact: kayenQuote.priceImpact,
              }
            } catch (quoteError) {
              console.error("Error getting Kayen quote for WCHZ route:", quoteError)
            }
          }

          // Obtener datos del par
          const pairWCHZB = await fetchPairData(wchzToken, tokenB, provider, isKayenPair)

          // Determinar las reservas correctas
          const reservesWCHZB: [bigint, bigint] =
            WCHZ_ADDRESS.toLowerCase() === pairWCHZB.token0.address.toLowerCase()
              ? [pairWCHZB.reserve0, pairWCHZB.reserve1]
              : [pairWCHZB.reserve1, pairWCHZB.reserve0]

          // Calcular la cantidad de salida
          const outputAmount = getAmountOut(actualAmountIn, reservesWCHZB[0], reservesWCHZB[1])

          // Calcular el impacto en el precio
          const priceImpact = calculatePriceImpact(actualAmountIn, outputAmount, reservesWCHZB[0], reservesWCHZB[1])

          return {
            exists: true,
            path: [tokenA, tokenB], // Mantenemos los tokens originales en la ruta
            reserves: [reservesWCHZB],
            isKayenRouter: isKayenPair,
            outputAmount,
            priceImpact,
          }
        }
      } catch (error) {
        console.error("Error finding route via WCHZ for native token:", error)
      }
    }

    // Si tokenB es nativo, intentamos una ruta directa a través de WCHZ
    if (tokenB.address === ethers.ZeroAddress && tokenA.address !== WCHZ_ADDRESS) {
      try {
        const wchzToken: TokenInfo = {
          address: WCHZ_ADDRESS,
          symbol: "WCHZ",
          name: "Wrapped CHZ",
          decimals: 18,
        }

        // Verificar si existe el par tokenA-WCHZ en nuestro router
        let pairAWCHZExists = await pairExists(tokenA.address, WCHZ_ADDRESS, FACTORY_ADDRESS, provider)
        let isKayenPair = false

        // Si no existe en nuestro router, verificar en el router de Kayen
        if (!pairAWCHZExists) {
          const kayenResult = await kayenRouteExists(tokenA.address, WCHZ_ADDRESS, provider)
          pairAWCHZExists = kayenResult.exists
          isKayenPair = pairAWCHZExists
        }

        if (pairAWCHZExists) {
          console.log(
            `Found route via WCHZ from ${tokenA.symbol} to native CHZ in ${isKayenPair ? "Kayen" : "main"} router`,
          )

          // Si usamos Kayen, obtenemos una cotización precisa
          if (isKayenPair) {
            try {
              const kayenQuote = await getKayenQuote(tokenA, tokenB, actualAmountIn, provider)

              // Crear reservas sintéticas para el par
              const syntheticReserveA = actualAmountIn * BigInt(1000)
              const syntheticReserveB = kayenQuote.outputAmount * BigInt(1000)

              return {
                exists: true,
                path: [tokenA, tokenB],
                reserves: [[syntheticReserveA, syntheticReserveB]],
                isKayenRouter: true,
                outputAmount: kayenQuote.outputAmount,
                priceImpact: kayenQuote.priceImpact,
              }
            } catch (quoteError) {
              console.error("Error getting Kayen quote for WCHZ route:", quoteError)
            }
          }

          // Obtener datos del par
          const pairAWCHZ = await fetchPairData(tokenA, wchzToken, provider, isKayenPair)

          // Determinar las reservas correctas
          const reservesAWCHZ: [bigint, bigint] =
            tokenA.address.toLowerCase() === pairAWCHZ.token0.address.toLowerCase()
              ? [pairAWCHZ.reserve0, pairAWCHZ.reserve1]
              : [pairAWCHZ.reserve1, pairAWCHZ.reserve0]

          // Calcular la cantidad de salida
          const outputAmount = getAmountOut(actualAmountIn, reservesAWCHZ[0], reservesAWCHZ[1])

          // Calcular el impacto en el precio
          const priceImpact = calculatePriceImpact(actualAmountIn, outputAmount, reservesAWCHZ[0], reservesAWCHZ[1])

          return {
            exists: true,
            path: [tokenA, tokenB], // Mantenemos los tokens originales en la ruta
            reserves: [reservesAWCHZ],
            isKayenRouter: isKayenPair,
            outputAmount,
            priceImpact,
          }
        }
      } catch (error) {
        console.error("Error finding route via WCHZ for native token:", error)
      }
    }
  }

  // Lista de tokens intermedios potenciales, empezando con WCHZ
  const intermediateTokens: TokenInfo[] = [
    // WCHZ primero ya que es el más probable que tenga liquidez
    {
      address: WCHZ_ADDRESS,
      symbol: "WCHZ",
      name: "Wrapped CHZ",
      decimals: 18,
    },
  ]

  // Añadir otros tokens comunes como posibles intermediarios
  // Excluir los tokens que ya estamos usando en el swap
  COMMON_TOKENS.forEach((token) => {
    if (token.address !== WCHZ_ADDRESS && token.address !== tokenA.address && token.address !== tokenB.address) {
      intermediateTokens.push({
        address: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
      })
    }
  })

  // Intentar encontrar una ruta a través de cada token intermedio
  for (const intermediateToken of intermediateTokens) {
    console.log(`Checking route via ${intermediateToken.symbol}...`)

    try {
      // Para tokens nativos, usamos WCHZ en las consultas de pares
      const tokenAForPair = tokenA.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenA.address
      const tokenBForPair = tokenB.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenB.address

      // Check in main router first
      let pairAIntExists = await pairExists(tokenAForPair, intermediateToken.address, FACTORY_ADDRESS, provider)
      let pairIntBExists = await pairExists(intermediateToken.address, tokenBForPair, FACTORY_ADDRESS, provider)
      let pairAIntIsKayen = false
      let pairIntBIsKayen = false

      // If not in main router, check in Kayen router
      if (!pairAIntExists) {
        const kayenResult = await kayenRouteExists(tokenAForPair, intermediateToken.address, provider)
        pairAIntExists = kayenResult.exists
        pairAIntIsKayen = pairAIntExists
      }

      if (!pairIntBExists) {
        const kayenResult = await kayenRouteExists(intermediateToken.address, tokenBForPair, provider)
        pairIntBExists = kayenResult.exists
        pairIntBIsKayen = pairIntBExists
      }

      console.log(
        `${tokenA.symbol}-${intermediateToken.symbol} pair exists: ${pairAIntExists} (${pairAIntIsKayen ? "Kayen" : "Main"})`,
      )
      console.log(
        `${intermediateToken.symbol}-${tokenB.symbol} pair exists: ${pairIntBExists} (${pairIntBIsKayen ? "Kayen" : "Main"})`,
      )

      if (pairAIntExists && pairIntBExists) {
        // Obtener datos de ambos pares
        const [pairAInt, pairIntB] = await Promise.all([
          fetchPairData(tokenA, intermediateToken, provider, pairAIntIsKayen),
          fetchPairData(intermediateToken, tokenB, provider, pairIntBIsKayen),
        ])

        // Determinar las reservas correctas para cada par
        const tokenAForComparison = tokenA.address === ethers.ZeroAddress ? WCHZ_ADDRESS : tokenA.address
        const reservesAInt: [bigint, bigint] =
          tokenAForComparison.toLowerCase() === pairAInt.token0.address.toLowerCase()
            ? [pairAInt.reserve0, pairAInt.reserve1]
            : [pairAInt.reserve1, pairAInt.reserve0]

        const intermediateForComparison = intermediateToken.address
        const reservesIntB: [bigint, bigint] =
          intermediateForComparison.toLowerCase() === pairIntB.token0.address.toLowerCase()
            ? [pairIntB.reserve0, pairIntB.reserve1]
            : [pairIntB.reserve1, pairIntB.reserve0]

        console.log(`Found valid route via ${intermediateToken.symbol}!`)

        // Calcular la cantidad de salida a través de múltiples saltos
        const intermediateAmount = getAmountOut(actualAmountIn, reservesAInt[0], reservesAInt[1])
        const outputAmount = getAmountOut(intermediateAmount, reservesIntB[0], reservesIntB[1])

        // Para rutas multi-hop, calculamos el impacto en el precio de forma diferente
        // Sumamos el impacto en el precio de cada salto con un pequeño ajuste
        const priceImpactA = calculatePriceImpact(actualAmountIn, intermediateAmount, reservesAInt[0], reservesAInt[1])
        const priceImpactB = calculatePriceImpact(intermediateAmount, outputAmount, reservesIntB[0], reservesIntB[1])

        // El impacto total es un poco mayor que la suma de los impactos individuales
        const totalPriceImpact = priceImpactA + priceImpactB + 0.3 // 0.3% adicional por el riesgo del multi-hop

        return {
          exists: true,
          path: [tokenA, intermediateToken, tokenB],
          reserves: [reservesAInt, reservesIntB],
          isKayenRouter: pairAIntIsKayen || pairIntBIsKayen,
          outputAmount,
          priceImpact: totalPriceImpact,
        }
      }
    } catch (error) {
      console.error(`Error checking route via ${intermediateToken.symbol}:`, error)
      // Continuar con el siguiente token intermedio
    }
  }

  console.log("No valid route found")
  return { exists: false, path: [], reserves: [] }
}

// Función para calcular la cantidad de salida dado un monto de entrada
export function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  if (amountIn <= BigInt(0)) {
    throw new Error("INSUFFICIENT_INPUT_AMOUNT")
  }

  if (reserveIn <= BigInt(0) || reserveOut <= BigInt(0)) {
    throw new Error("INSUFFICIENT_LIQUIDITY")
  }

  const amountInWithFee = amountIn * BigInt(997)
  const numerator = amountInWithFee * reserveOut
  const denominator = reserveIn * BigInt(1000) + amountInWithFee

  return numerator / denominator
}

// Función para calcular la cantidad de salida a través de múltiples pares
export function getAmountOutMultiHop(amountIn: bigint, reserves: [bigint, bigint][]): bigint {
  let amount = amountIn

  for (const [reserveIn, reserveOut] of reserves) {
    amount = getAmountOut(amount, reserveIn, reserveOut)
  }

  return amount
}

// Función para calcular el impacto en el precio
export function calculatePriceImpact(
  amountIn: bigint,
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
): number {
  try {
    // Si las reservas son muy pequeñas, podemos tener un alto impacto en el precio
    if (reserveIn < amountIn * BigInt(100) || reserveOut < amountOut * BigInt(100)) {
      // Para pools con poca liquidez, estimamos un impacto basado en la proporción
      return (Number(amountIn) / Number(reserveIn)) * 100
    }

    // Precio medio del pool sin considerar fees
    const midPrice = Number(reserveOut) / Number(reserveIn)

    // Precio de ejecución (sin considerar fees)
    const executionPrice = Number(amountOut) / Number(amountIn)

    // Precio de ejecución teórico sin impacto (considerando el fee de 0.3%)
    const theoreticalPrice = midPrice * 0.997

    // Impacto en el precio como porcentaje
    // Es la diferencia entre el precio teórico y el precio real
    return Math.max(0, (1 - executionPrice / theoreticalPrice) * 100)
  } catch (error) {
    console.error("Error calculating price impact:", error)
    // En caso de error, devolvemos un valor conservador
    return 1.0
  }
}

// Función para crear información de trade
export function createTrade(
  amountIn: bigint,
  path: TokenInfo[],
  reserves: [bigint, bigint][],
  isKayenRouter = false,
  outputAmount?: bigint,
  calculatedPriceImpact?: number,
): TradeInfo {
  // Si tenemos una cantidad de salida y un impacto en el precio precalculados, los usamos
  if (outputAmount !== undefined && calculatedPriceImpact !== undefined) {
    // Calcular precio de ejecución
    const executionPrice = Number(outputAmount) / Number(amountIn)

    return {
      inputAmount: amountIn,
      outputAmount,
      executionPrice,
      priceImpact: calculatedPriceImpact,
      path: path.map((token) => (token.address === ethers.ZeroAddress ? WCHZ_ADDRESS : token.address)),
      isKayenRouter,
    }
  }

  // Si solo tenemos una cantidad de salida precalculada
  if (outputAmount !== undefined) {
    // Calcular precio de ejecución
    const executionPrice = Number(outputAmount) / Number(amountIn)

    // Para el impacto en el precio, usamos una aproximación si no tenemos reservas precisas
    let priceImpact = 0.5

    if (reserves.length > 0 && reserves[0][0] > BigInt(0) && reserves[0][1] > BigInt(0)) {
      priceImpact = calculatePriceImpact(amountIn, outputAmount, reserves[0][0], reserves[0][1])
    }

    return {
      inputAmount: amountIn,
      outputAmount,
      executionPrice,
      priceImpact,
      path: path.map((token) => (token.address === ethers.ZeroAddress ? WCHZ_ADDRESS : token.address)),
      isKayenRouter,
    }
  }

  // Si es una ruta directa
  if (path.length === 2 && reserves.length === 1) {
    const outputAmount = getAmountOut(amountIn, reserves[0][0], reserves[0][1])

    // Calcular precio de ejecución
    const executionPrice = Number(outputAmount) / Number(amountIn)

    // Calcular impacto en el precio
    const priceImpact = calculatePriceImpact(amountIn, outputAmount, reserves[0][0], reserves[0][1])

    return {
      inputAmount: amountIn,
      outputAmount,
      executionPrice,
      priceImpact,
      path: path.map((token) => (token.address === ethers.ZeroAddress ? WCHZ_ADDRESS : token.address)),
      isKayenRouter,
    }
  }
  // Si es una ruta con múltiples saltos
  else if (path.length > 2 && reserves.length === path.length - 1) {
    // Para calcular la cantidad de salida a través de múltiples saltos
    let amount = amountIn
    let totalPriceImpact = 0

    for (let i = 0; i < reserves.length; i++) {
      const [reserveIn, reserveOut] = reserves[i]
      const amountOut = getAmountOut(amount, reserveIn, reserveOut)

      // Calculamos el impacto en el precio para este salto
      const stepImpact = calculatePriceImpact(amount, amountOut, reserveIn, reserveOut)
      totalPriceImpact += stepImpact

      // La salida de este salto es la entrada del siguiente
      amount = amountOut
    }

    // Añadimos un pequeño factor adicional por el riesgo de múltiples saltos
    totalPriceImpact += 0.3 * (path.length - 2)

    // La cantidad final de salida
    const outputAmount = amount

    // Calcular precio de ejecución
    const executionPrice = Number(outputAmount) / Number(amountIn)

    return {
      inputAmount: amountIn,
      outputAmount,
      executionPrice,
      priceImpact: totalPriceImpact,
      path: path.map((token) => (token.address === ethers.ZeroAddress ? WCHZ_ADDRESS : token.address)),
      isKayenRouter,
    }
  } else {
    throw new Error("INVALID_PATH")
  }
}

// Función para calcular la cantidad mínima de salida con slippage
export function getMinimumAmountOut(amountOut: bigint, slippagePercentage: number): bigint {
  const slippageFactor = BigInt(Math.floor((1 - slippagePercentage / 100) * 10000)) / BigInt(10000)
  return amountOut * slippageFactor
}
