import { requireAdmin } from "@/lib/auth";
import { getContent } from "@/lib/content";
import {
  updateServicesAction,
  addServiceAction,
  deleteServiceAction,
  moveServiceAction,
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
          कार्यालयद्वारा प्रदान गरिने कानुनी सेवाहरूको सूची, शीर्षक, विवरण र क्रम
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <form action={updateServicesAction}>
        {/* Section Header */}
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
            labelNe="खण्डको परिचय पाठ"
            labelEn="Section Intro Text"
            namePrefix="intro"
            valueNe={s.intro.ne}
            valueEn={s.intro.en}
            isTextarea
            required
          />
        </div>

        {/* Services List */}
        <div className="admin-card">
          <h2 className="admin-card__title">सेवाहरूको सूची ({s.items.length} वटा सेवाहरू)</h2>
          <input type="hidden" name="items_count" value={s.items.length} />

          {s.items.map((item, i) => (
            <div key={i} className="admin-item-row">
              <div className="admin-item-row__header">
                <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--blue)" }}>
                  सेवा #{i + 1}: {item.title.ne}
                </span>
                <div className="admin-item-row__actions">
                  <button
                    type="submit"
                    formAction={moveServiceAction.bind(null, i, "up")}
                    disabled={i === 0}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    title="माथि सार्नुहोस्"
                  >
                    ↑ माथि
                  </button>
                  <button
                    type="submit"
                    formAction={moveServiceAction.bind(null, i, "down")}
                    disabled={i === s.items.length - 1}
                    className="admin-btn admin-btn--outline admin-btn--sm"
                    title="तल सार्नुहोस्"
                  >
                    ↓ तल
                  </button>
                  <button
                    type="submit"
                    formAction={deleteServiceAction.bind(null, i)}
                    className="admin-btn admin-btn--danger admin-btn--sm"
                  >
                    हटाउनुहोस् (Delete)
                  </button>
                </div>
              </div>

              <BilingualField
                labelNe="सेवाको शीर्षक"
                labelEn="Service Title"
                namePrefix={`item_${i}_title`}
                valueNe={item.title.ne}
                valueEn={item.title.en}
                required
              />

              <BilingualField
                labelNe="सेवाको विस्तृत विवरण"
                labelEn="Service Description"
                namePrefix={`item_${i}_desc`}
                valueNe={item.desc.ne}
                valueEn={item.desc.en}
                isTextarea
                required
              />
            </div>
          ))}
        </div>

        <div className="admin-btn-group">
          <button type="submit" className="admin-btn admin-btn--primary">
            सबै सेभ गर्नुहोस् (Save Services)
          </button>
        </div>
      </form>

      {/* Add Service Form */}
      <div className="admin-card" style={{ marginTop: "24px" }}>
        <h3 className="admin-card__title">नयाँ सेवा थप्नुहोस् (Add New Service)</h3>
        <form action={addServiceAction}>
          <BilingualField
            labelNe="नयाँ सेवाको शीर्षक"
            labelEn="New Service Title"
            namePrefix="new_title"
            valueNe=""
            valueEn=""
            required
          />
          <BilingualField
            labelNe="नयाँ सेवाको विवरण"
            labelEn="New Service Description"
            namePrefix="new_desc"
            valueNe=""
            valueEn=""
            isTextarea
            required
          />
          <button type="submit" className="admin-btn admin-btn--outline">
            + सेवा थप्नुहोस् (Add Service)
          </button>
        </form>
      </div>
    </div>
  );
}
