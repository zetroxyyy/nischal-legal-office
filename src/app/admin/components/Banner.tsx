export default function Banner({ ok, error }: { ok?: string; error?: string }) {
  if (ok === "1") {
    return (
      <div className="admin-banner admin-banner--success" role="status">
        <span>✓ सेभ भयो (Saved successfully)</span>
      </div>
    );
  }

  if (error) {
    let message = "त्रुटि भयो, कृपया पुनः प्रयास गर्नुहोस् (An error occurred)";
    if (error === "invalid_json") message = "अमान्य JSON ढाँचा (Invalid JSON format)";
    if (error.startsWith("missing_key_")) {
      const key = error.replace("missing_key_", "");
      message = `JSON मा आवश्यक '${key}' कुञ्जी फेला परेन (Missing key: ${key})`;
    }
    if (error === "backup_not_found") message = "ब्याकअप फेला परेन (Backup not found)";
    if (error === "corrupted_backup") message = "ब्याकअप फाइल बिग्रिएको छ (Corrupted backup)";
    if (error === "min_length_8") message = "नयाँ पासवर्ड कम्तीमा ८ वर्णको हुनुपर्छ (Password must be at least 8 chars)";
    if (error === "passwords_mismatch") message = "नयाँ पासवर्ड र पुष्टि पासवर्ड मिलेन (Passwords do not match)";
    if (error === "current_password_incorrect") message = "हालको पासवर्ड मिलेन (Current password incorrect)";
    if (error === "all_fields_required") message = "सबै फिल्ड अनिवार्य छन् (All fields required)";

    return (
      <div className="admin-banner admin-banner--error" role="alert">
        <span>⚠ {message}</span>
      </div>
    );
  }

  return null;
}
