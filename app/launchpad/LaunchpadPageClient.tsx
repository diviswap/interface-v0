"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Rocket, Clock, Target, Users, DollarSign, TrendingUp } from "lucide-react"
import { ethers } from "ethers"
import { PRESALE_ABI } from "@/lib/presale-abi"

// Dirección del contrato de presale actualizada
const PRESALE_CONTRACT_ADDRESS = "0x0c19d6F5d993031ABa0916894009E34e6964AA88"

interface PresaleStats {
  totalRaised: string
  hardCap: string
  softCap: string
  rate: string
  startTime: number
  endTime: number
  isActive: boolean
  isFinalized: boolean
}

interface UserInfo {
  contribution: string
  claimed: boolean
}

export default function LaunchpadPageClient() {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string>("")
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [presaleStats, setPresaleStats] = useState<PresaleStats | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [error, setError] = useState<string>("")

  // Conectar wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        console.log("Conectando wallet...")
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })

        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          console.log("Wallet conectada:", accounts[0])
          await loadUserInfo(accounts[0])
        }
      } else {
        setError("MetaMask no está instalado")
      }
    } catch (error) {
      console.error("Error conectando wallet:", error)
      setError("Error conectando wallet")
    }
  }

  // Cargar estadísticas de la presale
  const loadPresaleStats = async () => {
    try {
      console.log("Cargando estadísticas de presale...")
      console.log("Dirección del contrato:", PRESALE_CONTRACT_ADDRESS)

      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider)

        console.log("Contrato inicializado:", contract.target)

        const [totalRaised, hardCap, softCap, rate, startTime, endTime, isActive, isFinalized] = await Promise.all([
          contract.totalRaised(),
          contract.hardCap(),
          contract.softCap(),
          contract.rate(),
          contract.startTime(),
          contract.endTime(),
          contract.isActive(),
          contract.isFinalized(),
        ])

        const stats: PresaleStats = {
          totalRaised: ethers.formatEther(totalRaised),
          hardCap: ethers.formatEther(hardCap),
          softCap: ethers.formatEther(softCap),
          rate: rate.toString(),
          startTime: Number(startTime),
          endTime: Number(endTime),
          isActive,
          isFinalized,
        }

        console.log("Estadísticas cargadas:", stats)
        setPresaleStats(stats)
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
      setError("Error cargando estadísticas de la presale")
    }
  }

  // Cargar información del usuario
  const loadUserInfo = async (userAddress: string) => {
    try {
      console.log("Cargando información del usuario:", userAddress)

      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const contract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, provider)

        const [contribution, claimed] = await Promise.all([
          contract.contributions(userAddress),
          contract.claimed(userAddress),
        ])

        const info: UserInfo = {
          contribution: ethers.formatEther(contribution),
          claimed,
        }

        console.log("Información del usuario cargada:", info)
        setUserInfo(info)
      }
    } catch (error) {
      console.error("Error cargando información del usuario:", error)
    }
  }

  // Comprar tokens
  const handlePurchase = async () => {
    if (!purchaseAmount || !isConnected) return

    setIsLoading(true)
    setError("")

    try {
      console.log("Iniciando compra de tokens...")
      console.log("Cantidad:", purchaseAmount, "CHZ")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer)

      const value = ethers.parseEther(purchaseAmount)
      console.log("Valor en wei:", value.toString())

      const tx = await contract.buyTokens({
        value,
        gasLimit: 300000,
      })

      console.log("Transacción enviada:", tx.hash)
      await tx.wait()
      console.log("Transacción confirmada")

      // Recargar datos
      await loadPresaleStats()
      await loadUserInfo(account)
      setPurchaseAmount("")
    } catch (error) {
      console.error("Error en la compra:", error)
      setError("Error al comprar tokens")
    } finally {
      setIsLoading(false)
    }
  }

  // Reclamar tokens
  const handleClaim = async () => {
    if (!isConnected) return

    setIsLoading(true)
    setError("")

    try {
      console.log("Reclamando tokens...")

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(PRESALE_CONTRACT_ADDRESS, PRESALE_ABI, signer)

      const tx = await contract.claimTokens({
        gasLimit: 200000,
      })

      console.log("Transacción de reclamo enviada:", tx.hash)
      await tx.wait()
      console.log("Tokens reclamados exitosamente")

      // Recargar información del usuario
      await loadUserInfo(account)
    } catch (error) {
      console.error("Error reclamando tokens:", error)
      setError("Error al reclamar tokens")
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular progreso
  const getProgress = () => {
    if (!presaleStats) return 0
    const raised = Number.parseFloat(presaleStats.totalRaised)
    const cap = Number.parseFloat(presaleStats.hardCap)
    return cap > 0 ? (raised / cap) * 100 : 0
  }

  // Formatear tiempo
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Verificar si la presale está activa
  const isPresaleActive = () => {
    if (!presaleStats) return false
    const now = Math.floor(Date.now() / 1000)
    return presaleStats.isActive && now >= presaleStats.startTime && now <= presaleStats.endTime
  }

  // Inicializar datos
  useEffect(() => {
    const initializeData = async () => {
      console.log("Inicializando datos de launchpad...")
      setIsInitializing(true)

      try {
        await loadPresaleStats()

        // Verificar si ya hay una wallet conectada
        if (typeof window.ethereum !== "undefined") {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          })

          if (accounts.length > 0) {
            setAccount(accounts[0])
            setIsConnected(true)
            await loadUserInfo(accounts[0])
          }
        }
      } catch (error) {
        console.error("Error inicializando:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeData()
  }, [])

  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando launchpad...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">FTK Token Launchpad</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Participa en la preventa de FTK Token y sé parte del futuro de DiviSwap
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información de la Presale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Información de la Presale
            </CardTitle>
            <CardDescription>Detalles y estadísticas de la preventa de FTK Token</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {presaleStats ? (
              <>
                {/* Progreso */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progreso</span>
                    <span className="text-sm text-muted-foreground">{getProgress().toFixed(1)}%</span>
                  </div>
                  <Progress value={getProgress()} className="h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{presaleStats.totalRaised} CHZ</span>
                    <span>{presaleStats.hardCap} CHZ</span>
                  </div>
                </div>

                <Separator />

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-2xl font-bold">{presaleStats.totalRaised}</div>
                    <div className="text-sm text-muted-foreground">CHZ Recaudados</div>
                  </div>

                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <div className="text-2xl font-bold">{presaleStats.rate}</div>
                    <div className="text-sm text-muted-foreground">FTK por CHZ</div>
                  </div>
                </div>

                {/* Tiempos */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Inicio:</strong> {formatTime(presaleStats.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Fin:</strong> {formatTime(presaleStats.endTime)}
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <div className="flex gap-2">
                  <Badge variant={isPresaleActive() ? "default" : "secondary"}>
                    {isPresaleActive() ? "Activa" : "Inactiva"}
                  </Badge>
                  {presaleStats.isFinalized && <Badge variant="outline">Finalizada</Badge>}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando información...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel de Compra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participar en la Presale
            </CardTitle>
            <CardDescription>Conecta tu wallet y compra FTK tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <div className="text-center py-8">
                <Button onClick={connectWallet} size="lg" className="w-full">
                  Conectar Wallet
                </Button>
              </div>
            ) : (
              <>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Wallet Conectada</div>
                  <div className="font-mono text-sm">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </div>
                </div>

                {userInfo && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Tu Contribución:</span>
                      <span className="font-medium">{userInfo.contribution} CHZ</span>
                    </div>

                    {Number.parseFloat(userInfo.contribution) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm">Tokens a Recibir:</span>
                        <span className="font-medium">
                          {presaleStats
                            ? (Number.parseFloat(userInfo.contribution) * Number.parseFloat(presaleStats.rate)).toFixed(
                                2,
                              )
                            : "0"}{" "}
                          FTK
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {isPresaleActive() ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cantidad a Invertir (CHZ)</label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      onClick={handlePurchase}
                      disabled={!purchaseAmount || isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? "Procesando..." : "Comprar Tokens"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">La presale no está activa en este momento</p>

                    {userInfo &&
                      Number.parseFloat(userInfo.contribution) > 0 &&
                      !userInfo.claimed &&
                      presaleStats?.isFinalized && (
                        <Button onClick={handleClaim} disabled={isLoading} className="w-full" size="lg">
                          {isLoading ? "Procesando..." : "Reclamar Tokens"}
                        </Button>
                      )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
