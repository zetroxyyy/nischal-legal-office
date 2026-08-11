import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { getSql } from "@/lib/db";

const SECTIONS = [
  { href: "/admin/settings", labelNe: "सेटिङहरू", labelEn: "Settings", desc: "कार्यालय विवरण, फोन, ठेगाना, सूचना ब्यानर, र SEO" },
  { href: "/admin/hero", labelNe: "मुख्य ब्यानर", labelEn: "Hero Section", desc: "शीर्षक, उप-शीर्षक, मुख्य बुँदाहरू र मुख्य तस्बिर" },
  { href: "/admin/services", labelNe: "सेवाहरू", labelEn: "Services", desc: "तीन वर्ग — नोटरी, कानुनी सेवा र मेलमिलाप" },
  { href: "/admin/docs", labelNe: "आवश्यक कागजात", labelEn: "Required Documents", desc: "कागजात समूहहरू, सूची र महत्त्वपूर्ण सूचना" },
  { href: "/admin/procedure", labelNe: "सेवा प्रक्रिया", labelEn: "Procedure", desc: "काम सम्पन्न हुने चरणबद्ध प्रक्रियाहरू" },
  { href: "/admin/about", labelNe: "अधिवक्ता परिचय", labelEn: "About Advocate", desc: "अधिवक्ताको नाम, पद, विस्तृत परिचय र फोटो" },
  { href: "/admin/gallery", labelNe: "तस्बिर ग्यालरी", labelEn: "Photo Gallery", desc: "कार्यालयका तस्बिरहरू, क्याप्सन र नयाँ तस्बिर थप्ने" },
  { href: "/admin/labels", labelNe: "बटन तथा शब्दहरू", labelEn: "UI Labels", desc: "नेभिगेसन, बटन र स्थानीयकरण शब्दहरू" },
  { href: "/admin/messages", labelNe: "ग्राहक सन्देशहरू", labelEn: "Messages Inbox", desc: "सम्पर्क फारमबाट आएका सन्देशहरूको सूची" },
  { href: "/admin/advanced", labelNe: "उन्नत / ब्याकअप", labelEn: "Advanced / Backups", desc: "कच्चा JSON सम्पादन र पहिलेका ब्याकअप रिस्टोर" },
  { href: "/admin/password", labelNe: "पासवर्ड परिवर्तन", labelEn: "Change Password", desc: "व्यवस्थापक पासवर्ड परिवर्तन गर्नुहोस्" },
  { href: "/admin/guide", labelNe: "प्रयोग गाइड", labelEn: "User Guide", desc: "वेबसाइट चलाउने र सम्पादन गर्ने सरल नेपाली गाइड" },
];

export default async function AdminDashboardPage() {
  await requireAdmin();
  const content = await getContent();

  const sql = getSql();
  let unreadCount = 0;
  let lastUpdated: string | null = null;

  try {
    const unreadRes = (await sql`SELECT count(*)::int as count FROM messages WHERE read = false`) as Record<string, any>[];
    unreadCount = unreadRes[0]?.count || 0;

    const contentRes = (await sql`SELECT updated_at FROM site_content WHERE id = 1 LIMIT 1`) as Record<string, any>[];
    if (contentRes && contentRes[0]?.updated_at) {
      lastUpdated = new Date(contentRes[0].updated_at).toLocaleString("ne-NP", {
        timeZone: "Asia/Kathmandu",
      });
    }
  } catch (err) {
    console.error("[Dashboard] error fetching stats:", err);
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">ड्यासबोर्ड (Dashboard)</h1>
        <p className="admin-header__sub">
          वेबसाइटको सामग्री र तस्बिरहरू सजिलै सम्पादन गर्नुहोस्
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div className="admin-card" style={{ margin: 0, borderLeft: "4px solid var(--blue)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--muted)", fontWeight: 600 }}>
            अन्तिम पटक अद्यावधिक (Last Updated)
          </span>
          <p style={{ fontSize: "1.125rem", fontWeight: 700, margin: "8px 0 0", color: "var(--ink)" }}>
            {lastUpdated || "उपलब्ध छैन"}
          </p>
        </div>

        <div className="admin-card" style={{ margin: 0, borderLeft: unreadCount > 0 ? "4px solid var(--red)" : "4px solid var(--line)" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--muted)", fontWeight: 600 }}>
            नयाँ सन्देशहरू (Unread Messages)
          </span>
          <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: "8px 0 0", color: unreadCount > 0 ? "var(--red)" : "var(--ink)" }}>
            {unreadCount} वटा
          </p>
          {unreadCount > 0 && (
            <Link href="/admin/messages" style={{ fontSize: "0.8125rem", color: "var(--blue)", marginTop: "4px", display: "inline-block" }}>
              सन्देशहरू हेर्नुहोस् →
            </Link>
          )}
        </div>
      </div>

      {/* Section Quick Links */}
      <h2 style={{ fontFamily: "var(--font-noto-serif-dev), Georgia, serif", fontSize: "1.25rem", marginBottom: "16px" }}>
        सम्पादन खण्डहरू (Content Sections)
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {SECTIONS.map((sec) => (
          <Link
            key={sec.href}
            href={sec.href}
            className="admin-card"
            style={{
              margin: 0,
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 0.15s ease, transform 0.1s ease",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--blue)" }}>
                  {sec.labelNe}
                </span>
                <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                  {sec.labelEn}
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.4 }}>
                {sec.desc}
              </p>
            </div>
            <span style={{ fontSize: "0.8125rem", color: "var(--blue)", fontWeight: 600, marginTop: "12px", alignSelf: "flex-end" }}>
              सम्पादन गर्नुहोस् →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
