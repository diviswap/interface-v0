import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"

const categories = [
  {
    title: "Beginner",
    description:
      "Basic concepts of the DeFi world. Learn about cryptocurrencies, blockchains, wallets, and how to get started on DiviSwap.",
  },
  {
    title: "Intermediate",
    description:
      "Deepen your knowledge. Explore topics like liquidity pools, impermanent loss, and yield farming strategies.",
  },
  {
    title: "Advanced",
    description:
      "For the experts. Articles on governance, DAO structures, and advanced technical analysis of protocols.",
  },
  {
    title: "Tutorials",
    description: "Step-by-step guides to use all DiviSwap features, from making a swap to creating a liquidity pool.",
  },
  {
    title: "Security",
    description:
      "Learn to protect your assets. Best practices for your wallet's security and how to identify common scams.",
  },
  {
    title: "Fan Tokens",
    description:
      "Discover the world of Fan Tokens. What they are, how they work, and how you can interact with your favorite teams and artists.",
  },
]

export default function AcademyPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">DiviSwap Academy</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Welcome to the DiviSwap Academy. Here you'll find a summary of our educational articles organized by category.
        </p>
        <a
          href="https://academy.diviswap.io/academy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline"
        >
          Visit the full academy <ArrowUpRight className="ml-1 h-4 w-4" />
        </a>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.title} className="flex flex-col">
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
