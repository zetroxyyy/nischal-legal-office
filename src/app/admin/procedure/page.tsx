import { requireAdmin } from "@/lib/auth";
import { getUncachedContent } from "@/lib/content";
import {
  updateProcedureAction,
  addProcedureItemAction,
  deleteProcedureItemAction,
  moveProcedureItemAction,
} from "../actions";
import Banner from "../components/Banner";
import BilingualField from "../components/BilingualField";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string; status?: string }>;
}

export default async function AdminProcedurePage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error, status } = await searchParams;
  const content = await getUncachedContent();
  const p = content.procedure;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">सेवा प्रक्रिया सम्पादन (Procedure Steps)</h1>
        <p className="admin-header__sub">
          सेवाग्राही कार्यालय आएदेखि काम सम्पन्न हुनेसम्मका चरणबद्ध प्रक्रियाहरू
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <form action={updateProcedureAction}>
        {/* Header & Intro */}
        <div className="admin-card">
          <h2 className="admin-card__title">खण्ड शीर्षक र परिचय (Section Header)</h2>
          <BilingualField
            labelNe="खण्डको मुख्य शीर्षक"
            labelEn="Section Heading"
            namePrefix="heading"
            valueNe={p.heading.ne}
            valueEn={p.heading.en}
            required
          />
          <BilingualField
            labelNe="खण्डको परिचय पाठ"
            labelEn="Section Intro Text"
            namePrefix="intro"
            valueNe={p.intro.ne}
            valueEn={p.intro.en}
            isTextarea
            required
          />
        </div>

        {/* Steps List */}
        <div className="admin-card">
          <h2 className="admin-card__title">चरणबद्ध प्रक्रियाहरू ({p.items.length} वटा चरणहरू)</h2>
          <input type="hidden" name="items_count" value={p.items.length} />

          {p.items.map((item, i) => (
            <div key={i} className="admin-item-row">
              <div className="admin-item-row__header">
                <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--blue)" }}>
                  चरण #{i + 1}
                </span>
                <div className="admin-item-row__actions">
                  <button
                    type="submit"
                    formAction={moveProcedureItemAction.bind(null, i, "up")}
                    disabled={i === 0}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    title="माथि सार्नुहोस्"
                  >
                    ↑ माथि
                  </button>
                  <button
                    type="submit"
                    formAction={moveProcedureItemAction.bind(null, i, "down")}
                    disabled={i === p.items.length - 1}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    title="तल सार्नुहोस्"
                  >
                    ↓ तल
                  </button>
                  <button
                    type="submit"
                    formAction={deleteProcedureItemAction.bind(null, i)}
                    className="admin-btn admin-btn--danger admin-btn--sm"
                  >
                    हटाउनुहोस् (Delete)
                  </button>
                </div>
              </div>

              <div className="admin-bilingual-grid">
                <div>
                  <label className="admin-label">नेपाली चरण</label>
                  <input
                    type="text"
                    name={`item_${i}_ne`}
                    defaultValue={item.ne}
                    required
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">English Step</label>
                  <input
                    type="text"
                    name={`item_${i}_en`}
                    defaultValue={item.en}
                    required
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-btn-group">
          <button type="submit" className="admin-btn admin-btn--primary">
            सबै सेभ गर्नुहोस् (Save Procedure)
          </button>
        </div>
      </form>

      {/* Add Step Form */}
      <div className="admin-card" style={{ marginTop: "24px" }}>
        <h3 className="admin-card__title">नयाँ चरण थप्नुहोस् (Add New Step)</h3>
        <form action={addProcedureItemAction}>
          <div className="admin-bilingual-grid" style={{ marginBottom: "16px" }}>
            <div>
              <label className="admin-label">नयाँ चरण (नेपाली)</label>
              <input
                type="text"
                name="new_item_ne"
                required
                className="admin-input"
                placeholder="नयाँ कार्यविधि चरण..."
              />
            </div>
            <div>
              <label className="admin-label">New Step (English)</label>
              <input
                type="text"
                name="new_item_en"
                required
                className="admin-input"
                placeholder="New procedure step..."
              />
            </div>
          </div>
          <button type="submit" className="admin-btn admin-btn--outline">
            + चरण थप्नुहोस् (Add Step)
          </button>
        </form>
      </div>
    </div>
  );
}
