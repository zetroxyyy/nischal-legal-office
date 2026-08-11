"use client";

import { useSearchParams } from "next/navigation";

interface StatusBannerProps {
  status?: string;
  ok?: string;
  error?: string;
}

export default function StatusBanner(props: StatusBannerProps) {
  const searchParams = useSearchParams();

  const status = props.status || searchParams.get("status") || undefined;
  const ok = props.ok || searchParams.get("ok") || undefined;
  const error = props.error || searchParams.get("error") || undefined;

  const code = status || (ok === "1" ? "saved" : undefined);
  const errCode = error || (code === "error" ? "error" : undefined);

  if (errCode) {
    let message = "⚠ काम पूरा भएन (Could not complete)";
    if (errCode === "min_length_8") {
      message =
        "⚠ सेभ हुन सकेन: नयाँ पासवर्ड कम्तीमा ८ वर्णको हुनुपर्छ (Could not save: Password must be at least 8 chars)";
    } else if (errCode === "passwords_mismatch") {
      message =
        "⚠ सेभ हुन सकेन: नयाँ पासवर्ड र पुष्टि पासवर्ड मिलेन (Could not save: Passwords do not match)";
    } else if (errCode === "current_password_incorrect") {
      message =
        "⚠ सेभ हुन सकेन: हालको पासवर्ड मिलेन (Could not save: Current password incorrect)";
    } else if (errCode === "all_fields_required") {
      message =
        "⚠ सेभ हुन सकेन: सबै फिल्ड अनिवार्य छन् (Could not save: All fields required)";
    } else if (errCode === "backup_not_found") {
      message =
        "⚠ सेभ हुन सकेन: ब्याकअप फेला परेन (Could not save: Backup not found)";
    } else if (errCode === "corrupted_backup") {
      message =
        "⚠ सेभ हुन सकेन: ब्याकअप फाइल बिग्रिएको छ (Could not save: Corrupted backup)";
    } else if (errCode === "invalid_json") {
      message =
        "⚠ सेभ हुन सकेन: अमान्य JSON ढाँचा (Could not save: Invalid JSON format)";
    }

    return (
      <div
        className="admin-banner admin-banner--error"
        role="alert"
        style={{ marginBottom: "20px" }}
      >
        <span style={{ fontWeight: 600, fontSize: "1rem" }}>{message}</span>
      </div>
    );
  }

  if (code) {
    let message = "✓ सेभ भयो (Saved)";
    if (code === "added") message = "✓ थपियो (Added)";
    else if (code === "deleted") message = "✓ हटाइयो (Deleted)";
    else if (code === "moved") message = "✓ क्रम मिलाइयो (Order updated)";
    else if (code === "uploaded") message = "✓ तस्बिर अपलोड भयो (Photo uploaded)";
    else if (code === "restored") message = "✓ पुरानो अवस्था फर्काइयो (Restored)";
    else if (code === "password") message = "✓ पासवर्ड परिवर्तन भयो (Password changed)";
    else if (code === "saved") message = "✓ सेभ भयो (Saved)";

    return (
      <div
        className="admin-banner admin-banner--success"
        role="status"
        style={{ marginBottom: "20px" }}
      >
        <span style={{ fontWeight: 600, fontSize: "1rem" }}>{message}</span>
      </div>
    );
  }

  return null;
}
