import type { Metadata } from "next";
import Link from "next/link";
import React, { Suspense } from "react";
import { getCurrentAdmin } from "@/lib/auth";
import { logoutAction } from "./actions";
import MobileNav from "./components/MobileNav";
import StatusBanner from "./components/StatusBanner";
import "./admin.css";

export const metadata: Metadata = {
  title: "व्यवस्थापन प्यानल — निश्चल कानूनी कार्यालय",
  robots: {
    index: false,
    follow: false,
  },
};

export const instant = false;

const NAV_ITEMS = [
  { href: "/admin", labelNe: "ड्यासबोर्ड", labelEn: "Dashboard" },
  { href: "/admin/settings", labelNe: "सेटिङहरू", labelEn: "Settings" },
  { href: "/admin/hero", labelNe: "मुख्य ब्यानर", labelEn: "Hero" },
  { href: "/admin/services", labelNe: "सेवाहरू", labelEn: "Services" },
  { href: "/admin/docs", labelNe: "आवश्यक कागजात", labelEn: "Docs" },
  { href: "/admin/procedure", labelNe: "प्रक्रिया", labelEn: "Procedure" },
  { href: "/admin/about", labelNe: "परिचय", labelEn: "About" },
  { href: "/admin/gallery", labelNe: "तस्बिरहरू", labelEn: "Gallery" },
  { href: "/admin/labels", labelNe: "बटन र शब्दहरू", labelEn: "Labels" },
  { href: "/admin/messages", labelNe: "सन्देशहरू", labelEn: "Messages" },
  { href: "/admin/advanced", labelNe: "उन्नत / ब्याकअप", labelEn: "Advanced" },
  { href: "/admin/password", labelNe: "पासवर्ड परिवर्तन", labelEn: "Password" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // If not logged in, render plain child (e.g. login page)
  if (!admin) {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <span className="admin-sidebar__title">निश्चल कानूनी कार्यालय</span>
          <span className="admin-sidebar__sub">व्यवस्थापन प्यानल (Admin)</span>
        </div>

        <nav className="admin-nav" aria-label="व्यवस्थापन नेभिगेसन">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="admin-nav__link">
              <span>{item.labelNe}</span>
              <span className="admin-nav__sublabel">{item.labelEn}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--outline admin-btn--sm"
          >
            ↗ मुख्य वेबसाइट (Live site)
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="admin-btn admin-btn--danger admin-btn--sm"
              style={{ width: "100%" }}
            >
              लगआउट (Logout)
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile Navigation Dropdown */}
        <MobileNav items={NAV_ITEMS} />

        <main className="admin-main">
          <Suspense fallback={null}>
            <StatusBanner />
          </Suspense>

          {/* Password change warning banner */}
          {admin.must_change && (
            <div className="admin-banner admin-banner--warning" role="alert">
              <div>
                <strong>कृपया पासवर्ड परिवर्तन गर्नुहोस् (Please change your default password)</strong>
                <p style={{ margin: "4px 0 0", fontSize: "0.8125rem" }}>
                  सुरक्षाको लागि पहिलो पटक लगइन गरेपछि नयाँ पासवर्ड राख्नु आवश्यक छ।
                </p>
              </div>
              <Link href="/admin/password" className="admin-btn admin-btn--sm admin-btn--outline">
                परिवर्तन गर्नुहोस् →
              </Link>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
