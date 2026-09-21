"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SessionUser } from "@/lib/admin/users";
import styles from "./UserMenu.module.css";

// Quem está logado, com sair deste aparelho ou de todos.
export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onClick = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  async function sair(todos: boolean) {
    setBusy(true);
    try {
      await fetch("/api/admin/sair", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ todos }),
      });
    } catch {
      // Mesmo sem resposta, seguimos para a tela de entrada: o cookie local já não serve.
    }
    router.replace("/admin/entrar");
    router.refresh();
  }

  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={styles.wrap} ref={box}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <span className={styles.who}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.email}>{user.email}</span>
        </span>
        <span className={styles.caret} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          {user.isSuperadmin && <p className={styles.badge}>Superadmin</p>}
          <button type="button" role="menuitem" onClick={() => sair(false)} disabled={busy}>
            Sair
          </button>
          <button type="button" role="menuitem" onClick={() => sair(true)} disabled={busy}>
            Sair de todos os aparelhos
          </button>
        </div>
      )}
    </div>
  );
}
