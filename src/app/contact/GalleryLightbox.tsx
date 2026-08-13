"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface GalleryItem {
  image: string;
  caption: string; // already translated string
}

interface GalleryLightboxProps {
  items: GalleryItem[];
  /** Accessible label for the grid, e.g. the heading translated text */
  gridLabel: string;
}

/**
 * GalleryLightbox
 * Renders a grid of photos. Clicking any photo opens a fullscreen lightbox.
 * Close by: clicking the backdrop, clicking ✕, or pressing Escape.
 * Keyboard-accessible: each trigger is a focusable button;
 * focus moves into the dialog on open and returns to the trigger on close.
 */
export default function GalleryLightbox({ items, gridLabel }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  function open(i: number) {
    setActiveIndex(i);
  }

  function close() {
    const idx = activeIndex;
    setActiveIndex(null);
    // Return focus to the trigger that opened the lightbox
    if (idx !== null && triggerRefs.current[idx]) {
      triggerRefs.current[idx]?.focus();
    }
  }

  // Move focus into dialog when it opens
  useEffect(() => {
    if (activeIndex !== null) {
      // Small timeout lets the dialog render before focus attempt
      const t = setTimeout(() => closeRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [activeIndex]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && activeIndex !== null) {
        close();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Prevent body scroll while open
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activeIndex]);

  const activeItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      {/* ── Gallery Grid ───────────────────────────────────────────────────── */}
      <div className="gallery-grid" aria-label={gridLabel}>
        {items.map((item, i) => (
          <figure key={i}>
            {/* Wrap image in a focusable button so keyboard users can activate the lightbox */}
            <button
              ref={(el) => { triggerRefs.current[i] = el; }}
              className="gallery-lightbox-trigger"
              aria-label={item.caption || `Photo ${i + 1}`}
              onClick={() => open(i)}
              type="button"
            >
              <Image
                src={item.image}
                alt={item.caption}
                width={600}
                height={420}
                loading="lazy"
                style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </button>
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
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* ── Lightbox Dialog ───────────────────────────────────────────────── */}
      {activeItem && (
        <div
          className="gallery-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.caption}
          onClick={close}
        >
          {/* Inner wrapper — stop clicks here from closing */}
          <div
            className="gallery-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              ref={closeRef}
              className="gallery-lightbox-close"
              aria-label="Close photo"
              onClick={close}
              type="button"
            >
              ✕
            </button>

            {/* Photo */}
            <div className="gallery-lightbox-img-wrap">
              <Image
                src={activeItem.image}
                alt={activeItem.caption}
                width={1200}
                height={900}
                style={{
                  maxWidth: "90vw",
                  maxHeight: "80vh",
                  width: "auto",
                  height: "auto",
                  display: "block",
                  objectFit: "contain",
                }}
                sizes="90vw"
                priority
              />
            </div>

            {/* Caption */}
            {activeItem.caption && (
              <p className="gallery-lightbox-caption">{activeItem.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
