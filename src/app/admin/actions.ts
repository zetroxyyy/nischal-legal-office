"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { put, del } from "@vercel/blob";
import { getSql } from "@/lib/db";
import { requireAdmin, setAdminSessionCookie, clearAdminSessionCookie, signAdminToken } from "@/lib/auth";
import type { SiteContent } from "@/lib/content";
import seedJson from "../../../content/seed.json";

const TOP_LEVEL_KEYS = [
  "settings",
  "ui",
  "hero",
  "services",
  "docs",
  "procedure",
  "about",
  "gallery",
  "contact",
] as const;

/**
 * Fetch raw SiteContent from DB (id=1) or fallback.
 */
async function getRawContentForMutation(): Promise<SiteContent> {
  const sql = getSql();
  const rows = (await sql`SELECT data FROM site_content WHERE id = 1 LIMIT 1`) as Record<string, any>[];
  if (!rows || rows.length === 0) {
    return seedJson as SiteContent;
  }
  return rows[0].data as SiteContent;
}

/**
 * Helper to save updated SiteContent to DB with backup rotation.
 */
async function saveContentWithBackup(newContent: SiteContent) {
  const sql = getSql();

  // 1. Back up current content
  const current = (await sql`SELECT data FROM site_content WHERE id = 1 LIMIT 1`) as Record<string, any>[];
  if (current && current.length > 0) {
    await sql`
      INSERT INTO site_content_backups (data, created_at)
      VALUES (${JSON.stringify(current[0].data)}::jsonb, now())
    `;
    // Retain only the newest 20 backups
    await sql`
      DELETE FROM site_content_backups
      WHERE id NOT IN (
        SELECT id FROM site_content_backups
        ORDER BY id DESC
        LIMIT 20
      )
    `;
  }

  // 2. Update site_content id=1
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${JSON.stringify(newContent)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET
      data = excluded.data,
      updated_at = now()
  `;

  // 3. Invalidate Next.js cache
  revalidateTag("content", "max");
}

/**
 * Helper to safely delete old blob if it's on Vercel Blob storage.
 */
async function safeDeleteBlob(url?: string | null) {
  if (!url) return;
  // Only delete if it's a Vercel Blob URL (never delete local /images/*)
  if (url.includes("blob.vercel-storage.com") || url.includes("vercel-storage.com")) {
    try {
      await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (err) {
      console.warn("[blob] Failed to delete old blob:", url, err);
    }
  }
}

/**
 * Helper to upload image to Vercel Blob.
 */
async function uploadToBlob(file: File, section: string, oldUrl?: string): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("तस्बिर फाइल खाली छ (Empty file)");
  }

  // Validate type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!validTypes.includes(file.type)) {
    throw new Error("तस्बिर JPEG, PNG वा WEBP मात्र हुनुपर्छ (Invalid file type)");
  }

  // Validate size <= 8MB
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("तस्बिर ८ MB भन्दा सानो हुनुपर्छ (File size must be <= 8MB)");
  }

  const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const pathname = `site/${section}/${Date.now()}-${sanitized}`;

  const blob = await put(pathname, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  // Try to delete old blob if replacing
  await safeDeleteBlob(oldUrl);

  return blob.url;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function loginAction(prevState: { error?: string } | null, formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "प्रयोगकर्ताको नाम र पासवर्ड अनिवार्य छ (Username & password required)" };
  }

  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT id, username, password_hash, must_change, failed_attempts, locked_until
      FROM admin_users
      WHERE username = ${username}
      LIMIT 1
    `) as Record<string, any>[];

    if (!rows || rows.length === 0) {
      return { error: "प्रयोगकर्ताको नाम वा पासवर्ड मिलेन (Invalid credentials)" };
    }

    const user = rows[0];

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMin = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
      return {
        error: `धेरै पटक गलत प्रयास भएकोले खाता ${remainingMin} मिनेटका लागि बन्द गरिएको छ (Account locked for ${remainingMin}m)`,
      };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const newAttempts = (user.failed_attempts || 0) + 1;
      if (newAttempts >= 8) {
        await sql`
          UPDATE admin_users
          SET failed_attempts = ${newAttempts},
              locked_until = now() + interval '15 minutes',
              updated_at = now()
          WHERE id = ${user.id}
        `;
        return {
          error: "८ पटक गलत पासवर्ड हालेकोले खाता १५ मिनेटका लागि बन्द गरिएको छ (Account locked for 15 minutes)",
        };
      } else {
        await sql`
          UPDATE admin_users
          SET failed_attempts = ${newAttempts},
              updated_at = now()
          WHERE id = ${user.id}
        `;
        return { error: "प्रयोगकर्ताको नाम वा पासवर्ड मिलेन (Invalid credentials)" };
      }
    }

    // Success — reset failed counters
    await sql`
      UPDATE admin_users
      SET failed_attempts = 0,
          locked_until = null,
          updated_at = now()
      WHERE id = ${user.id}
    `;

    const token = await signAdminToken({
      userId: user.id,
      username: user.username,
    });

    await setAdminSessionCookie(token);
  } catch (err) {
    console.error("[loginAction] error:", err);
    return { error: "लगइन गर्दा प्राविधिक समस्या आयो (Login error occurred)" };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function changePasswordAction(formData: FormData) {
  const admin = await requireAdmin();

  const currentPassword = String(formData.get("current_password") || "");
  const newPassword = String(formData.get("new_password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");

  let redirectUrl = "/admin/password?status=password";

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/admin/password?error=all_fields_required");
  }

  if (newPassword.length < 8) {
    redirect("/admin/password?error=min_length_8");
  }

  if (newPassword !== confirmPassword) {
    redirect("/admin/password?error=passwords_mismatch");
  }

  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT password_hash FROM admin_users WHERE id = ${admin.id} LIMIT 1
    `) as Record<string, any>[];

    if (!rows || rows.length === 0) {
      redirectUrl = "/admin/password?error=user_not_found";
    } else {
      const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
      if (!isMatch) {
        redirectUrl = "/admin/password?error=current_password_incorrect";
      } else {
        const newHash = await bcrypt.hash(newPassword, 10);
        await sql`
          UPDATE admin_users
          SET password_hash = ${newHash},
              must_change = false,
              updated_at = now()
          WHERE id = ${admin.id}
        `;
      }
    }
  } catch (err) {
    console.error("[changePasswordAction] error:", err);
    redirectUrl = "/admin/password?error=1";
  }

  redirect(redirectUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT SECTION ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/settings?status=saved";
  try {
    const content = await getRawContentForMutation();

    content.settings = {
      siteName: {
        ne: String(formData.get("siteName_ne") || "").trim(),
        en: String(formData.get("siteName_en") || "").trim(),
      },
      siteSub: {
        ne: String(formData.get("siteSub_ne") || "").trim(),
        en: String(formData.get("siteSub_en") || "").trim(),
      },
      phone: String(formData.get("phone") || "").trim(),
      mobile: String(formData.get("mobile") || "").trim(),
      // mobile2 is optional: use form value if present, otherwise keep stored value
      // Never wipe a stored mobile2 due to a missing form field
      mobile2: (() => {
        const v = String(formData.get("mobile2") ?? "").trim();
        return v !== "" ? v : (content.settings.mobile2 ?? "");
      })(),
      email: String(formData.get("email") || "").trim(),
      whatsapp: String(formData.get("whatsapp") || "").trim(),
      hours: {
        ne: String(formData.get("hours_ne") || "").trim(),
        en: String(formData.get("hours_en") || "").trim(),
      },
      address: {
        ne: String(formData.get("address_ne") || "").trim(),
        en: String(formData.get("address_en") || "").trim(),
      },
      landmark: {
        ne: String(formData.get("landmark_ne") || "").trim(),
        en: String(formData.get("landmark_en") || "").trim(),
      },
      esewa: {
        ne: String(formData.get("esewa_ne") || "").trim(),
        en: String(formData.get("esewa_en") || "").trim(),
      },
      mapLink: String(formData.get("mapLink") || "").trim(),
      mapEmbed: String(formData.get("mapEmbed") || "").trim(),
      plusCode: String(formData.get("plusCode") || "").trim(),
      announce: {
        show: formData.get("announce_show") === "on",
        ne: String(formData.get("announce_ne") || "").trim(),
        en: String(formData.get("announce_en") || "").trim(),
      },
      seo: {
        title: {
          ne: String(formData.get("seo_title_ne") || "").trim(),
          en: String(formData.get("seo_title_en") || "").trim(),
        },
        desc: {
          ne: String(formData.get("seo_desc_ne") || "").trim(),
          en: String(formData.get("seo_desc_en") || "").trim(),
        },
        ogImage: String(formData.get("seo_ogImage") || "").trim(),
      },
      footerNote: {
        ne: String(formData.get("footerNote_ne") || "").trim(),
        en: String(formData.get("footerNote_en") || "").trim(),
      },
    };

    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateSettingsAction] error:", err);
    redirectUrl = "/admin/settings?error=1";
  }

  redirect(redirectUrl);
}

export async function updateHeroAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/hero?status=saved";
  try {
    const content = await getRawContentForMutation();

    content.hero.kicker = {
      ne: String(formData.get("kicker_ne") || "").trim(),
      en: String(formData.get("kicker_en") || "").trim(),
    };
    content.hero.title = {
      ne: String(formData.get("title_ne") || "").trim(),
      en: String(formData.get("title_en") || "").trim(),
    };
    content.hero.subtitle = {
      ne: String(formData.get("subtitle_ne") || "").trim(),
      en: String(formData.get("subtitle_en") || "").trim(),
    };
    content.hero.imageCaption = {
      ne: String(formData.get("imageCaption_ne") || "").trim(),
      en: String(formData.get("imageCaption_en") || "").trim(),
    };

    // Hero image upload if provided
    const imageFile = formData.get("image_file") as File | null;
    if (imageFile && imageFile.size > 0) {
      const newUrl = await uploadToBlob(imageFile, "hero", content.hero.image);
      content.hero.image = newUrl;
      redirectUrl = "/admin/hero?status=uploaded";
    }

    // Points
    const pointsCount = parseInt(String(formData.get("points_count") || "0"), 10);
    const newPoints = [];
    for (let i = 0; i < pointsCount; i++) {
      const ne = String(formData.get(`point_${i}_ne`) || "").trim();
      const en = String(formData.get(`point_${i}_en`) || "").trim();
      if (ne || en) {
        newPoints.push({ ne, en });
      }
    }
    content.hero.points = newPoints;

    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateHeroAction] error:", err);
    redirectUrl = "/admin/hero?error=1";
  }

  redirect(redirectUrl);
}

export async function addHeroPointAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/hero?status=added";
  try {
    const content = await getRawContentForMutation();
    const ne = String(formData.get("new_point_ne") || "").trim();
    const en = String(formData.get("new_point_en") || "").trim();
    if (ne || en) {
      content.hero.points.push({ ne, en });
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[addHeroPointAction] error:", err);
    redirectUrl = "/admin/hero?error=1";
  }
  redirect(redirectUrl);
}

export async function deleteHeroPointAction(index: number) {
  await requireAdmin();
  let redirectUrl = "/admin/hero?status=deleted";
  try {
    const content = await getRawContentForMutation();
    if (index >= 0 && index < content.hero.points.length) {
      content.hero.points.splice(index, 1);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteHeroPointAction] error:", err);
    redirectUrl = "/admin/hero?error=1";
  }
  redirect(redirectUrl);
}

export async function moveHeroPointAction(index: number, direction: "up" | "down") {
  await requireAdmin();
  let redirectUrl = "/admin/hero?status=moved";
  try {
    const content = await getRawContentForMutation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < content.hero.points.length) {
      const item = content.hero.points.splice(index, 1)[0];
      content.hero.points.splice(targetIndex, 0, item);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[moveHeroPointAction] error:", err);
    redirectUrl = "/admin/hero?error=1";
  }
  redirect(redirectUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES ACTIONS — Phase 5B real editor
// ─────────────────────────────────────────────────────────────────────────────

/** Save services section header: heading, intro, global note */
export async function updateServicesHeaderAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/services?status=saved";
  try {
    const content = await getRawContentForMutation();
    content.services.heading = {
      ne: String(formData.get("heading_ne") || "").trim(),
      en: String(formData.get("heading_en") || "").trim(),
    };
    content.services.intro = {
      ne: String(formData.get("intro_ne") || "").trim(),
      en: String(formData.get("intro_en") || "").trim(),
    };
    content.services.note = {
      ne: String(formData.get("note_ne") || "").trim(),
      en: String(formData.get("note_en") || "").trim(),
    };
    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateServicesHeaderAction] error:", err);
    redirectUrl = "/admin/services?status=error";
  }
  redirect(redirectUrl);
}

/** Bulk-save category title / subtitle / note for all categories */
export async function updateServicesCategoriesAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/services?status=saved";
  try {
    const content = await getRawContentForMutation();
    const count = parseInt(String(formData.get("cats_count") || "0"), 10);
    for (let i = 0; i < count && i < content.services.categories.length; i++) {
      content.services.categories[i].title = {
        ne: String(formData.get(`cat_${i}_title_ne`) || "").trim(),
        en: String(formData.get(`cat_${i}_title_en`) || "").trim(),
      };
      content.services.categories[i].subtitle = {
        ne: String(formData.get(`cat_${i}_subtitle_ne`) || "").trim(),
        en: String(formData.get(`cat_${i}_subtitle_en`) || "").trim(),
      };
      content.services.categories[i].note = {
        ne: String(formData.get(`cat_${i}_note_ne`) || "").trim(),
        en: String(formData.get(`cat_${i}_note_en`) || "").trim(),
      };
    }
    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateServicesCategoriesAction] error:", err);
    redirectUrl = "/admin/services?status=error";
  }
  redirect(redirectUrl);
}

/** Add a new empty category */
export async function addServiceCategoryAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/services?status=added";
  try {
    const content = await getRawContentForMutation();
    const titleNe = String(formData.get("new_cat_title_ne") || "").trim();
    const titleEn = String(formData.get("new_cat_title_en") || "").trim();
    if (titleNe || titleEn) {
      content.services.categories.push({
        title: { ne: titleNe, en: titleEn },
        subtitle: { ne: "", en: "" },
        note: { ne: "", en: "" },
        groups: [],
      });
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[addServiceCategoryAction] error:", err);
    redirectUrl = "/admin/services?status=error";
  }
  redirect(redirectUrl);
}

/** Delete a category by index */
export async function deleteServiceCategoryAction(index: number) {
  await requireAdmin();
  let redirectUrl = "/admin/services?status=deleted";
  try {
    const content = await getRawContentForMutation();
    if (index >= 0 && index < content.services.categories.length) {
      content.services.categories.splice(index, 1);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteServiceCategoryAction] error:", err);
    redirectUrl = "/admin/services?status=error";
  }
  redirect(redirectUrl);
}

/** Move a category up or down */
export async function moveServiceCategoryAction(index: number, direction: "up" | "down") {
  await requireAdmin();
  let redirectUrl = "/admin/services?status=moved";
  try {
    const content = await getRawContentForMutation();
    const cats = content.services.categories;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target >= 0 && target < cats.length) {
      const [item] = cats.splice(index, 1);
      cats.splice(target, 0, item);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[moveServiceCategoryAction] error:", err);
    redirectUrl = "/admin/services?status=error";
  }
  redirect(redirectUrl);
}

/** Page 2: save all group titles + all items text for one category */
export async function updateServiceCategoryGroupsAction(
  catIndex: number,
  formData: FormData
) {
  await requireAdmin();
  let redirectUrl = `/admin/services/${catIndex}?status=saved`;
  try {
    const content = await getRawContentForMutation();
    const cats = content.services.categories;
    if (catIndex < 0 || catIndex >= cats.length) {
      redirectUrl = "/admin/services?status=error";
    } else {
      const groupCount = parseInt(String(formData.get("groups_count") || "0"), 10);
      for (let gi = 0; gi < groupCount && gi < cats[catIndex].groups.length; gi++) {
        cats[catIndex].groups[gi].title = {
          ne: String(formData.get(`group_${gi}_title_ne`) || "").trim(),
          en: String(formData.get(`group_${gi}_title_en`) || "").trim(),
        };
        const itemCount = parseInt(
          String(formData.get(`group_${gi}_items_count`) || "0"),
          10
        );
        for (
          let ii = 0;
          ii < itemCount && ii < cats[catIndex].groups[gi].items.length;
          ii++
        ) {
          cats[catIndex].groups[gi].items[ii] = {
            ne: String(formData.get(`group_${gi}_item_${ii}_ne`) || "").trim(),
            en: String(formData.get(`group_${gi}_item_${ii}_en`) || "").trim(),
          };
        }
      }
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[updateServiceCategoryGroupsAction] error:", err);
    redirectUrl = `/admin/services/${catIndex}?status=error`;
  }
  redirect(redirectUrl);
}

/** Add a new empty group to a category */
export async function addServiceGroupAction(catIndex: number, formData: FormData) {
  await requireAdmin();
  let redirectUrl = `/admin/services/${catIndex}?status=added`;
  try {
    const content = await getRawContentForMutation();
    const cats = content.services.categories;
    if (catIndex >= 0 && catIndex < cats.length) {
      const titleNe = String(formData.get("new_group_title_ne") || "").trim();
      const titleEn = String(formData.get("new_group_title_en") || "").trim();
      cats[catIndex].groups.push({
        title: { ne: titleNe, en: titleEn },
        items: [],
      });
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[addServiceGroupAction] error:", err);
    redirectUrl = `/admin/services/${catIndex}?status=error`;
  }
  redirect(redirectUrl);
}

/** Delete a group from a category */
export async function deleteServiceGroupAction(catIndex: number, groupIndex: number) {
  await requireAdmin();
  let redirectUrl = `/admin/services/${catIndex}?status=deleted`;
  try {
    const content = await getRawContentForMutation();
    const cats = content.services.categories;
    if (
      catIndex >= 0 &&
      catIndex < cats.length &&
      groupIndex >= 0 &&
      groupIndex < cats[catIndex].groups.length
    ) {
      cats[catIndex].groups.splice(groupIndex, 1);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteServiceGroupAction] error:", err);
    redirectUrl = `/admin/services/${catIndex}?status=error`;
  }
  redirect(redirectUrl);
}

/** Move a group up or down within a category */
export async function moveServiceGroupAction(
  catIndex: number,
  groupIndex: number,
  direction: "up" | "down"
) {
  await requireAdmin();
  let redirectUrl = `/admin/services/${catIndex}?status=moved`;
  try {
    const content = await getRawContentForMutation();
    const groups = content.services.categories[catIndex]?.groups;
    if (!groups) throw new Error("category not found");
    const target = direction === "up" ? groupIndex - 1 : groupIndex + 1;
    if (target >= 0 && target < groups.length) {
      const [item] = groups.splice(groupIndex, 1);
      groups.splice(target, 0, item);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[moveServiceGroupAction] error:", err);
    redirectUrl = `/admin/services/${catIndex}?status=error`;
  }
  redirect(redirectUrl);
}

/** Add an item to a group */
export async function addServiceItemAction(
  catIndex: number,
  groupIndex: number,
  formData: FormData
) {
  await requireAdmin();
  let redirectUrl = `/admin/services/${catIndex}?status=added`;
  try {
    const content = await getRawContentForMutation();
    const group = content.services.categories[catIndex]?.groups[groupIndex];
    if (!group) throw new Error("group not found");
    const ne = String(
      formData.get(`new_item_${groupIndex}_ne`) ||
        formData.get("new_item_ne") ||
        ""
    ).trim();
    const en = String(
      formData.get(`new_item_${groupIndex}_en`) ||
        formData.get("new_item_en") ||
        ""
    ).trim();
    if (ne || en) {
      group.items.push({ ne, en });
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[addServiceItemAction] error:", err);
    redirectUrl = `/admin/services/${catIndex}?status=error`;
  }
  redirect(redirectUrl);
}

/** Delete an item from a group */
export async function deleteServiceItemAction(
  catIndex: number,
  groupIndex: number,
  itemIndex: number
) {
  await requireAdmin();
  let redirectUrl = `/admin/services/${catIndex}?status=deleted`;
  try {
    const content = await getRawContentForMutation();
    const items = content.services.categories[catIndex]?.groups[groupIndex]?.items;
    if (!items) throw new Error("group/items not found");
    if (itemIndex >= 0 && itemIndex < items.length) {
      items.splice(itemIndex, 1);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteServiceItemAction] error:", err);
    redirectUrl = `/admin/services/${catIndex}?status=error`;
  }
  redirect(redirectUrl);
}

/** Move an item up or down within a group */
export async function moveServiceItemAction(
  catIndex: number,
  groupIndex: number,
  itemIndex: number,
  direction: "up" | "down"
) {
  await requireAdmin();
  let redirectUrl = `/admin/services/${catIndex}?status=moved`;
  try {
    const content = await getRawContentForMutation();
    const items = content.services.categories[catIndex]?.groups[groupIndex]?.items;
    if (!items) throw new Error("group/items not found");
    const target = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    if (target >= 0 && target < items.length) {
      const [item] = items.splice(itemIndex, 1);
      items.splice(target, 0, item);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[moveServiceItemAction] error:", err);
    redirectUrl = `/admin/services/${catIndex}?status=error`;
  }
  redirect(redirectUrl);
}


// ─────────────────────────────────────────────────────────────────────────────
// DOCS ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateDocsAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/docs?status=saved";
  try {
    const content = await getRawContentForMutation();
    content.docs.heading = {
      ne: String(formData.get("heading_ne") || "").trim(),
      en: String(formData.get("heading_en") || "").trim(),
    };
    content.docs.intro = {
      ne: String(formData.get("intro_ne") || "").trim(),
      en: String(formData.get("intro_en") || "").trim(),
    };
    content.docs.note = {
      ne: String(formData.get("note_ne") || "").trim(),
      en: String(formData.get("note_en") || "").trim(),
    };

    const groupsCount = parseInt(String(formData.get("groups_count") || "0"), 10);
    const updatedGroups = [];
    for (let g = 0; g < groupsCount; g++) {
      const titleNe = String(formData.get(`group_${g}_title_ne`) || "").trim();
      const titleEn = String(formData.get(`group_${g}_title_en`) || "").trim();
      const itemsCount = parseInt(String(formData.get(`group_${g}_items_count`) || "0"), 10);
      const items = [];
      for (let i = 0; i < itemsCount; i++) {
        const itemNe = String(formData.get(`group_${g}_item_${i}_ne`) || "").trim();
        const itemEn = String(formData.get(`group_${g}_item_${i}_en`) || "").trim();
        if (itemNe || itemEn) {
          items.push({ ne: itemNe, en: itemEn });
        }
      }
      if (titleNe || titleEn) {
        updatedGroups.push({
          title: { ne: titleNe, en: titleEn },
          items,
        });
      }
    }
    content.docs.groups = updatedGroups;

    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateDocsAction] error:", err);
    redirectUrl = "/admin/docs?status=error";
  }

  redirect(redirectUrl);
}

export async function addDocGroupAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/docs?status=added";
  try {
    const content = await getRawContentForMutation();
    const titleNe = String(formData.get("new_group_title_ne") || "").trim();
    const titleEn = String(formData.get("new_group_title_en") || "").trim();
    if (titleNe || titleEn) {
      content.docs.groups.push({
        title: { ne: titleNe, en: titleEn },
        items: [],
      });
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[addDocGroupAction] error:", err);
    redirectUrl = "/admin/docs?status=error";
  }
  redirect(redirectUrl);
}

export async function deleteDocGroupAction(groupIndex: number) {
  await requireAdmin();
  let redirectUrl = "/admin/docs?status=deleted";
  try {
    const content = await getRawContentForMutation();
    if (groupIndex >= 0 && groupIndex < content.docs.groups.length) {
      content.docs.groups.splice(groupIndex, 1);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteDocGroupAction] error:", err);
    redirectUrl = "/admin/docs?status=error";
  }
  redirect(redirectUrl);
}

export async function addDocItemAction(groupIndex: number, formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/docs?status=added";
  try {
    const content = await getRawContentForMutation();
    const itemNe = String(formData.get("new_item_ne") || "").trim();
    const itemEn = String(formData.get("new_item_en") || "").trim();
    if (groupIndex >= 0 && groupIndex < content.docs.groups.length && (itemNe || itemEn)) {
      content.docs.groups[groupIndex].items.push({ ne: itemNe, en: itemEn });
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[addDocItemAction] error:", err);
    redirectUrl = "/admin/docs?status=error";
  }
  redirect(redirectUrl);
}

export async function deleteDocItemAction(groupIndex: number, itemIndex: number) {
  await requireAdmin();
  let redirectUrl = "/admin/docs?status=deleted";
  try {
    const content = await getRawContentForMutation();
    if (
      groupIndex >= 0 &&
      groupIndex < content.docs.groups.length &&
      itemIndex >= 0 &&
      itemIndex < content.docs.groups[groupIndex].items.length
    ) {
      content.docs.groups[groupIndex].items.splice(itemIndex, 1);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteDocItemAction] error:", err);
    redirectUrl = "/admin/docs?status=error";
  }
  redirect(redirectUrl);
}

export async function moveDocItemAction(
  groupIndex: number,
  itemIndex: number,
  direction: "up" | "down"
) {
  await requireAdmin();
  let redirectUrl = "/admin/docs?status=moved";
  try {
    const content = await getRawContentForMutation();
    if (groupIndex >= 0 && groupIndex < content.docs.groups.length) {
      const items = content.docs.groups[groupIndex].items;
      const targetIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1;
      if (targetIndex >= 0 && targetIndex < items.length) {
        const moved = items.splice(itemIndex, 1)[0];
        items.splice(targetIndex, 0, moved);
        await saveContentWithBackup(content);
      }
    }
  } catch (err) {
    console.error("[moveDocItemAction] error:", err);
    redirectUrl = "/admin/docs?status=error";
  }
  redirect(redirectUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURE ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateProcedureAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/procedure?status=saved";
  try {
    const content = await getRawContentForMutation();
    content.procedure.heading = {
      ne: String(formData.get("heading_ne") || "").trim(),
      en: String(formData.get("heading_en") || "").trim(),
    };
    content.procedure.intro = {
      ne: String(formData.get("intro_ne") || "").trim(),
      en: String(formData.get("intro_en") || "").trim(),
    };

    const count = parseInt(String(formData.get("items_count") || "0"), 10);
    const updated = [];
    for (let i = 0; i < count; i++) {
      const ne = String(formData.get(`item_${i}_ne`) || "").trim();
      const en = String(formData.get(`item_${i}_en`) || "").trim();
      if (ne || en) {
        updated.push({ ne, en });
      }
    }
    content.procedure.items = updated;

    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateProcedureAction] error:", err);
    redirectUrl = "/admin/procedure?status=error";
  }

  redirect(redirectUrl);
}

export async function addProcedureItemAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/procedure?status=added";
  try {
    const content = await getRawContentForMutation();
    const ne = String(formData.get("new_item_ne") || "").trim();
    const en = String(formData.get("new_item_en") || "").trim();
    if (ne || en) {
      content.procedure.items.push({ ne, en });
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[addProcedureItemAction] error:", err);
    redirectUrl = "/admin/procedure?status=error";
  }
  redirect(redirectUrl);
}

export async function deleteProcedureItemAction(index: number) {
  await requireAdmin();
  let redirectUrl = "/admin/procedure?status=deleted";
  try {
    const content = await getRawContentForMutation();
    if (index >= 0 && index < content.procedure.items.length) {
      content.procedure.items.splice(index, 1);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteProcedureItemAction] error:", err);
    redirectUrl = "/admin/procedure?status=error";
  }
  redirect(redirectUrl);
}

export async function moveProcedureItemAction(index: number, direction: "up" | "down") {
  await requireAdmin();
  let redirectUrl = "/admin/procedure?status=moved";
  try {
    const content = await getRawContentForMutation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < content.procedure.items.length) {
      const item = content.procedure.items.splice(index, 1)[0];
      content.procedure.items.splice(targetIndex, 0, item);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[moveProcedureItemAction] error:", err);
    redirectUrl = "/admin/procedure?status=error";
  }
  redirect(redirectUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateAboutAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/about?status=saved";
  try {
    const content = await getRawContentForMutation();
    content.about.heading = {
      ne: String(formData.get("heading_ne") || "").trim(),
      en: String(formData.get("heading_en") || "").trim(),
    };
    content.about.name = {
      ne: String(formData.get("name_ne") || "").trim(),
      en: String(formData.get("name_en") || "").trim(),
    };
    content.about.roles = {
      ne: String(formData.get("roles_ne") || "").trim(),
      en: String(formData.get("roles_en") || "").trim(),
    };
    content.about.body = {
      ne: String(formData.get("body_ne") || "").trim(),
      en: String(formData.get("body_en") || "").trim(),
    };

    // Photo upload if provided
    const photoFile = formData.get("photo_file") as File | null;
    if (photoFile && photoFile.size > 0) {
      const newUrl = await uploadToBlob(photoFile, "about", content.about.photo);
      content.about.photo = newUrl;
      redirectUrl = "/admin/about?status=uploaded";
    }

    // Tags
    const tagsCount = parseInt(String(formData.get("tags_count") || "0"), 10);
    const updatedTags = [];
    for (let i = 0; i < tagsCount; i++) {
      const ne = String(formData.get(`tag_${i}_ne`) || "").trim();
      const en = String(formData.get(`tag_${i}_en`) || "").trim();
      if (ne || en) {
        updatedTags.push({ ne, en });
      }
    }
    content.about.tags = updatedTags;

    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateAboutAction] error:", err);
    redirectUrl = "/admin/about?status=error";
  }

  redirect(redirectUrl);
}

export async function addAboutTagAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/about?status=added";
  try {
    const content = await getRawContentForMutation();
    const ne = String(formData.get("new_tag_ne") || "").trim();
    const en = String(formData.get("new_tag_en") || "").trim();
    if (ne || en) {
      content.about.tags.push({ ne, en });
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[addAboutTagAction] error:", err);
    redirectUrl = "/admin/about?status=error";
  }
  redirect(redirectUrl);
}

export async function deleteAboutTagAction(index: number) {
  await requireAdmin();
  let redirectUrl = "/admin/about?status=deleted";
  try {
    const content = await getRawContentForMutation();
    if (index >= 0 && index < content.about.tags.length) {
      content.about.tags.splice(index, 1);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteAboutTagAction] error:", err);
    redirectUrl = "/admin/about?status=error";
  }
  redirect(redirectUrl);
}

export async function moveAboutTagAction(index: number, direction: "up" | "down") {
  await requireAdmin();
  let redirectUrl = "/admin/about?status=moved";
  try {
    const content = await getRawContentForMutation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < content.about.tags.length) {
      const item = content.about.tags.splice(index, 1)[0];
      content.about.tags.splice(targetIndex, 0, item);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[moveAboutTagAction] error:", err);
    redirectUrl = "/admin/about?status=error";
  }
  redirect(redirectUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// GALLERY ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateGalleryAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/gallery?status=saved";
  try {
    const content = await getRawContentForMutation();
    content.gallery.heading = {
      ne: String(formData.get("heading_ne") || "").trim(),
      en: String(formData.get("heading_en") || "").trim(),
    };

    const count = parseInt(String(formData.get("items_count") || "0"), 10);
    for (let i = 0; i < count; i++) {
      if (content.gallery.items[i]) {
        content.gallery.items[i].caption = {
          ne: String(formData.get(`item_${i}_caption_ne`) || "").trim(),
          en: String(formData.get(`item_${i}_caption_en`) || "").trim(),
        };
      }
    }

    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateGalleryAction] error:", err);
    redirectUrl = "/admin/gallery?status=error";
  }

  redirect(redirectUrl);
}

export async function addGalleryPhotosAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/gallery?status=uploaded";
  try {
    const content = await getRawContentForMutation();
    const files = formData.getAll("photos") as File[];

    for (const file of files) {
      if (file && file.size > 0) {
        const url = await uploadToBlob(file, "gallery");
        content.gallery.items.push({
          image: url,
          caption: { ne: "", en: "" },
        });
      }
    }

    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[addGalleryPhotosAction] error:", err);
    redirectUrl = "/admin/gallery?status=error";
  }

  redirect(redirectUrl);
}

export async function deleteGalleryItemAction(index: number) {
  await requireAdmin();
  let redirectUrl = "/admin/gallery?status=deleted";
  try {
    const content = await getRawContentForMutation();
    if (index >= 0 && index < content.gallery.items.length) {
      const removed = content.gallery.items.splice(index, 1)[0];
      await safeDeleteBlob(removed.image);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[deleteGalleryItemAction] error:", err);
    redirectUrl = "/admin/gallery?status=error";
  }
  redirect(redirectUrl);
}

export async function moveGalleryItemAction(index: number, direction: "up" | "down") {
  await requireAdmin();
  let redirectUrl = "/admin/gallery?status=moved";
  try {
    const content = await getRawContentForMutation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < content.gallery.items.length) {
      const item = content.gallery.items.splice(index, 1)[0];
      content.gallery.items.splice(targetIndex, 0, item);
      await saveContentWithBackup(content);
    }
  } catch (err) {
    console.error("[moveGalleryItemAction] error:", err);
    redirectUrl = "/admin/gallery?status=error";
  }
  redirect(redirectUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// LABELS (UI) ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateLabelsAction(formData: FormData) {
  await requireAdmin();
  let redirectUrl = "/admin/labels?status=saved";
  try {
    const content = await getRawContentForMutation();
    const uiKeys = Object.keys(content.ui) as Array<keyof typeof content.ui>;

    for (const key of uiKeys) {
      content.ui[key] = {
        ne: String(formData.get(`${key}_ne`) || "").trim(),
        en: String(formData.get(`${key}_en`) || "").trim(),
      };
    }

    await saveContentWithBackup(content);
  } catch (err) {
    console.error("[updateLabelsAction] error:", err);
    redirectUrl = "/admin/labels?status=error";
  }

  redirect(redirectUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function markMessageReadAction(id: number) {
  await requireAdmin();
  let redirectUrl = "/admin/messages?status=saved";
  try {
    const sql = getSql();
    await sql`UPDATE messages SET read = true WHERE id = ${id}`;
  } catch (err) {
    console.error("[markMessageReadAction] error:", err);
    redirectUrl = "/admin/messages?status=error";
  }
  redirect(redirectUrl);
}

export async function deleteMessageAction(id: number) {
  await requireAdmin();
  let redirectUrl = "/admin/messages?status=deleted";
  try {
    const sql = getSql();
    await sql`DELETE FROM messages WHERE id = ${id}`;
  } catch (err) {
    console.error("[deleteMessageAction] error:", err);
    redirectUrl = "/admin/messages?status=error";
  }
  redirect(redirectUrl);
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED & BACKUPS ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function updateAdvancedAction(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("rawJson") || "");
  let redirectUrl = "/admin/advanced?status=saved";

  try {
    const parsed = JSON.parse(raw);

    // Validate all 9 top-level keys
    for (const key of TOP_LEVEL_KEYS) {
      if (!parsed[key] || typeof parsed[key] !== "object") {
        redirectUrl = `/admin/advanced?error=missing_key_${key}`;
        redirect(redirectUrl);
      }
    }

    await saveContentWithBackup(parsed as SiteContent);
  } catch (err) {
    if (typeof err === "object" && err !== null && "digest" in err) {
      throw err;
    }
    console.error("[updateAdvancedAction] JSON error:", err);
    redirectUrl = "/admin/advanced?error=invalid_json";
  }

  redirect(redirectUrl);
}

export async function restoreBackupAction(backupId: number) {
  await requireAdmin();
  let redirectUrl = "/admin/advanced?status=restored";
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT data FROM site_content_backups WHERE id = ${backupId} LIMIT 1
    `) as Record<string, any>[];

    if (!rows || rows.length === 0) {
      redirectUrl = "/admin/advanced?error=backup_not_found";
    } else {
      const backupData = rows[0].data as SiteContent;

      // Validate keys in backup before restoring
      for (const key of TOP_LEVEL_KEYS) {
        if (!backupData[key]) {
          redirectUrl = "/admin/advanced?error=corrupted_backup";
          redirect(redirectUrl);
        }
      }

      // Save with backup of current state
      await saveContentWithBackup(backupData);
    }
  } catch (err) {
    if (typeof err === "object" && err !== null && "digest" in err) {
      throw err;
    }
    console.error("[restoreBackupAction] error:", err);
    redirectUrl = "/admin/advanced?status=error";
  }

  redirect(redirectUrl);
}
