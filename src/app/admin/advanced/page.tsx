import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { getSql } from "@/lib/db";
import { updateAdvancedAction, restoreBackupAction } from "../actions";
import Banner from "../components/Banner";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

interface BackupRow {
  id: number;
  created_at: string;
}

export default async function AdminAdvancedPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const content = await getContent();

  let backups: BackupRow[] = [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, created_at
      FROM site_content_backups
      ORDER BY id DESC
      LIMIT 10
    `;
    backups = rows as BackupRow[];
  } catch (err) {
    console.error("[AdminAdvanced] error loading backups:", err);
  }

  const formattedJson = JSON.stringify(content, null, 2);

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">उन्नत सम्पादन तथा ब्याकअप (Advanced JSON & Backups)</h1>
        <p className="admin-header__sub">
          वेबसाइटको सम्पूर्ण कच्चा डेटा JSON ढाँचामा सम्पादन गर्नुहोस् र विगतका ब्याकअपहरू रिस्टोर गर्नुहोस्
        </p>
      </div>

      <Banner ok={ok} error={error} />

      {/* Raw JSON Editor */}
      <div className="admin-card">
        <h2 className="admin-card__title" style={{ color: "var(--red)" }}>
          कच्चा JSON सम्पादक (Raw JSON Content Editor)
        </h2>

        <div
          className="admin-banner admin-banner--error"
          style={{ marginBottom: "16px" }}
          role="alert"
        >
          <span>
            <strong>सावधानी (Warning):</strong> यहाँ गरिएको कुनै पनि सानो गल्तीले वेबसाइटमा समस्या ल्याउन सक्छ। सबै ९ वटा कुञ्जीहरू (settings, ui, hero, services, docs, procedure, about, gallery, contact) अनिवार्य हुनुपर्छ।
          </span>
        </div>

        <form action={updateAdvancedAction}>
          <div className="admin-field-group">
            <textarea
              name="rawJson"
              defaultValue={formattedJson}
              required
              className="admin-textarea admin-textarea--code"
              spellCheck={false}
            />
          </div>

          <button type="submit" className="admin-btn admin-btn--primary">
            JSON सेभ गर्नुहोस् (Save Raw JSON)
          </button>
        </form>
      </div>

      {/* Backups List */}
      <div className="admin-card">
        <h2 className="admin-card__title">
          विगतका ब्याकअपहरू (Content Backups — Last {backups.length})
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "16px" }}>
          सामग्री सम्पादन गर्दा प्रत्येक पटक स्वतः ब्याकअप सुरक्षित हुन्छ। कुनै पुरानो संस्करण फर्काउन &quot;रिस्टोर&quot; बटन थिच्नुहोस्।
        </p>

        {backups.length === 0 ? (
          <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
            कुनै ब्याकअप सुरक्षित गरिएको छैन।
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ब्याकअप ID</th>
                  <th>सुरक्षित गरिएको मिति र समय</th>
                  <th>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>#{b.id}</td>
                    <td>
                      {new Date(b.created_at).toLocaleString("ne-NP", {
                        timeZone: "Asia/Kathmandu",
                      })}
                    </td>
                    <td>
                      <form action={restoreBackupAction.bind(null, b.id)}>
                        <button
                          type="submit"
                          className="admin-btn admin-btn--outline admin-btn--sm"
                          title="यो ब्याकअप रिस्टोर गर्नुहोस्"
                        >
                          रिस्टोर गर्नुहोस् (Restore)
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
