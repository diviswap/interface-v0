import { ethers } from "ethers"

// Network
export const CHILIZ_CHAIN_ID = 88888 // Replace with the actual Chiliz Chain ID

// Contract addresses - Usar SOLO las direcciones de DiviSwap
export const FACTORY_ADDRESS = "0xBDd9c322Ecf401E09C9D2Dca3be46a7E45d48BB1" // DiviSwap Factory
export const ROUTER_ADDRESS = "0xC4E14363A01B7725532e099a67DbD17617FB7485" // DiviSwap Router

// Adding competition router address
export const COMPETITION_ROUTER_ADDRESS = "0x2DfB3288EbFFDa80dEc4394568E20d7408156B89" // Competition Router with PEPPER rewards

// Kayen Router and Factory Addresses
export const KAYEN_ROUTER_ADDRESS = "0x1918EbB39492C8b98865c5E53219c3f1AE79e76F"
export const KAYEN_FACTORY_ADDRESS = "0x7Bc2Ff3a7e4a9B2B75E1F9d2e5B0F0E9E4D3F8a9"

export const WCHZ_ADDRESS = "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47"
// Add this line to fix the error - WETH_ADDRESS is an alias for WCHZ_ADDRESS in Chiliz Chain
export const WETH_ADDRESS = WCHZ_ADDRESS

// Adding PEPPER token address for competition
export const PEPPER_TOKEN_ADDRESS = "0x60f397acbcfb8f4e3234c659a3e10867e6fa6b67"

