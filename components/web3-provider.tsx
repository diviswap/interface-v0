"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"

type Web3ContextType = {
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  account: string | null
  chainId: number | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
  isWrongNetwork: boolean
  switchToChilizChain: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
  isWrongNetwork: false,
  switchToChilizChain: async () => {},
})

export const useWeb3 = () => useContext(Web3Context)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)

  const CHILIZ_CHAIN_ID = 88888
  const CHILIZ_CHAIN_CONFIG = {
    chainId: `0x${CHILIZ_CHAIN_ID.toString(16)}`,
    chainName: "Chiliz Chain",
    nativeCurrency: {
      name: "CHZ",
      symbol: "CHZ",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.chiliz.com"],
    blockExplorerUrls: ["https://explorer.chiliz.com"],
  }

  const switchToChilizChain = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHILIZ_CHAIN_CONFIG.chainId }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [CHILIZ_CHAIN_CONFIG],
            })
          } catch (addError) {
            console.error("Failed to add Chiliz Chain", addError)
          }
        }
      }
    }
  }

  const connect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

        const ethersProvider = new ethers.BrowserProvider(window.ethereum)
        const ethersSigner = await ethersProvider.getSigner()
        const network = await ethersProvider.getNetwork()

        setProvider(ethersProvider)
        setSigner(ethersSigner)
        setAccount(accounts[0])
        setChainId(Number(network.chainId))
        setIsConnected(true)

        const currentChainId = Number(network.chainId)
        setIsWrongNetwork(currentChainId !== CHILIZ_CHAIN_ID)

        if (currentChainId !== CHILIZ_CHAIN_ID) {
          await switchToChilizChain()
        }
      } catch (error) {
        console.error("Failed to connect to wallet", error)
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet")
    }
  }

  const disconnect = () => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setChainId(null)
    setIsConnected(false)
    setIsWrongNetwork(false)

    if (typeof window !== "undefined") {
      localStorage.removeItem("walletconnect")
      localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE")
    }
  }

  const refreshBalance = async () => {
    if (isConnected && provider && account && typeof window !== "undefined") {
      try {
        setTimeout(() => {
          const event = new CustomEvent("balanceUpdated", { detail: { account } })
          window.dispatchEvent(event)
        }, 0)
      } catch (error) {
        console.error("Error refreshing balance:", error)
      }
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && mounted) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== account) {
          setAccount(accounts[0])
        }
      }

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = Number.parseInt(chainIdHex, 16)
        setChainId(newChainId)
        setIsWrongNetwork(newChainId !== CHILIZ_CHAIN_ID)
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connect()
          }
        })
        .catch(console.error)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [account, mounted])

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnected,
        connect,
        disconnect,
        refreshBalance,
        isWrongNetwork,
        switchToChilizChain,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Provider
