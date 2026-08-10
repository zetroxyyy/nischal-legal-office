import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export default async function AdminServicesPage() {
  await requireAdmin();

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">सेवाहरू सम्पादन (Services)</h1>
        <p className="admin-header__sub">
          तीन फरक हैसियत: नोटरी पब्लिक, अधिवक्ता र मेलमिलापकर्ता
        </p>
      </div>

      <div
        className="admin-card"
        style={{
          borderLeft: "4px solid var(--blue)",
          maxWidth: "640px",
          marginTop: "24px",
        }}
      >
        <h2
          className="admin-card__title"
          style={{ color: "var(--blue)", marginBottom: "12px" }}
        >
          🔧 यो खण्ड अद्यावधिक हुँदैछ
        </h2>
        <p style={{ lineHeight: 1.8, marginBottom: "12px" }}>
          <strong>नेपाली:</strong> सेवाहरूको संरचना तीन हैसियत (नोटरी पब्लिक,
          अधिवक्ता र मेलमिलापकर्ता) मा पुनर्गठित गरिएको छ। यो खण्डको सम्पादन
          सुविधा केही समयमै उपलब्ध हुनेछ।
        </p>
        <p style={{ lineHeight: 1.8, color: "var(--muted)" }}>
          <strong>English:</strong> The services section has been restructured
          into three legal capacities (Notary Public, Advocate and Mediator).
          The editor for this section will be available shortly.
        </p>
        <p
          style={{
            marginTop: "20px",
            fontSize: "0.875rem",
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          यो खण्ड अद्यावधिक हुँदैछ — केही समयमै सम्पादन गर्न मिल्नेछ
          (This section is being upgraded)
        </p>
      </div>

      <div style={{ marginTop: "24px" }}>
        <Link href="/admin" className="admin-btn admin-btn--outline">
          ← ड्यासबोर्डमा फर्कनुहोस् (Back to Dashboard)
        </Link>
      </div>
    </div>
  );
}
