"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import styles from "./PageSpeed.module.css";

// Dispara uma análise (mobile + desktop) e abre o relatório quando termina.
// O Google leva de 15 a 40 segundos; o contador mostra que não travou.
// `fixedUrl` vira o botão "Analisar de novo" do relatório.

const OUTRO = "__outro";

export function AnalyzeForm({
  pages,
  fixedUrl,
}: {
  pages?: { path: string; title: string }[];
  fixedUrl?: string;
}) {
  const router = useRouter();
  const [choice, setChoice] = useState(pages?.[0]?.path ?? "/");
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [busy]);

  async function analyze(event: React.FormEvent) {
    event.preventDefault();
    const url = fixedUrl ?? (choice === OUTRO ? custom.trim() : choice);
    if (!url) return;

    setSeconds(0);
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/pagespeed", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as { ok: boolean; id?: string; message?: string; aviso?: string };
      if (!data.ok || !data.id) {
        setStatus({ tipo: "erro", texto: data.message ?? "Não foi possível analisar a página." });
        setBusy(false);
        return;
      }
      if (data.aviso) setStatus({ tipo: "erro", texto: data.aviso });
      router.push(`/admin/analise/pagespeed/${data.id}`);
      router.refresh();
    } catch {
      setStatus({ tipo: "erro", texto: "Sem conexão com o servidor." });
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} data-compact={fixedUrl ? true : undefined} onSubmit={analyze}>
      {!fixedUrl && pages && (
        <>
          <div className={styles.field}>
            <label htmlFor="psi-pagina">Página</label>
            <select
              id="psi-pagina"
              className={styles.control}
              value={choice}
              onChange={(event) => setChoice(event.target.value)}
              disabled={busy}
            >
              {pages.map((page) => (
                <option key={page.path} value={page.path}>
                  {page.title} ({page.path})
                </option>
              ))}
              <option value={OUTRO}>Outro endereço deste site…</option>
            </select>
          </div>
          {choice === OUTRO && (
            <div className={styles.field}>
              <label htmlFor="psi-url">Endereço</label>
              <input
                id="psi-url"
                className={styles.control}
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
                placeholder="/blog/meu-artigo ou URL completa"
                required
                disabled={busy}
              />
            </div>
          )}
        </>
      )}

      <button type="submit" className={buttonClass(fixedUrl ? "outline" : "solid")} disabled={busy}>
        {busy ? `Analisando… ${seconds}s` : fixedUrl ? "Analisar de novo" : "Analisar mobile e desktop"}
      </button>

      {busy && !fixedUrl && (
        <p className={styles.status} data-tipo="ok" role="status">
          O Google está carregando a página como um celular e como um computador. Leva de 15 a 40 segundos.
        </p>
      )}
      {status && (
        <p className={styles.status} data-tipo={status.tipo} role="status">
          {status.texto}
        </p>
      )}
    </form>
  );
}
