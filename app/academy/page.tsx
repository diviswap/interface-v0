import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "DiviSwap Academy | Chiliz Chain DEX",
  description: "Learn about DeFi and trading on Chiliz Chain",
}

export default function AcademyPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        padding: "20px",
        textAlign: "center",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>DiviSwap Academy</h1>
      <p style={{ marginBottom: "2rem" }}>You are being redirected to the DiviSwap Academy...</p>
      <Link
        href="https://academy.diviswap.io"
        style={{
          padding: "10px 20px",
          backgroundColor: "#3b82f6",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        Go to Academy
      </Link>
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
