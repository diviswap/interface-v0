export type Language = "en" | "es" | "pt" | "it" | "fr" | "tr" | "ja"

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
  flag: string
}

export interface TranslationKeys {
  // Navigation
  nav: {
    home: string
    swap: string
    pool: string
    launchpad: string
    competition: string
    charts: string
    academy: string
  }

  // Homepage
  home: {
    welcome: string
    subtitle: string
    startSwapping: string
    provideLiquidity: string
    features: string
    tokenomics: string
    frictionlessTrading: string
    frictionlessTradingDesc: string
    frictionlessTradingContent: string
    liquidityProvision: string
    liquidityProvisionDesc: string
    liquidityProvisionContent: string
    enhancedSecurity: string
    enhancedSecurityDesc: string
    enhancedSecurityContent: string
    lightningFast: string
    lightningFastDesc: string
    lightningFastContent: string
    analyticsDashboard: string
    analyticsDashboardDesc: string
    analyticsDashboardContent: string
    diviswapAcademy: string
    diviswapAcademyDesc: string
    diviswapAcademyContent: string
    goToSwap: string
    goToPool: string
    viewAudits: string
    learnMore: string
    viewCharts: string
    startLearning: string
    tokenDistribution: string
    communityAllocation: string
    liquidityPool: string
    diviswapLaunchpad: string
    diviswapKewl: string
    developmentMaintenance: string
    liquidityIncentives: string
    marketing: string
    tokenFeatures: string
    keyFeatures: string
    governance: string
    governanceDesc: string
    staking: string
    stakingDesc: string
    feeSharing: string
    feeSharingDesc: string
    priorityAccess: string
    priorityAccessDesc: string
    deflationary: string
    deflationaryDesc: string
  }

  swap: {
    title: string
    subtitle: string
    tradeDescription: string
    from: string
    to: string
    balance: string
    max: string
    selectToken: string
    enterAmount: string
    swapTokens: string
    approve: string
    approving: string
    swap: string
    swapping: string
    transactionSettings: string
    slippageTolerance: string
    transactionDeadline: string
    minutes: string
    priceImpact: string
    minimumReceived: string
    liquidityProviderFee: string
    route: string
    noLiquidity: string
    insufficientLiquidity: string
    insufficientBalance: string
    enterValidAmount: string
    selectBothTokens: string
    cannotSwapSameToken: string
    priceUpdated: string
    acceptPriceUpdate: string
    swapAnyway: string
    confirmSwap: string
    swapConfirmation: string
    youAreSelling: string
    youAreBuying: string
    outputEstimated: string
    transactionWillRevert: string
    poweredByChiliz: string
    builtOnChiliz: string
    competitionBadge: {
      title: string
      description: string
    }
    errors: {
      pairDoesNotExist: string
      noRouteFound: string
      insufficientLiquidity: string
      unableToGetQuote: string
      transactionFailed: string
      approvalFailed: string
      swapFailed: string
    }
    success: {
      approvalSuccess: string
      swapSuccess: string
    }
  }

  // Pool section added
  pool: {
    title: string
    subtitle: string
    liquidityPools: string
    yourLiquidity: string
    addLiquidity: string
    removeLiquidity: string
    createPair: string
    importPool: string
    poolNotFound: string
    noLiquidityFound: string
    yourLiquidityPositions: string
    totalLiquidity: string
    poolShare: string
    pooledTokens: string
    add: string
    remove: string
    deposit: string
    withdraw: string
    firstLiquidityProvider: string
    firstLiquidityProviderDesc: string
    priceAndPoolShare: string
    shareOfPool: string
    outputEstimated: string
    transactionWillRevert: string
    liquidityProviderReward: string
    liquidityProviderRewardDesc: string
    confirmSupply: string
    supplyConfirmation: string
    youWillReceive: string
    lpTokensInWallet: string
    positionWillAppear: string
    connectWalletToView: string
    noLiquidityPositions: string
    createFirstPosition: string
    allPools: string
    searchPools: string
    filterByToken: string
    volume24h: string
    fees24h: string
    apr: string
    myLiquidity: string
    availablePools: string
    topPools: string
    recentlyAdded: string
    highestApr: string
    mostVolume: string
    errors: {
      insufficientBalance: string
      invalidAmount: string
      pairNotFound: string
      noLiquidity: string
      transactionFailed: string
      approvalFailed: string
      addLiquidityFailed: string
      removeLiquidityFailed: string
    }
    success: {
      liquidityAdded: string
      liquidityRemoved: string
      approvalSuccess: string
    }
    confirmation: {
      liquidityAdded: string
      liquidityRemoved: string
      transactionConfirmed: string
      youAdded: string
      youReceived: string
      poolShare: string
      lpTokensBurned: string
      network: string
      transactionHash: string
      viewOnExplorer: string
    }
  }

