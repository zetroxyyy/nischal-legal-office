import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { getLang, t, t2, nd } from "@/lib/lang";
import { telHref, waHref } from "@/lib/phone";
import { submitContactFormAction } from "./actions";
import GalleryLightbox from "./GalleryLightbox";

// Allow cookies() (used by getLang) to block prerendering in Next.js 16
export const instant = false;

interface ContactPageProps {
  searchParams: Promise<{ sent?: string; err?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const seed = await getContent();
  return {
    title: `${t(seed.contact.heading, lang)} — ${t(seed.settings.siteName, lang)}`,
    description: t(seed.contact.intro, lang),
    alternates: {
      canonical: "/contact",
      languages: {
        ne: "/contact?lang=ne",
        en: "/contact?lang=en",
        "x-default": "/contact",
      },
    },
  };
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const lang = await getLang();
  const seed = await getContent();
  const { sent, err } = await searchParams;
  const { settings, ui, contact, gallery } = seed;

  const phoneDisplay = nd(settings.phone, lang);
  const mobileDisplay = nd(settings.mobile, lang);
  const mobile2Display = settings.mobile2 ? nd(settings.mobile2, lang) : "";

  const formNameLabel = ui.form_name ? t(ui.form_name, lang) : (lang === "ne" ? "नाम" : "Name");
  const formPhoneLabel = ui.form_phone ? t(ui.form_phone, lang) : (lang === "ne" ? "फोन / मोबाइल" : "Phone");
  const formMessageLabel = ui.form_message ? t(ui.form_message, lang) : (lang === "ne" ? "सन्देश" : "Message");
  const formSendLabel = ui.form_send ? t(ui.form_send, lang) : (lang === "ne" ? "सन्देश पठाउनुहोस्" : "Send message");
  const formSuccessMsg = ui.form_success
    ? t(ui.form_success, lang)
    : (lang === "ne" ? "तपाईंको सन्देश प्राप्त भयो । धन्यवाद !" : "Your message has been received. Thank you!");
  const formErrorMsg = ui.form_error
    ? t(ui.form_error, lang)
    : (lang === "ne" ? "माफ गर्नुहोस्, सन्देश पठाउन सकिएन । फेरि प्रयास गर्नुहोस् ।" : "Sorry, the message could not be sent. Please try again.");

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
                    <a href={telHref(settings.phone)}>{phoneDisplay}</a>
                  </dd>
                </div>
                <div className="contact-dl__row">
                  <dt className="contact-dl__label">{t(ui.mobile_label, lang)}</dt>
                  <dd className="contact-dl__value">
                    <a href={telHref(settings.mobile)}>{mobileDisplay}</a>
                  </dd>
                </div>
                {settings.mobile2 && (
                  <div className="contact-dl__row">
                    <dt className="contact-dl__label">
                      {lang === "ne" ? "मोबाइल २" : "Mobile 2"}
                    </dt>
                    <dd className="contact-dl__value">
                      <a href={telHref(settings.mobile2)}>{mobile2Display}</a>
                    </dd>
                  </div>
                )}
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
                  href={telHref(settings.mobile)}
                  className="btn btn-primary"
                  id="contact-call-btn"
                >
                  {t(ui.call, lang)}
                </a>
                <a
                  href={waHref(settings.whatsapp)}
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

          {/* ── PUBLIC CONTACT FORM ────────────────────────────────────────── */}
          <div className="contact-form-wrap" id="contact-form">
            <div className="contact-form-card">
              <h2 className="lockup__heading" style={{ fontSize: "1.375rem", marginBottom: "8px" }}>
                {formSendLabel}
              </h2>
              {contact.formIntro && (
                <p className="contact-form-intro">{t(contact.formIntro, lang)}</p>
              )}

              {sent === "1" && (
                <div className="form-banner form-banner--success" role="status">
                  <span>✓ {formSuccessMsg}</span>
                </div>
              )}

              {err === "1" && (
                <div className="form-banner form-banner--error" role="alert">
                  <span>⚠ {formErrorMsg}</span>
                </div>
              )}

              <form action={submitContactFormAction} key={sent === "1" ? "sent" : "form"}>
                {/* Honeypot field (hidden from genuine users) */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* Timing field */}
                <input type="hidden" name="_t" value={Date.now()} />

                <div className="form-group">
                  <label className="form-label" htmlFor="form-name">
                    {formNameLabel} <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="form-name"
                    name="name"
                    required
                    maxLength={100}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="form-phone">
                    {formPhoneLabel} <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="form-phone"
                    name="phone"
                    required
                    maxLength={30}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="form-message">
                    {formMessageLabel} <span style={{ color: "var(--red)" }}>*</span>
                  </label>
                  <textarea
                    id="form-message"
                    name="message"
                    required
                    maxLength={2000}
                    className="form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  id="contact-form-submit-btn"
                >
                  {formSendLabel}
                </button>
              </form>
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
          <GalleryLightbox
            gridLabel={t(gallery.heading, lang)}
            items={gallery.items.map((item) => ({
              image: item.image,
              caption: t(item.caption, lang),
            }))}
          />
        </div>
      </section>
    </>
  );
}
