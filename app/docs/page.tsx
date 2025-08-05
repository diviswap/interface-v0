import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "DiviSwap Docs | Overview",
  description: "An overview of DiviSwap, the community-driven decentralized exchange on Chiliz Chain.",
}

export default function DocsOverviewPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">DiviSwap Overview</h1>
        <p className="text-xl text-muted-foreground">
          The community-driven decentralized exchange built on Chiliz Chain.
        </p>
      </header>

      <section>
        <h2>What is DiviSwap?</h2>
        <p>
          DiviSwap is a decentralized exchange (DEX) that leverages an automated market maker (AMM) protocol. Built on
          the high-performance Chiliz Chain, it offers users a seamless, secure, and efficient platform for swapping
          ERC-20 tokens. As a community-first project, DiviSwap is designed to be governed by its users, ensuring that
          the protocol evolves in alignment with the community's best interests.
        </p>
        <p>
          Our mission is to provide the Chiliz ecosystem with a foundational DeFi primitive that combines robust
          functionality with a user-friendly experience, empowering users to trade assets and provide liquidity with
          confidence.
        </p>
      </section>

      <section>
        <h2>Core Concepts</h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>Automated Market Maker (AMM):</strong> Instead of traditional order books, DiviSwap uses AMMs to
            enable permissionless token swaps. Prices are determined algorithmically based on the ratio of assets in a
            liquidity pool.
          </li>
          <li>
            <strong>Liquidity Pools:</strong> These are smart contracts that hold reserves of two or more tokens. Users,
            known as Liquidity Providers (LPs), contribute assets to these pools and receive LP tokens in return, which
            represent their share of the pool and entitle them to a portion of the trading fees.
          </li>
          <li>
            <strong>Frictionless Swapping:</strong> Users can instantly swap one token for another by interacting with
            the liquidity pools. The protocol automatically calculates the best possible exchange rate.
          </li>
          <li>
            <strong>Community Governance:</strong> Holders of the $DSwap token will have the power to propose and vote
            on changes to the protocol, from fee structures to new feature integrations.
          </li>
        </ul>
      </section>

      <section>
        <h2>Why Chiliz Chain?</h2>
        <p>
          Chiliz Chain is the premier blockchain for sports and entertainment. By building on Chiliz, DiviSwap positions
          itself at the heart of a vibrant and rapidly growing ecosystem. The key advantages include:
        </p>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>Low Transaction Fees:</strong> Chiliz Chain's architecture allows for significantly lower gas fees
            compared to other networks, making DeFi accessible to a wider audience.
          </li>
          <li>
            <strong>Fast Transactions:</strong> Experience near-instant transaction finality, crucial for a smooth
            trading experience.
          </li>
          <li>
            <strong>Growing Ecosystem:</strong> Tap into a network of sports and entertainment-focused projects,
            creating unique opportunities for token listings and partnerships.
          </li>
        </ul>
      </section>

      <section>
        <h2>Getting Started</h2>
        <p>Ready to dive in? Here are your next steps:</p>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            Read the <Link href="/docs/user-guide">User Guide</Link> to learn how to connect your wallet and perform
            your first swap.
          </li>
          <li>
            Explore the <Link href="/docs/protocol">Protocol</Link> section to understand the technical details behind
            DiviSwap.
          </li>
          <li>Join our community on social media to stay updated on the latest news and announcements.</li>
        </ul>
      </section>
    </div>
  )
}
