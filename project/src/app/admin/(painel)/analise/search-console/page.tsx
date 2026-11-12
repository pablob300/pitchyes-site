import type { Metadata } from "next";
import psi from "@/components/admin/pagespeed/PageSpeed.module.css";
import { PagesTable, type Row } from "@/components/admin/search-console/PagesTable";
import styles from "@/components/admin/search-console/SearchConsole.module.css";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { GscError, serviceAccount } from "@/lib/admin/search-console/auth";
import { gscProperty, inspectLink, listSitemaps, type GscSitemap } from "@/lib/admin/search-console/client";
import { indexNowKey } from "@/lib/admin/search-console/indexnow";
import { getInventory, recentPings } from "@/lib/admin/search-console/inventory";
import { pageMetadata } from "@/lib/seo";

// Análise > Search Console: cada URL dos sitemaps com o status no Google, o último
// rastreamento e a última alteração do site. Verde = rastreada depois da alteração.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Search Console",
    description: "Área interna da PitchYes: status de indexação no Google de cada página do site e reenvio dos sitemaps.",
    path: "/admin/analise/search-console",
    noindex: true,
  });
}

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const fmt = (iso?: string) => (iso ? dateTime.format(new Date(iso)) : "—");

export default async function Page() {
  const account = serviceAccount();
  const [inventory, pings] = await Promise.all([getInventory(), recentPings()]);

  let sitemaps: GscSitemap[] = [];
  let connectionError: string | null = null;
  if (account) {
    try {
      sitemaps = await listSitemaps();
    } catch (error) {
      connectionError = error instanceof GscError ? error.message : "Não foi possível falar com o Search Console.";
    }
  }

  const rows: Row[] = inventory.map((row) => ({
    path: row.path,
    url: row.url,
    sitemap: row.sitemap,
    lastChange: row.lastChange,
    lastCrawl: row.inspection?.lastCrawlTime ?? null,
    inspectedAt: row.inspection?.inspectedAt ?? null,
    tone: row.status.tone,
    label: row.status.label,
    reason: row.status.reason,
    inspectLink: inspectLink(row.url),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Análise"
        title="Search Console"
        description="Se o Google já indexou cada página e se o rastreamento é mais recente que a última alteração do site. Toda página criada, alterada ou apagada no painel reenvia o sitemap dela sozinha."
      />

      {!account ? (
        <p className={psi.notice} data-tipo="alerta">
          Falta conectar o Search Console: crie uma conta de serviço no Google Cloud, adicione o e-mail dela como Proprietário
          da propriedade {gscProperty()} e grave o JSON da chave no segredo <code>GSC_SERVICE_ACCOUNT_JSON</code> do Worker
          (passo a passo no README do projeto).
        </p>
      ) : connectionError ? (
        <p className={psi.notice} data-tipo="alerta">
          {connectionError} Conta de serviço: {account.client_email}.
        </p>
      ) : (
        <p className={psi.notice}>
          Conectado a {gscProperty()} como {account.client_email}. IndexNow (Bing, ChatGPT Search, Copilot):{" "}
          {indexNowKey() ? "ligado" : "sem chave (INDEXNOW_KEY)"}.
        </p>
      )}

      <PagesTable rows={rows} configured={Boolean(account) && !connectionError} />

      <section className={psi.section}>
        <h2 className={psi.sectionTitle}>Sitemaps no Google</h2>
        {sitemaps.length ? (
          <div className={psi.tableWrap}>
            <table className={psi.table}>
              <thead>
                <tr>
                  <th>Sitemap</th>
                  <th>Enviado em</th>
                  <th>Lido pelo Google em</th>
                  <th className={psi.num}>URLs enviadas</th>
                  <th className={psi.num}>Erros</th>
                  <th className={psi.num}>Avisos</th>
                </tr>
              </thead>
              <tbody>
                {sitemaps.map((item) => (
                  <tr key={item.path}>
                    <td className={psi.path}>{new URL(item.path).pathname}</td>
                    <td>{fmt(item.lastSubmitted)}</td>
                    <td>{item.isPending ? "Na fila" : fmt(item.lastDownloaded)}</td>
                    <td className={psi.num}>{item.contents?.reduce((sum, c) => sum + Number(c.submitted ?? 0), 0) ?? "—"}</td>
                    <td className={psi.num}>{item.errors ?? "0"}</td>
                    <td className={psi.num}>{item.warnings ?? "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={psi.muted}>{account && !connectionError ? "Nenhum sitemap enviado ainda. Use “Reenviar sitemaps”." : "Disponível depois de conectar."}</p>
        )}
      </section>

      <section className={psi.section}>
        <h2 className={psi.sectionTitle}>Últimos avisos enviados</h2>
        {pings.length ? (
          <ul className={styles.pings}>
            {pings.map((ping) => {
              const ok = ping.status !== null && ping.status >= 200 && ping.status < 300;
              return (
                <li key={ping.id}>
                  <span className={ok ? styles.pingOk : styles.pingErr}>{ok ? "✓" : "✗"}</span>
                  <span>{fmt(ping.created_at)}</span>
                  <span>{ping.kind === "sitemap" ? "Google (sitemap)" : "IndexNow"}</span>
                  <span>{ping.message}</span>
                  <span className={styles.pingTarget}>
                    {ping.kind === "sitemap" ? ping.target : `${ping.target.split(" ").length} URL(s)`}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={psi.muted}>Nada enviado ainda.</p>
        )}
        <p className={psi.legend}>
          O Google não oferece API para pedir a indexação de páginas comuns. “Indexar agora” reenvia o sitemap, avisa o
          IndexNow e abre a página na Inspeção de URL do Search Console, onde o botão “Solicitar indexação” faz o pedido.
        </p>
      </section>
    </>
  );
}
