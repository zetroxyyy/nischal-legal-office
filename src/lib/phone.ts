/**
 * lib/phone.ts
 *
 * Utilities to derive standardized tel:, wa.me, and E.164 phone strings from raw phone strings.
 */

export function phoneE164(raw: string | undefined | null): string {
  if (!raw) return "";
  const d = String(raw).replace(/\D/g, "");
  if (!d) return "";

  if (d.startsWith("977")) {
    return "+" + d;
  }
  if (d.startsWith("0")) {
    return "+977" + d.slice(1);
  }
  if (d.startsWith("9") && d.length === 10) {
    return "+977" + d;
  }
  return "+" + d;
}

export function telHref(raw: string | undefined | null): string {
  const e164 = phoneE164(raw);
  return e164 ? `tel:${e164}` : "#";
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
