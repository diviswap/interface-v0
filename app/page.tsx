import type { Metadata } from "next"
import { CardFooter } from "@/components/ui/card"
import Link from "next/link"
import {
  ArrowRight,
  ArrowLeftRight,
  Droplets,
  Shield,
  Zap,
  BarChartIcon as ChartBar,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnimatedTextCycle from "@/components/ui/animated-text-cycle"

export const metadata: Metadata = {
  title: "DiviSwap | Decentralized Exchange on Chiliz Chain",
  description:
    "DiviSwap is a decentralized exchange (DEX) on Chiliz Chain that allows you to trade tokens and earn rewards by providing liquidity.",
  keywords: [
    "DiviSwap",
    "DEX",
    "Decentralized Exchange",
    "Chiliz Chain",
    "Swap",
    "Liquidity",
    "DeFi",
    "Cryptocurrency",
  ],
  openGraph: {
    title: "DiviSwap | Trade and Provide Liquidity on Chiliz Chain",
    description:
      "Trade tokens and earn rewards by providing liquidity on Chiliz Chain with DiviSwap, a decentralized exchange.",
    url: "https://diviswap.io",
    siteName: "DiviSwap",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
        width: 512,
        height: 512,
        alt: "DiviSwap Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DiviSwap | DEX on Chiliz Chain",
    description:
      "Trade and provide liquidity on Chiliz Chain. Frictionless trading, earn rewards, guaranteed security.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png"],
    creator: "@DSwap",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
    shortcut: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DS_CIRCLE_O-jS8k1FEErlvtPQhtkG85QTsKsUkpmu.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#000000",
}

export default function Home() {
  return (
    <div className="flex flex-col gap-12 min-h-[calc(100vh-4rem)]">
      <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white">
              <AnimatedTextCycle
                words={[
                  "Welcome to DiviSwap", // English
                  "Bienvenido a DiviSwap", // Spanish
                  "Bienvenue à DiviSwap", // French
                  "Willkommen bei DiviSwap", // German
                  "Benvenuto a DiviSwap", // Italian
                  "DiviSwapへようこそ", // Japanese
                  "DiviSwap에 오신 것을 환영합니다", // Korean
                  "Bem-vindo ao DiviSwap", // Portuguese
                  "Добро пожаловать в DiviSwap", // Russian
                  "DiviSwap'a Hoş Geldiniz", // Turkish
                  "欢迎来到 DiviSwap", // Chinese (Simplified)
                  "Welkom bij DiviSwap", // Dutch
                  "Velkommen til DiviSwap", // Norwegian
                  "Välkommen till DiviSwap", // Swedish
                  "DiviSwap'a خوش آمدید", // Persian
                  "DiviSwap मे आपका स्वागत है", // Hindi
                  "Καλώς ήρθατε στο DiviSwap", // Greek
                ]}
                interval={3000}
                className="text-primary"
              />
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
              A community-driven decentralized exchange on Chiliz Chain. Swap tokens, provide liquidity, and join our
              growing ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/swap">
                  Start Swapping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                <Link href="/pool">
                  Provide Liquidity
                  <Droplets className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="features" className="container flex flex-col items-center">
        <TabsList className="inline-flex p-1 space-x-2 bg-secondary/20 rounded-full backdrop-blur-sm mb-8">
          <TabsTrigger
            value="features"
            className="px-6 py-3 text-base font-medium transition-all rounded-full hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Features
          </TabsTrigger>
          <TabsTrigger
            value="tokenomics"
            className="px-6 py-3 text-base font-medium transition-all rounded-full hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Tokenomics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ArrowLeftRight className="h-10 w-10 text-primary mb-4" />,
                title: "Frictionless Trading",
                description: "Swap tokens quickly and efficiently",
                content:
                  "Our automated market maker (AMM) protocol ensures you always get the best price for your trades.",
                link: "/swap",
                linkText: "Go to Swap",
              },
              {
                icon: <Droplets className="h-10 w-10 text-primary mb-4" />,
                title: "Liquidity Provision",
                description: "Earn fees by providing liquidity",
                content: "Add your tokens to liquidity pools and earn a share of the trading fees.",
                link: "/pool",
                linkText: "Go to Pool",
              },
              {
                icon: <Shield className="h-10 w-10 text-primary mb-4" />,
                title: "Enhanced Security",
                description: "Your assets, protected",
                content: "Our smart contracts are audited and battle-tested to ensure the highest level of security.",
                link: "#",
                linkText: "View Audits",
              },
              {
                icon: <Zap className="h-10 w-10 text-primary mb-4" />,
                title: "Lightning Fast",
                description: "Rapid transactions on Chiliz Chain",
                content: "Experience near-instant transactions and low fees on the Chiliz Chain network.",
                link: "#",
                linkText: "Learn More",
              },
              {
                icon: <ChartBar className="h-10 w-10 text-primary mb-4" />,
                title: "Analytics Dashboard",
                description: "In-depth market insights",
                content: "Access detailed analytics and charts to make informed trading decisions.",
                link: "/charts",
                linkText: "View Charts",
              },
              {
                icon: <GraduationCap className="h-10 w-10 text-primary mb-4" />,
                title: "DiviSwap Academy",
                description: "Learn DeFi and crypto basics",
                content:
                  "Access educational resources to enhance your understanding of DeFi, cryptocurrencies, and trading strategies.",
                link: "https://academy.diviswap.io",
                linkText: "Start Learning",
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-2 border-primary/10 flex flex-col">
                <CardHeader>
                  {feature.icon}
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{feature.content}</p>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button asChild variant="ghost" className="w-full">
                    {feature.link.startsWith("http") ? (
                      <a href={feature.link}>
                        {feature.linkText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    ) : (
                      <Link href={feature.link}>
                        {feature.linkText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="tokenomics" className="w-full">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center">$DSwap Tokenomics</CardTitle>
                <CardDescription>$DSwap Token Distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRI_BLACK-bWDciwZMKpfXzIt9lcQG6rRsUqmSdK.png"
                    alt="DSwap Token"
                    className="w-48 h-48 drop-shadow-2xl"
                  />
                </div>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Community Allocation</span>
                    <span className="font-semibold">27.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Liquidity Pool</span>
                    <span className="font-semibold">20%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>DiviSwap Launchpad</span>
                    <span className="font-semibold">15%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>DiviSwap KEWL</span>
                    <span className="font-semibold">15%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Development and Maintenance</span>
                    <span className="font-semibold">12.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Liquidity Incentives</span>
                    <span className="font-semibold">7.5%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Marketing</span>
                    <span className="font-semibold">2.5%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
              <CardHeader>
                <CardTitle>$DSwap Features</CardTitle>
                <CardDescription>Key features of the governance token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Governance</h3>
                    <p className="text-sm text-muted-foreground">
                      $DSwap holders can participate in protocol decision-making through proposals and voting.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Staking</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn additional yields by staking your $DSwap tokens in different pools.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Fee Sharing</h3>
                    <p className="text-sm text-muted-foreground">
                      $DSwap holders receive a portion of the fees generated by the protocol.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Priority Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Get priority access to new launches and exclusive features in the DiviSwap ecosystem.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Deflationary</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatic burn mechanism that reduces the total supply with each transaction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Chiliz Chain Badge */}
      <div className="flex justify-center mt-8 mb-12">
        <a
          href="https://www.chiliz.com"
          className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jKLx0f8SHem72P4rTOAS2E5OtISne0.png"
            alt="Built on Chiliz Chain - No affiliation with or endorsement by Chiliz"
            className="h-16 w-auto"
          />
        </a>
      </div>
    </div>
  )
}
