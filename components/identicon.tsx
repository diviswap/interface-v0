"use client"

import { useEffect, useRef } from "react"
import jazzicon from "jazzicon"

interface IdenticonProps {
  account: string
  size?: number
  className?: string
}

export default function Identicon({ account, size = 16, className = "" }: IdenticonProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = ""
      ref.current.appendChild(jazzicon(size, Number.parseInt(account.slice(2, 10), 16)))
    }
  }, [account, size])

  return <div ref={ref} className={className} style={{ height: size, width: size }} />
}

export { Identicon }