  charts: {
    title: string
    subtitle: string
    marketAnalysis: string
    poweredBy: string
    selectPool: string
    price: string
    liquidity: string
    volume: string
    tvl: string
    change24h: string
    viewChart: string
    dataDisclaimer: string
    noDataAvailable: string
    loadingCharts: string
    popularPools: string
    mostActivePools: string
    pool: string
    refreshing: string
  }

  presale: {
    statistics: string
    totalTokens: string
    tokensSold: string
    fundsRaised: string
    tokenPrice: string
    tokenDistribution: string
    yourParticipation: string
    tokensPurchased: string
    chzContributed: string
    stablecoinContributed: string
    estimatedBonusTokens: string
    bonusTokensDesc: string
    notParticipated: string
    purchaseTokensNow: string
    sold: string
    remaining: string
    amount: string
  }

  // Launchpad section added
  launchpad: {
    title: string
    subtitle: string
    presaleEnds: string
    progress: string
    price: string
    perToken: string
    timeRemaining: string
    yourContribution: string
    noContribution: string
    connectWalletToView: string
    information: string
    purchaseTokens: string
    statistics: string
    disclaimer: string
    disclaimerTitle: string
    disclaimerText: string
    projectInfo: {
      title: string
      description: string
      tokenSymbol: string
      totalSupply: string
      presaleAllocation: string
      listingPrice: string
      softCap: string
      hardCap: string
    }
    purchase: {
      selectPayment: string
      enterAmount: string
      youWillReceive: string
      minimumPurchase: string
      maximumPurchase: string
      purchaseNow: string
      purchasing: string
      connectWallet: string
      presaleEnded: string
      insufficientBalance: string
      invalidAmount: string
    }
    stats: {
      totalRaised: string
      participants: string
      averageContribution: string
      timeLeft: string
      nextPhase: string
    }
  }

  // Competition section added
  competition: {
    title: string
    subtitle: string
    leaderboards: string
    rankingDescription: string
    daily: string
    weekly: string
    monthly: string
    rank: string
    user: string
    volume: string
    trades: string
    rewards: string
    you: string
    competitionToken: string
    contractAddress: string
    tradePepper: string
    yourRewards: string
    availableToClaim: string
    claimRewards: string
    claiming: string
    howToParticipate: string
    connectYourWallet: string
    connectWalletDesc: string
    getTokens: string
    getTokensDesc: string
    tradeToken: string
    tradeTokenDesc: string
    termsConditions: string
    fairPlayPolicy: string
    fairPlayDesc: string
    organizedBy: string
    rules: {
      volumeBased: string
      rewardsDistributed: string
      manualClaim: string
    }
  }

  // Common
  common: {
    connectWallet: string
    connect: string
    disconnect: string
    connected: string
    balance: string
    copyright: string
    loading: string
    copyAddress: string
    copied: string
    addressCopied: string
    failedToCopy: string
    viewOnExplorer: string
    chooseWallet: string
    termsAgreement: string
    // Adding PWA installation instruction types
    installApp?: string
    installIOSInstructions?: string
    installAndroidInstructions?: string
    walletDescriptions: {
      metamask: string
      walletconnect: string
      coinbase: string
      default: string
    }
  }
}