// Token List
export const TOKEN_LIST = [
  {
    chainId: 88888,
    address: "0x0000000000000000000000000000000000000000", // Native CHZ
    name: "Chiliz",
    symbol: "CHZ",
    decimals: 18,
    logoURI: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rHJrCRLDtphuSlEN06yGYcJTuo2kpg.png",
  },
  {
    chainId: 88888,
    address: "0x677F7e16C7Dd57be1D4C8aD1244883214953DC47", // WCHZ
    name: "Wrapped Chiliz",
    symbol: "WCHZ",
    decimals: 18,
    logoURI: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rHJrCRLDtphuSlEN06yGYcJTuo2kpg.png",
  },
  {
    chainId: 88888,
    address: "0x2eBEc8E89BB4B9C3681BE4eAA85C391F1cd717cE",
    name: "DiviSwap",
    symbol: "DSwap",
    decimals: 18,
    logoURI: "https://ipfs.io/ipfs/bafkreifgof7st3jht6t4yftbp73prddatdtpfnzlgtisa6dbwgmnv3n7ba",
  },
  {
    chainId: 88888,
    address: "0xa37936f56249965d407e39347528a1a91eb1cbef",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI: "/images/usdc-logo.png",
  },
  {
    chainId: 88888,
    address: "0x37C57a89812a0D492AeEd7691F1610CA0a8f74A1",
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x37c57a89812a0d492aeed7691f1610ca0a8f74a1/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x60f397acbcfb8f4e3234c659a3e10867e6fa6b67",
    name: "PEPPER",
    symbol: "PEPPER",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x60f397acbcfb8f4e3234c659a3e10867e6fa6b67/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xEd5740209FcF6974d6f3a5F11e295b5E468aC27c",
    name: "KEWL Exchange",
    symbol: "KWL",
    decimals: 18,
    logoURI: "https://ipfs.io/ipfs/QmUHodryMTDtqFUgMHUtVGdH3uwpzPPhBQm4zdpmA9MbCU",
  },
  {
    chainId: 88888,
    address: "0x8c0b6ea89DABA6516df9437a60cA481501781606",
    name: "KAYEN Token",
    symbol: "KAYEN",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x8c0b6ea89daba6516df9437a60ca481501781606/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xa0402bCeEE4Cc5F7eAEF8ab2969aD3Bfcd14A683",
    name: "ChlixAI",
    symbol: "CHXAI",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xa0402bceee4cc5f7eaef8ab2969ad3bfcd14a683/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x60cfC65BA14C2f8B111Fc7B152bB11486FDEa822",
    name: "FanFanToken",
    symbol: "FANFAN",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x60cfc65ba14c2f8b111fc7b152bb11486fdea822/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xF3928e7871eb136DD6648Ad08aEEF6B6ea893001",
    name: "ChilizInu",
    symbol: "CHZINU",
    decimals: 4,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/d490f4ee4a9273906fb2f3f9a87a7fe24f29dea6/chiliz/tokens/0xf3928e7871eb136dd6648ad08aeef6b6ea893001/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x1291f5a7B6204155255C868378c246b0E65110F6",
    name: "CHILIZ TURTLE",
    symbol: "CHZTRTLE",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x1291f5a7b6204155255c868378c246b0e65110f6/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xEfDd09582498184d14aF330e1B02d0c8d63aFED5",
    name: "PUMLx",
    symbol: "PUMLx",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xefdd09582498184d14af330e1b02d0c8d63afed5/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xc2661815c69c2b3924d3dd0c2c1358a1e38a3105",
    name: "Paris Saint-Germain Fan Token",
    symbol: "PSG",
    decimals: 0,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/d490f4ee4a9273906fb2f3f9a87a7fe24f29dea6/chiliz/tokens/0xc2661815c69c2b3924d3dd0c2c1358a1e38a3105/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xfd3c73b3b09d418841dd6aff341b2d6e3aba433b",
    name: "FC Barcelona Fan Token",
    symbol: "BAR",
    decimals: 0,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/d490f4ee4a9273906fb2f3f9a87a7fe24f29dea6/chiliz/tokens/0xfd3c73b3b09d418841dd6aff341b2d6e3aba433b/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x6401b29f40a02578ae44241560625232a01b3f79",
    name: "Manchester City Fan Token",
    symbol: "CITY",
    decimals: 0,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/d490f4ee4a9273906fb2f3f9a87a7fe24f29dea6/chiliz/tokens/0x6401b29f40a02578ae44241560625232a01b3f79/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x6dab8fe8e5d425f2eb063aae58540aa04e273e0d",
    name: "Galatasaray Fan Token",
    symbol: "GAL",
    decimals: 0,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/d490f4ee4a9273906fb2f3f9a87a7fe24f29dea6/chiliz/tokens/0x6dab8fe8e5d425f2eb063aae58540aa04e273e0d/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x19ca0f4adb29e2130a56b9c9422150b5dc07f294",
    name: "OG Fan Token",
    symbol: "OG",
    decimals: 0,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/d490f4ee4a9273906fb2f3f9a87a7fe24f29dea6/chiliz/tokens/0x19ca0f4adb29e2130a56b9c9422150b5dc07f294/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xa6610b3361c4c0D206Aa3364cd985016c2d89386",
    name: "AS Roma Fan Token",
    symbol: "ASR",
    decimals: 0,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/d490f4ee4a9273906fb2f3f9a87a7fe24f29dea6/chiliz/tokens/0xa6610b3361c4c0d206aa3364cd985016c2d89386/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x454038003a93cf44766af352f74bad6b745616d0",
    name: "Juventus Fan Token",
    symbol: "JUV",
    decimals: 0,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/d490f4ee4a9273906fb2f3f9a87a7fe24f29dea6/chiliz/tokens/0x454038003a93cf44766af352f74bad6b745616d0/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x8b8454ad0bc75C3C4bECb250b48D9a2072Fd55E3",
    name: "Wrapped Sharks",
    symbol: "WSHARKS",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x1f5ed1182b673338ecff0eeab13ed79ceaf775f5/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x2EA082e1053f05EfFEB8E28c350fa0ff8fe78538",
    name: "Wrapped Tigres",
    symbol: "WTIGRES",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xf17b1e028537aba705433f7cebdca881b5c5b79e/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xf6Bebad8bE7bb9ce05b9A71b9ab62E2e7fA58e9f",
    name: "Wrapped Tottenham Hotspur",
    symbol: "WSPURS",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x93d84ff2c5f5a5a3d7291b11af97679e75eeac92/logo.svg",
  },
  {
    chainId: 88888,
    address: "0x5667DDD9764d1873D7a1bc15bc091a8B8a88EF1d",
    name: "Wrapped Novara Calcio",
    symbol: "WNOV",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xe6bd000d6608e1e5d1476a96e7cb63c335c595a9/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xB00d2468FB7471D080Ec301dcD1E12e334A1d9a3",
    name: "Wrapped Chivas",
    symbol: "W$CHVS",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xf66288961a3495ea9140fbd7c69e70a59db08b16/logo.svg",
  },
  {
    chainId: 88888,
    address: "0xdc9cAd4bceb669E823aEB30e80F2d124b0a58b6b",
    name: "Wrapped Johor Darul Tazim F.C",
    symbol: "WJDT",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x12129ad866906ab5aa456ae1ebaea9e8a13e8197/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Goztepe S.K.",
    symbol: "WGOZ",
    address: "0x71103f7892c6c5BeCC135A22aFa9F021D905B750",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x0e469d1c78421c7952e4d9626800dad22f45361d/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Roush Fenway Facing",
    symbol: "WROUSH",
    address: "0x369C0bf5B24cfc088BD1E634ecDF95F786DBF5CB",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xba20ef1670393150d1c1b135f45043740ec3a729/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Paris Saint-Germain",
    symbol: "WPSG",
    address: "0x476eF844B3E8318b3bc887a7db07a1A0FEde5557",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xc2661815c69c2b3924d3dd0c2c1358a1e38a3105/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Valencia CF",
    symbol: "WVCF",
    address: "0xf9ae77D7658ad1a1Ff49Ca4D082fEDb680A83373",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xba0c26485b1909f80476067272d74a99cc0e1d57/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Alfa Romeo Racing ORLEN",
    symbol: "WSAUBER",
    address: "0x9632E5D03Bb7568b68096AbF34B1367B87295d82",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xcf6d626203011e5554c82babe17dd7cdc4ee86bf/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Portugal National Team",
    symbol: "WPOR",
    address: "0x804C701c3d548d68773e4E06c76C03aFa0e32d42",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xffad7930b474d45933c93b83a2802204b8787129/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Alanyaspor",
    symbol: "WALA",
    address: "0x685Ba5134F373785263DB5a5BC5CFF686264500b",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x863f7537b38130f01a42e9e9406573b1f1e309f7/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Vitality",
    symbol: "WVIT",
    address: "0x82E159F2704A9d00f2079be89Dc1d6c499536957",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x1754bbc90f8c004edbacc59e41aa4be7a36b5d5b/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped AS Monaco",
    symbol: "WASM",
    address: "0x7Ad193240F89b2f60c087eb9aebcf64139Dd7b89",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x371863096cf5685cd37ae00c28de10b6edbab3fe/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Clube Atlético Mineiro",
    symbol: "WGALO",
    address: "0xb7ff11AA7612e8c04A276dFEa3ff95fFc9724EA1",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xe5274eb169e0e3a60b9dc343f02ba940958e8683/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped BSC Young Boys",
    symbol: "WYBO",
    address: "0xd14f7b7fD6D18A16c4f0c678E301a783D36a2BF0",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x0dc1776c56ffd3a046134be6fdc23a3214359329/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped AS Roma",
    symbol: "WASR",
    address: "0x36C8239aabd0C6F7856B20aD9DEEb5080adAf0fb",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xa6610b3361c4c0d206aa3364cd985016c2d89386/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Bologna FC",
    symbol: "WBFC",
    address: "0x3Bce6c975Ed6Ed39aB80daC8774E5A6CE0E58515",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x319067e6253fdbf183c27abcaf31d45ad50e98ff/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Aston Villa",
    symbol: "WAVL",
    address: "0xC8f1C7267F7c362A178EB94Ac74877ea2F6c034c",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x095726841dc9bf395114ac83f8fd42b176cfad10/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Manchester City FC",
    symbol: "WCITY",
    address: "0x368F1EB2E4FA30C1C5957980C576Df6163575416",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x6401b29f40a02578ae44241560625232a01b3f79/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Professional Fighters League",
    symbol: "WPFL",
    address: "0x9b18841FE851f5B4b9400E67602eC2FE65aaaE0a",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xde05490b7ac4b86e54eff43f4f809c3a7bb16564/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Alliance",
    symbol: "WALL",
    address: "0x1eb33b4243691f6FFbE0f77BBEa3be1C6b26E43E",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xc5c0d1e98d9b1398a37c82ed81086674baef2a72/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped Aston Martin Cognizant",
    symbol: "WAM",
    address: "0xE51a3c216afB6e7c9BeBb4968CD4A8d1E0E99F77",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0x3757951792edfc2ce196e4c06cffd04027e87403/logo.svg",
  },
  {
    chainId: 88888,
    name: "Wrapped FC Barcelona",
    symbol: "WBAR",
    address: "0xbaAAEF59F4A6C11cC87FF75EAa7a386e753b2666",
    decimals: 18,
    logoURI:
      "https://raw.githubusercontent.com/kewlexchange/assets/main/chiliz/tokens/0xfd3c73b3b09d418841dd6aff341b2d6e3aba433b/logo.svg",
  },
]

