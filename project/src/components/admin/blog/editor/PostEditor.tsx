"use client";

import type { Editor } from "@tiptap/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@/components/admin/ui/Dialog";
import { buttonClass } from "@/components/ui/Button";
import type { AdminPost, PostInput, PostStatus } from "@/lib/blog/admin";
import { DESCRIPTION_MAX, DESCRIPTION_MIN, runChecks, SEO_TITLE_MAX } from "@/lib/blog/checks";
import { toPostInput } from "@/lib/blog/post-input";
import { isValidSlug, slugify } from "@/lib/blog/slug";
import { MediaDialog } from "./MediaDialog";
import styles from "./Editor.module.css";

// O editor (TipTap/ProseMirror) só existe no navegador: fora do pacote do Worker, que
// precisa caber na memória do isolate.
const RichEditor = dynamic(() => import("./RichEditor").then((m) => m.RichEditor), {
  ssr: false,
  loading: () => <div className={styles.editorShell}>Carregando editor…</div>,
});

// Tela de edição de artigo, no espírito do WordPress: texto à esquerda, caixas de
// publicação, organização e SEO à direita. Toda regra é conferida de novo no servidor.
//
// Salvamento: rascunho salva sozinho a cada 30 s; artigo publicado só muda no ar quando
// alguém clica em "Atualizar" (as edições ficam guardadas no navegador até lá).

export type AuthorOption = { id: string; name: string; role: string | null; bio: string | null; sameAs: string[] };

type Form = PostInput;

const STATUS_LABEL: Record<PostStatus, string> = { rascunho: "Rascunho", agendado: "Agendado", publicado: "Publicado" };
const AUTOSAVE_MS = 30_000;
const LOCK_MS = 60_000;

/** ISO (UTC) → valor de <input type="datetime-local"> no horário de Brasília (UTC−3, sem verão). */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  return value ? new Date(`${value}:00-03:00`).toISOString() : null;
}

const fmt = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

const emptyForm = (authorId: string | null): Form => ({
  slug: "",
  title: "",
  seoTitle: "",
  metaDescription: "",
  focusKeyword: "",
  excerpt: "",
  contentHtml: "",
  coverUrl: null,
  coverAlt: "",
  coverWidth: null,
  coverHeight: null,
  authorId,
  categoryId: null,
  tags: [],
  status: "rascunho",
  publishedAt: null,
  featured: false,
  noindex: false,
});

