"use client";

import React from "react";

interface ConfirmSubmitButtonProps {
  label: React.ReactNode;
  confirmMessage: string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
}

export default function ConfirmSubmitButton({
  label,
  confirmMessage,
  className = "admin-btn admin-btn--danger admin-btn--sm",
  style,
  title,
  formAction,
}: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      formAction={formAction}
      className={className}
      style={style}
      title={title}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
