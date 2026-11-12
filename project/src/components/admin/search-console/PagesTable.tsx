"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import psi from "@/components/admin/pagespeed/PageSpeed.module.css";
import styles from "./SearchConsole.module.css";

// Tabela da tela Análise > Search Console e as ações: atualizar o status (Inspeção de URL),
// "Indexar agora" (reenvia o sitemap + IndexNow) e o link para pedir a indexação no próprio
// Search Console — o Google não oferece API para esse pedido em páginas comuns.

export type Row = {
  path: string;
  url: string;
  sitemap: "paginas" | "blog" | "conteudo";
  lastChange?: string;
  lastCrawl?: string | null;
  inspectedAt?: string | null;
  tone: "ok" | "stale" | "missing" | "unknown";
  label: string;
  reason?: string;
  inspectLink: string;
};

const GROUPS: { key: Row["sitemap"]; title: string }[] = [
  { key: "paginas", title: "Páginas do site" },
  { key: "blog", title: "Blog" },
  { key: "conteudo", title: "Landing pages" },
];

const BATCH = 10;

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });

function when(value: string | null | undefined): string {
  if (!value) return "—";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? dateOnly.format(new Date(value)) : dateTime.format(new Date(value));
}

type Message = { tipo: "ok" | "erro"; texto: string } | null;

async function post(body: Record<string, unknown>) {
  const response = await fetch("/api/admin/search-console", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json().catch(() => ({ ok: false, message: "Resposta inválida do servidor." }))) as {
    ok: boolean;
    message?: string;
    aviso?: string;
  };
}

export function PagesTable({ rows, configured }: { rows: Row[]; configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [onlyRed, setOnlyRed] = useState(false);

  const counts = {
    ok: rows.filter((row) => row.tone === "ok").length,
    red: rows.filter((row) => row.tone === "stale" || row.tone === "missing").length,
    unknown: rows.filter((row) => row.tone === "unknown").length,
  };

  async function inspect(paths: string[], key: string) {
    setBusy(key);
    setMessage(null);
    let done = 0;
    let warning: string | undefined;
    for (let start = 0; start < paths.length; start += BATCH) {
      if (paths.length > BATCH) setMessage({ tipo: "ok", texto: `Consultando o Google… ${done} de ${paths.length}` });
      const result = await post({ acao: "inspecionar", caminhos: paths.slice(start, start + BATCH) }).catch(() => null);
      if (!result?.ok) {
        setMessage({ tipo: "erro", texto: result?.message ?? "Sem conexão com o servidor." });
        setBusy(null);
        router.refresh();
        return;
      }
      warning ??= result.aviso;
      done = Math.min(paths.length, start + BATCH);
    }
    setMessage(warning ? { tipo: "erro", texto: warning } : { tipo: "ok", texto: `Status atualizado (${done} página${done === 1 ? "" : "s"}).` });
    setBusy(null);
    router.refresh();
  }

  async function index(body: Record<string, unknown>, key: string, openLink?: string) {
    // Abre a aba já no clique (o navegador bloqueia janela aberta depois de um await).
    if (openLink) window.open(openLink, "_blank", "noopener");
    const tab = Boolean(openLink);
    setBusy(key);
    setMessage(null);
    const result = await post(body).catch(() => null);
    setMessage(
      result?.ok
        ? { tipo: "ok", texto: `${result.message ?? "Enviado."}${tab ? " Na aba do Search Console, clique em “Solicitar indexação”." : ""}` }
        : { tipo: "erro", texto: result?.message ?? "Sem conexão com o servidor." },
    );
    setBusy(null);
    router.refresh();
  }

  const disabled = busy !== null || !configured;

  return (
    <>
      <div className={styles.toolbar}>
        <button type="button" className={buttonClass("solid")} disabled={disabled} onClick={() => inspect(rows.map((r) => r.path), "all-inspect")}>
          {busy === "all-inspect" ? "Atualizando…" : "Atualizar status de todas"}
        </button>
        <button type="button" className={buttonClass("outline")} disabled={disabled} onClick={() => index({ acao: "indexar", todas: true }, "all-index")}>
          {busy === "all-index" ? "Enviando…" : "Indexar todas"}
        </button>
        <button type="button" className={buttonClass("outline")} disabled={disabled} onClick={() => index({ acao: "sitemaps" }, "sitemaps")}>
          {busy === "sitemaps" ? "Enviando…" : "Reenviar sitemaps"}
        </button>
        {message && (
          <p className={styles.toolbarStatus} data-tipo={message.tipo} role="status">
            {message.texto}
          </p>
        )}
      </div>

      <div className={styles.summary}>
        <span className={styles.badge} data-tom="ok">{counts.ok} indexadas e atualizadas</span>
        <span className={styles.badge} data-tom="stale">{counts.red} pedem atenção</span>
        <span className={styles.badge} data-tom="unknown">{counts.unknown} não verificadas</span>
        <label className={styles.filter}>
          <input type="checkbox" checked={onlyRed} onChange={(event) => setOnlyRed(event.target.checked)} />
          Só as vermelhas
        </label>
      </div>

      {GROUPS.map((group) => {
        const list = rows.filter((row) => row.sitemap === group.key && (!onlyRed || row.tone === "stale" || row.tone === "missing"));
        const total = rows.filter((row) => row.sitemap === group.key).length;
        if (!total) return null;
        return (
          <section key={group.key}>
            <h2 className={styles.groupTitle}>
              {group.title} <span className={styles.groupCount}>({total})</span>
            </h2>
            {list.length ? (
              <div className={psi.tableWrap}>
                <table className={psi.table}>
                  <thead>
                    <tr>
                      <th>Página</th>
                      <th>Indexação</th>
                      <th>Último rastreamento (Google)</th>
                      <th>Última alteração (site)</th>
                      <th>Verificado em</th>
                      <th>
                        <span className="visually-hidden">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row) => (
                      <tr key={row.path}>
                        <td>
                          <a className={styles.url} href={row.url} target="_blank" rel="noopener">
                            {row.path}
                          </a>
                        </td>
                        <td>
                          <span className={styles.badge} data-tom={row.tone}>
                            {row.label}
                          </span>
                          {row.reason && <span className={styles.reason}>{row.reason}</span>}
                        </td>
                        <td className={styles.date}>{when(row.lastCrawl)}</td>
                        <td className={styles.date}>{when(row.lastChange)}</td>
                        <td className={styles.date}>{when(row.inspectedAt)}</td>
                        <td>
                          <span className={styles.actions}>
                            <button type="button" className={styles.mini} disabled={disabled} onClick={() => inspect([row.path], `inspect:${row.path}`)}>
                              {busy === `inspect:${row.path}` ? "Consultando…" : "Atualizar status"}
                            </button>
                            <button
                              type="button"
                              className={styles.mini}
                              disabled={disabled}
                              onClick={() => index({ acao: "indexar", caminhos: [row.path] }, `index:${row.path}`, row.inspectLink)}
                              title="Reenvia o sitemap ao Google, avisa o IndexNow e abre a página no Search Console para pedir a indexação"
                            >
                              {busy === `index:${row.path}` ? "Enviando…" : "Indexar agora"}
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={psi.muted}>Nenhuma página vermelha neste grupo.</p>
            )}
          </section>
        );
      })}
    </>
  );
}
