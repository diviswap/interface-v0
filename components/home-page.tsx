"use client"

import Link from "next/link"
import {
  ArrowRight,
  ArrowLeftRight,
  Droplets,
  Shield,
  Zap,
  BarChartIcon as ChartBar,
  GraduationCap,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "@/lib/i18n/context"

export function HomePage() {
  const { t } = useTranslation()

  const features = [
    {
      icon: ArrowLeftRight,
      title: t.home.frictionlessTrading,
      description: t.home.frictionlessTradingDesc,
      content: t.home.frictionlessTradingContent,
      link: "/swap",
      linkText: t.home.goToSwap,
    },
    {
      icon: Droplets,
      title: t.home.liquidityProvision,
      description: t.home.liquidityProvisionDesc,
      content: t.home.liquidityProvisionContent,
      link: "/pool",
      linkText: t.home.goToPool,
    },
    {
      icon: Shield,
      title: t.home.enhancedSecurity,
      description: t.home.enhancedSecurityDesc,
      content: t.home.enhancedSecurityContent,
      link: "#",
      linkText: t.home.viewAudits,
    },
    {
      icon: Zap,
      title: t.home.lightningFast,
      description: t.home.lightningFastDesc,
      content: t.home.lightningFastContent,
      link: "#",
      linkText: t.home.learnMore,
    },
    {
      icon: ChartBar,
      title: t.home.analyticsDashboard,
      description: t.home.analyticsDashboardDesc,
      content: t.home.analyticsDashboardContent,
      link: "/charts",
      linkText: t.home.viewCharts,
    },
    {
      icon: GraduationCap,
      title: t.home.diviswapAcademy,
      description: t.home.diviswapAcademyDesc,
      content: t.home.diviswapAcademyContent,
      link: "https://academy.diviswap.io",
      linkText: t.home.startLearning,
    },
  ]

  const tokenDistribution = [
    { label: t.home.communityAllocation, percentage: 27.5 },
    { label: t.home.liquidityPool, percentage: 20 },
    { label: t.home.diviswapLaunchpad, percentage: 15 },
    { label: t.home.diviswapKewl, percentage: 15 },
    { label: t.home.developmentMaintenance, percentage: 12.5 },
    { label: t.home.liquidityIncentives, percentage: 7.5 },
    { label: t.home.marketing, percentage: 2.5 },
  ]

  const tokenFeatures = [
    { title: t.home.governance, description: t.home.governanceDesc },
    { title: t.home.staking, description: t.home.stakingDesc },
    { title: t.home.feeSharing, description: t.home.feeSharingDesc },
    { title: t.home.priorityAccess, description: t.home.priorityAccessDesc },
    { title: t.home.deflationary, description: t.home.deflationaryDesc },
  ]

  return (
    <div className="relative flex flex-col gap-16 md:gap-24 min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-10 md:pt-20 pb-4 md:pb-8">
        {/* Radial halo */}
        <div aria-hidden className="absolute inset-0 -z-10 hero-radial" />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-grid-faint [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        />

        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <span className="relative inline-flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary pulse-dot" />
              </span>
              {t.home.builtOnChiliz ?? "Built on Chiliz Chain"}
            </div>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-gradient-primary">{t.home.welcome}</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              {t.home.subtitle}
            </p>

            <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Button
                asChild
                size="lg"
                className="group h-12 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all"
              >
                <Link href="/swap">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t.home.startSwapping}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-border/60 bg-card/40 px-6 text-base font-semibold backdrop-blur-md hover:bg-card/70 hover:border-primary/30"
              >
                <Link href="/pool">
                  <Droplets className="mr-2 h-4 w-4 text-primary" />
                  {t.home.provideLiquidity}
                </Link>
              </Button>
            </div>

            {/* Stats strip */}
            <div className="mt-12 grid w-full grid-cols-3 gap-2 sm:gap-4 max-w-2xl">
              {[
                { label: t.home.statChain ?? "Chain", value: "Chiliz" },
                { label: t.home.statFees ?? "Swap Fee", value: "0.30%" },
                { label: t.home.statProtocol ?? "Protocol", value: "AMM v2" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass-panel rounded-xl px-3 py-3 sm:px-4 sm:py-4 text-left"
                >
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="mt-0.5 text-base sm:text-lg font-semibold text-foreground">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features / Tokenomics tabs */}
      <Tabs defaultValue="features" className="container flex flex-col items-center">
        <TabsList className="inline-flex gap-1 p-1 rounded-full border border-border/50 bg-card/40 backdrop-blur-md mb-10">
          <TabsTrigger
            value="features"
            className="px-5 py-2 text-sm font-medium rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
          >
            {t.home.features}
          </TabsTrigger>
          <TabsTrigger
            value="tokenomics"
            className="px-5 py-2 text-sm font-medium rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/25 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
          >
            {t.home.tokenomics}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isExternal = feature.link.startsWith("http")
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border/40 glass-panel hover:border-primary/30 transition-all duration-300 flex flex-col"
                >
                  {/* hover glow */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(400px circle at 50% 0%, hsl(var(--primary) / 0.12), transparent 60%)",
                    }}
                  />
                  <CardHeader className="relative">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary/15 group-hover:ring-primary/40">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative flex-grow">
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.content}</p>
                  </CardContent>
                  <CardFooter className="relative pt-2">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10"
                    >
                      {isExternal ? (
                        <a href={feature.link} target="_blank" rel="noopener noreferrer">
                          {feature.linkText}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </a>
                      ) : (
                        <Link href={feature.link}>
                          {feature.linkText}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="tokenomics" className="w-full">
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="glass-panel border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <ChartBar className="h-4 w-4" />
                  </span>
                  {t.home.tokenFeatures}
                </CardTitle>
                <CardDescription>{t.home.tokenDistribution}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-full bg-primary/15 blur-3xl"
                    />
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TRI_BLACK-bWDciwZMKpfXzIt9lcQG6rRsUqmSdK.png"
                      alt="DSwap Token"
                      className="w-40 h-40 drop-shadow-2xl"
                    />
                  </div>
                </div>
                <ul className="space-y-3">
                  {tokenDistribution.map((item, index) => (
                    <li key={index} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/90">{item.label}</span>
                        <span className="font-semibold text-primary">{item.percentage}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(32_100%_60%)] transition-all"
                          style={{ width: `${item.percentage * 2}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  {t.home.tokenFeatures}
                </CardTitle>
                <CardDescription>{t.home.keyFeatures}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {tokenFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-border/40 bg-background/30 p-4 transition-all hover:border-primary/30 hover:bg-background/50"
                    >
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Chiliz Chain Badge */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {t.home.poweredBy ?? "Powered by"}
        </span>
        <a
          href="https://www.chiliz.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jKLx0f8SHem72P4rTOAS2E5OtISne0.png"
            alt="Built on Chiliz Chain - No affiliation with or endorsement by Chiliz"
            className="h-14 w-auto"
          />
        </a>
      </div>
    </div>
  )
}
