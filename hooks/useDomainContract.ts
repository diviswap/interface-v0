"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useWeb3 } from "@/components/web3-provider"

// Domain contract ABI (simplified to only include the functions we need)
const DOMAIN_ABI = [
  "function getDomainByAddress(address addr) view returns (tuple(bool isValid, bool isTLD, bool useDefaultAvatar, uint64 ttl, uint256 strategy, uint256 labelHash, uint256 createdDate, uint256 registrationDate, uint256 expirationDate, uint256 length, uint256 segmentLength, uint256 xp, address owner, address manager, address resolver, string name, string label, string url, string avatar, string contentHash, string description, bytes encodedName, tuple(string color0, string color1, string color2, string color3) colors, bytes32 namehash, bytes32 labelHashHex, bytes32 parent, tuple(bool isValid, string entryKey, string entryValue)[] addresses, tuple(bool isValid, string recordKey, string recordType, string recordValue)[] records, tuple(uint256 index, string name, bytes32 namehash)[] subdomains, tuple(uint256 xp, address asset, address tokenId)[] extras) domain)",
]

// Domain contract address
const DOMAIN_CONTRACT_ADDRESS = "0x1C55a6e9A736C6d86d9ff1ba4700e64583c18f50"

export function useDomainContract() {
  const { provider } = useWeb3()
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  useEffect(() => {
    if (!provider) return

    const domainContract = new ethers.Contract(DOMAIN_CONTRACT_ADDRESS, DOMAIN_ABI, provider)

    setContract(domainContract)
  }, [provider])

  return contract
}

export function useDomainName(address: string | null) {
  const [domainName, setDomainName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const domainContract = useDomainContract()

  useEffect(() => {
    if (!domainContract || !address) {
      setDomainName(null)
      return
    }

    const fetchDomainName = async () => {
      setIsLoading(true)
      try {
        const domainInfo = await domainContract.getDomainByAddress(address)

        // Check if the domain is valid and has a name
        if (domainInfo && domainInfo.isValid && domainInfo.name) {
          setDomainName(domainInfo.name)
        } else {
          setDomainName(null)
        }
      } catch (error) {
        console.error("Error fetching domain name:", error)
        setDomainName(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDomainName()
  }, [domainContract, address])

  return { domainName, isLoading }
}