export function PostEditor({
  post,
  categories,
  authors: initialAuthors,
  allTags,
  host,
  lockedBy,
}: {
  post: AdminPost | null;
  categories: { id: string; name: string }[];
  authors: AuthorOption[];
  allTags: string[];
  host: string;
  lockedBy: { name: string; at: string } | null;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(post?.id ?? null);
  const [form, setForm] = useState<Form>(() => (post ? toPostInput(post) : emptyForm(initialAuthors[0]?.id ?? null)));
  const [editorKey, setEditorKey] = useState(0);
  const [savedStatus, setSavedStatus] = useState<PostStatus>(post?.status ?? "rascunho");
  const [savedSlug, setSavedSlug] = useState(post?.slug ?? "");
  const [updatedAt, setUpdatedAt] = useState(post?.updatedAt ?? null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<null | "rascunho" | "publicar" | "auto">(null);
  const [notice, setNotice] = useState<{ tipo: "ok" | "erro" | "aviso"; texto: string } | null>(
    lockedBy ? { tipo: "aviso", texto: `${lockedBy.name} está com este artigo aberto (${fmt.format(new Date(lockedBy.at))}). Combine antes de salvar, para um não sobrescrever o outro.` } : null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [tagDraft, setTagDraft] = useState("");
  const [dialog, setDialog] = useState<null | "capa" | "autor" | "versoes">(null);
  const [authors, setAuthors] = useState(initialAuthors);
  const [pendingBackup, setPendingBackup] = useState<Form | null>(null);
  const [suggestions, setSuggestions] = useState<{ title: string; href: string; phrase: string; kind: string }[] | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const live = savedStatus !== "rascunho";
  const scheduled = !!form.publishedAt && form.publishedAt > new Date().toISOString();
  const backupKey = id ? `blog-edicao-${id}` : null;

  const update = useCallback(<K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  const checks = useMemo(
    () =>
      runChecks({
        title: form.title,
        slug: form.slug,
        seoTitle: form.seoTitle,
        metaDescription: form.metaDescription,
        focusKeyword: form.focusKeyword,
        excerpt: form.excerpt,
        html: form.contentHtml,
        coverUrl: form.coverUrl,
        coverAlt: form.coverAlt,
        coverWidth: form.coverWidth,
        categoryId: form.categoryId,
        tags: form.tags,
      }),
    [form],
  );
  const blocking = checks.filter((c) => c.level === "erro");

  // ── Gravação ──────────────────────────────────────────────────────────────────
  const save = useCallback(
    async (target: "rascunho" | "publicar" | "auto", status: PostStatus): Promise<boolean> => {
      const current = formRef.current;
      setBusy(target);
      setErrors({});
      const body: Form = { ...current, status, slug: current.slug || slugify(current.title) };
      try {
        const response = await fetch(id ? `/api/admin/blog/artigos/${id}` : "/api/admin/blog/artigos", {
          method: id ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await response.json()) as {
          ok: boolean;
          message?: string;
          errors?: Record<string, string>;
          id?: string;
          slug?: string;
          status?: PostStatus;
          publishedAt?: string | null;
        };
        setBusy(null);
        if (!data.ok || !data.id) {
          setErrors(data.errors ?? {});
          if (target !== "auto") setNotice({ tipo: "erro", texto: data.message ?? "Não foi possível salvar." });
          return false;
        }
        setForm((f) => ({ ...f, slug: data.slug ?? f.slug, status: data.status ?? f.status, publishedAt: data.publishedAt ?? f.publishedAt }));
        setSavedStatus(data.status ?? status);
        setSavedSlug(data.slug ?? "");
        setUpdatedAt(new Date().toISOString());
        setDirty(false);
        if (backupKey) localStorage.removeItem(backupKey);
        if (target !== "auto") {
          setNotice({
            tipo: "ok",
            texto:
              data.status === "publicado"
                ? "Publicado. Pode levar até um minuto para aparecer em todas as páginas do blog."
                : data.status === "agendado"
                  ? `Agendado para ${fmt.format(new Date(data.publishedAt ?? ""))}.`
                  : "Rascunho salvo.",
          });
        }
        if (!id) {
          setId(data.id);
          router.replace(`/admin/blog/${data.id}`);
        }
        return true;
      } catch {
        setBusy(null);
        if (target !== "auto") setNotice({ tipo: "erro", texto: "Sem conexão com o servidor." });
        return false;
      }
    },
    [id, backupKey, router],
  );

  // Rascunho: salva sozinho. Publicado: guarda no navegador até alguém clicar em Atualizar.
  useEffect(() => {
    if (!dirty) return;
    if (live) {
      if (backupKey) localStorage.setItem(backupKey, JSON.stringify({ at: Date.now(), form }));
      return;
    }
    if (!id || !form.title.trim()) return;
    const timer = setTimeout(() => void save("auto", "rascunho"), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [dirty, form, live, id, backupKey, save]);

  // Edição não salva de um publicado que ficou no navegador (aba fechada, queda de rede).
  useEffect(() => {
    if (!backupKey) return;
    // Lido depois da montagem (o servidor não tem localStorage) e fora do corpo do efeito.
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(backupKey);
        if (!raw) return;
        const backup = JSON.parse(raw) as { at: number; form: Form };
        if (updatedAt && backup.at > new Date(updatedAt).getTime()) {
          setNotice({ tipo: "aviso", texto: "Há alterações deste artigo que não foram publicadas (guardadas neste navegador)." });
          setPendingBackup(backup.form);
        } else {
          localStorage.removeItem(backupKey);
        }
      } catch {
        /* armazenamento indisponível: segue sem cópia local */
      }
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backupKey]);

  // Aviso ao sair com alterações não salvas.
  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  // Trinco: avisa quem abrir o mesmo artigo que ele está sendo editado.
  useEffect(() => {
    if (!id) return;
    const ping = () => fetch(`/api/admin/blog/artigos/${id}`, { method: "PATCH" }).catch(() => undefined);
    void ping();
    const timer = setInterval(ping, LOCK_MS);
    return () => clearInterval(timer);
  }, [id]);

  function loadInto(next: Form, message: string) {
    setForm(next);
    setEditorKey((k) => k + 1);
    setDirty(true);
    setNotice({ tipo: "aviso", texto: message });
  }

  // ── Tags ──────────────────────────────────────────────────────────────────────
  function addTags(raw: string) {
    const names = raw
      .split(/[,;\n]/)
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
    if (!names.length) return;
    const existing = new Set(form.tags.map((t) => t.toLowerCase()));
    update("tags", [...form.tags, ...names.filter((n) => !existing.has(n.toLowerCase()))]);
    setTagDraft("");
  }

  // ── Links sugeridos ───────────────────────────────────────────────────────────
  async function loadSuggestions() {
    setSuggestions(null);
    try {
      const response = await fetch("/api/admin/blog/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, html: form.contentHtml }),
      });
      const data = (await response.json()) as { sugestoes?: { title: string; href: string; phrase: string; kind: string }[] };
      setSuggestions(data.sugestoes ?? []);
    } catch {
      setSuggestions([]);
    }
  }

  function insertSuggestion(phrase: string, href: string) {
    const editor = editorRef.current;
    if (!editor) return;
    const target = phrase.toLowerCase();
    let range: { from: number; to: number } | null = null;
    editor.state.doc.descendants((node, pos) => {
      if (range || !node.isText || !node.text) return !range;
      if (node.marks.some((m) => m.type.name === "link")) return true;
      const index = node.text.toLowerCase().indexOf(target);
      if (index >= 0) range = { from: pos + index, to: pos + index + phrase.length };
      return !range;
    });
    if (!range) {
      setNotice({ tipo: "aviso", texto: `Não achei “${phrase}” fora de um link no texto.` });
      return;
    }
    editor.chain().focus().setTextSelection(range).setLink({ href }).run();
    setSuggestions((list) => list?.filter((s) => s.href !== href) ?? null);
  }

  const seoTitle = form.seoTitle || form.title;
  const description = form.metaDescription || form.excerpt;
  const descState = !description.length ? undefined : description.length >= DESCRIPTION_MIN && description.length <= DESCRIPTION_MAX ? "ok" : "ruim";
  const author = authors.find((a) => a.id === form.authorId) ?? null;

  const publishLabel = live && !scheduled ? "Atualizar" : scheduled ? "Agendar" : "Publicar";

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link href="/admin/blog" className={styles.back}>
          ← Artigos
        </Link>
        <span className={styles.statusPill} data-status={savedStatus}>
          {STATUS_LABEL[savedStatus]}
        </span>
        <span className={styles.hint}>
          {busy === "auto"
            ? "Salvando…"
            : dirty
              ? live
                ? "Alterações ainda não publicadas"
                : "Alterações não salvas"
              : updatedAt
                ? `Salvo ${fmt.format(new Date(updatedAt))}`
                : "Novo artigo"}
        </span>
      </div>

      {notice && (
        <div className={styles.notice} data-tipo={notice.tipo} role="status">
          <span>{notice.texto}</span>
          {pendingBackup && (
            <span className={styles.row}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  loadInto(pendingBackup, "Alterações locais restauradas. Clique em Atualizar para publicá-las.");
                  setPendingBackup(null);
                }}
              >
                Restaurar
              </button>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  if (backupKey) localStorage.removeItem(backupKey);
                  setPendingBackup(null);
                  setNotice(null);
                }}
              >
                Descartar
              </button>
            </span>
          )}
          <button type="button" className={styles.noticeClose} aria-label="Fechar aviso" onClick={() => setNotice(null)}>
            ×
          </button>
        </div>
      )}

      <div className={styles.layout}>
        {/* ── Coluna principal ─────────────────────────────────────────────── */}
        <div className={styles.main}>
          <input
            className={styles.titleInput}
            value={form.title}
            placeholder="Título do artigo"
            aria-label="Título do artigo (vira o H1)"
            aria-invalid={!!errors.title || undefined}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
              setDirty(true);
            }}
          />
          {errors.title && <p className={styles.error}>{errors.title}</p>}

          <div className={styles.slugRow}>
            <span className={styles.slugPrefix}>{host}/blog/</span>
            <input
              className={styles.slugInput}
              value={form.slug}
              aria-label="Endereço do artigo"
              aria-invalid={(!!form.slug && !isValidSlug(form.slug)) || !!errors.slug || undefined}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
              }}
            />
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                setSlugTouched(true);
                update("slug", slugify(form.focusKeyword || form.title));
              }}
            >
              Gerar
            </button>
          </div>
          {live && savedSlug && form.slug !== savedSlug && (
            <p className={styles.hint}>Ao salvar, /blog/{savedSlug} passa a redirecionar (301) para o novo endereço.</p>
          )}
          {errors.slug && <p className={styles.error}>{errors.slug}</p>}

          <RichEditor
            key={editorKey}
            initialHtml={form.contentHtml}
            onReady={(editor) => (editorRef.current = editor)}
            onChange={(html) => update("contentHtml", html)}
          />

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Resumo</h2>
            <textarea
              className={styles.textarea}
              rows={3}
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="2–3 frases que aparecem no card do blog e abaixo do título. Sem meta description, também vira a descrição no Google."
            />
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>SEO</h2>
            <label className={styles.field}>
              <span>Palavra-chave foco</span>
              <input className={styles.input} value={form.focusKeyword} onChange={(e) => update("focusKeyword", e.target.value)} placeholder="Ex.: ligações frias com IA" />
              <span className={styles.hint}>O termo que a pessoa digita no Google. Use no título, no endereço e no primeiro parágrafo.</span>
            </label>
            <label className={styles.field}>
              <span>
                Título no Google{" "}
                <span className={styles.counter} data-state={seoTitle.length > SEO_TITLE_MAX ? "ruim" : seoTitle.length ? "ok" : undefined}>
                  {seoTitle.length}/{SEO_TITLE_MAX}
                </span>
              </span>
              <input className={styles.input} value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} placeholder={form.title || "Igual ao título, se ficar vazio"} />
            </label>
            <label className={styles.field}>
              <span>
                Meta description{" "}
                <span className={styles.counter} data-state={descState}>
                  {description.length} ({DESCRIPTION_MIN}–{DESCRIPTION_MAX})
                </span>
              </span>
              <textarea
                className={styles.textarea}
                rows={3}
                value={form.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                placeholder="A proposta do artigo e uma razão para clicar. Vazia, usa o resumo."
              />
            </label>
            <div className={styles.serp} aria-label="Prévia no Google">
              <span className={styles.serpUrl}>
                {host} › blog › {form.slug || "endereco-do-artigo"}
              </span>
              <span className={styles.serpTitle}>{(seoTitle || "Título do artigo").slice(0, 70)} | PitchYes</span>
              <span className={styles.serpDesc}>{(description || "A descrição aparece aqui.").slice(0, 165)}</span>
            </div>
            <label className={styles.check}>
              <input type="checkbox" checked={form.noindex} onChange={(e) => update("noindex", e.target.checked)} />
              Não indexar este artigo (some do Google e do sitemap)
            </label>
          </section>
        </div>

        {/* ── Barra lateral ────────────────────────────────────────────────── */}
        <aside className={styles.side}>
          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Publicar</h2>
            <label className={styles.field}>
              <span>Data de publicação (Brasília)</span>
              <input
                type="datetime-local"
                className={styles.input}
                value={toLocalInput(form.publishedAt)}
                onChange={(e) => update("publishedAt", fromLocalInput(e.target.value))}
              />
              <span className={styles.hint}>
                {scheduled ? "Data futura: o artigo entra no ar sozinho nessa hora." : form.publishedAt ? "Aparece no artigo e no Google." : "Vazia: usa a hora em que publicar."}
              </span>
            </label>
            <div className={styles.publishActions}>
              {!live && (
                <button type="button" className={buttonClass("outline")} disabled={!!busy} onClick={() => save("rascunho", "rascunho")}>
                  {busy === "rascunho" ? "Salvando…" : "Salvar rascunho"}
                </button>
              )}
              <button
                type="button"
                className={buttonClass("solid")}
                disabled={!!busy || blocking.length > 0}
                title={blocking.length ? `Resolva antes: ${blocking.map((b) => b.label).join("; ")}` : undefined}
                onClick={() => save("publicar", "publicado")}
              >
                {busy === "publicar" ? "Publicando…" : publishLabel}
              </button>
            </div>
            {blocking.length > 0 && <p className={styles.error}>Para publicar: {blocking.map((b) => b.label.toLowerCase()).join("; ")}.</p>}
            <div className={styles.row}>
              {id && (
                <a href={`/admin/blog/${id}/previa`} target="_blank" rel="noopener" className={styles.linkButton}>
                  Prévia
                </a>
              )}
              {live && savedSlug && (
                <a href={`/blog/${savedSlug}`} target="_blank" rel="noopener" className={styles.linkButton}>
                  Ver no site
                </a>
              )}
              {id && (
                <button type="button" className={styles.linkButton} onClick={() => setDialog("versoes")}>
                  Versões
                </button>
              )}
              {live && (
                <button type="button" className={`${styles.linkButton} ${styles.danger}`} disabled={!!busy} onClick={() => save("rascunho", "rascunho")}>
                  Voltar para rascunho
                </button>
              )}
            </div>
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Categoria</h2>
            <select className={styles.select} value={form.categoryId ?? ""} onChange={(e) => update("categoryId", e.target.value || null)}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Link href="/admin/blog/categorias" className={styles.hint}>
              Gerenciar categorias
            </Link>
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Tags</h2>
            <ul className={styles.chips}>
              {form.tags.map((tag) => (
                <li key={tag}>
                  {tag}
                  <button type="button" aria-label={`Remover ${tag}`} onClick={() => update("tags", form.tags.filter((t) => t !== tag))}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <input
              className={styles.input}
              list="blog-tags"
              value={tagDraft}
              placeholder="Digite e tecle Enter"
              onChange={(e) => {
                if (/[,;]/.test(e.target.value)) addTags(e.target.value);
                else setTagDraft(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTags(tagDraft);
                }
              }}
              onBlur={() => addTags(tagDraft)}
            />
            <datalist id="blog-tags">
              {allTags.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <span className={styles.hint}>Prefira as tags que já existem: assunto repetido com outro nome divide a página.</span>
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Imagem destacada</h2>
            {form.coverUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.cover} src={`${form.coverUrl}?w=640`} alt={form.coverAlt} />
                <label className={styles.field}>
                  <span>Texto alternativo</span>
                  <input className={styles.input} value={form.coverAlt} aria-invalid={!form.coverAlt.trim() || undefined} onChange={(e) => update("coverAlt", e.target.value)} />
                </label>
                <span className={styles.hint}>
                  {form.coverWidth}×{form.coverHeight}px{form.coverWidth && form.coverWidth < 1200 ? " · ideal: 1200×630 ou maior" : ""}
                </span>
                <div className={styles.row}>
                  <button type="button" className={styles.linkButton} onClick={() => setDialog("capa")}>
                    Trocar
                  </button>
                  <button
                    type="button"
                    className={`${styles.linkButton} ${styles.danger}`}
                    onClick={() => setForm((f) => ({ ...f, coverUrl: null, coverAlt: "", coverWidth: null, coverHeight: null }))}
                  >
                    Remover
                  </button>
                </div>
              </>
            ) : (
              <button type="button" className={styles.coverEmpty} onClick={() => setDialog("capa")}>
                Escolher imagem destacada
                <span className={styles.hint}>Aparece no card do blog, no topo do artigo e ao compartilhar. Ideal: 1200×630.</span>
              </button>
            )}
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Autor</h2>
            <select className={styles.select} value={form.authorId ?? ""} onChange={(e) => update("authorId", e.target.value || null)}>
              <option value="">Equipe (sem autor)</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <button type="button" className={styles.linkButton} onClick={() => setDialog("autor")}>
              {author ? "Editar autor" : "Novo autor"}
            </button>
            <label className={styles.check}>
              <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
              Destaque no topo do blog
            </label>
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>
              Checklist de SEO <span className={styles.hint}>{checks.filter((c) => c.level === "ok").length}/{checks.length}</span>
            </h2>
            <ul className={styles.checks}>
              {checks.map((c) => (
                <li key={c.id} data-level={c.level}>
                  {c.label}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Links internos</h2>
            <p className={styles.hint}>Artigos e páginas cujo assunto aparece no seu texto e ainda não estão linkados.</p>
            <button type="button" className={buttonClass("outline")} onClick={loadSuggestions}>
              Sugerir links
            </button>
            {suggestions &&
              (suggestions.length ? (
                <ul className={styles.suggestions}>
                  {suggestions.map((s) => (
                    <li key={s.href}>
                      <span>
                        “{s.phrase}” → <strong>{s.title}</strong>
                        <span className={styles.hint}> {s.kind === "pagina" ? "página" : "artigo"}</span>
                      </span>
                      <button type="button" className={styles.linkButton} onClick={() => insertSuggestion(s.phrase, s.href)}>
                        Linkar
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.hint}>Nenhuma sugestão nova para este texto.</p>
              ))}
          </section>
        </aside>
      </div>

      {dialog === "capa" && (
        <MediaDialog
          title="Imagem destacada"
          withCaption={false}
          initial={form.coverUrl ? { src: form.coverUrl, alt: form.coverAlt, width: form.coverWidth, height: form.coverHeight } : undefined}
          onClose={() => setDialog(null)}
          onPick={(image) => {
            setForm((f) => ({ ...f, coverUrl: image.src, coverAlt: image.alt, coverWidth: image.width, coverHeight: image.height }));
            setDirty(true);
            setDialog(null);
          }}
        />
      )}
      {dialog === "autor" && (
        <AuthorDialog
          author={author}
          onClose={() => setDialog(null)}
          onSaved={(saved) => {
            setAuthors((list) => (list.some((a) => a.id === saved.id) ? list.map((a) => (a.id === saved.id ? saved : a)) : [...list, saved]));
            update("authorId", saved.id);
            setDialog(null);
          }}
        />
      )}
      {dialog === "versoes" && id && (
        <VersionsDialog
          postId={id}
          onClose={() => setDialog(null)}
          onLoad={(data, when) => {
            loadInto({ ...data, status: form.status, publishedAt: data.publishedAt ?? form.publishedAt }, `Versão de ${when} carregada no editor. Nada mudou no site até você salvar ou atualizar.`);
            setDialog(null);
          }}
        />
      )}
    </div>
  );
}

function AuthorDialog({
  author,
  onClose,
  onSaved,
}: {
  author: AuthorOption | null;
  onClose: () => void;
  onSaved: (author: AuthorOption) => void;
}) {
  const [name, setName] = useState(author?.name ?? "");
  const [role, setRole] = useState(author?.role ?? "");
  const [bio, setBio] = useState(author?.bio ?? "");
  const [sameAs, setSameAs] = useState((author?.sameAs ?? []).join("\n"));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const body = { name, role, bio, sameAs: sameAs.split("\n").map((s) => s.trim()).filter(Boolean) };
    try {
      const response = await fetch(author ? `/api/admin/blog/autores/${author.id}` : "/api/admin/blog/autores", {
        method: author ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { ok: boolean; id?: string; message?: string };
      setBusy(false);
      if (!data.ok || !data.id) {
        setError(data.message ?? "Não foi possível salvar.");
        return;
      }
      onSaved({ id: data.id, name: name.trim(), role: role.trim() || null, bio: bio.trim() || null, sameAs: body.sameAs });
    } catch {
      setBusy(false);
      setError("Sem conexão com o servidor.");
    }
  }

  return (
    <Dialog
      title={author ? "Editar autor" : "Novo autor"}
      description="Nome, cargo e bio aparecem no fim de cada artigo e na página do autor; os perfis ligam a pessoa à marca para o Google (E-E-A-T)."
      onClose={onClose}
      footer={
        <>
          <button type="button" className={buttonClass("ghost")} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={buttonClass("solid")} onClick={save} disabled={busy}>
            {busy ? "Salvando…" : "Salvar"}
          </button>
        </>
      }
    >
      <div className={styles.dialogBody}>
        <label className={styles.field}>
          <span>Nome</span>
          <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Cargo</span>
          <input className={styles.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Ex.: Especialista em IA de voz" />
        </label>
        <label className={styles.field}>
          <span>Bio</span>
          <textarea className={styles.textarea} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span>Perfis públicos (um por linha, https://)</span>
          <textarea className={styles.textarea} rows={2} value={sameAs} onChange={(e) => setSameAs(e.target.value)} placeholder="https://www.linkedin.com/in/…" />
        </label>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </Dialog>
  );
}

function VersionsDialog({
  postId,
  onClose,
  onLoad,
}: {
  postId: string;
  onClose: () => void;
  onLoad: (data: PostInput, when: string) => void;
}) {
  const [versions, setVersions] = useState<{ id: string; note: string | null; created_at: string; created_by_name: string | null }[] | null>(null);

  useEffect(() => {
    fetch(`/api/admin/blog/artigos/${postId}/versoes`)
      .then((r) => r.json() as Promise<{ versoes?: typeof versions }>)
      .then((data) => setVersions(data.versoes ?? []))
      .catch(() => setVersions([]));
  }, [postId]);

  async function load(versionId: string, when: string) {
    const response = await fetch(`/api/admin/blog/artigos/${postId}/versoes?versao=${versionId}`);
    const data = (await response.json()) as { ok: boolean; versao?: PostInput };
    if (data.ok && data.versao) onLoad(data.versao, when);
  }

  return (
    <Dialog
      title="Versões do artigo"
      description="Uma versão é guardada a cada publicação. Carregar uma versão só muda o editor; o site muda quando você salvar."
      onClose={onClose}
      footer={
        <button type="button" className={buttonClass("ghost")} onClick={onClose}>
          Fechar
        </button>
      }
    >
      <div className={styles.dialogBody}>
        {versions === null ? (
          <p className={styles.hint}>Carregando…</p>
        ) : versions.length ? (
          <ul className={styles.versions}>
            {versions.map((v) => {
              const when = fmt.format(new Date(v.created_at));
              return (
                <li key={v.id}>
                  <span>
                    {when} · {v.note ?? "Versão"}
                    {v.created_by_name && <span className={styles.hint}> · {v.created_by_name}</span>}
                  </span>
                  <button type="button" className={styles.linkButton} onClick={() => load(v.id, when)}>
                    Carregar
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.hint}>Ainda não há versões: elas são criadas ao publicar.</p>
        )}
      </div>
    </Dialog>
  );
}
