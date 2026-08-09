import { cookies } from "next/headers";
import type { Lang, BilingualPair } from "./types";

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const val = cookieStore.get("lang")?.value;
  return val === "en" ? "en" : "ne";
}

export function t(pair: BilingualPair, lang: Lang): string {
  return pair[lang];
}

export function t2(pair: BilingualPair, lang: Lang): string {
  return pair[lang === "ne" ? "en" : "ne"];
}

const DEVANAGARI_DIGITS: Record<string, string> = {
  "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
  "5": "५", "6": "६", "7": "७", "8": "८", "9": "९",
};

export function nd(str: string, lang: Lang): string {
  if (lang !== "ne") return str;
  return str.replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[d] ?? d);
}

export function formatIndex(n: number, lang: Lang): string {
  const s = String(n).padStart(2, "0");
  return nd(s, lang);
}
