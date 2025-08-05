import { DocsSidebar } from "@/components/docs-sidebar"
import type React from "react"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <DocsSidebar />
        <main className="flex-1 min-w-0">
          <article className="prose prose-invert max-w-none prose-headings:text-primary prose-headings:font-designer prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-white">
            {children}
          </article>
        </main>
      </div>
    </div>
  )
}
