"use client"

import { useState, useEffect } from "react"
import { CheckCircle2 } from "lucide-react"

interface PresaleTimerProps {
  endTime: number
  isEnded: boolean
}

export function PresaleTimer({ endTime, isEnded }: PresaleTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    if (isEnded) return

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000)
      const difference = endTime - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (60 * 60 * 24))
      const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60))
      const minutes = Math.floor((difference % (60 * 60)) / 60)
      const seconds = Math.floor(difference % 60)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime, isEnded])

  if (isEnded) {
    return (
      <div className="flex items-center justify-center">
        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
        <span className="text-lg font-medium">Presale Ended</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div>
        <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
        <p className="text-xs text-muted-foreground">Days</p>
      </div>
      <div>
        <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
        <p className="text-xs text-muted-foreground">Hours</p>
      </div>
      <div>
        <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
        <p className="text-xs text-muted-foreground">Minutes</p>
      </div>
      <div>
        <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
        <p className="text-xs text-muted-foreground">Seconds</p>
      </div>
    </div>
  )
}
