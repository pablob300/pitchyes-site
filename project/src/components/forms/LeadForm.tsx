"use client";

import { useId, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { formatPhone, validateField, type LeadFormDef, type LeadValues } from "@/lib/leads";
import styles from "./LeadForm.module.css";

// Formulário genérico: os campos vêm da definição em lib/leads.ts, a validação é a mesma
// que /api/leads roda no servidor. O envio grava o lead (visível em /admin/leads).

type Status = "idle" | "sending" | "done" | "error";

export function LeadForm({
  form,
  title,
  benefits,
  submitLabel,
  note,
}: {
  form: LeadFormDef;
  title: string;
  benefits?: string[];
  submitLabel: string;
  note?: React.ReactNode;
}) {
  const uid = useId();
  const [values, setValues] = useState<LeadValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const fieldId = (name: string) => `${uid}-${name}`;

  function setValue(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Record<string, string> = {};
    for (const field of form.fields) {
      const error = validateField(field, values[field.name] ?? "");
      if (error) found[field.name] = error;
    }
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus("error");
      setMessage("Confira os campos destacados abaixo.");
      document.getElementById(fieldId(Object.keys(found)[0]))?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ form: form.id, values }),
      });
      const data = (await response.json()) as { ok: boolean; message?: string; errors?: Record<string, string> };
      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? {});
        setStatus("error");
        setMessage(data.message ?? "Não foi possível enviar agora. Tente novamente.");
        return;
      }
      setStatus("done");
      setMessage("Recebemos seus dados. Nosso time entra em contato em até 2 horas úteis.");
      setValues({});
    } catch {
      setStatus("error");
      setMessage("Sem conexão com o servidor. Tente novamente em instantes.");
    }
  }

  if (status === "done") {
    return (
      <div className={styles.card}>
        <h2 className={styles.title}>Recebemos seu contato.</h2>
        <p className={styles.success} role="status">
          {message}
        </p>
        <button type="button" className={buttonClass("outline")} onClick={() => setStatus("idle")}>
          Enviar outro contato
        </button>
      </div>
    );
  }

  return (
    <form className={styles.card} onSubmit={onSubmit} noValidate>
      <h2 className={styles.title}>{title}</h2>
      {benefits && (
        <ul className={styles.benefits}>
          {benefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <div className={styles.fields}>
        {form.fields.map((field) => {
          const id = fieldId(field.name);
          const error = errors[field.name];
          const describedBy = error ? `${id}-error` : undefined;
          const value = values[field.name] ?? "";
          return (
            <div key={field.name} className={styles.field} data-half={field.half || undefined}>
              <label htmlFor={id}>
                {field.label}
                {field.required && <span aria-hidden="true"> *</span>}
              </label>
              {field.type === "select" ? (
                <select
                  id={id}
                  name={field.name}
                  value={value}
                  required={field.required}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => setValue(field.name, e.target.value)}
                >
                  <option value="">Selecione</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={id}
                  name={field.name}
                  rows={4}
                  value={value}
                  placeholder={field.placeholder}
                  required={field.required}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  onChange={(e) => setValue(field.name, e.target.value)}
                />
              ) : (
                <input
                  id={id}
                  name={field.name}
                  type={field.type === "date" ? "date" : field.type}
                  value={value}
                  placeholder={field.placeholder}
                  required={field.required}
                  autoComplete={field.autoComplete}
                  inputMode={field.type === "tel" ? "numeric" : undefined}
                  min={field.type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  onChange={(e) =>
                    setValue(field.name, field.type === "tel" ? formatPhone(e.target.value) : e.target.value)
                  }
                />
              )}
              {error && (
                <p id={`${id}-error`} className={styles.error}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button type="submit" className={buttonClass("solid", "md", styles.submit)} disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : submitLabel}
      </button>

      <p className={styles.status} role="status">
        {status === "error" ? message : ""}
      </p>

      {note && <p className={styles.note}>{note}</p>}
    </form>
  );
}
