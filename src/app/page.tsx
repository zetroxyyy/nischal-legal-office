import Image from "next/image";
import seed from "@/lib/content";
import { getLang, t, t2, nd, formatIndex } from "@/lib/lang";

export default async function HomePage() {
  const lang = await getLang();
  const { settings, ui, hero, services, about, gallery, contact } = seed;

  const phoneDisplay = nd(settings.phone, lang);
  const mobileDisplay = nd(settings.mobile, lang);

  const aboutBody = t(about.body, lang)
    .split("\n\n")
    .filter(Boolean);

  const galleryFirst4 = gallery.items.slice(0, 4);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero__grid">
            {/* Left */}
            <div>
              <p className="hero__kicker fade-up">{t(hero.kicker, lang)}</p>
              <h1 className="hero__title fade-up">{t(hero.title, lang)}</h1>
              <p className="hero__subtitle fade-up">{t(hero.subtitle, lang)}</p>
              <ul className="hero__points fade-up">
                {hero.points.map((pt, i) => (
                  <li key={i}>{t(pt, lang)}</li>
                ))}
              </ul>
              <div className="btn-group fade-up">
                <a
                  href={`tel:${settings.mobile}`}
                  className="btn btn-primary"
                  id="hero-call-btn"
                >
                  {t(ui.call, lang)}
                </a>
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  id="hero-directions-btn"
                >
                  {t(ui.directions, lang)}
                </a>
              </div>
            </div>
            {/* Right: hero image in board frame */}
            <div className="hero__img-wrap">
              <div className="board-frame">
                <Image
                  src={hero.image}
                  alt={t(hero.imageCaption, lang)}
                  width={600}
                  height={450}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  priority
                  sizes="(max-width: 860px) 100vw, 45vw"
                />
                <p className="hero__img-caption">{t(hero.imageCaption, lang)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES OVERVIEW ─────────────────────────────────────────────── */}
      <section className="section-bg-alt">
        <div className="container">
          <div className="lockup">
            <h2 className="lockup__heading">{t(services.heading, lang)}</h2>
            <p className="lockup__sub">{t2(services.heading, lang)}</p>
            <div className="lockup__rule"></div>
          </div>
          <p style={{ marginBottom: "32px", color: "var(--muted)", maxWidth: "680px" }}>
            {t(services.intro, lang)}
          </p>
          <div className="services-grid">
            {services.items.map((item, i) => (
              <div key={i} className="service-card">
                <span className="service-card__index" aria-hidden="true">
                  {formatIndex(i + 1, lang)}
                </span>
                <h3 className="service-card__title">{t(item.title, lang)}</h3>
                <p className="service-card__desc">{t(item.desc, lang)}</p>
              </div>
            ))}
          </div>
          <a href="/services" className="text-link" id="home-all-services-link">
            {t(ui.all_services, lang)} →
          </a>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section>
        <div className="container">
          <div className="about-grid">
            {/* Photo */}
            <div className="about-photo-wrap">
              <Image
                src={about.photo}
                alt={t(about.name, lang)}
                width={300}
                height={380}
                style={{ width: "100%", height: "auto", display: "block" }}
                sizes="(max-width: 860px) 100vw, 300px"
              />
            </div>
            {/* Content */}
            <div>
              <div className="lockup">
                <h2 className="lockup__heading">{t(about.heading, lang)}</h2>
                <p className="lockup__sub">{t2(about.heading, lang)}</p>
                <div className="lockup__rule"></div>
              </div>
              <p className="about__name">{t(about.name, lang)}</p>
              <p className="about__roles">{t(about.roles, lang)}</p>
              <div className="about__body">
                {aboutBody.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <div className="about__tags">
                {about.tags.map((tag, i) => (
                  <span key={i} className="about__tag">{t(tag, lang)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY STRIP ─────────────────────────────────────────────────── */}
      <section className="section-bg-alt">
        <div className="container">
          <div className="lockup">
            <h2 className="lockup__heading">{t(gallery.heading, lang)}</h2>
            <p className="lockup__sub">{t2(gallery.heading, lang)}</p>
            <div className="lockup__rule"></div>
          </div>
          <div className="gallery-strip">
            {galleryFirst4.map((item, i) => (
              <figure key={i}>
                <Image
                  src={item.image}
                  alt={t(item.caption, lang)}
                  width={400}
                  height={280}
                  style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                  sizes="(max-width: 760px) 50vw, 25vw"
                />
                <figcaption>{t(item.caption, lang)}</figcaption>
              </figure>
            ))}
          </div>
          <a href="/contact#gallery" className="text-link" id="home-more-photos-link">
            {t(ui.more_photos, lang)} →
          </a>
        </div>
      </section>

      {/* ── CONTACT BAND ──────────────────────────────────────────────────── */}
      <section className="contact-band">
        <div className="container">
          <div className="contact-band__grid">
            {/* Details */}
            <div>
              <div className="lockup">
                <h2 className="lockup__heading">{t(contact.heading, lang)}</h2>
                <p className="lockup__sub">{t2(contact.heading, lang)}</p>
                <div className="lockup__rule"></div>
              </div>
              <p className="contact-detail">
                {t(settings.address, lang)}
              </p>
              <p className="contact-detail" style={{ marginTop: "8px", color: "var(--muted)" }}>
                {t(settings.hours, lang)}
              </p>
              <a
                href={`tel:${settings.phone.replace(/-/g, "")}`}
                className="contact-detail__phone-big"
                style={{ marginTop: "16px", display: "block" }}
              >
                {phoneDisplay}
              </a>
              <div className="btn-group" style={{ marginTop: "20px" }}>
                <a
                  href={`tel:${settings.mobile}`}
                  className="btn btn-primary"
                  id="contact-band-call-btn"
                >
                  {t(ui.call, lang)}
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  id="contact-band-whatsapp-btn"
                >
                  {t(ui.whatsapp, lang)}
                </a>
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  id="contact-band-directions-btn"
                >
                  {t(ui.directions, lang)}
                </a>
              </div>
            </div>
            {/* Map */}
            <div className="board-frame">
              <iframe
                src={settings.mapEmbed}
                className="map-frame"
                loading="lazy"
                title={lang === "ne" ? "कार्यालयको नक्सा" : "Office location map"}
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
