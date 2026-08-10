import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { getLang, t, t2, nd } from "@/lib/lang";

// Allow cookies() (used by getLang) to block prerendering in Next.js 16
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const seed = await getContent();
  return {
    title: `${t(seed.services.heading, lang)} — ${t(seed.settings.siteName, lang)}`,
    description: t(seed.services.intro, lang),
    alternates: {
      canonical: "/services",
      languages: {
        ne: "/services?lang=ne",
        en: "/services?lang=en",
        "x-default": "/services",
      },
    },
  };
}

export default async function ServicesPage() {
  const lang = await getLang();
  const seed = await getContent();
  const { services, docs, procedure } = seed;

  return (
    <>
      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="container">
          <div className="lockup">
            <h1 className="lockup__heading">{t(services.heading, lang)}</h1>
            <p className="lockup__sub">{t2(services.heading, lang)}</p>
            <div className="lockup__rule"></div>
          </div>
          <p style={{ maxWidth: "720px", color: "var(--muted)" }}>
            {t(services.intro, lang)}
          </p>
        </div>
      </div>

      {/* ── SERVICES FULL STRUCTURE ────────────────────────────────────────── */}
      <section>
        <div className="container">
          {services.categories.map((cat, ci) => {
            const catNote = t(cat.note, lang);
            return (
              <div key={ci} className="services-category-section">
                {/* Category heading — bilingual board-lockup style */}
                <div className="lockup">
                  <h2 className="lockup__heading">{t(cat.title, lang)}</h2>
                  <p className="lockup__sub">{t2(cat.title, lang)}</p>
                  <div className="lockup__rule"></div>
                </div>
                {/* Category subtitle in blue */}
                <p className="services-category-subtitle">{t(cat.subtitle, lang)}</p>

                {/* Groups */}
                {cat.groups.map((group, gi) => {
                  const groupTitle = t(group.title, lang).trim();
                  return (
                    <div key={gi} className="services-group">
                      {/* Red band header — only if group title is non-empty */}
                      {groupTitle && (
                        <div className="doc-card__header services-group__band">
                          <h3 className="doc-card__title">{groupTitle}</h3>
                        </div>
                      )}
                      <ol className="services-items-list" aria-label={groupTitle || t(cat.title, lang)}>
                        {group.items.map((item, ii) => (
                          <li key={ii}>
                            <span className="services-list__num" aria-hidden="true">
                              {nd(String(ii + 1), lang)}
                            </span>
                            <span>{t(item, lang)}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}

                {/* Category note — 3px red left border panel, only if non-empty */}
                {catNote && (
                  <div className="disclaimer services-cat-note" role="note">
                    {catNote}
                  </div>
                )}
              </div>
            );
          })}

          {/* Global services.note — board-framed panel */}
          {t(services.note, lang) && (
            <div className="board-frame services-global-note" role="note">
              <p style={{ margin: 0, lineHeight: 1.7, fontSize: "0.9375rem" }}>
                {t(services.note, lang)}
              </p>
            </div>
          )}
        </div>
      </section>


      {/* ── DOCUMENTS SECTION ─────────────────────────────────────────────── */}
      <section className="section-bg-alt">
        <div className="container">
          <div className="lockup">
            <h2 className="lockup__heading">{t(docs.heading, lang)}</h2>
            <p className="lockup__sub">{t2(docs.heading, lang)}</p>
            <div className="lockup__rule"></div>
          </div>
          <p style={{ marginBottom: "32px", color: "var(--muted)", maxWidth: "680px" }}>
            {t(docs.intro, lang)}
          </p>

          {/* 2×2 board-framed cards */}
          <div className="docs-grid">
            {docs.groups.map((group, gi) => (
              <div key={gi} className="doc-card board-frame">
                <div className="doc-card__header">
                  <h3 className="doc-card__title">{t(group.title, lang)}</h3>
                </div>
                <div className="doc-card__body">
                  <ul className="doc-card__list" aria-label={t(group.title, lang)}>
                    {group.items.map((item, ii) => (
                      <li key={ii}>
                        <span className="doc-card__num" aria-hidden="true">
                          {nd(String(ii + 1), lang)}
                        </span>
                        <span>{t(item, lang)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Legal disclaimer */}
          <div className="disclaimer" role="note" aria-label={lang === "ne" ? "महत्त्वपूर्ण सूचना" : "Important notice"}>
            {t(docs.note, lang)}
          </div>
        </div>
      </section>

      {/* ── PROCEDURE ─────────────────────────────────────────────────────── */}
      <section>
        <div className="container">
          <div className="lockup">
            <h2 className="lockup__heading">{t(procedure.heading, lang)}</h2>
            <p className="lockup__sub">{t2(procedure.heading, lang)}</p>
            <div className="lockup__rule"></div>
          </div>
          <p style={{ marginBottom: "32px", color: "var(--muted)", maxWidth: "680px" }}>
            {t(procedure.intro, lang)}
          </p>

          <div className="board-frame">
            <div className="procedure-panel">
              <ol className="procedure-list" aria-label={t(procedure.heading, lang)}>
                {procedure.items.map((item, i) => (
                  <li key={i}>
                    <span className="proc-num" aria-hidden="true">
                      {nd(String(i + 1), lang)}
                    </span>
                    <span>{t(item, lang)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
