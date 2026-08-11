import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import {
  updateServicesHeaderAction,
  updateServicesCategoriesAction,
  addServiceCategoryAction,
  deleteServiceCategoryAction,
  moveServiceCategoryAction,
} from "../actions";
import Banner from "../components/Banner";
import BilingualField from "../components/BilingualField";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminServicesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const content = await getContent();
  const s = content.services;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">सेवाहरू सम्पादन (Services)</h1>
        <p className="admin-header__sub">
          तीन वर्ग — नोटरी पब्लिक, कानुनी सेवा र मेलमिलाप
        </p>
      </div>

      <Banner ok={ok} error={error} />

      {/* ── SECTION HEADER CARD ─────────────────────────────────────────── */}
      <form action={updateServicesHeaderAction}>
        <div className="admin-card">
          <h2 className="admin-card__title">खण्ड शीर्षक र परिचय (Section Header)</h2>
          <BilingualField
            labelNe="खण्डको मुख्य शीर्षक"
            labelEn="Section Heading"
            namePrefix="heading"
            valueNe={s.heading.ne}
            valueEn={s.heading.en}
            required
          />
          <BilingualField
            labelNe="परिचय पाठ (Intro)"
            labelEn="Intro Text"
            namePrefix="intro"
            valueNe={s.intro.ne}
            valueEn={s.intro.en}
            isTextarea
            required
          />
          <BilingualField
            labelNe="सामान्य सूचना / टिप्पणी (Global Note)"
            labelEn="Global Note (shown after all categories)"
            namePrefix="note"
            valueNe={s.note.ne}
            valueEn={s.note.en}
            isTextarea
          />
        </div>
        <div className="admin-btn-group" style={{ marginBottom: "32px" }}>
          <button type="submit" className="admin-btn admin-btn--primary">
            सेभ गर्नुहोस् (Save Header)
          </button>
        </div>
      </form>

      {/* ── CATEGORY CARDS ──────────────────────────────────────────────── */}
      <h2
        style={{
          fontFamily: "var(--font-noto-serif-dev), Georgia, serif",
          fontSize: "1.125rem",
          fontWeight: 700,
          marginBottom: "16px",
        }}
      >
        वर्गहरू (Categories) — {s.categories.length} वटा
      </h2>

      <form action={updateServicesCategoriesAction}>
        <input type="hidden" name="cats_count" value={s.categories.length} />

        {s.categories.map((cat, ci) => {
          const totalGroups = cat.groups.length;
          const totalItems = cat.groups.reduce(
            (sum, g) => sum + g.items.length,
            0
          );
          return (
            <div
              key={ci}
              className="admin-card"
              style={{ borderTop: "3px solid var(--red)" }}
            >
              {/* Card header row */}
              <div className="admin-item-row__header">
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "1.0625rem",
                    color: "var(--blue)",
                  }}
                >
                  वर्ग #{ci + 1}
                </span>
                <div className="admin-item-row__actions">
                  {/* Move up */}
                  <form action={moveServiceCategoryAction.bind(null, ci, "up")}>
                    <button
                      type="submit"
                      disabled={ci === 0}
                      className="admin-btn admin-btn--outline admin-btn--sm"
                      title="माथि सार्नुहोस्"
                    >
                      ↑ माथि
                    </button>
                  </form>
                  {/* Move down */}
                  <form
                    action={moveServiceCategoryAction.bind(null, ci, "down")}
                  >
                    <button
                      type="submit"
                      disabled={ci === s.categories.length - 1}
                      className="admin-btn admin-btn--outline admin-btn--sm"
                      title="तल सार्नुहोस्"
                    >
                      ↓ तल
                    </button>
                  </form>
                  {/* Delete */}
                  <form action={deleteServiceCategoryAction.bind(null, ci)}>
                    <button
                      type="submit"
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={(e) => {
                        if (
                          !confirm(
                            `वर्ग "#${ci + 1}: ${cat.title.ne}" सहित यसका सबै समूह र सेवाहरू हटाउने? (Delete category and all its groups/items?)`
                          )
                        )
                          e.preventDefault();
                      }}
                    >
                      हटाउनुहोस् (Delete)
                    </button>
                  </form>
                </div>
              </div>

              {/* Text fields */}
              <BilingualField
                labelNe="वर्गको शीर्षक"
                labelEn="Category Title"
                namePrefix={`cat_${ci}_title`}
                valueNe={cat.title.ne}
                valueEn={cat.title.en}
                required
              />
              <BilingualField
                labelNe="उप-शीर्षक (Subtitle)"
                labelEn="Subtitle"
                namePrefix={`cat_${ci}_subtitle`}
                valueNe={cat.subtitle.ne}
                valueEn={cat.subtitle.en}
              />
              <BilingualField
                labelNe="वर्गको सूचना (Category Note)"
                labelEn="Category Note (shown after this category's items)"
                namePrefix={`cat_${ci}_note`}
                valueNe={cat.note.ne}
                valueEn={cat.note.en}
                isTextarea
              />

              {/* Stats */}
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                  marginTop: "8px",
                  marginBottom: "12px",
                }}
              >
                {totalGroups} समूह, {totalItems} सेवा ({totalGroups} groups,{" "}
                {totalItems} items)
              </p>

              {/* Edit groups link */}
              <Link
                href={`/admin/services/${ci}`}
                className="admin-btn admin-btn--outline"
                style={{ display: "inline-flex", textDecoration: "none" }}
              >
                समूह र सेवाहरू सम्पादन गर्नुहोस् (Edit groups &amp; items) →
              </Link>
            </div>
          );
        })}

        <div className="admin-btn-group" style={{ marginBottom: "32px" }}>
          <button type="submit" className="admin-btn admin-btn--primary">
            सबै सेभ गर्नुहोस् (Save All Categories)
          </button>
        </div>
      </form>

      {/* ── ADD NEW CATEGORY ─────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginTop: "8px" }}>
        <h3 className="admin-card__title">
          नयाँ वर्ग थप्नुहोस् (Add New Category)
        </h3>
        <form action={addServiceCategoryAction}>
          <BilingualField
            labelNe="नयाँ वर्गको शीर्षक (कम्तीमा नेपालीमा)"
            labelEn="New Category Title (Nepali required at minimum)"
            namePrefix="new_cat_title"
            valueNe=""
            valueEn=""
            required
          />
          <button type="submit" className="admin-btn admin-btn--outline">
            + नयाँ वर्ग थप्नुहोस् (Add Category)
          </button>
        </form>
      </div>
    </div>
  );
}
