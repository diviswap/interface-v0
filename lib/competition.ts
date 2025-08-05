import { ethers } from "ethers"
import { getCompetitionRouterContract } from "./contracts"
import type { PublicClient, WalletClient } from "viem"

export interface CompetitionInfo {
  currentDayIndex: number
  currentDayStart: number
  competitionDuration: number
  dailyRewardPool: string
  pepperToken: string
  wchzToken: string
}

export interface LeaderboardEntry {
  user: string
  volume: string
}

export interface UserCompetitionData {
  volume: string
  estimatedReward: string
  hasClaimed: boolean
}

// Get current competition information
export async function getCompetitionInfo(publicClient: PublicClient): Promise<CompetitionInfo> {
  try {
    const provider = new ethers.BrowserProvider(publicClient as any)
    const competitionRouter = getCompetitionRouterContract(provider as any)

    const [currentDayIndex, currentDayStart, competitionDuration, dailyRewardPool, pepperToken, wchzToken] =
      await Promise.all([
        competitionRouter.currentDayIndex(),
        competitionRouter.currentDayStart(),
        competitionRouter.competitionDuration(),
        competitionRouter.dailyRewardPool(),
        competitionRouter.pepperToken(),
        competitionRouter.wchzToken(),
      ])

    return {
      currentDayIndex: Number(currentDayIndex),
      currentDayStart: Number(currentDayStart),
      competitionDuration: Number(competitionDuration),
      dailyRewardPool: ethers.formatUnits(dailyRewardPool, 18),
      pepperToken,
      wchzToken,
    }
  } catch (error) {
    console.error("Error getting competition info:", error)
    throw error
  }
}

// Get user volume for a specific day
export async function getUserVolume(
  dayIndex: number,
  userAddress: string,
  publicClient: PublicClient,
): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(publicClient as any)
    const competitionRouter = getCompetitionRouterContract(provider as any)

    // Check if the day exists in the competition
    const currentDay = await competitionRouter.currentDayIndex()
    const currentDayNumber = Number(currentDay)

    // Only allow querying days that exist (1 to currentDay)
    if (dayIndex < 1 || dayIndex > currentDayNumber) {
      console.log(`Day ${dayIndex} is out of range (1-${currentDayNumber})`)
      return "0"
    }

    const volume = await competitionRouter.getUserVolume(dayIndex, userAddress)
    return ethers.formatUnits(volume, 18)
  } catch (error) {
    console.error(`Error getting user volume for day ${dayIndex}:`, error)
    return "0"
  }
}

// Get leaderboard for a specific day
export async function getLeaderboard(dayIndex: number, publicClient: PublicClient): Promise<LeaderboardEntry[]> {
  try {
    const provider = new ethers.BrowserProvider(publicClient as any)
    const competitionRouter = getCompetitionRouterContract(provider as any)

    // Check if the day exists in the competition
    const currentDay = await competitionRouter.currentDayIndex()
    const currentDayNumber = Number(currentDay)

    // Only allow querying days that exist (1 to currentDay)
    if (dayIndex < 1 || dayIndex > currentDayNumber) {
      console.log(`Day ${dayIndex} is out of range (1-${currentDayNumber})`)
      return []
    }

    const [users, volumes] = await competitionRouter.getLeaderboard(dayIndex)

    const leaderboard: LeaderboardEntry[] = users.map((user: string, index: number) => ({
      user,
      volume: ethers.formatUnits(volumes[index], 18),
    }))

    // Sort by volume descending
    return leaderboard.sort((a, b) => Number.parseFloat(b.volume) - Number.parseFloat(a.volume))
  } catch (error) {
    console.error(`Error getting leaderboard for day ${dayIndex}:`, error)
    return []
  }
}

// Estimate reward for a user on a specific day
export async function estimateReward(
  dayIndex: number,
  userAddress: string,
  publicClient: PublicClient,
): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(publicClient as any)
    const competitionRouter = getCompetitionRouterContract(provider as any)

    // Check if the day exists in the competition
    const currentDay = await competitionRouter.currentDayIndex()
    const currentDayNumber = Number(currentDay)

    // Only allow querying days that exist (1 to currentDay)
    if (dayIndex < 1 || dayIndex > currentDayNumber) {
      console.log(`Day ${dayIndex} is out of range (1-${currentDayNumber})`)
      return "0"
    }

    const reward = await competitionRouter.estimateReward(dayIndex, userAddress)
    return ethers.formatUnits(reward, 18)
  } catch (error) {
    console.error(`Error estimating reward for day ${dayIndex}:`, error)
    return "0"
  }
}

// Check if user has claimed rewards for a specific day
export async function hasClaimedRewards(
  dayIndex: number,
  userAddress: string,
  publicClient: PublicClient,
): Promise<boolean> {
  try {
    const provider = new ethers.BrowserProvider(publicClient as any)
    const competitionRouter = getCompetitionRouterContract(provider as any)

    // Get the last claimed day for the user
    const lastClaimedDay = await competitionRouter.lastClaimedDay(userAddress)
    return Number(lastClaimedDay) >= dayIndex
  } catch (error) {
    console.error("Error checking claimed status:", error)
    return false
  }
}

