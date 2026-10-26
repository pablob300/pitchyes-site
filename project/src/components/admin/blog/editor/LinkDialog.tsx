"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/admin/ui/Dialog";
import { buttonClass } from "@/components/ui/Button";
import styles from "./Editor.module.css";

// Inserir ou editar link. A busca traz artigos do blog e páginas do site: link interno é
// o que distribui autoridade entre as páginas (SEO.md §2). Link externo abre na mesma aba
// e ganha rel="noopener noreferrer" na hora de exibir.

type Target = { title: string; href: string; kind: "artigo" | "pagina" };

export function LinkDialog({
  initialHref,
  onClose,
  onApply,
  onRemove,
}: {
  initialHref: string;
  onClose: () => void;
  onApply: (href: string) => void;
  onRemove?: () => void;
}) {
  const [href, setHref] = useState(initialHref);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Target[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/blog/links?q=${encodeURIComponent(query)}`);
        const data = (await response.json()) as { ok: boolean; resultados?: Target[] };
        setResults(data.resultados ?? []);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function apply() {
    const value = href.trim();
    if (!/^(https?:\/\/|\/|#|mailto:|tel:)/.test(value)) {
      setError("Use um endereço completo (https://…) ou um caminho do site (/blog/…).");
      return;
    }
    onApply(value);
  }

  return (
    <Dialog
      title="Link"
      onClose={onClose}
      footer={
        <>
          {onRemove && initialHref && (
            <button type="button" className={buttonClass("ghost")} onClick={onRemove}>
              Remover link
            </button>
          )}
          <button type="button" className={buttonClass("ghost")} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={buttonClass("solid")} onClick={apply}>
            Aplicar
          </button>
        </>
      }
    >
      <div className={styles.dialogBody}>
        <label className={styles.field}>
          <span>Endereço</span>
          <input className={styles.input} value={href} onChange={(e) => setHref(e.target.value)} placeholder="/blog/… ou https://…" autoFocus />
        </label>
        <label className={styles.field}>
          <span>Ou busque um artigo ou página do site</span>
          <input className={styles.input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex.: prospecção, URA, planos" />
        </label>
        <ul className={styles.results}>
          {results.map((r) => (
            <li key={r.href}>
              <button type="button" onClick={() => setHref(r.href)} aria-pressed={href === r.href}>
                <span className={styles.resultKind}>{r.kind === "artigo" ? "Artigo" : "Página"}</span>
                {r.title}
                <span className={styles.hint}>{r.href}</span>
              </button>
            </li>
          ))}
        </ul>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
