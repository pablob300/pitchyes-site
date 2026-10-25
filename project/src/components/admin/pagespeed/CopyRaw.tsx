"use client";

import { useState } from "react";
import styles from "./PageSpeed.module.css";

// Copia só as melhorias, em texto puro, para colar na conversa com o desenvolvedor
// ou com a IA que vai ajustar o código.
export function CopyRaw({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.rawButton}
      onClick={copy}
      title="Copia só as correções, em texto puro, como instruções para o desenvolvedor ou a IA"
    >
      {copied ? "Copiado" : "copy in raw"}
    </button>
  );
}
