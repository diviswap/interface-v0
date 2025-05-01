"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PresaleInfo() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">About FintSport Token (FTK)</h2>
          <p className="mb-4">
            The FintSport Token (FTK) is a utility token, designed to function as a funding token, with the goal of
            ensuring a successful launch and promoting long-term adoption. It's an ERC20 token deployed on the Chiliz
            protocol that serves as a utility token for accessing Player Tokens at a discount and before everyone else.
          </p>

          <h3 className="text-xl font-semibold mb-2">Key Features</h3>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Early access to Player Tokens</li>
            <li>Discounted rates on token purchases</li>
            <li>Participation in exclusive events</li>
            <li>Governance rights in the FintSport ecosystem</li>
            <li>Staking rewards and benefits</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Presale Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Token Name</p>
                <p className="font-medium">FintSport Token (FTK)</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Initial Price</p>
                <p className="font-medium">$0.01 USD</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Payment Methods</p>
                <p className="font-medium">CHZ, USDC, USDT</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Presale Period</p>
                <p className="font-medium">May 1 - July 30, 2025</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Fundraising Goal</p>
                <p className="font-medium">$500,000 USD</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Minimum Purchase</p>
                <p className="font-medium">0.1 FTK</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Token Distribution & Bonuses</h2>
        <Tabs defaultValue="tier1">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="tier1">Tier 1</TabsTrigger>
            <TabsTrigger value="tier2">Tier 2</TabsTrigger>
            <TabsTrigger value="tier3">Tier 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tier1" className="bg-secondary/30 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-full">
                <span className="text-2xl font-bold text-primary">+30%</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Early Bird Bonus</h3>
                <p className="text-sm text-muted-foreground mb-2">First 10,000,000 FTK</p>
                <p>Purchase tokens in this tier and receive a 30% bonus airdrop after the presale ends.</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tier2" className="bg-secondary/30 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-full">
                <span className="text-2xl font-bold text-primary">+20%</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Mid-Sale Bonus</h3>
                <p className="text-sm text-muted-foreground mb-2">Next 10,000,000 FTK</p>
                <p>Purchase tokens in this tier and receive a 20% bonus airdrop after the presale ends.</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tier3" className="bg-secondary/30 p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-full">
                <span className="text-2xl font-bold text-primary">+10%</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Final Tier Bonus</h3>
                <p className="text-sm text-muted-foreground mb-2">Last 20,000,000 FTK</p>
                <p>Purchase tokens in this tier and receive a 10% bonus airdrop after the presale ends.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Roadmap</h2>
        <div className="relative border-l-2 border-primary/30 pl-6 space-y-6 ml-2">
          {/* Pre-Seed Round */}
          <div className="relative">
            <div className="absolute -left-8 top-0 w-4 h-4 rounded-full bg-primary"></div>
            <h3 className="text-lg font-semibold">Pre-Seed Round</h3>
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-sm text-primary font-medium">Q3 2022</p>
                <p className="font-medium">FintSport LC Establishment</p>
                <p className="text-sm text-muted-foreground">
                  FintSport was founded with the mission to democratize exclusive experiences and rewards for fans while
                  providing athletes with new ways to monetize and connect with their community.
                </p>
              </div>
              <div>
                <p className="text-sm text-primary font-medium">Q1 2023</p>
                <p className="font-medium">POC: Cadiz CF, Spain</p>
                <p className="text-sm text-muted-foreground">
                  FintSport conducted a proof of concept with Cadiz FC, analyzing its impact on the community and
                  evaluating the level of acceptance among fans.
                </p>
              </div>
              <div>
                <p className="text-sm text-primary font-medium">Q2 2023</p>
                <p className="font-medium">POC: Colo Colo, Chile</p>
                <p className="text-sm text-muted-foreground">
                  The company replicated this experience with Colo Colo, adapting the product to the specific
                  characteristics of their community and increasing its functional reach by involving more fans and
                  improving player interaction.
                </p>
              </div>
              <div>
                <p className="text-sm text-primary font-medium">Q3 2023 - Q2 2024</p>
                <p className="font-medium">MVP: Parma Calcio, Italy</p>
                <p className="text-sm text-muted-foreground">
                  FintSport iterated again, improving performance and optimizing the user experience. The team
                  implemented the complete product flow, which allowed them to engage 3.8% of the club's total audience
                  with effective transactions on the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Chiliz Incubation */}
          <div className="relative">
            <div className="absolute -left-8 top-0 w-4 h-4 rounded-full bg-primary/80"></div>
            <h3 className="text-lg font-semibold">Chiliz Incubation</h3>
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-sm text-primary font-medium">Q3 2024</p>
                <p className="font-medium">Includ3d Accelerator by Chiliz</p>
                <p className="text-sm text-muted-foreground">
                  FintSport began an acceleration process with Chiliz, where the team worked on the business model,
                  defined monetization strategies, analyzed regulatory aspects, and deepened their industry knowledge to
                  ensure the project's success.
                </p>
              </div>
              <div>
                <p className="text-sm text-primary font-medium">Q4 2024</p>
                <p className="font-medium">Chiliz Labs</p>
                <p className="text-sm text-muted-foreground">
                  The project moved to an incubation stage, where Chiliz provided resources in infrastructure,
                  development, compliance, and other key areas, allowing FintSport to accelerate the process and develop
                  a long-term sustainable project.
                </p>
              </div>
            </div>
          </div>

          {/* Seed Round - ICO */}
          <div className="relative">
            <div className="absolute -left-8 top-0 w-4 h-4 rounded-full bg-primary/60"></div>
            <h3 className="text-lg font-semibold">Seed Round - ICO</h3>
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-sm text-primary font-medium">Q1 2025</p>
                <p className="font-medium">Private FTK Presale</p>
                <p className="text-sm text-muted-foreground">
                  FintSport initiated the private ICO among family and friends, with deployed contracts and integrations
                  with the Chiliz ecosystem, exchange partners, and socios.com wallets, which allowed the company to
                  establish a solid foundation for the project's growth.
                </p>
              </div>
              <div>
                <p className="text-sm text-primary font-medium">Q2 2025</p>
                <p className="font-medium">FTK / CHZ Presale</p>
                <p className="text-sm text-muted-foreground">
                  The project opened to the Chiliz community, offering benefits and cross-utility to Chiliz and
                  socios.com users, thus strengthening the connection between both platforms and expanding the project's
                  reach.
                </p>
              </div>
              <div>
                <p className="text-sm text-primary font-medium">Q2 2025</p>
                <p className="font-medium">FTK / FIAT Presale</p>
                <p className="text-sm text-muted-foreground">
                  At this stage, FintSport provided users with the possibility to transact with fiat currency, which
                  allowed the team to open the ICO to a wider audience, focused on early adopters, and facilitate their
                  participation in the project.
                </p>
              </div>
            </div>
          </div>

          {/* Seed Round */}
          <div className="relative">
            <div className="absolute -left-8 top-0 w-4 h-4 rounded-full bg-primary/40"></div>
            <h3 className="text-lg font-semibold">Seed Round</h3>
            <div className="space-y-4 mt-2">
              <div>
                <p className="text-sm text-primary font-medium">Q3 2025</p>
                <p className="font-medium">Launch PTK LATAM</p>
                <p className="text-sm text-muted-foreground">
                  FintSport will begin issuing tokens associated with players from Latin American teams, starting with
                  Argentina and continuing with Mexico, Brazil, and Colombia, giving users the possibility to access
                  unique experiences and collectibles with their idols.
                </p>
              </div>
              <div>
                <p className="text-sm text-primary font-medium">Q3 2026</p>
                <p className="font-medium">Launch PTK EU</p>
                <p className="text-sm text-muted-foreground">
                  The company plans to scale the experience to the European Union, starting with Spain and Italy, and
                  then expand operations to other European countries. FintSport will involve exclusive players, football
                  legends, and women's football figures, offering unique experiences and collectibles for fans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
