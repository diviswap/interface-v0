"use client"

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
import { useTranslation } from "@/lib/i18n/context"

export function HomePage() {
  const { t } = useTranslation()

  const features = [
    {
      icon: <ArrowLeftRight className="h-10 w-10 text-primary mb-4" />,
      title: t.home.frictionlessTrading,
      description: t.home.frictionlessTradingDesc,
      content: t.home.frictionlessTradingContent,
      link: "/swap",
      linkText: t.home.goToSwap,
    },
    {
      icon: <Droplets className="h-10 w-10 text-primary mb-4" />,
      title: t.home.liquidityProvision,
      description: t.home.liquidityProvisionDesc,
      content: t.home.liquidityProvisionContent,
      link: "/pool",
      linkText: t.home.goToPool,
    },
    {
      icon: <Shield className="h-10 w-10 text-primary mb-4" />,
      title: t.home.enhancedSecurity,
      description: t.home.enhancedSecurityDesc,
      content: t.home.enhancedSecurityContent,
      link: "#",
      linkText: t.home.viewAudits,
    },
    {
      icon: <Zap className="h-10 w-10 text-primary mb-4" />,
      title: t.home.lightningFast,
      description: t.home.lightningFastDesc,
      content: t.home.lightningFastContent,
      link: "#",
      linkText: t.home.learnMore,
    },
    {
      icon: <ChartBar className="h-10 w-10 text-primary mb-4" />,
      title: t.home.analyticsDashboard,
      description: t.home.analyticsDashboardDesc,
      content: t.home.analyticsDashboardContent,
      link: "/charts",
      linkText: t.home.viewCharts,
    },
    {
      icon: <GraduationCap className="h-10 w-10 text-primary mb-4" />,
      title: t.home.diviswapAcademy,
      description: t.home.diviswapAcademyDesc,
      content: t.home.diviswapAcademyContent,
      link: "https://academy.diviswap.io",
      linkText: t.home.startLearning,
    },
  ]

  const tokenDistribution = [
    { label: t.home.communityAllocation, percentage: "27.5%" },
    { label: t.home.liquidityPool, percentage: "20%" },
    { label: t.home.diviswapLaunchpad, percentage: "15%" },
    { label: t.home.diviswapKewl, percentage: "15%" },
    { label: t.home.developmentMaintenance, percentage: "12.5%" },
    { label: t.home.liquidityIncentives, percentage: "7.5%" },
    { label: t.home.marketing, percentage: "2.5%" },
  ]

  const tokenFeatures = [
    {
      title: t.home.governance,
      description: t.home.governanceDesc,
    },
    {
      title: t.home.staking,
      description: t.home.stakingDesc,
    },
    {
      title: t.home.feeSharing,
      description: t.home.feeSharingDesc,
    },
    {
      title: t.home.priorityAccess,
      description: t.home.priorityAccessDesc,
    },
    {
      title: t.home.deflationary,
      description: t.home.deflationaryDesc,
    },
  ]

  return (
    <div className="flex flex-col gap-12 min-h-[calc(100vh-4rem)]">
      <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <div className="container px-4 md:px-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white">
              <span className="text-primary">{t.home.welcome}</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">{t.home.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/swap">
                  {t.home.startSwapping}
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
                  {t.home.provideLiquidity}
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
            {t.home.features}
          </TabsTrigger>
          <TabsTrigger
            value="tokenomics"
            className="px-6 py-3 text-base font-medium transition-all rounded-full hover:bg-primary/20 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {t.home.tokenomics}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
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
                <CardTitle className="flex items-center">{t.home.tokenFeatures}</CardTitle>
                <CardDescription>{t.home.tokenDistribution}</CardDescription>
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
                  {tokenDistribution.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.percentage}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/10">
              <CardHeader>
                <CardTitle>{t.home.tokenFeatures}</CardTitle>
                <CardDescription>{t.home.keyFeatures}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {tokenFeatures.map((feature, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
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
