import { requireAdmin } from "@/lib/auth";
import { getSql } from "@/lib/db";
import { markMessageReadAction, deleteMessageAction } from "../actions";
import Banner from "../components/Banner";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

interface MessageRow {
  id: number;
  name: string;
  phone: string;
  message: string;
  lang: string;
  read: boolean;
  created_at: string;
}

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;

  let messages: MessageRow[] = [];
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, name, phone, message, lang, read, created_at
      FROM messages
      ORDER BY id DESC
    `;
    messages = rows as MessageRow[];
  } catch (err) {
    console.error("[AdminMessages] error loading messages:", err);
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">ग्राहक सन्देशहरू (Messages Inbox)</h1>
        <p className="admin-header__sub">
          वेबसाइटबाट सेवाग्राहीहरूले पठाएका सोधपुछ तथा सन्देशहरू
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <div className="admin-card">
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
            <p style={{ fontSize: "1.125rem", margin: 0, fontWeight: 500 }}>
              हालसम्म कुनै सन्देश प्राप्त भएको छैन।
            </p>
            <p style={{ fontSize: "0.875rem", margin: "6px 0 0" }}>
              (No messages received yet. The public contact form arrives in Phase 4.)
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>स्थिति</th>
                  <th>मिति</th>
                  <th>नाम</th>
                  <th>फोन</th>
                  <th>भाषा</th>
                  <th>सन्देश</th>
                  <th>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id} className={m.read ? "" : "admin-table tr--unread"}>
                    <td>
                      {m.read ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>पढिसकियो</span>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            backgroundColor: "var(--red)",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            fontWeight: 600,
                          }}
                        >
                          नयाँ
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                      {new Date(m.created_at).toLocaleDateString("ne-NP", {
                        timeZone: "Asia/Kathmandu",
                      })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>
                      <a href={`tel:${m.phone}`} style={{ color: "var(--blue)", fontWeight: 500 }}>
                        {m.phone}
                      </a>
                    </td>
                    <td style={{ textTransform: "uppercase", fontSize: "0.75rem" }}>{m.lang}</td>
                    <td style={{ maxWidth: "300px", lineHeight: 1.4 }}>{m.message}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", whiteSpace: "nowrap" }}>
                        {!m.read && (
                          <form action={markMessageReadAction.bind(null, m.id)}>
                            <button
                              type="submit"
                              className="admin-btn admin-btn--outline admin-btn--sm"
                              title="पढियो भनी चिन्ह लगाउनुहोस्"
                            >
                              पढियो (Mark Read)
                            </button>
                          </form>
                        )}
                        <form action={deleteMessageAction.bind(null, m.id)}>
                          <button
                            type="submit"
                            className="admin-btn admin-btn--danger admin-btn--sm"
                            title="हटाउनुहोस्"
                          >
                            हटाउनुहोस्
                          </button>
                        </form>
                      </div>
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
