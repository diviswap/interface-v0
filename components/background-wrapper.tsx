import type React from "react"

export function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col bg-background bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BACKGROUND-DMAJJ9fLURxRAYeLNJ5cZRpI53nQmO.png')`,
      }}
    >
      {children}
    </div>
  )
}
