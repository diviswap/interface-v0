"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Book, Code, Hand, Zap, GraduationCap } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/docs", icon: Book },
  { name: "User Guide", href: "/docs/user-guide", icon: Hand },
  { name: "Protocol", href: "/docs/protocol", icon: Zap },
  { name: "Contracts", href: "/docs/contracts", icon: Code },
  { name: "Academy", href: "/docs/academy", icon: GraduationCap },
  // { name: "Security", href: "/docs/security", icon: Shield },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
      <div className="sticky top-20">
        <nav className="flex flex-col space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
