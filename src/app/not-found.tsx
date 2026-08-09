import Link from "next/link";
import { getContent } from "@/lib/content";
import { getLang, t } from "@/lib/lang";

// Allow cookies() to block prerendering in Next.js 16
export const instant = false;

export default async function NotFound() {
  const lang = await getLang();
  const content = await getContent();
  const { ui } = content;

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--paper)",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "540px" }}>
        <h1
          style={{
            fontFamily: "var(--font-noto-serif-dev), Georgia, serif",
            fontSize: "2rem",
            color: "var(--red)",
            fontWeight: 700,
            marginBottom: "12px",
            lineHeight: 1.3,
          }}
        >
          {lang === "ne" ? "पृष्ठ फेला परेन" : "Page Not Found"}
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--muted)",
            marginBottom: "20px",
          }}
        >
          {lang === "ne" ? "Page Not Found" : "पृष्ठ फेला परेन"}
        </p>

        <div
          style={{
            width: "60px",
            height: "2px",
            backgroundColor: "var(--line)",
            margin: "0 auto 24px",
          }}
        />

        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--muted)",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}
        >
          {lang === "ne"
            ? "तपाईंले खोज्नुभएको पृष्ठ सारिएको वा मेटिएको हुन सक्छ । कृपया गृहपृष्ठमा फर्कनुहोस् ।"
            : "The page you are looking for might have been removed or relocated. Please return to the homepage."}
        </p>

        <Link
          href="/"
          className="btn btn-primary"
          id="not-found-home-btn"
          style={{ display: "inline-flex" }}
        >
          ← {t(ui.nav_home, lang)}
        </Link>
      </div>
    </div>
  );
}
