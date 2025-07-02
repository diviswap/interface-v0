export const PRESALE_ABI = [
  // Events
  "event TokensPurchased(address indexed buyer, uint256 chzAmount, uint256 usdcAmount, uint256 tokensReceived)",
  "event PresaleExtended(uint256 oldEndTime, uint256 newEndTime)",
  "event TreasuryWalletChanged(address indexed oldWallet, address indexed newWallet)",
  "event UnsoldTokensRecovered(uint256 amount)",
  "event ERC20TokensRecovered(address indexed tokenContract, uint256 amount)",
  "event PresalePaused(address indexed owner)",
  "event PresaleUnpaused(address indexed owner)",

  // View functions
  "function calculateTokensForChz(uint256 chzAmount) public view returns(uint256 usdcAmount, uint256 tokensToReceive)",
  "function getUserInfo(address user) external view returns (uint256, uint256, uint256, uint256)",
  "function getPresaleStats() external view returns (uint256 endTime, uint256 totalTokens, uint256 soldTokens, uint256 remainingTokens, uint256 tokenPrice)",
  "function isPresaleEnded() public view returns (bool)",

  // State variables
  "function tokenPriceInUsdc() public view returns (uint256)",
  "function saleEndTime() public view returns (uint256)",
  "function totalTokensForSale() public view returns (uint256)",
  "function totalTokensSold() public view returns (uint256)",
  "function totalStableCoinRaised() public view returns (uint256)",
  "function stableCoinHardCap() public view returns (uint256)",

  // Transaction functions
  "function purchaseTokens() public payable",
  "function purchaseTokensWithStablecoin(uint256 amount, bool isUsdc) external",
]

// Alternative export for compatibility
export const PresaleABI = PRESALE_ABI
