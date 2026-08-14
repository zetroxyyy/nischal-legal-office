"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "crypto";
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

  // 2. Timing check (minimum 500ms)
  const renderedAtStr = String(formData.get("_t") || "");
  const renderedAt = parseInt(renderedAtStr, 10);
  const now = Date.now();
  if (!renderedAt || isNaN(renderedAt) || now - renderedAt < 500) {
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

  // 4. Per-IP Rate Limiting (max 5 submissions per hour per hashed IP)
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");
  const clientIp = (forwarded ? forwarded.split(",")[0].trim() : realIp) || "127.0.0.1";
  const ipHash = crypto.createHash("sha256").update(clientIp).digest("hex");

  try {
    const sql = getSql();

    // Check recent submission count from this hashed IP in the past 1 hour
    const recentRows = (await sql`
      SELECT COUNT(*)::int AS count
      FROM contact_submissions_log
      WHERE ip_hash = ${ipHash}
        AND created_at > now() - interval '1 hour'
    `) as { count: number }[];

    const submissionCount = recentRows[0]?.count ?? 0;
    if (submissionCount >= 5) {
      console.warn(`[contact] Rate limit exceeded for hashed IP: ${ipHash.slice(0, 8)}... (${submissionCount} submissions in last hour)`);
      redirect("/contact?err=1#contact-form");
    }

    // Record submission attempt in log
    await sql`
      INSERT INTO contact_submissions_log (ip_hash, created_at)
      VALUES (${ipHash}, now())
    `;

    // Insert contact message
    await sql`
      INSERT INTO messages (name, phone, message, lang, read, created_at)
      VALUES (${name}, ${phone}, ${message}, ${lang}, false, now())
    `;
    redirectUrl = "/contact?sent=1#contact-form";
  } catch (err: any) {
    // If redirect() was called inside try block, Next.js throws NEXT_REDIRECT
    if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[submitContactFormAction] DB error:", err);
    redirectUrl = "/contact?err=1#contact-form";
  }

  redirect(redirectUrl);
}
