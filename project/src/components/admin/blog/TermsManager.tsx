"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@/components/admin/ui/Dialog";
import { buttonClass } from "@/components/ui/Button";
import type { TermRow } from "@/lib/blog/admin";
import { DESCRIPTION_MAX, DESCRIPTION_MIN, SEO_TITLE_MAX } from "@/lib/blog/checks";
import { slugify } from "@/lib/blog/slug";
import styles from "./BlogAdmin.module.css";

// Categorias e tags do blog: criar, editar, fundir e excluir. Cada categoria/tag tem
// página própria (/blog/categoria/..., /blog/tag/...), então também tem SEO próprio.
// Renomear o endereço ou fundir grava 301 — links antigos continuam funcionando.

type Kind = "categoria" | "tag";
type Form = { id: string | null; name: string; slug: string; description: string; seoTitle: string; metaDescription: string; ctaPath: string };

const empty: Form = { id: null, name: "", slug: "", description: "", seoTitle: "", metaDescription: "", ctaPath: "" };

export function TermsManager({
  kind,
  terms,
  pages,
}: {
  kind: Kind;
  terms: TermRow[];
  pages: { path: string; title: string }[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(empty);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [merging, setMerging] = useState<TermRow | null>(null);
  const [mergeInto, setMergeInto] = useState("");
  const [removing, setRemoving] = useState<TermRow | null>(null);

  const noun = kind === "categoria" ? "categoria" : "tag";
  const base = kind === "categoria" ? "/blog/categoria" : "/blog/tag";

  function edit(term: TermRow) {
    setForm({
      id: term.id,
      name: term.name,
      slug: term.slug,
      description: term.description ?? "",
      seoTitle: term.seo_title ?? "",
      metaDescription: term.meta_description ?? "",
      ctaPath: term.cta_path ?? "",
    });
    setSlugTouched(true);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function call(url: string, method: string, body?: unknown): Promise<boolean> {
    setBusy(true);
    setErrors({});
    try {
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await response.json()) as { ok: boolean; message?: string; errors?: Record<string, string> };
      setBusy(false);
      if (!data.ok) {
        setErrors(data.errors ?? {});
        setNotice({ tipo: "erro", texto: data.message ?? "Não foi possível concluir." });
        return false;
      }
      setNotice({ tipo: "ok", texto: data.message ?? "Salvo." });
      router.refresh();
      return true;
    } catch {
      setBusy(false);
      setNotice({ tipo: "erro", texto: "Sem conexão com o servidor." });
      return false;
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const body = { tipo: kind, ...form, slug: form.slug || slugify(form.name, 50) };
    const ok = await call(form.id ? `/api/admin/blog/termos/${form.id}` : "/api/admin/blog/termos", form.id ? "PUT" : "POST", body);
    if (ok) {
      setForm(empty);
      setSlugTouched(false);
    }
  }

  const descriptionState = (length: number) =>
    !length ? undefined : length >= DESCRIPTION_MIN && length <= DESCRIPTION_MAX ? "ok" : "ruim";

  return (
    <>
      {notice && (
        <p className={styles.notice} data-tipo={notice.tipo} role="status">
          {notice.texto}
        </p>
      )}
      <div className={styles.termLayout}>
        <form className={styles.panel} onSubmit={save}>
          <p className={styles.panelTitle}>{form.id ? `Editar ${noun}` : `Nova ${noun}`}</p>
          <label className={styles.field}>
            <span>Nome</span>
            <input
              className={styles.input}
              value={form.name}
              aria-invalid={!!errors.name || undefined}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value, 50) })}
              required
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </label>
          <label className={styles.field}>
            <span>Endereço</span>
            <input
              className={styles.input}
              value={form.slug}
              aria-invalid={!!errors.slug || undefined}
              onChange={(e) => {
                setSlugTouched(true);
                setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
              }}
            />
            <span className={styles.hint}>
              {base}/{form.slug || "…"}
              {form.id ? " · mudar o endereço cria um redirecionamento 301 do antigo" : ""}
            </span>
            {errors.slug && <span className={styles.error}>{errors.slug}</span>}
          </label>
          <label className={styles.field}>
            <span>Descrição (aparece no topo da página)</span>
            <textarea className={styles.textarea} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <span className={styles.hint}>Um texto próprio evita que a página seja só uma lista: escreva 1–3 frases sobre o tema.</span>
          </label>
          {kind === "categoria" && (
            <label className={styles.field}>
              <span>Página comercial ligada</span>
              <select className={styles.select} value={form.ctaPath} onChange={(e) => setForm({ ...form, ctaPath: e.target.value })}>
                <option value="">Nenhuma (usa Soluções)</option>
                {pages.map((p) => (
                  <option key={p.path} value={p.path}>
                    {p.title} ({p.path})
                  </option>
                ))}
              </select>
              <span className={styles.hint}>O fim de cada artigo desta categoria leva o leitor para esta página.</span>
              {errors.ctaPath && <span className={styles.error}>{errors.ctaPath}</span>}
            </label>
          )}
          <label className={styles.field}>
            <span>
              Título no Google{" "}
              <span className={styles.counter} data-state={form.seoTitle.length > SEO_TITLE_MAX ? "ruim" : undefined}>
                {form.seoTitle.length}/{SEO_TITLE_MAX}
              </span>
            </span>
            <input className={styles.input} value={form.seoTitle} placeholder={`${form.name || "Nome"}: artigos do blog`} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
          </label>
          <label className={styles.field}>
            <span>
              Meta description{" "}
              <span className={styles.counter} data-state={descriptionState(form.metaDescription.length)}>
                {form.metaDescription.length} ({DESCRIPTION_MIN}–{DESCRIPTION_MAX})
              </span>
            </span>
            <textarea className={styles.textarea} rows={3} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
          </label>
          <div className={styles.row}>
            <button type="submit" className={buttonClass("solid")} disabled={busy}>
              {busy ? "Salvando…" : form.id ? "Salvar" : `Criar ${noun}`}
            </button>
            {form.id && (
              <button
                type="button"
                className={buttonClass("ghost")}
                onClick={() => {
                  setForm(empty);
                  setSlugTouched(false);
                  setErrors({});
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {terms.length ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Artigos</th>
                  <th>Descrição</th>
                  <th>
                    <span className="visually-hidden">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr key={term.id}>
                    <td>
                      <button type="button" className={styles.titleLink} style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }} onClick={() => edit(term)}>
                        {term.name}
                      </button>
                      <div className={styles.muted}>
                        {base}/{term.slug}
                        {kind === "categoria" && term.cta_path ? ` · → ${term.cta_path}` : ""}
                      </div>
                    </td>
                    <td className={styles.nowrap}>{term.count}</td>
                    <td className={styles.muted}>{term.description ? `${term.description.slice(0, 90)}${term.description.length > 90 ? "…" : ""}` : "—"}</td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" className={styles.linkButton} onClick={() => edit(term)}>
                          Editar
                        </button>
                        {term.count > 0 && (
                          <a href={`${base}/${term.slug}`} target="_blank" rel="noopener">
                            Ver
                          </a>
                        )}
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() => {
                            setMerging(term);
                            setMergeInto("");
                          }}
                        >
                          Fundir
                        </button>
                        {term.count === 0 && (
                          <button type="button" className={`${styles.linkButton} ${styles.danger}`} onClick={() => setRemoving(term)}>
                            Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.empty}>Nenhuma {noun} criada ainda.</p>
        )}
      </div>

      {merging && (
        <Dialog
          title={`Fundir “${merging.name}”`}
          description={`Os ${merging.count} artigos passam para a ${noun} escolhida, “${merging.name}” é apagada e o endereço dela redireciona (301) para a outra.`}
          onClose={() => setMerging(null)}
          footer={
            <>
              <button type="button" className={buttonClass("ghost")} onClick={() => setMerging(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className={buttonClass("solid")}
                disabled={!mergeInto || busy}
                onClick={async () => {
                  if (await call(`/api/admin/blog/termos/${merging.id}`, "POST", { tipo: kind, destino: mergeInto })) setMerging(null);
                }}
              >
                Fundir
              </button>
            </>
          }
        >
          <label className={styles.field}>
            <span>Juntar em</span>
            <select className={styles.select} value={mergeInto} onChange={(e) => setMergeInto(e.target.value)}>
              <option value="">Escolha…</option>
              {terms
                .filter((t) => t.id !== merging.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </label>
        </Dialog>
      )}

      {removing && (
        <Dialog
          title={`Excluir “${removing.name}”?`}
          description="Ela não tem artigos. A página dela deixa de existir."
          onClose={() => setRemoving(null)}
          footer={
            <>
              <button type="button" className={buttonClass("ghost")} onClick={() => setRemoving(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className={buttonClass("solid")}
                disabled={busy}
                onClick={async () => {
                  await call(`/api/admin/blog/termos/${removing.id}?tipo=${kind}`, "DELETE");
                  setRemoving(null);
                }}
              >
                Excluir
              </button>
            </>
          }
        />
      )}
    </>
  );
}
