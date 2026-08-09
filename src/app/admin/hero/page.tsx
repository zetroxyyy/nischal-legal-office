import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import {
  updateHeroAction,
  addHeroPointAction,
  deleteHeroPointAction,
  moveHeroPointAction,
} from "../actions";
import Banner from "../components/Banner";
import BilingualField from "../components/BilingualField";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminHeroPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const content = await getContent();
  const hero = content.hero;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">मुख्य ब्यानर सम्पादन (Hero Section)</h1>
        <p className="admin-header__sub">
          गृहपृष्ठको मुख्य शीर्षक, मुख्य बुँदाहरू र दायाँपट्टिको तस्बिर सम्पादन गर्नुहोस्
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <form action={updateHeroAction}>
        <div className="admin-card">
          <h2 className="admin-card__title">शीर्षक तथा विवरण (Hero Text)</h2>
          <BilingualField
            labelNe="किकर / सानो शीर्षक (Kicker)"
            labelEn="Kicker"
            namePrefix="kicker"
            valueNe={hero.kicker.ne}
            valueEn={hero.kicker.en}
            required
          />
          <BilingualField
            labelNe="मुख्य ठूलो शीर्षक (Main Title)"
            labelEn="Main Title"
            namePrefix="title"
            valueNe={hero.title.ne}
            valueEn={hero.title.en}
            required
          />
          <BilingualField
            labelNe="उप-शीर्षक (Subtitle)"
            labelEn="Subtitle"
            namePrefix="subtitle"
            valueNe={hero.subtitle.ne}
            valueEn={hero.subtitle.en}
            isTextarea
            required
          />
        </div>

        {/* Hero Photo */}
        <div className="admin-card">
          <h2 className="admin-card__title">मुख्य तस्बिर (Hero Photo)</h2>
          <div className="admin-field-group">
            <label className="admin-label">हालको तस्बिर (Current Image)</label>
            <div className="admin-image-preview">
              <Image
                src={hero.image}
                alt={hero.imageCaption.ne || "Hero Image"}
                width={320}
                height={220}
                style={{ objectFit: "cover", display: "block", borderRadius: "2px" }}
              />
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)", margin: "4px 0 12px" }}>
              तस्बिरको बाटो / URL: {hero.image}
            </p>
          </div>

          <div className="admin-field-group">
            <label className="admin-label">
              नयाँ तस्बिर अपलोड गर्नुहोस् (Upload New Photo - max 8MB)
            </label>
            <input
              type="file"
              name="image_file"
              accept="image/jpeg,image/png,image/webp"
              className="admin-input"
            />
          </div>

          <BilingualField
            labelNe="तस्बिरको क्याप्सन (Image Caption)"
            labelEn="Image Caption"
            namePrefix="imageCaption"
            valueNe={hero.imageCaption.ne}
            valueEn={hero.imageCaption.en}
          />
        </div>

        {/* Points list */}
        <div className="admin-card">
          <h2 className="admin-card__title">मुख्य बुँदाहरू (Bullet Points)</h2>
          <input type="hidden" name="points_count" value={hero.points.length} />

          {hero.points.map((pt, i) => (
            <div key={i} className="admin-item-row">
              <div className="admin-item-row__header">
                <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  बुँदा #{i + 1}
                </span>
                <div className="admin-item-row__actions">
                  <button
                    type="submit"
                    formAction={moveHeroPointAction.bind(null, i, "up")}
                    disabled={i === 0}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    title="माथि सार्नुहोस्"
                  >
                    ↑ माथि
                  </button>
                  <button
                    type="submit"
                    formAction={moveHeroPointAction.bind(null, i, "down")}
                    disabled={i === hero.points.length - 1}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    title="तल सार्नुहोस्"
                  >
                    ↓ तल
                  </button>
                  <button
                    type="submit"
                    formAction={deleteHeroPointAction.bind(null, i)}
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
                    name={`point_${i}_ne`}
                    defaultValue={pt.ne}
                    required
                    className="admin-input"
                    placeholder="नेपाली विवरण"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name={`point_${i}_en`}
                    defaultValue={pt.en}
                    required
                    className="admin-input"
                    placeholder="English description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-btn-group">
          <button type="submit" className="admin-btn admin-btn--primary">
            सबै सेभ गर्नुहोस् (Save Hero Section)
          </button>
        </div>
      </form>

      {/* Add New Point Form */}
      <div className="admin-card" style={{ marginTop: "24px" }}>
        <h3 className="admin-card__title">नयाँ बुँदा थप्नुहोस् (Add New Point)</h3>
        <form action={addHeroPointAction}>
          <div className="admin-bilingual-grid" style={{ marginBottom: "16px" }}>
            <div>
              <label className="admin-label">नेपाली बुँदा</label>
              <input
                type="text"
                name="new_point_ne"
                required
                className="admin-input"
                placeholder="नयाँ कानुनी सेवा वा विशेषता..."
              />
            </div>
            <div>
              <label className="admin-label">English Point</label>
              <input
                type="text"
                name="new_point_en"
                required
                className="admin-input"
                placeholder="New legal service or specialty..."
              />
            </div>
          </div>
          <button type="submit" className="admin-btn admin-btn--outline">
            + बुँदा थप्नुहोस् (Add Point)
          </button>
        </form>
      </div>
    </div>
  );
}
