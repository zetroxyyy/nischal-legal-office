export default function Banner({ ok, error }: { ok?: string; error?: string }) {
  if (ok === "1") {
    return (
      <div className="admin-banner admin-banner--success" role="status">
        <span style={{ fontWeight: 600, fontSize: "1rem" }}>
          ✓ सेभ भयो (Saved)
        </span>
      </div>
    );
  }

  if (error) {
    let message = "सेभ हुन सकेन (Could not save)";
    if (error === "invalid_json") message = "सेभ हुन सकेन: अमान्य JSON ढाँचा (Could not save: Invalid JSON format)";
    else if (error.startsWith("missing_key_")) {
      const key = error.replace("missing_key_", "");
      message = `सेभ हुन सकेन: JSON मा आवश्यक '${key}' कुञ्जी फेला परेन (Could not save: Missing key '${key}')`;
    } else if (error === "backup_not_found") message = "सेभ हुन सकेन: ब्याकअप फेला परेन (Could not save: Backup not found)";
    else if (error === "corrupted_backup") message = "सेभ हुन सकेन: ब्याकअप फाइल बिग्रिएको छ (Could not save: Corrupted backup)";
    else if (error === "min_length_8") message = "सेभ हुन सकेन: नयाँ पासवर्ड कम्तीमा ८ वर्णको हुनुपर्छ (Could not save: Password must be at least 8 chars)";
    else if (error === "passwords_mismatch") message = "सेभ हुन सकेन: नयाँ पासवर्ड र पुष्टि पासवर्ड मिलेन (Could not save: Passwords do not match)";
    else if (error === "current_password_incorrect") message = "सेभ हुन सकेन: हालको पासवर्ड मिलेन (Could not save: Current password incorrect)";
    else if (error === "all_fields_required") message = "सेभ हुन सकेन: सबै फिल्ड अनिवार्य छन् (Could not save: All fields required)";

    return (
      <div className="admin-banner admin-banner--error" role="alert">
        <span style={{ fontWeight: 600, fontSize: "1rem" }}>
          ⚠ {message}
        </span>
      </div>
    );
  }

  return null;
}
