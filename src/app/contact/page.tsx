import type { Metadata } from "next";
import Image from "next/image";
import { getContent } from "@/lib/content";
import { getLang, t, t2, nd } from "@/lib/lang";

// Allow cookies() (used by getLang) to block prerendering in Next.js 16
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const seed = await getContent();
  return {
    title: `${t(seed.contact.heading, lang)} — ${t(seed.settings.siteName, lang)}`,
    description: t(seed.contact.intro, lang),
  };
}

export default async function ContactPage() {
  const lang = await getLang();
  const seed = await getContent();
  const { settings, ui, contact, gallery } = seed;

  const phoneDisplay = nd(settings.phone, lang);
  const mobileDisplay = nd(settings.mobile, lang);

  return (
    <>
      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="container">
          <div className="lockup">
            <h1 className="lockup__heading">{t(contact.heading, lang)}</h1>
            <p className="lockup__sub">{t2(contact.heading, lang)}</p>
            <div className="lockup__rule"></div>
          </div>
          <p style={{ maxWidth: "640px", color: "var(--muted)" }}>
            {t(contact.intro, lang)}
          </p>
        </div>
      </div>

      {/* ── CONTACT DETAILS + MAP ─────────────────────────────────────────── */}
      <section>
        <div className="container">
          <div className="contact-band__grid">
            {/* Left: details */}
            <div>
              <dl className="contact-dl">
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">{t(ui.phone_label, lang)}</dt>
                  <dd className="contact-dl__value">
                    {/* International tel: — Part A fix */}
                    <a href="tel:+97756493487">{phoneDisplay}</a>
                  </dd>
                </div>
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">{t(ui.mobile_label, lang)}</dt>
                  <dd className="contact-dl__value">
                    <a href="tel:+9779855054592">{mobileDisplay}</a>
                  </dd>
                </div>
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">{t(ui.email_label, lang)}</dt>
                  <dd className="contact-dl__value">
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  </dd>
                </div>
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">{t(ui.hours_label, lang)}</dt>
                  <dd className="contact-dl__value">{t(settings.hours, lang)}</dd>
                </div>
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">{t(ui.address_label, lang)}</dt>
                  <dd className="contact-dl__value">{t(settings.address, lang)}</dd>
                </div>
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">{t(ui.landmark_label, lang)}</dt>
                  <dd className="contact-dl__value">{t(settings.landmark, lang)}</dd>
                </div>
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">{t(ui.payment_label, lang)}</dt>
                  <dd className="contact-dl__value">{t(settings.esewa, lang)}</dd>
                </div>
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">Plus Code</dt>
                  <dd className="contact-dl__value">
                    <a
                      href={settings.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {settings.plusCode}
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="btn-group">
                <a
                  href="tel:+9779855054592"
                  className="btn btn-primary"
                  id="contact-call-btn"
                >
                  {t(ui.call, lang)}
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  id="contact-whatsapp-btn"
                >
                  {t(ui.whatsapp, lang)}
                </a>
              </div>
            </div>

            {/* Right: map */}
            <div>
              <div className="board-frame" style={{ marginBottom: "12px" }}>
                <iframe
                  src={settings.mapEmbed}
                  className="map-frame"
                  loading="lazy"
                  title={lang === "ne" ? "कार्यालयको नक्सा" : "Office location map"}
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  style={{ height: "400px" }}
                />
              </div>
              <a
                href={settings.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="map-open-link"
                id="contact-open-map-link"
              >
                {t(ui.open_map, lang)} ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────────────────── */}
      <section id="gallery" className="section-bg-alt">
        <div className="container">
          <div className="lockup">
            <h2 className="lockup__heading">{t(gallery.heading, lang)}</h2>
            <p className="lockup__sub">{t2(gallery.heading, lang)}</p>
            <div className="lockup__rule"></div>
          </div>
          <div className="gallery-grid">
            {gallery.items.map((item, i) => (
              <figure key={i}>
                <Image
                  src={item.image}
                  alt={t(item.caption, lang)}
                  width={600}
                  height={420}
                  loading="lazy"
                  style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <figcaption
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.8125rem",
                    color: "var(--muted)",
                    fontStyle: "italic",
                    background: "var(--panel)",
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  {t(item.caption, lang)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
