import { useId } from "react";
import styles from "./Field.module.css";

// Campo de formulário do painel: rótulo, controle, erro e as ligações de acessibilidade.
export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  autoFocus,
  readOnly,
  error,
  options,
  hint,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "select";
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  error?: string;
  options?: { value: string; label: string }[];
  hint?: string;
}) {
  const id = useId();
  const describedBy = error ? `${id}-erro` : hint ? `${id}-dica` : undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {type === "select" ? (
        <select id={id} name={name} defaultValue={defaultValue} aria-describedby={describedBy}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      )}
      {error && (
        <p id={`${id}-erro`} className={styles.error}>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-dica`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
