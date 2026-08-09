import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "प्रशासक लगइन (Admin Login) — निश्चल कानूनी कार्यालय",
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--paper)",
        padding: "20px",
      }}
    >
      <div
        className="admin-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "36px 30px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              fontFamily: "var(--font-noto-serif-dev), Georgia, serif",
              fontSize: "1.375rem",
              color: "var(--red)",
              margin: 0,
              fontWeight: 700,
            }}
          >
            निश्चल कानूनी कार्यालय
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--muted)" }}>
            व्यवस्थापन प्यानल (Admin Login)
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
