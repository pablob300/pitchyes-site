import "server-only";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { BlogListing } from "@/components/blog/BlogListing";
import {
  blogPaths,
  getAuthor,
  getCategory,
  getRedirect,
  getTag,
  listAuthors,
  listCategories,
  listPosts,
  listTags,
  pageCount,
  POSTS_PER_PAGE,
  TAG_INDEX_MIN,
  type ListFilter,
} from "@/lib/blog";
import { pageDefault } from "@/lib/page-defaults";
import { breadcrumbSchema, pageMetadataWithOverrides, SITE_NAME } from "@/lib/seo";
import { blogSchema, collectionPageSchema, itemListSchema, personSchema } from "./schema";

// As listagens do blog (o próprio blog, categoria, tag e autor) com paginação.
// Cada página tem título, descrição e canonical próprios (a página 2 não aponta para a 1:
// o conteúdo é outro) e o mesmo h1 da página 1 com "— página N".

export const BLOG_TITLE = "Blog da PitchYes";
export const BLOG_LEAD =
  "Artigos sobre IA de voz, prospecção, atendimento e gestão comercial: como empresas usam ligações automatizadas para vender mais, atender na hora e tirar o time da rotina.";

const BLOG_TRAIL = [
  { name: "Início", path: "/" },
  { name: "Blog", path: "/blog" },
];

/** "/blog/pagina/2" → 2. Página 1 tem endereço próprio (/blog), então "1" aqui é 404. */
export function parsePage(raw: string | undefined): number {
  if (raw === undefined) return 1;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 2 || String(n) !== raw) notFound();
  return n;
}

const pageSuffix = (page: number) => (page > 1 ? ` — página ${page}` : "");

/** Descrição na faixa de 120–160 caracteres: corta na palavra (com reticências) se passar. */
function fitDescription(text: string, page: number): string {
  const suffix = page > 1 ? ` Página ${page}.` : "";
  const base = text.trim();
  if (base.length + suffix.length <= 160) return base + suffix;
  const room = 160 - suffix.length - 1;
  const cut = base.slice(0, room).replace(/\s+\S*$/, "").replace(/[,;:.\s]+$/, "");
  return `${cut}…${suffix}`;
}

/** Autor: a bio vira descrição só se estiver na faixa; senão, um texto padrão. */
function authorDescription(name: string, bio: string | null): string {
  if (bio && bio.length >= 120 && bio.length <= 160) return bio;
  return `Artigos de ${name} no blog da PitchYes sobre IA de voz, prospecção, atendimento e gestão comercial, com exemplos e dicas práticas.`;
}

type Kind =
  | { kind: "blog" }
  | { kind: "category"; slug: string }
  | { kind: "tag"; slug: string }
  | { kind: "author"; slug: string };

async function resolve(target: Kind) {
  if (target.kind === "blog") {
    const fallback = pageDefault("/blog", "Blog", BLOG_LEAD);
    return {
      filter: {} as ListFilter,
      path: (n: number) => blogPaths.listing(n),
      eyebrow: "Blog",
      h1: BLOG_TITLE,
      lead: BLOG_LEAD,
      seoTitle: fallback.title,
      description: fallback.description,
      trail: BLOG_TRAIL,
      noindex: false,
      extra: [blogSchema()],
    };
  }
  if (target.kind === "category") {
    const category = await getCategory(target.slug);
    if (!category) return null;
    return {
      filter: { category: category.slug } as ListFilter,
      path: (n: number) => blogPaths.category(category.slug, n),
      eyebrow: "Categoria",
      h1: category.name,
      lead: category.description,
      seoTitle: category.seoTitle || `${category.name}: artigos do blog`,
      description:
        category.metaDescription ||
        category.description ||
        `Artigos do blog da PitchYes sobre ${category.name.toLowerCase()}: IA de voz aplicada a vendas e atendimento.`,
      trail: [...BLOG_TRAIL, { name: category.name, path: blogPaths.category(category.slug) }],
      noindex: false,
      extra: [],
    };
  }
  if (target.kind === "tag") {
    const tag = await getTag(target.slug);
    if (!tag) return null;
    return {
      filter: { tag: tag.slug } as ListFilter,
      path: (n: number) => blogPaths.tag(tag.slug, n),
      eyebrow: "Assunto",
      h1: tag.name,
      lead: tag.description || `Todos os artigos do blog da PitchYes sobre ${tag.name.toLowerCase()}.`,
      seoTitle: tag.seoTitle || `${tag.name}: artigos do blog`,
      description:
        tag.metaDescription ||
        tag.description ||
        `Artigos da PitchYes sobre ${tag.name.toLowerCase()}: como a IA de voz muda ligações de vendas, atendimento e relacionamento com clientes.`,
      trail: [...BLOG_TRAIL, { name: tag.name, path: blogPaths.tag(tag.slug) }],
      // Tag com poucos artigos é página rala: fora do índice, mas os links continuam valendo.
      // As páginas 2+ de tag também (mesmo assunto, menos itens) — ver listingMetadata.
      noindex: tag.count < TAG_INDEX_MIN,
      noindexPaginated: true,
      extra: [],
    };
  }
  const author = await getAuthor(target.slug);
  if (!author) return null;
  return {
    filter: { author: author.slug } as ListFilter,
    path: (n: number) => blogPaths.author(author.slug, n),
    eyebrow: author.role || "Autor",
    h1: author.name,
    lead: author.bio,
    seoTitle: `${author.name}: artigos no blog`,
    description: authorDescription(author.name, author.bio),
    trail: [...BLOG_TRAIL, { name: author.name, path: blogPaths.author(author.slug) }],
    noindex: false,
    noindexPaginated: true,
    extra: [{ "@type": "ProfilePage", mainEntity: personSchema(author) }],
  };
}

