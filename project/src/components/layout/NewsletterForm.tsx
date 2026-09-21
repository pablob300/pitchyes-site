"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import styles from "./SiteFooter.module.css";

// Assinatura da newsletter. Grava pelo mesmo caminho do formulário de contato
// (/api/leads → banco → /admin/leads), com o formulário "newsletter".
// A ligação com a ferramenta de e-mail marketing entra na rota, não aqui.

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  // Campo isca e tempo mínimo: um e-mail solto em todas as páginas atrai robô.
  const trap = useRef<HTMLInputElement>(null);
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  return (
    <form
      className={styles.newsletter}
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = String(data.get("email") ?? "");

        if (trap.current?.value || Date.now() - openedAt.current < 2000) {
          setStatus("done");
          setMessage("Pronto — você vai receber as novidades por e-mail.");
          return;
        }

        setStatus("sending");
        try {
          const response = await fetch("/api/leads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ form: "newsletter", values: { email } }),
          });
          const result = (await response.json()) as { ok: boolean; message?: string; errors?: Record<string, string> };
          if (!result.ok) {
            setStatus("error");
            setMessage(result.errors?.email ?? result.message ?? "Não foi possível assinar agora.");
            return;
          }
          setStatus("done");
          setMessage("Pronto — você vai receber as novidades por e-mail.");
        } catch {
          setStatus("error");
          setMessage("Sem conexão com o servidor. Tente de novo.");
        }
      }}
    >
      <label htmlFor="newsletter-email" className={styles.newsletterLabel}>
        Receba novidades por e-mail
      </label>
      <div className={styles.newsletterRow}>
        <input
          id="newsletter-email"
          className={styles.field}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Endereço de e-mail"
          disabled={status === "done"}
        />
        <button type="submit" className={buttonClass("dark")} disabled={status === "sending" || status === "done"}>
          {status === "sending" ? "Enviando…" : "Assinar"}
        </button>
      </div>
      {/* Isca: invisível para gente, preenchida por robô. */}
      <input
        ref={trap}
        type="text"
        name="empresa_site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="visually-hidden"
      />
      <p className={styles.newsletterStatus} role="status">
        {message}
      </p>
    </form>
  );
}
