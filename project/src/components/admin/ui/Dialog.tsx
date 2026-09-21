"use client";

import { useEffect, useRef } from "react";
import styles from "./Dialog.module.css";

// Diálogo do painel: fecha no Escape e no clique fora, prende o foco enquanto
// está aberto e devolve o foco a quem o abriu. Serve para formulário e confirmação.
export function Dialog({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children?: React.ReactNode;
  footer: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previous.current = document.activeElement as HTMLElement | null;
    const node = panel.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea') ?? [],
      );
    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous.current?.focus();
    };
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <button type="button" className={styles.backdrop} aria-label="Fechar" onClick={onClose} tabIndex={-1} />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label={title} ref={panel}>
        <header className={styles.head}>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </header>
        {children}
        <footer className={styles.foot}>{footer}</footer>
      </div>
    </div>
  );
}