// Get user competition data for a specific day
export async function getUserCompetitionData(
  dayIndex: number,
  userAddress: string,
  publicClient: PublicClient,
): Promise<UserCompetitionData> {
  try {
    const [volume, estimatedReward, hasClaimed] = await Promise.all([
      getUserVolume(dayIndex, userAddress, publicClient),
      estimateReward(dayIndex, userAddress, publicClient),
      hasClaimedRewards(dayIndex, userAddress, publicClient),
    ])

    return {
      volume,
      estimatedReward,
      hasClaimed,
    }
  } catch (error) {
    console.error("Error getting user competition data:", error)
    return {
      volume: "0",
      estimatedReward: "0",
      hasClaimed: false,
    }
  }
}

// Claim all available rewards for the user
export async function claimRewards(
  dayIndices: number[],
  walletClient: WalletClient,
): Promise<ethers.TransactionResponse> {
  try {
    const provider = new ethers.BrowserProvider(walletClient as any)
    const signer = await provider.getSigner()
    const competitionRouter = getCompetitionRouterContract(signer)

    console.log("Claiming all available rewards")

    // Simply call claimAllRewards without any parameters or gas options
    const tx = await competitionRouter.claimAllRewards()

    console.log("Claim rewards transaction sent:", tx.hash)
    return tx
  } catch (error) {
    console.error("Error claiming rewards:", error)
    throw error
  }
}

// Get claimable days for a user (days that are finished and not claimed)
export async function getClaimableDays(userAddress: string, publicClient: PublicClient): Promise<number[]> {
  try {
    const provider = new ethers.BrowserProvider(publicClient as any)
    const competitionRouter = getCompetitionRouterContract(provider as any)

    const competitionInfo = await getCompetitionInfo(publicClient)
    const currentDay = competitionInfo.currentDayIndex
    const claimableDays: number[] = []

    // Always allow claiming from the previous day (currentDay - 1)
    // This ensures users can always claim rewards regardless of other conditions
    const previousDay = Math.max(1, currentDay - 1)

    if (previousDay < currentDay) {
      const volume = await getUserVolume(previousDay, userAddress, publicClient)

      // If user has volume for the previous day, it's claimable
      if (Number.parseFloat(volume) > 0) {
        claimableDays.push(previousDay)
      }
    }

    return claimableDays
  } catch (error) {
    console.error("Error getting claimable days:", error)
    return []
  }
}

// Get total claimable rewards for a user
export async function getTotalClaimableRewards(userAddress: string, publicClient: PublicClient): Promise<string> {
  try {
    const claimableDays = await getClaimableDays(userAddress, publicClient)
    let totalRewards = 0

    for (const day of claimableDays) {
      const reward = await estimateReward(day, userAddress, publicClient)
      totalRewards += Number.parseFloat(reward)
    }

    return totalRewards.toString()
  } catch (error) {
    console.error("Error getting total claimable rewards:", error)
    return "0"
  }
}

// Get competition statistics
export async function getCompetitionStats(publicClient: PublicClient) {
  try {
    const competitionInfo = await getCompetitionInfo(publicClient)
    const currentDay = competitionInfo.currentDayIndex

    // Get current day leaderboard
    const currentLeaderboard = await getLeaderboard(currentDay, publicClient)

    // Calculate total volume for current day
    const totalVolume = currentLeaderboard.reduce((sum, entry) => sum + Number.parseFloat(entry.volume), 0)

    // Get time remaining in current day
    const currentTime = Math.floor(Date.now() / 1000)
    const dayEndTime = competitionInfo.currentDayStart + competitionInfo.competitionDuration
    const timeRemaining = Math.max(0, dayEndTime - currentTime)

    return {
      currentDay,
      totalVolume: totalVolume.toString(),
      participantCount: currentLeaderboard.length,
      dailyRewardPool: competitionInfo.dailyRewardPool,
      timeRemaining,
      leaderboard: currentLeaderboard.slice(0, 10), // Top 10
    }
  } catch (error) {
    console.error("Error getting competition stats:", error)
    return {
      currentDay: 0,
      totalVolume: "0",
      participantCount: 0,
      dailyRewardPool: "0",
      timeRemaining: 0,
      leaderboard: [],
    }
  }
}

// Get pending rewards directly from contract
export async function getPendingRewards(userAddress: string, publicClient: PublicClient): Promise<string> {
  try {
    const provider = new ethers.BrowserProvider(publicClient as any)
    const competitionRouter = getCompetitionRouterContract(provider as any)

    console.log("Getting pending rewards for user:", userAddress)
    const pendingRewards = await competitionRouter.pendingRewards(userAddress)
    const formattedRewards = ethers.formatUnits(pendingRewards, 18)

    console.log("Pending rewards from contract:", formattedRewards)
    return formattedRewards
  } catch (error) {
    console.error("Error getting pending rewards:", error)
    return "0"
  }
}
