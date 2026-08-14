"use client";

import { useState, useRef, useEffect } from "react";

interface HeaderNavProps {
  siteName: string;
  siteSub: string;
  navLinks: { href: string; label: string }[];
  openMenuLabel: string;
}

/**
 * HeaderNav Client Component
 * Replaces the CSS-only checkbox toggle with a fully accessible React state toggle.
 * Toggles mobile navigation dropdown while remaining 100% unchanged on desktop (>=701px).
 */
export default function HeaderNav({
  siteName,
  siteSub,
  navLinks,
  openMenuLabel,
}: HeaderNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  function toggleMenu() {
    setIsOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      // Focus first nav link when panel opens
      const firstLink = navRef.current?.querySelector<HTMLAnchorElement>("a");
      if (firstLink) {
        firstLink.focus();
      }

      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
          closeMenu();
        }
      }

      function handleOutsideClick(e: MouseEvent | TouchEvent) {
        const target = e.target as Node;
        if (
          navRef.current &&
          !navRef.current.contains(target) &&
          buttonRef.current &&
          !buttonRef.current.contains(target)
        ) {
          closeMenu();
        }
      }

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("touchstart", handleOutsideClick);
      };
    } else if (wasOpen.current) {
      // Return focus to button when panel closes
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div className="site-header__inner">
      <a href="/" className="wordmark">
        <span className="wordmark__name">{siteName}</span>
        <span className="wordmark__sub">{siteSub}</span>
      </a>

      <button
        ref={buttonRef}
        type="button"
        className="hamburger-btn"
        aria-label={openMenuLabel}
        aria-expanded={isOpen}
        aria-controls="site-main-nav"
        onClick={toggleMenu}
      >
        <span className="sr-only">{openMenuLabel}</span>
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <nav
        ref={navRef}
        id="site-main-nav"
        className={`site-nav${isOpen ? " site-nav--open" : ""}`}
        aria-label="मुख्य नेभिगेसन"
      >
        {navLinks.map((link, idx) => (
          <a key={idx} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
