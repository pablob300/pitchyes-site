"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@/components/admin/ui/Dialog";
import { buttonClass } from "@/components/ui/Button";
import type { AdminPostRow } from "@/lib/blog/admin";
import styles from "./BlogAdmin.module.css";

// Tabela de artigos do painel. Excluir pede confirmação (é definitivo; o histórico de
// versões fica, mas o artigo some do site e do sitemap).

const STATUS_LABEL: Record<string, string> = { publicado: "Publicado", agendado: "Agendado", rascunho: "Rascunho" };

const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function PostsTable({ rows }: { rows: AdminPostRow[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<AdminPostRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/blog/artigos/${removing.id}`, { method: "DELETE" });
      const data = (await response.json()) as { ok: boolean; message?: string };
      setNotice({ tipo: data.ok ? "ok" : "erro", texto: data.message ?? (data.ok ? "Excluído." : "Não foi possível excluir.") });
      if (data.ok) router.refresh();
    } catch {
      setNotice({ tipo: "erro", texto: "Sem conexão com o servidor." });
    }
    setBusy(false);
    setRemoving(null);
  }

  if (!rows.length) return <p className={styles.empty}>Nenhum artigo encontrado.</p>;

  return (
    <>
      {notice && (
        <p className={styles.notice} data-tipo={notice.tipo} role="status">
          {notice.texto}
        </p>
      )}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Situação</th>
              <th>Categoria</th>
              <th>Autor</th>
              <th>Publicação</th>
              <th>Atualizado</th>
              <th>
                <span className="visually-hidden">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className={styles.titleCell}>
                    {row.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.thumb} src={`${row.cover_url}?w=320`} alt="" aria-hidden="true" />
                    ) : (
                      <span className={styles.thumb} aria-hidden="true" />
                    )}
                    <div>
                      <Link href={`/admin/blog/${row.id}`} className={styles.titleLink}>
                        {row.title || "(sem título)"}
                      </Link>
                      <div className={styles.muted}>
                        /blog/{row.slug} · {row.word_count} palavras{row.featured ? " · ★ destaque" : ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.status} data-status={row.status}>
                    {STATUS_LABEL[row.status]}
                  </span>
                </td>
                <td>{row.category_name ?? <span className={styles.muted}>—</span>}</td>
                <td className={styles.nowrap}>{row.author_name ?? <span className={styles.muted}>—</span>}</td>
                <td className={styles.nowrap}>{row.published_at ? dateFmt.format(new Date(row.published_at)) : <span className={styles.muted}>—</span>}</td>
                <td className={styles.nowrap}>
                  {dateTimeFmt.format(new Date(row.updated_at))}
                  {row.updated_by_name && <div className={styles.muted}>{row.updated_by_name}</div>}
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/admin/blog/${row.id}`}>Editar</Link>
                    {row.status === "publicado" ? (
                      <a href={`/blog/${row.slug}`} target="_blank" rel="noopener">
                        Ver
                      </a>
                    ) : (
                      <a href={`/admin/blog/${row.id}/previa`} target="_blank" rel="noopener">
                        Prévia
                      </a>
                    )}
                    <button type="button" className={`${styles.linkButton} ${styles.danger}`} onClick={() => setRemoving(row)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {removing && (
        <Dialog
          title="Excluir artigo?"
          description={`“${removing.title}” sai do site, do sitemap e da lista. Não dá para desfazer.`}
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button type="button" className={buttonClass("ghost")} onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button type="button" className={buttonClass("solid")} onClick={remove} disabled={busy}>
                {busy ? "Excluindo…" : "Excluir"}
              </button>
            </>
          }
        />
      )}
    </>
  );
}
