import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Academy - DiviSwap",
  description: "Learn about DeFi and cryptocurrency on DiviSwap Academy",
}

export default function AcademyPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>DiviSwap Academy</h1>
      <p style={{ marginBottom: "2rem" }}>You are being redirected to the DiviSwap Academy...</p>
      <a
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
      </a>
    </div>
  )
}