// Common tokens (most frequently used)
export const COMMON_TOKENS = [
  TOKEN_LIST[0], // CHZ (Native)
  TOKEN_LIST[1], // WCHZ
  TOKEN_LIST[2], // DSwap
  TOKEN_LIST[3], // USDC (Nuevo)
  TOKEN_LIST[4], // USDT
  TOKEN_LIST[5], // PEPPER
]

// Default token (CHZ)
export const DEFAULT_TOKEN = TOKEN_LIST[0]

// Replace the fetchTokenList function with a function that returns the static list
export function fetchTokenList() {
  return Promise.resolve(TOKEN_LIST)
}

// ABIs
export const FACTORY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
    ],
    name: "getPair",
    outputs: [{ internalType: "address", name: "pair", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "tokenA", type: "address" },
      { internalType: "address", name: "tokenB", type: "address" },
    ],
    name: "createPair",
    outputs: [{ internalType: "address", name: "pair", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "setFeeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "setFeeToSetter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "feeTo",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeToSetter",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "allPairsLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "allPairs",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export const ROUTER_ABI = [
  // Factory functions
  "function factory() external view returns (address)",
  "function WETH() external view returns (address)",

  // Add liquidity functions
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)",

  // Remove liquidity functions
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
  "function removeLiquidityETH(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external returns (uint amountToken, uint amountETH)",
  "function removeLiquidityWithPermit(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) external returns (uint amountA, uint amountB)",
  "function removeLiquidityETHWithPermit(address token, uint liquidity, uint amountTokenMin, uint amountETHMin, address to, uint deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) external returns (uint amountToken, uint amountETH)",

  // Swap functions
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapTokensForExactETH(uint amountOut, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",

  // Price calculation functions
  "function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB)",
  "function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut)",
  "function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) external pure returns (uint amountIn)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
]

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function transfer(address, uint256) returns (bool)",
  "function transferFrom(address, address, uint256) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
]

export const PAIR_ABI = [
  // ERC20 functions
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint)",
  "function balanceOf(address owner) external view returns (uint)",
  "function allowance(address owner, address spender) external view returns (uint)",
  "function approve(address spender, uint value) external returns (bool)",
  "function transfer(address to, uint value) external returns (bool)",
  "function transferFrom(address from, address to, uint value) external returns (bool)",

  // Pair-specific functions
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function mint(address to) external returns (uint liquidity)",
  "function burn(address to) external returns (uint amount0, uint amount1)",
  "function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external",
  "function skim(address to) external",
  "function sync() external",
  "function initialize(address, address) external",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external",

  // Events
  "event Mint(address indexed sender, uint amount0, uint amount1)",
  "event Burn(address indexed sender, uint amount0, uint amount1, address indexed to)",
  "event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)",
  "event Sync(uint112 reserve0, uint112 reserve1)",
]

// Add WETH ABI
export const WETH_ABI = [
  "function deposit() external payable",
  "function withdraw(uint) external",
  "function totalSupply() external view returns (uint)",
  "function approve(address guy, uint wad) external returns (bool)",
  "function transfer(address dst, uint wad) external returns (bool)",
  "function transferFrom(address src, address dst, uint wad) external returns (bool)",
]

// Default slippage tolerance
export const DEFAULT_SLIPPAGE = 0.5 // 0.5%

// Transaction deadline (minutes)
export const DEFAULT_DEADLINE_MINUTES = 20

// Gas price settings
export const GAS_PRICE = {
  low: ethers.parseUnits("4", "gwei"),
  medium: ethers.parseUnits("5.6", "gwei"),
  high: ethers.parseUnits("7.2", "gwei"),
}
