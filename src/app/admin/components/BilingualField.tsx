interface BilingualFieldProps {
  labelNe: string;
  labelEn: string;
  namePrefix: string;
  valueNe: string;
  valueEn: string;
  isTextarea?: boolean;
  required?: boolean;
}

export default function BilingualField({
  labelNe,
  labelEn,
  namePrefix,
  valueNe,
  valueEn,
  isTextarea = false,
  required = false,
}: BilingualFieldProps) {
  return (
    <div className="admin-field-group">
      <label className="admin-label">
        {labelNe}
        <span className="admin-label__en">({labelEn})</span>
      </label>
      <div className="admin-bilingual-grid">
        <div>
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)", marginBottom: "4px" }}>
            नेपाली (Nepali)
          </span>
          {isTextarea ? (
            <textarea
              name={`${namePrefix}_ne`}
              defaultValue={valueNe}
              required={required}
              className="admin-textarea"
            />
          ) : (
            <input
              type="text"
              name={`${namePrefix}_ne`}
              defaultValue={valueNe}
              required={required}
              className="admin-input"
            />
          )}
        </div>
        <div>
          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)", marginBottom: "4px" }}>
            English
          </span>
          {isTextarea ? (
            <textarea
              name={`${namePrefix}_en`}
              defaultValue={valueEn}
              required={required}
              className="admin-textarea"
            />
          ) : (
            <input
              type="text"
              name={`${namePrefix}_en`}
              defaultValue={valueEn}
              required={required}
              className="admin-input"
            />
          )}
        </div>
      </div>
    </div>
  );
}
