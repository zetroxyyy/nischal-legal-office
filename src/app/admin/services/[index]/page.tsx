import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import {
  updateServiceCategoryGroupsAction,
  addServiceGroupAction,
  deleteServiceGroupAction,
  moveServiceGroupAction,
  addServiceItemAction,
  deleteServiceItemAction,
  moveServiceItemAction,
} from "../../actions";
import Banner from "../../components/Banner";
import ConfirmSubmitButton from "../../components/ConfirmSubmitButton";

interface PageProps {
  params: Promise<{ index: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminServiceCategoryPage({
  params,
  searchParams,
}: PageProps) {
  await requireAdmin();
  const { index: indexStr } = await params;
  const { ok, error } = await searchParams;

  const catIndex = parseInt(indexStr, 10);
  const content = await getContent();
  const cats = content.services.categories;

  // Guard: invalid index → redirect to overview
  if (isNaN(catIndex) || catIndex < 0 || catIndex >= cats.length) {
    redirect("/admin/services");
  }

  const cat = cats[catIndex];

  return (
    <div>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: "16px", fontSize: "0.875rem" }}>
        <Link
          href="/admin/services"
          style={{ color: "var(--blue)", textDecoration: "none" }}
        >
          ← सेवाहरू सम्पादन
        </Link>
        <span style={{ color: "var(--muted)", margin: "0 8px" }}>›</span>
        <span style={{ color: "var(--muted)" }}>वर्ग #{catIndex + 1}</span>
      </nav>

      <div className="admin-header">
        <h1 className="admin-header__title">
          {cat.title.ne || `वर्ग #${catIndex + 1}`}
        </h1>
        <p className="admin-header__sub">
          समूह र सेवाहरू सम्पादन (Edit Groups &amp; Items) — {cat.groups.length}{" "}
          समूह,{" "}
          {cat.groups.reduce((s, g) => s + g.items.length, 0)} सेवा
        </p>
      </div>

      <Banner ok={ok} error={error} />

      {/* ── GROUPS + ITEMS FORM ──────────────────────────────────────────── */}
      <form action={updateServiceCategoryGroupsAction.bind(null, catIndex)}>
        <input type="hidden" name="groups_count" value={cat.groups.length} />

        {cat.groups.length === 0 && (
          <div
            className="admin-card"
            style={{ color: "var(--muted)", textAlign: "center", padding: "32px" }}
          >
            <p>
              यस वर्गमा अझै कुनै समूह छैन। तल&quot;नयाँ समूह थप्नुहोस्&quot; प्रयोग
              गर्नुहोस्।
              <br />
              <span style={{ fontSize: "0.8125rem" }}>
                (No groups yet. Use &quot;Add New Group&quot; below.)
              </span>
            </p>
          </div>
        )}

        {cat.groups.map((group, gi) => (
          <div
            key={gi}
            className="admin-card"
            style={{ borderLeft: "3px solid var(--red)" }}
          >
            {/* Group header row */}
            <div className="admin-item-row__header">
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1.0625rem",
                  color: "var(--ink)",
                }}
              >
                समूह #{gi + 1}
                {group.title.ne ? ` — ${group.title.ne}` : " (शीर्षक छैन)"}
              </span>
              <div className="admin-item-row__actions">
                {/* Move group up */}
                <button
                  type="submit"
                  formAction={moveServiceGroupAction.bind(null, catIndex, gi, "up")}
                  disabled={gi === 0}
                  className="admin-btn admin-btn--outline admin-btn--sm"
                  title="समूह माथि सार्नुहोस्"
                >
                  ↑
                </button>
                {/* Move group down */}
                <button
                  type="submit"
                  formAction={moveServiceGroupAction.bind(
                    null,
                    catIndex,
                    gi,
                    "down"
                  )}
                  disabled={gi === cat.groups.length - 1}
                  className="admin-btn admin-btn--outline admin-btn--sm"
                  title="समूह तल सार्नुहोस्"
                >
                  ↓
                </button>
                {/* Delete group */}
                <ConfirmSubmitButton
                  formAction={deleteServiceGroupAction.bind(null, catIndex, gi)}
                  label="समूह हटाउनुहोस्"
                  confirmMessage={`समूह "${group.title.ne || `#${gi + 1}`}" र यसका सबै सेवाहरू हटाउने? (Delete group and all its items?)`}
                />
              </div>
            </div>

            {/* Group title inputs */}
            <input
              type="hidden"
              name={`group_${gi}_items_count`}
              value={group.items.length}
            />
            <div style={{ marginBottom: "16px" }}>
              <label className="admin-label">
                समूहको शीर्षक{" "}
                <span className="admin-label__en">(Group Title)</span>
              </label>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                  marginBottom: "8px",
                  marginTop: 0,
                }}
              >
                खाली छोड्दा शीर्षक देखिँदैन (leave empty for no header)
              </p>
              <div className="admin-bilingual-grid">
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      marginBottom: "4px",
                    }}
                  >
                    नेपाली (Nepali)
                  </span>
                  <input
                    type="text"
                    name={`group_${gi}_title_ne`}
                    defaultValue={group.title.ne}
                    className="admin-input"
                    placeholder="(खाली = शीर्षक छैन)"
                  />
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      marginBottom: "4px",
                    }}
                  >
                    English
                  </span>
                  <input
                    type="text"
                    name={`group_${gi}_title_en`}
                    defaultValue={group.title.en}
                    className="admin-input"
                    placeholder="(empty = no header)"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <h3
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                margin: "16px 0 8px",
              }}
            >
              सेवाहरू ({group.items.length} वटा)
            </h3>

            {group.items.map((item, ii) => (
              <div
                key={ii}
                className="admin-item-row"
                style={{ backgroundColor: "var(--paper)" }}
              >
                <div className="admin-item-row__header">
                  <span
                    style={{ fontSize: "0.8125rem", fontWeight: 600 }}
                  >
                    सेवा #{ii + 1}
                  </span>
                  <div className="admin-item-row__actions">
                    {/* Move item up */}
                    <button
                      type="submit"
                      formAction={moveServiceItemAction.bind(
                        null,
                        catIndex,
                        gi,
                        ii,
                        "up"
                      )}
                      disabled={ii === 0}
                      className="admin-btn admin-btn--outline admin-btn--sm"
                      title="माथि सार्नुहोस्"
                    >
                      ↑
                    </button>
                    {/* Move item down */}
                    <button
                      type="submit"
                      formAction={moveServiceItemAction.bind(
                        null,
                        catIndex,
                        gi,
                        ii,
                        "down"
                      )}
                      disabled={ii === group.items.length - 1}
                      className="admin-btn admin-btn--outline admin-btn--sm"
                      title="तल सार्नुहोस्"
                    >
                      ↓
                    </button>
                    {/* Delete item */}
                    <ConfirmSubmitButton
                      formAction={deleteServiceItemAction.bind(
                        null,
                        catIndex,
                        gi,
                        ii
                      )}
                      label="हटाउनुहोस्"
                      confirmMessage={`सेवा #${ii + 1} (${item.ne || item.en || "Item"}) हटाउने? (Delete this service item?)`}
                    />
                  </div>
                </div>
                <div className="admin-bilingual-grid">
                  <div>
                    <input
                      type="text"
                      name={`group_${gi}_item_${ii}_ne`}
                      defaultValue={item.ne}
                      className="admin-input"
                      placeholder="नेपाली सेवा विवरण"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name={`group_${gi}_item_${ii}_en`}
                      defaultValue={item.en}
                      className="admin-input"
                      placeholder="English service description"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add item to this group */}
            <div
              style={{
                marginTop: "12px",
                borderTop: "1px dashed var(--line)",
                paddingTop: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                यस समूहमा नयाँ सेवा थप्नुहोस् (Add Item to this Group):
              </span>
              <div
                className="admin-bilingual-grid"
                style={{ marginBottom: "8px" }}
              >
                <div>
                  <input
                    type="text"
                    name={`new_item_${gi}_ne`}
                    className="admin-input"
                    placeholder="नयाँ सेवा (नेपाली)"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name={`new_item_${gi}_en`}
                    className="admin-input"
                    placeholder="New service (English)"
                  />
                </div>
              </div>
              <button
                type="submit"
                formAction={addServiceItemAction.bind(null, catIndex, gi)}
                className="admin-btn admin-btn--outline admin-btn--sm"
              >
                + सेवा थप्नुहोस् (Add Item)
              </button>
            </div>
          </div>
        ))}

        {/* Save all text fields */}
        {cat.groups.length > 0 && (
          <div className="admin-btn-group" style={{ marginBottom: "32px" }}>
            <button type="submit" className="admin-btn admin-btn--primary">
              सबै सेभ गर्नुहोस् (Save All)
            </button>
          </div>
        )}
      </form>

      {/* ── ADD NEW GROUP ────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginTop: "8px" }}>
        <h3 className="admin-card__title">
          नयाँ समूह थप्नुहोस् (Add New Group)
        </h3>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--muted)",
            marginBottom: "12px",
            marginTop: "-8px",
          }}
        >
          खाली छोड्दा शीर्षक देखिँदैन — मेलमिलाप जस्ता खण्डका लागि ठीक छ
          (leave title empty for untitled groups, e.g. Mediation)
        </p>
        <form action={addServiceGroupAction.bind(null, catIndex)}>
          <div className="admin-bilingual-grid" style={{ marginBottom: "12px" }}>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginBottom: "4px",
                }}
              >
                नेपाली (Nepali)
              </span>
              <input
                type="text"
                name="new_group_title_ne"
                className="admin-input"
                placeholder="नयाँ समूहको शीर्षक (वा खाली)"
              />
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "var(--muted)",
                  marginBottom: "4px",
                }}
              >
                English
              </span>
              <input
                type="text"
                name="new_group_title_en"
                className="admin-input"
                placeholder="New group title (or empty)"
              />
            </div>
          </div>
          <button type="submit" className="admin-btn admin-btn--outline">
            + नयाँ समूह थप्नुहोस् (Add Group)
          </button>
        </form>
      </div>

      {/* Back link */}
      <div style={{ marginTop: "24px", paddingBottom: "32px" }}>
        <Link href="/admin/services" className="admin-btn admin-btn--outline">
          ← सेवाहरू सम्पादनमा फर्कनुहोस् (Back to Services)
        </Link>
      </div>
    </div>
  );
}
