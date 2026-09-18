"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import styles from "./SiteFooter.module.css";

// TODO: connect to the e-mail provider. Until then the form validates and tells the
// visitor honestly that sign-ups aren't open yet — nothing is stored.
export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "pending">("idle");

  return (
    <form
      className={styles.newsletter}
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("pending");
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
        />
        <button type="submit" className={buttonClass("dark")}>
          Assinar
        </button>
      </div>
      <p className={styles.newsletterStatus} role="status">
        {status === "pending" && "As inscrições na newsletter abrem em breve."}
      </p>
    </form>
  );
}
