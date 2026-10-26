import type { Metadata } from "next";
import Link from "next/link";
import { PostsTable } from "@/components/admin/blog/PostsTable";
import styles from "@/components/admin/blog/BlogAdmin.module.css";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/ui/Button";
import { ADMIN_PER_PAGE, listAdminAuthors, listAdminPosts, listTerms } from "@/lib/blog/admin";
import { pageMetadata } from "@/lib/seo";

// Blog › Artigos: todos os artigos (rascunhos, agendados e publicados), com busca e filtros.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Artigos do blog",
    description: "Área interna da PitchYes: artigos do blog, rascunhos, agendados e publicados.",
    path: "/admin/blog",
    noindex: true,
  });
}

const STATUS = [
  { value: "", label: "Todos" },
  { value: "publicado", label: "Publicados" },
  { value: "agendado", label: "Agendados" },
  { value: "rascunho", label: "Rascunhos" },
];

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const filters = {
    q: params.q?.trim() || undefined,
    status: STATUS.some((s) => s.value === params.status) ? params.status || undefined : undefined,
    categoria: params.categoria || undefined,
    autor: params.autor || undefined,
    pagina: Math.max(1, Number(params.pagina) || 1),
  };
  const [{ rows, total, counts }, categories, authors] = await Promise.all([
    listAdminPosts(filters),
    listTerms("categoria"),
    listAdminAuthors(),
  ]);
  const all = Object.values(counts).reduce((a, b) => a + b, 0);
  const pages = Math.max(1, Math.ceil(total / ADMIN_PER_PAGE));

  const href = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q: filters.q, status: filters.status, categoria: filters.categoria, autor: filters.autor, ...patch };
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, String(value));
    const query = next.toString();
    return `/admin/blog${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Artigos"
        description={`${all} ${all === 1 ? "artigo" : "artigos"} no total · horário de Brasília`}
        actions={
          <Link href="/admin/blog/novo" className={buttonClass("solid")}>
            Novo artigo
          </Link>
        }
      />

      <nav className={styles.tabs} aria-label="Filtrar por situação">
        {STATUS.map((s) => (
          <Link key={s.value} href={href({ status: s.value || undefined, pagina: undefined })} aria-current={(filters.status ?? "") === s.value ? "page" : undefined}>
            {s.label} <span>({s.value ? (counts[s.value] ?? 0) : all})</span>
          </Link>
        ))}
      </nav>

      <form className={styles.bar} action="/admin/blog">
        {filters.status && <input type="hidden" name="status" value={filters.status} />}
        <label className={`${styles.field} ${styles.grow}`}>
          <span>Buscar</span>
          <input className={styles.input} name="q" defaultValue={filters.q} placeholder="Título ou endereço" />
        </label>
        <label className={styles.field}>
          <span>Categoria</span>
          <select className={styles.select} name="categoria" defaultValue={filters.categoria ?? ""}>
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Autor</span>
          <select className={styles.select} name="autor" defaultValue={filters.autor ?? ""}>
            <option value="">Todos</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonClass("outline")}>
          Filtrar
        </button>
      </form>

      <PostsTable rows={rows} />

      {pages > 1 && (
        <nav className={styles.pager} aria-label="Páginas">
          {filters.pagina > 1 ? <Link href={href({ pagina: filters.pagina - 1 })}>← Anteriores</Link> : <span />}
          <span className={styles.muted}>
            Página {filters.pagina} de {pages}
          </span>
          {filters.pagina < pages ? <Link href={href({ pagina: filters.pagina + 1 })}>Próximos →</Link> : <span />}
        </nav>
      )}
    </>
  );
}
