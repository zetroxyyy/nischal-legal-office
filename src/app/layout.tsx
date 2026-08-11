import type { Metadata } from "next";
import { connection } from "next/server";
import { Noto_Serif_Devanagari, Mukta } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";
import { getLang, t, nd } from "@/lib/lang";
import { telHref, phoneE164 } from "@/lib/phone";

// Allow cookies() (used by getLang) to block prerendering in Next.js 16
export const instant = false;

const notoSerifDev = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["600", "700"],
  variable: "--font-noto-serif-dev",
  display: "swap",
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mukta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const lang = await getLang();
  const seed = await getContent();
  const { settings } = seed;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nischal-legal-office.vercel.app";

  return {
    metadataBase: new URL(siteUrl),
    title: t(settings.seo.title, lang),
    description: t(settings.seo.desc, lang),
    alternates: {
      canonical: "/",
      languages: {
        ne: "/?lang=ne",
        en: "/?lang=en",
        "x-default": "/",
      },
    },
    openGraph: {
      title: t(settings.seo.title, lang),
      description: t(settings.seo.desc, lang),
      images: [settings.seo.ogImage],
      type: "website",
      url: siteUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  const seed = await getContent();
  const { settings, ui } = seed;

  const phoneDisplay = nd(settings.phone, lang);
  const mobileDisplay = nd(settings.mobile, lang);
  const mobile2Display = settings.mobile2 ? nd(settings.mobile2, lang) : "";
  const currentYear = nd(String(new Date().getFullYear()), lang);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nischal-legal-office.vercel.app";
  const ogImageUrl = settings.seo.ogImage.startsWith("http")
    ? settings.seo.ogImage
    : `${siteUrl}${settings.seo.ogImage}`;

  // If office hours change again, update this line — it is not driven by the admin.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "निश्चल कानूनी कार्यालय",
    alternateName: "Nischal Legal Office — Office of Nepal Notary Public",
    url: siteUrl,
    image: ogImageUrl,
    telephone: phoneE164(settings.mobile),
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lionschowk, Kshetrapur Highway",
      addressLocality: "Bharatpur",
      postalCode: "44207",
      addressRegion: "Bagmati Province",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 27.6935327,
      longitude: 84.4274409,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    founder: {
      "@type": "Person",
      name: "Hari Bdr. Mainali",
      jobTitle: "Advocate, Notary Public",
    },
  };

  return (
    <html lang={lang} className={`${notoSerifDev.variable} ${mukta.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FBF9F4" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Top strip */}
        <div className="top-strip">
          <div className="container">
            <div className="top-strip__inner">
              <div className="top-strip__contacts">
                <a href={telHref(settings.phone)}>
                  {t(ui.phone_label, lang)}: {phoneDisplay}
                </a>
                <a href={telHref(settings.mobile)}>
                  {t(ui.mobile_label, lang)}: {mobileDisplay}
                </a>
                {settings.mobile2 && (
                  <a href={telHref(settings.mobile2)}>
                    {t(ui.mobile_label, lang)} २: {mobile2Display}
                  </a>
                )}
                <span className="top-strip__hours">{t(settings.hours, lang)}</span>
              </div>
              <div className="lang-toggle">
                <form method="POST" action="/api/lang">
                  <input type="hidden" name="lang" value="ne" />
                  <button
                    type="submit"
                    className={`lang-toggle__btn${lang === "ne" ? " lang-toggle__btn--active" : ""}`}
                    aria-label="नेपालीमा हेर्नुहोस्"
                  >
                    ने
                  </button>
                </form>
                <span className="lang-sep" aria-hidden="true">/</span>
                <form method="POST" action="/api/lang">
                  <input type="hidden" name="lang" value="en" />
                  <button
                    type="submit"
                    className={`lang-toggle__btn${lang === "en" ? " lang-toggle__btn--active" : ""}`}
                    aria-label="View in English"
                  >
                    EN
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <header className="site-header" role="banner">
          <input type="checkbox" id="hamburger" className="hamburger-check" aria-hidden="true" />
          <div className="container">
            <div className="site-header__inner">
              <a href="/" className="wordmark">
                <span className="wordmark__name">{t(settings.siteName, lang)}</span>
                <span className="wordmark__sub">{t(settings.siteSub, lang)}</span>
              </a>
              <label htmlFor="hamburger" className="hamburger-label">
                <span className="sr-only">मेनु खोल्नुहोस्</span>
                <span></span>
                <span></span>
                <span></span>
              </label>
              <nav className="site-nav" aria-label="मुख्य नेभिगेसन">
                <a href="/">{t(ui.nav_home, lang)}</a>
                <a href="/services">{t(ui.nav_services, lang)}</a>
                <a href="/contact">{t(ui.nav_contact, lang)}</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Announce band */}
        {settings.announce.show && (
          <div className="announce-band" role="alert">
            {t(settings.announce, lang)}
          </div>
        )}

        <main id="main-content">{children}</main>

        {/* Footer */}
        <footer className="site-footer" role="contentinfo">
          <div className="container">
            <div className="site-footer__main">
              <div className="site-footer__grid">
                {/* Col 1: Office */}
                <div>
                  <span className="footer-wordmark">{t(settings.siteName, lang)}</span>
                  <p className="footer-note">{t(settings.footerNote, lang)}</p>
                </div>
                {/* Col 2: Quick links */}
                <div>
                  <p className="footer-col__heading">{lang === "ne" ? "छिटो लिंक" : "Quick links"}</p>
                  <ul className="footer-links">
                    <li><a href="/">{t(ui.nav_home, lang)}</a></li>
                    <li><a href="/services">{t(ui.nav_services, lang)}</a></li>
                    <li><a href="/contact">{t(ui.nav_contact, lang)}</a></li>
                  </ul>
                </div>
                {/* Col 3: Contact */}
                <div>
                  <p className="footer-col__heading">{lang === "ne" ? "सम्पर्क" : "Contact"}</p>
                  <div className="footer-detail">
                    <p>{t(settings.address, lang)}</p>
                    <p style={{ marginTop: "8px" }}>{t(settings.hours, lang)}</p>
                    <p style={{ marginTop: "8px" }}>
                      <a href={telHref(settings.phone)}>{phoneDisplay}</a>
                      {" · "}
                      <a href={telHref(settings.mobile)}>{mobileDisplay}</a>
                      {settings.mobile2 && (
                        <>
                          {" · "}
                          <a href={telHref(settings.mobile2)}>{mobile2Display}</a>
                        </>
                      )}
                    </p>
                    <p style={{ marginTop: "4px" }}>
                      <a href={`mailto:${settings.email}`}>{settings.email}</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="site-footer__colophon">
              <span>© {currentYear} {t(settings.siteName, lang)}</span>
              <span>
                {t(ui.credit, lang)}:{" "}
                <a href="https://github.com/zetroxyyy" rel="noopener" target="_blank">Zetroxy</a>
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
