/**
 * lib/phone.ts
 *
 * Utilities to derive standardized tel: and wa.me href links from raw phone strings.
 */

export function telHref(raw: string | undefined | null): string {
  if (!raw) return "#";
  const d = String(raw).replace(/\D/g, "");
  if (!d) return "#";

  if (d.startsWith("977")) {
    return "tel:+" + d;
  }
  if (d.startsWith("0")) {
    return "tel:+977" + d.slice(1);
  }
  if (d.startsWith("9") && d.length === 10) {
    return "tel:+977" + d;
  }
  return "tel:+" + d;
}

export function waHref(raw: string | undefined | null): string {
  if (!raw) return "#";
  let d = String(raw).replace(/\D/g, "");
  if (!d) return "#";

  if (d.startsWith("977")) {
    // use as-is
  } else if (d.startsWith("9") && d.length === 10) {
    d = "977" + d;
  }

  return "https://wa.me/" + d;
}
