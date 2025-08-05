import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "DiviSwap Docs | Protocol",
  description: "An explanation of the DiviSwap protocol, including its AMM, fee structure, and architecture.",
}

export default function DocsProtocolPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Protocol Deep Dive</h1>
        <p className="text-xl text-muted-foreground">Understanding the core mechanics of the DiviSwap exchange.</p>
      </header>

      <section>
        <h2>Core Architecture</h2>
        <p>
          DiviSwap is a fork of Uniswap V2, a battle-tested and highly successful DEX protocol. The architecture
          consists of a set of smart contracts that work in concert to facilitate decentralized trading. The two main
          contracts are:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Factory Contract:</strong> A contract responsible for creating a new exchange contract (a liquidity
            pool) for any unique pair of ERC-20 tokens. There is only one factory contract.
          </li>
          <li>
            <strong>Router Contract:</strong> A contract that facilitates swaps by finding the optimal path between
            tokens (including multi-hop swaps) and interacting with the appropriate liquidity pools. Users typically
            interact with the router, not directly with the pool contracts.
          </li>
        </ul>
      </section>

      <section>
        <h2>Automated Market Maker (AMM)</h2>
        <p>
          DiviSwap uses a constant product automated market maker. This model is defined by the simple but powerful
          formula:
        </p>
        <div className="my-4 p-4 bg-muted rounded-lg text-center">
          <code className="text-lg font-mono">x * y = k</code>
        </div>
        <p>In this formula:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <code>x</code> is the amount of one token in the liquidity pool.
          </li>
          <li>
            <code>y</code> is the amount of the other token.
          </li>
          <li>
            <code>k</code> is a constant.
          </li>
        </ul>
        <p>
          When a user performs a swap, they add a certain amount of one token to the pool and remove a proportional
          amount of the other. To ensure that <code>k</code> remains constant (before fees), the amounts of{" "}
          <code>x</code> and <code>y</code> must change. The price of a token is determined by the ratio of{" "}
          <code>x</code> to <code>y</code>. This elegant design allows for continuous liquidity and programmatic price
          discovery without needing a traditional order book.
        </p>
      </section>

      <section>
        <h2>Fee Structure</h2>
        <p>
          A standard trading fee is applied to every swap on DiviSwap. This fee is essential for incentivizing liquidity
          provision and supporting the protocol's growth.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Trading Fee:</strong> A 0.3% fee is charged on every trade.
          </li>
          <li>
            <strong>Liquidity Provider Rewards:</strong> 0.25% of the fee is distributed pro-rata to the liquidity
            providers of the respective pool. This is the primary incentive for users to provide liquidity.
          </li>
          <li>
            <strong>Protocol Fee:</strong> 0.05% of the fee is allocated to the DiviSwap treasury. This fund is used for
            development, marketing, and buyback-and-burn programs, as decided by community governance.
          </li>
        </ul>
      </section>
    </div>
  )
}
