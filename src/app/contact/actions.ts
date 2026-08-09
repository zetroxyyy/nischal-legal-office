"use server";

import { redirect } from "next/navigation";
import { getSql } from "@/lib/db";
import { getLang } from "@/lib/lang";

export async function submitContactFormAction(formData: FormData) {
  let redirectUrl = "/contact?sent=1#contact-form";

  // 1. Honeypot check
  const honeypot = String(formData.get("website") || "").trim();
  if (honeypot) {
    // Bot detected: pretend success silently
    redirect("/contact?sent=1#contact-form");
  }

  // 2. Timing check (minimum 3 seconds)
  const renderedAtStr = String(formData.get("_t") || "");
  const renderedAt = parseInt(renderedAtStr, 10);
  const now = Date.now();
  if (!renderedAt || isNaN(renderedAt) || now - renderedAt < 3000) {
    // Submitted too quickly (bot or spam)
    redirect("/contact?err=1#contact-form");
  }

  // 3. Extract & validate fields
  const name = String(formData.get("name") || "").trim().slice(0, 100);
  const phone = String(formData.get("phone") || "").trim().slice(0, 30);
  const message = String(formData.get("message") || "").trim().slice(0, 2000);
  const lang = await getLang();

  if (!name || !phone || !message) {
    redirect("/contact?err=1#contact-form");
  }

  try {
    const sql = getSql();
    await sql`
      INSERT INTO messages (name, phone, message, lang, read, created_at)
      VALUES (${name}, ${phone}, ${message}, ${lang}, false, now())
    `;
    redirectUrl = "/contact?sent=1#contact-form";
  } catch (err) {
    console.error("[submitContactFormAction] DB error:", err);
    redirectUrl = "/contact?err=1#contact-form";
  }

  redirect(redirectUrl);
}
