"use client";

import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  href: string;
  labelNe: string;
  labelEn: string;
}

interface MobileNavProps {
  items: NavItem[];
}

export default function MobileNav({ items }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="admin-mobile-nav">
      <div className="admin-mobile-nav__header">
        <div>
          <span style={{ fontWeight: 700, color: "var(--red)", fontSize: "1.125rem" }}>
            निश्चल कानूनी कार्यालय
          </span>
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)" }}>
            व्यवस्थापन प्यानल (Admin Panel)
          </span>
        </div>
      </div>
      <select
        className="admin-mobile-nav__select"
        value={pathname}
        onChange={(e) => router.push(e.target.value)}
        aria-label="मेनु चयन गर्नुहोस्"
      >
        {items.map((item) => (
          <option key={item.href} value={item.href}>
            {item.labelNe} ({item.labelEn})
          </option>
        ))}
      </select>
    </div>
  );
}
