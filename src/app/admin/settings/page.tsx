import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { updateSettingsAction } from "../actions";
import Banner from "../components/Banner";
import BilingualField from "../components/BilingualField";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;
  const content = await getContent();
  const s = content.settings;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">कार्यालय सेटिङहरू (General Settings)</h1>
        <p className="admin-header__sub">
          कार्यालयको नाम, सम्पर्क विवरण, समय, ठेगाना, सूचना ब्यानर र SEO विवरणहरू
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <form action={updateSettingsAction}>
        {/* Office Identity */}
        <div className="admin-card">
          <h2 className="admin-card__title">कार्यालयको नाम र परिचय (Office Identity)</h2>
          <BilingualField
            labelNe="कार्यालयको नाम"
            labelEn="Office / Site Name"
            namePrefix="siteName"
            valueNe={s.siteName.ne}
            valueEn={s.siteName.en}
            required
          />
          <BilingualField
            labelNe="उप-शीर्षक (तह / योग्यता)"
            labelEn="Subtitle / Qualification"
            namePrefix="siteSub"
            valueNe={s.siteSub.ne}
            valueEn={s.siteSub.en}
            required
          />
        </div>

        {/* Contact Info */}
        <div className="admin-card">
          <h2 className="admin-card__title">सम्पर्क विवरण (Contact Information)</h2>
          <div className="admin-bilingual-grid" style={{ marginBottom: "16px" }}>
            <div>
              <label className="admin-label">
                टेलिफोन (Landline Phone)
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={s.phone}
                required
                className="admin-input"
                placeholder="056-493487"
              />
            </div>
            <div>
              <label className="admin-label">
                मोबाइल नम्बर (Mobile Phone)
              </label>
              <input
                type="text"
                name="mobile"
                defaultValue={s.mobile}
                required
                className="admin-input"
                placeholder="9855054592"
              />
            </div>
          </div>

          <div className="admin-bilingual-grid" style={{ marginBottom: "16px" }}>
            <div>
              <label className="admin-label">
                मोबाइल २ (Second Mobile — optional)
              </label>
              <input
                type="text"
                name="mobile2"
                defaultValue={s.mobile2 ?? ""}
                className="admin-input"
                placeholder="9855054592 (वा खाली छोड्नुहोस्)"
              />
            </div>
            <div />
          </div>

          <div className="admin-bilingual-grid" style={{ marginBottom: "16px" }}>
            <div>
              <label className="admin-label">
                इमेल (Email Address)
              </label>
              <input
                type="email"
                name="email"
                defaultValue={s.email}
                required
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">
                ह्वाट्सएप नम्बर (WhatsApp without +)
              </label>
              <input
                type="text"
                name="whatsapp"
                defaultValue={s.whatsapp}
                required
                className="admin-input"
                placeholder="9779855054592"
              />
            </div>
          </div>

          <BilingualField
            labelNe="कार्यालय खुल्ने समय"
            labelEn="Office Hours"
            namePrefix="hours"
            valueNe={s.hours.ne}
            valueEn={s.hours.en}
          />
          <BilingualField
            labelNe="ठेगाना"
            labelEn="Address"
            namePrefix="address"
            valueNe={s.address.ne}
            valueEn={s.address.en}
          />
          <BilingualField
            labelNe="चिनारी / ल्यान्डमार्क"
            labelEn="Landmark"
            namePrefix="landmark"
            valueNe={s.landmark.ne}
            valueEn={s.landmark.en}
          />
          <BilingualField
            labelNe="भुक्तानी (ईसेवा)"
            labelEn="Payment (eSewa ID)"
            namePrefix="esewa"
            valueNe={s.esewa.ne}
            valueEn={s.esewa.en}
          />
        </div>

        {/* Map & Location */}
        <div className="admin-card">
          <h2 className="admin-card__title">गुगल नक्सा (Google Map & Location)</h2>
          <div className="admin-field-group">
            <label className="admin-label">
              गुगल नक्सा लिंक (Google Maps Link)
            </label>
            <input
              type="url"
              name="mapLink"
              defaultValue={s.mapLink}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">
              गुगल नक्सा इम्बेड लिंक (Map Embed iframe URL)
            </label>
            <input
              type="text"
              name="mapEmbed"
              defaultValue={s.mapEmbed}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label">
              प्लस कोड (Plus Code)
            </label>
            <input
              type="text"
              name="plusCode"
              defaultValue={s.plusCode}
              required
              className="admin-input"
            />
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="admin-card">
          <h2 className="admin-card__title">सूचना ब्यानर (Top Announcement Banner)</h2>
          <div className="admin-field-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="announce_show"
                defaultChecked={s.announce.show}
                className="admin-checkbox"
              />
              <span>वेबसाइटको माथि रातो सूचना ब्यानर देखाउनुहोस् (Show announcement banner)</span>
            </label>
          </div>

          <BilingualField
            labelNe="सूचना पाठ"
            labelEn="Announcement Text"
            namePrefix="announce"
            valueNe={s.announce.ne}
            valueEn={s.announce.en}
          />
        </div>

        {/* SEO & Footer */}
        <div className="admin-card">
          <h2 className="admin-card__title">खोज इन्जिन अप्टिमाइजेसन (SEO & Metadata)</h2>
          <BilingualField
            labelNe="एसईओ शीर्षक (Meta Title)"
            labelEn="SEO Title"
            namePrefix="seo_title"
            valueNe={s.seo.title.ne}
            valueEn={s.seo.title.en}
            required
          />
          <BilingualField
            labelNe="एसईओ विवरण (Meta Description)"
            labelEn="SEO Description"
            namePrefix="seo_desc"
            valueNe={s.seo.desc.ne}
            valueEn={s.seo.desc.en}
            isTextarea
            required
          />
          <div className="admin-field-group">
            <label className="admin-label">
              सामाजिक सञ्जाल तस्बिर (OG Share Image URL)
            </label>
            <input
              type="text"
              name="seo_ogImage"
              defaultValue={s.seo.ogImage}
              required
              className="admin-input"
            />
          </div>

          <BilingualField
            labelNe="फुटरको टिप्पणी (Footer Note)"
            labelEn="Footer Note"
            namePrefix="footerNote"
            valueNe={s.footerNote.ne}
            valueEn={s.footerNote.en}
          />
        </div>

        <div className="admin-btn-group">
          <button type="submit" className="admin-btn admin-btn--primary">
            सेभ गर्नुहोस् (Save Settings)
          </button>
        </div>
      </form>
    </div>
  );
}
