import { requireAdmin } from "@/lib/auth";
import { changePasswordAction } from "../actions";
import Banner from "../components/Banner";

interface PageProps {
  searchParams: Promise<{ ok?: string; error?: string }>;
}

export default async function AdminPasswordPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { ok, error } = await searchParams;

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-header__title">पासवर्ड परिवर्तन (Change Password)</h1>
        <p className="admin-header__sub">
          आफ्नो व्यवस्थापक खाताको सुरक्षाका लागि नयाँ र सुरक्षित पासवर्ड राख्नुहोस्
        </p>
      </div>

      <Banner ok={ok} error={error} />

      <div className="admin-card" style={{ maxWidth: "540px" }}>
        <form action={changePasswordAction}>
          <div className="admin-field-group">
            <label className="admin-label" htmlFor="current_password">
              हालको पासवर्ड
              <span className="admin-label__en">(Current Password)</span>
            </label>
            <input
              type="password"
              id="current_password"
              name="current_password"
              required
              className="admin-input"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label" htmlFor="new_password">
              नयाँ पासवर्ड (कम्तीमा ८ वर्ण)
              <span className="admin-label__en">(New Password - min 8 chars)</span>
            </label>
            <input
              type="password"
              id="new_password"
              name="new_password"
              minLength={8}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-field-group">
            <label className="admin-label" htmlFor="confirm_password">
              नयाँ पासवर्ड पुष्टि गर्नुहोस्
              <span className="admin-label__en">(Confirm New Password)</span>
            </label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              minLength={8}
              required
              className="admin-input"
            />
          </div>

          <div className="admin-btn-group">
            <button type="submit" className="admin-btn admin-btn--primary">
              पासवर्ड अद्यावधिक गर्नुहोस् (Update Password)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
