import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import {
  updateGalleryAction,
  addGalleryPhotosAction,
  deleteGalleryItemAction,
  moveGalleryItemAction,
} from "../actions";
import Banner from "../components/Banner";
import BilingualField from "../components/BilingualField";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminGalleryPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const content = await getContent();
  const g = content.gallery;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">तस्बिर ग्यालरी सम्पादन (Photo Gallery)</h1>
        <p className="admin-header__sub">
          कार्यालयको तस्बिरहरू, क्याप्सनहरू, क्रम व्यवस्थापन र नयाँ तस्बिरहरू अपलोड गर्नुहोस्
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <form action={updateGalleryAction}>
        {/* Gallery Heading */}
        <div className="admin-card">
          <h2 className="admin-card__title">ग्यालरी शीर्षक (Gallery Heading)</h2>
          <BilingualField
            labelNe="ग्यालरीको मुख्य शीर्षक"
            labelEn="Gallery Heading"
            namePrefix="heading"
            valueNe={g.heading.ne}
            valueEn={g.heading.en}
            required
          />
        </div>

        {/* Gallery Items Grid / List */}
        <div className="admin-card">
          <h2 className="admin-card__title">कार्यालयका तस्बिरहरू ({g.items.length} वटा तस्बिरहरू)</h2>
          <input type="hidden" name="items_count" value={g.items.length} />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {g.items.map((item, i) => (
              <div
                key={i}
                className="admin-item-row"
                style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "16px", alignItems: "start" }}
              >
                <div>
                  <div className="admin-image-preview" style={{ margin: 0, width: "100%", height: "100px", position: "relative" }}>
                    <Image
                      src={item.image}
                      alt={item.caption.ne || "Gallery Image"}
                      fill
                      sizes="140px"
                      style={{ objectFit: "cover", borderRadius: "2px" }}
                    />
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "var(--muted)", wordBreak: "break-all", display: "block", marginTop: "4px" }}>
                    #{i + 1}
                  </span>
                </div>

                <div>
                  <div className="admin-item-row__header" style={{ margin: 0, paddingBottom: "6px", border: "none" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                      क्रम: #{i + 1}
                    </span>
                    <div className="admin-item-row__actions">
                      <button
                        type="submit"
                        formAction={moveGalleryItemAction.bind(null, i, "up")}
                        disabled={i === 0}
                        className="admin-btn admin-btn--outline admin-btn--sm"
                        title="माथि सार्नुहोस्"
                      >
                        ↑
                      </button>
                      <button
                        type="submit"
                        formAction={moveGalleryItemAction.bind(null, i, "down")}
                        disabled={i === g.items.length - 1}
                        className="admin-btn admin-btn--outline admin-btn--sm"
                        title="तल सार्नुहोस्"
                      >
                        ↓
                      </button>
                      <button
                        type="submit"
                        formAction={deleteGalleryItemAction.bind(null, i)}
                        className="admin-btn admin-btn--danger admin-btn--sm"
                      >
                        हटाउनुहोस्
                      </button>
                    </div>
                  </div>

                  <div className="admin-bilingual-grid" style={{ marginTop: "8px" }}>
                    <div>
                      <label className="admin-label" style={{ fontSize: "0.8125rem" }}>
                        नेपाली क्याप्सन
                      </label>
                      <input
                        type="text"
                        name={`item_${i}_caption_ne`}
                        defaultValue={item.caption.ne}
                        className="admin-input"
                        placeholder="तस्बिरको क्याप्सन..."
                      />
                    </div>
                    <div>
                      <label className="admin-label" style={{ fontSize: "0.8125rem" }}>
                        English Caption
                      </label>
                      <input
                        type="text"
                        name={`item_${i}_caption_en`}
                        defaultValue={item.caption.en}
                        className="admin-input"
                        placeholder="Photo caption..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-btn-group">
          <button type="submit" className="admin-btn admin-btn--primary">
            क्याप्सनहरू सेभ गर्नुहोस् (Save Gallery Captions)
          </button>
        </div>
      </form>

      {/* Add Multiple Photos Upload Form */}
      <div className="admin-card" style={{ marginTop: "24px" }}>
        <h3 className="admin-card__title">नयाँ तस्बिरहरू थप्नुहोस् (Upload New Photos)</h3>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "16px" }}>
          एकैपटक एक वा धेरै तस्बिरहरू छनोट गर्न सक्नुहुन्छ (JPEG, PNG, WEBP — अधिकतम ८ MB प्रति तस्बिर)।
        </p>
        <form action={addGalleryPhotosAction}>
          <div className="admin-field-group">
            <input
              type="file"
              name="photos"
              multiple
              required
              accept="image/jpeg,image/png,image/webp"
              className="admin-input"
            />
          </div>
          <button type="submit" className="admin-btn admin-btn--outline">
            + तस्बिरहरू अपलोड गर्नुहोस् (Upload Photos)
          </button>
        </form>
      </div>
    </div>
  );
}
