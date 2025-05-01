"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  external?: boolean
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  onItemClick?: () => void
}

export function NavBar({ items, className, onItemClick }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set active tab based on current pathname
    const currentPath = items.find(
      (item) => pathname === item.url || (pathname.startsWith(item.url) && item.url !== "/"),
    )

    if (currentPath) {
      setActiveTab(currentPath.name)
    } else if (pathname === "/") {
      // If we're on the home page
      const homeItem = items.find((item) => item.url === "/")
      if (homeItem) setActiveTab(homeItem.name)
    } else {
      // Default to first item if no match
      setActiveTab(items[0].name)
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [pathname, items])

  // Calculate responsive padding based on number of items
  const getPadding = () => {
    const itemCount = items.length
    if (itemCount <= 3) return "px-6"
    if (itemCount <= 4) return "px-5"
    if (itemCount <= 5) return "px-4"
    return "px-3" // For 6 or more items
  }

  const padding = getPadding()

  return (
    <div className={cn("z-50", className)}>
      <div className="flex items-center gap-1 sm:gap-2 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              onClick={() => {
                setActiveTab(item.name)
                if (onItemClick) onItemClick()
              }}
              className={cn(
                "relative cursor-pointer text-sm font-semibold py-2 rounded-full transition-colors",
                padding,
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
