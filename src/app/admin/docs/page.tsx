import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import {
  updateDocsAction,
  addDocGroupAction,
  deleteDocGroupAction,
  addDocItemAction,
  deleteDocItemAction,
  moveDocItemAction,
} from "../actions";
import Banner from "../components/Banner";
import BilingualField from "../components/BilingualField";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminDocsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const content = await getContent();
  const d = content.docs;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">आवश्यक कागजात सम्पादन (Required Documents)</h1>
        <p className="admin-header__sub">
          सेवाग्राहीले ल्याउनुपर्ने कागजातका समूहहरू, कागजात सूची र महत्त्वपूर्ण सूचना
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <form action={updateDocsAction}>
        {/* Header & Note */}
        <div className="admin-card">
          <h2 className="admin-card__title">खण्ड शीर्षक र सूचना (Section Header & Note)</h2>
          <BilingualField
            labelNe="खण्डको मुख्य शीर्षक"
            labelEn="Section Heading"
            namePrefix="heading"
            valueNe={d.heading.ne}
            valueEn={d.heading.en}
            required
          />
          <BilingualField
            labelNe="खण्डको परिचय पाठ"
            labelEn="Section Intro Text"
            namePrefix="intro"
            valueNe={d.intro.ne}
            valueEn={d.intro.en}
            isTextarea
            required
          />
          <BilingualField
            labelNe="कानुनी सूचना / टिप्पणी (Legal Note / Disclaimer)"
            labelEn="Legal Note / Disclaimer"
            namePrefix="note"
            valueNe={d.note.ne}
            valueEn={d.note.en}
            isTextarea
            required
          />
        </div>

        {/* Document Groups */}
        <input type="hidden" name="groups_count" value={d.groups.length} />

        {d.groups.map((group, gi) => (
          <div key={gi} className="admin-card">
            <div className="admin-item-row__header">
              <span style={{ fontWeight: 700, fontSize: "1.0625rem", color: "var(--blue)" }}>
                समूह #{gi + 1}: {group.title.ne}
              </span>
              <button
                type="submit"
                formAction={deleteDocGroupAction.bind(null, gi)}
                className="admin-btn admin-btn--danger admin-btn--sm"
              >
                समूह हटाउनुहोस् (Delete Group)
              </button>
            </div>

            <BilingualField
              labelNe="समूहको शीर्षक"
              labelEn="Group Title"
              namePrefix={`group_${gi}_title`}
              valueNe={group.title.ne}
              valueEn={group.title.en}
              required
            />

            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: "16px 0 8px" }}>
              कागजातहरूको सूची ({group.items.length} वटा)
            </h3>

            <input type="hidden" name={`group_${gi}_items_count`} value={group.items.length} />

            {group.items.map((item, ii) => (
              <div key={ii} className="admin-item-row" style={{ backgroundColor: "var(--paper)" }}>
                <div className="admin-item-row__header">
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                    कागजात #{ii + 1}
                  </span>
                  <div className="admin-item-row__actions">
                    <button
                      type="submit"
                      formAction={moveDocItemAction.bind(null, gi, ii, "up")}
                      disabled={ii === 0}
                      className="admin-btn admin-btn--outline admin-btn--sm"
                      title="माथि सार्नुहोस्"
                    >
                      ↑
                    </button>
                    <button
                      type="submit"
                      formAction={moveDocItemAction.bind(null, gi, ii, "down")}
                      disabled={ii === group.items.length - 1}
                      className="admin-btn admin-btn--outline admin-btn--sm"
                      title="तल सार्नुहोस्"
                    >
                      ↓
                    </button>
                    <button
                      type="submit"
                      formAction={deleteDocItemAction.bind(null, gi, ii)}
                      className="admin-btn admin-btn--danger admin-btn--sm"
                    >
                      हटाउनुहोस्
                    </button>
                  </div>
                </div>
                <div className="admin-bilingual-grid">
                  <div>
                    <input
                      type="text"
                      name={`group_${gi}_item_${ii}_ne`}
                      defaultValue={item.ne}
                      required
                      className="admin-input"
                      placeholder="नेपाली विवरण"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name={`group_${gi}_item_${ii}_en`}
                      defaultValue={item.en}
                      required
                      className="admin-input"
                      placeholder="English description"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add item to this group */}
            <div style={{ marginTop: "12px", borderTop: "1px dashed var(--line)", paddingTop: "12px" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                यस समूहमा नयाँ कागजात थप्नुहोस् (Add Document to this Group):
              </span>
              <div className="admin-bilingual-grid" style={{ marginBottom: "8px" }}>
                <div>
                  <input
                    type="text"
                    name={`new_item_${gi}_ne`}
                    form={`add_doc_item_form_${gi}`}
                    className="admin-input"
                    placeholder="नयाँ कागजात (नेपाली)"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name={`new_item_${gi}_en`}
                    form={`add_doc_item_form_${gi}`}
                    className="admin-input"
                    placeholder="New Document (English)"
                  />
                </div>
              </div>
              <button
                type="submit"
                formAction={addDocItemAction.bind(null, gi)}
                className="admin-btn admin-btn--outline admin-btn--sm"
              >
                + कागजात थप्नुहोस् (Add Item)
              </button>
            </div>
          </div>
        ))}

        <div className="admin-btn-group">
          <button type="submit" className="admin-btn admin-btn--primary">
            सबै सेभ गर्नुहोस् (Save Documents Section)
          </button>
        </div>
      </form>

      {/* Add New Group Form */}
      <div className="admin-card" style={{ marginTop: "24px" }}>
        <h3 className="admin-card__title">नयाँ कागजात समूह थप्नुहोस् (Add Document Group)</h3>
        <form action={addDocGroupAction}>
          <BilingualField
            labelNe="नयाँ समूहको शीर्षक"
            labelEn="New Group Title"
            namePrefix="new_group_title"
            valueNe=""
            valueEn=""
            required
          />
          <button type="submit" className="admin-btn admin-btn--outline">
            + समूह थप्नुहोस् (Add Group)
          </button>
        </form>
      </div>
    </div>
  );
}
