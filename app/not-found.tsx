import Link from "next/link"

export default function NotFound() {
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
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>404 - Page Not Found</h1>
      <p style={{ marginBottom: "2rem" }}>Sorry, the page you are looking for does not exist.</p>
      <Link
        href="/"
        style={{
          padding: "10px 20px",
          backgroundColor: "#3b82f6",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        Return Home
      </Link>
    </div>
  )
}
