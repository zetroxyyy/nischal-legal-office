import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { getUncachedContent } from "@/lib/content";
import {
  updateAboutAction,
  addAboutTagAction,
  deleteAboutTagAction,
  moveAboutTagAction,
} from "../actions";
import Banner from "../components/Banner";
import BilingualField from "../components/BilingualField";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string; status?: string }>;
}

export default async function AdminAboutPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error, status } = await searchParams;
  const content = await getUncachedContent();
  const a = content.about;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">अधिवक्ता परिचय सम्पादन (About Advocate)</h1>
        <p className="admin-header__sub">
          अधिवक्ता हरि ब. मैनालीको नाम, पद, विस्तृत परिचय, फोटो र विशेषज्ञता ट्यागहरू
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <form action={updateAboutAction}>
        {/* Info */}
        <div className="admin-card">
          <h2 className="admin-card__title">व्यक्तिगत विवरण (Advocate Profile)</h2>
          <BilingualField
            labelNe="खण्डको मुख्य शीर्षक"
            labelEn="Section Heading"
            namePrefix="heading"
            valueNe={a.heading.ne}
            valueEn={a.heading.en}
            required
          />
          <BilingualField
            labelNe="अधिवक्ताको नाम"
            labelEn="Advocate Name"
            namePrefix="name"
            valueNe={a.name.ne}
            valueEn={a.name.en}
            required
          />
          <BilingualField
            labelNe="पद तथा योग्यताहरू"
            labelEn="Roles & Designations"
            namePrefix="roles"
            valueNe={a.roles.ne}
            valueEn={a.roles.en}
            required
          />
          <BilingualField
            labelNe="विस्तृत परिचय (अनुच्छेदहरू बीच खाली लाइन छोड्नुहोस्)"
            labelEn="Bio / Body (Separate paragraphs with blank lines)"
            namePrefix="body"
            valueNe={a.body.ne}
            valueEn={a.body.en}
            isTextarea
            required
          />
        </div>

        {/* Photo Upload */}
        <div className="admin-card">
          <h2 className="admin-card__title">अधिवक्ताको फोटो (Advocate Photo)</h2>
          <div className="admin-field-group">
            <label className="admin-label">हालको फोटो (Current Photo)</label>
            <div className="admin-image-preview">
              <Image
                src={a.photo}
                alt={a.name.ne || "Advocate Photo"}
                width={200}
                height={260}
                style={{ objectFit: "cover", display: "block", borderRadius: "2px" }}
              />
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)", margin: "4px 0 12px" }}>
              फोटोको बाटो / URL: {a.photo}
            </p>
          </div>

          <div className="admin-field-group">
            <label className="admin-label">
              नयाँ फोटो अपलोड गर्नुहोस् (Upload New Photo - max 8MB)
            </label>
            <input
              type="file"
              name="photo_file"
              accept="image/jpeg,image/png,image/webp"
              className="admin-input"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="admin-card">
          <h2 className="admin-card__title">विशेषज्ञता ट्यागहरू (Expertise Tags)</h2>
          <input type="hidden" name="tags_count" value={a.tags.length} />

          {a.tags.map((tag, i) => (
            <div key={i} className="admin-item-row">
              <div className="admin-item-row__header">
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  ट्याग #{i + 1}
                </span>
                <div className="admin-item-row__actions">
                  <button
                    type="submit"
                    formAction={moveAboutTagAction.bind(null, i, "up")}
                    disabled={i === 0}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    title="माथि सार्नुहोस्"
                  >
                    ↑
                  </button>
                  <button
                    type="submit"
                    formAction={moveAboutTagAction.bind(null, i, "down")}
                    disabled={i === a.tags.length - 1}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    title="तल सार्नुहोस्"
                  >
                    ↓
                  </button>
                  <button
                    type="submit"
                    formAction={deleteAboutTagAction.bind(null, i)}
                    className="admin-btn admin-btn--danger admin-btn--sm"
                  >
                    हटाउनुहोस् (Delete)
                  </button>
                </div>
              </div>

              <div className="admin-bilingual-grid">
                <div>
                  <input
                    type="text"
                    name={`tag_${i}_ne`}
                    defaultValue={tag.ne}
                    required
                    className="admin-input"
                    placeholder="नेपाली ट्याग"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name={`tag_${i}_en`}
                    defaultValue={tag.en}
                    required
                    className="admin-input"
                    placeholder="English tag"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-btn-group">
          <button type="submit" className="admin-btn admin-btn--primary">
            सबै सेभ गर्नुहोस् (Save About Section)
          </button>
        </div>
      </form>

      {/* Add Tag Form */}
      <div className="admin-card" style={{ marginTop: "24px" }}>
        <h3 className="admin-card__title">नयाँ ट्याग थप्नुहोस् (Add New Tag)</h3>
        <form action={addAboutTagAction}>
          <div className="admin-bilingual-grid" style={{ marginBottom: "16px" }}>
            <div>
              <label className="admin-label">नेपाली ट्याग</label>
              <input
                type="text"
                name="new_tag_ne"
                required
                className="admin-input"
                placeholder="उदा: नोटरी पब्लिक"
              />
            </div>
            <div>
              <label className="admin-label">English Tag</label>
              <input
                type="text"
                name="new_tag_en"
                required
                className="admin-input"
                placeholder="e.g. Notary Public"
              />
            </div>
          </div>
          <button type="submit" className="admin-btn admin-btn--outline">
            + ट्याग थप्नुहोस् (Add Tag)
          </button>
        </form>
      </div>
    </div>
  );
}
