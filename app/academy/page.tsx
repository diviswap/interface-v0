import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "DiviSwap Academy",
  description: "Learn about DeFi and DiviSwap",
}

// This uses Next.js's static redirects which work during prerendering
export default function AcademyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Redirecting to DiviSwap Academy...</h1>
      <p>If you are not redirected automatically, please click the link below:</p>
      <a href="https://academy.diviswap.io" className="text-blue-500 hover:text-blue-700 mt-4">
        Go to DiviSwap Academy
      </a>

      {/* Client-side redirect script that will run after hydration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              window.location.href = 'https://academy.diviswap.io';
            }
          `,
        }}
      />
    </div>
  )
}