/** Endereço antigo (categoria/tag renomeada ou fundida) → 301; senão 404. */
async function missing(path: string): Promise<never> {
  const to = await getRedirect(path);
  if (to) permanentRedirect(to);
  notFound();
}

export async function listingMetadata(target: Kind, page = 1): Promise<Metadata> {
  const data = await resolve(target);
  if (!data) return {};
  const title = `${data.seoTitle}${pageSuffix(page)}`;
  const metadata = await pageMetadataWithOverrides({
    title,
    description: fitDescription(data.description, page),
    path: data.path(page),
    noindex: data.noindex || (page > 1 && "noindexPaginated" in data && data.noindexPaginated === true),
  });
  // Título inteiro no Google: sem o sufixo da marca quando ele passaria de 60 caracteres.
  return `${title} | ${SITE_NAME}`.length > 60 ? { ...metadata, title: { absolute: title } } : metadata;
}

export async function ListingPage({ target, page = 1 }: { target: Kind; page?: number }) {
  const data = await resolve(target);
  if (!data) {
    const base =
      target.kind === "category"
        ? blogPaths.category(target.slug)
        : target.kind === "tag"
          ? blogPaths.tag(target.slug)
          : target.kind === "author"
            ? blogPaths.author(target.slug)
            : "/blog";
    return missing(base);
  }

  const [{ items, total }, categories] = await Promise.all([
    listPosts(page, data.filter),
    target.kind === "blog" || target.kind === "category" ? listCategories() : Promise.resolve([]),
  ]);
  const pages = pageCount(total);
  if (page > pages) notFound();

  // Destaque só na primeira página do blog: o artigo marcado ou, sem marcação, o mais novo.
  const featured = target.kind === "blog" && page === 1 ? (items.find((p) => p.featured) ?? items[0] ?? null) : null;
  const path = data.path(page);
  const title = `${data.h1}${pageSuffix(page)}`;

  return (
    <>
      <JsonLd
        graph={[
          ...data.extra,
          collectionPageSchema({ title, description: data.description, path }),
          itemListSchema(path, items, (page - 1) * POSTS_PER_PAGE),
          breadcrumbSchema(page > 1 ? [...data.trail, { name: `Página ${page}`, path }] : data.trail),
        ]}
      />
      <BlogListing
        eyebrow={data.eyebrow}
        title={title}
        lead={data.lead}
        trail={data.trail}
        posts={items}
        page={page}
        pages={pages}
        href={data.path}
        categories={categories}
        activeCategory={target.kind === "category" ? target.slug : undefined}
        featured={featured}
      />
    </>
  );
}

// ── Pré-geração no build ────────────────────────────────────────────────────────
// O build lê o D1 real ("remote": true no wrangler.jsonc), então todas as listagens saem
// prontas do deploy: nenhuma visita paga a renderização sob demanda (~0,5 s de CPU a frio).
const pagesFrom = (count: number) => Array.from({ length: Math.max(0, pageCount(count) - 1) }, (_, i) => String(i + 2));

export async function blogPageParams() {
  const { total } = await listPosts(1);
  return pagesFrom(total).map((n) => ({ n }));
}

export async function termParams(kind: "category" | "tag" | "author", paginated: boolean) {
  const terms =
    kind === "category"
      ? (await listCategories()).map((c) => ({ slug: c.slug, count: c.count }))
      : kind === "tag"
        ? (await listTags()).map((t) => ({ slug: t.slug, count: t.count }))
        : (await listAuthors()).map((a) => ({ slug: a.slug, count: a.count }));
  return paginated
    ? terms.flatMap((t) => pagesFrom(t.count).map((n) => ({ slug: t.slug, n })))
    : terms.filter((t) => t.count > 0).map((t) => ({ slug: t.slug }));
}
