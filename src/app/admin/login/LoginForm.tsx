"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {state?.error && (
        <div className="admin-banner admin-banner--error" role="alert">
          <span>⚠ {state.error}</span>
        </div>
      )}

      <div>
        <label className="admin-label" htmlFor="username">
          प्रयोगकर्ताको नाम
          <span className="admin-label__en">(Username)</span>
        </label>
        <input
          type="text"
          id="username"
          name="username"
          required
          autoComplete="username"
          className="admin-input"
          placeholder="admin"
        />
      </div>

      <div>
        <label className="admin-label" htmlFor="password">
          पासवर्ड
          <span className="admin-label__en">(Password)</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autoComplete="current-password"
          className="admin-input"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="admin-btn admin-btn--primary"
        style={{ width: "100%", marginTop: "8px" }}
      >
        {isPending ? "लगइन हुँदैछ..." : "लगइन गर्नुहोस् (Login)"}
      </button>
    </form>
  );
}
