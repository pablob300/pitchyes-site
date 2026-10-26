// Checklist de SEO do artigo — o mesmo no editor (ao vivo) e na API (ao publicar).
// Puro e sem dependência: roda no navegador e no Worker. As regras vêm do SEO.md.
//
// "erro" impede publicar; "aviso" só aparece no painel.

import { slugify } from "./slug";

export type CheckLevel = "ok" | "aviso" | "erro";
export type Check = { id: string; level: CheckLevel; label: string };

export type CheckInput = {
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  excerpt: string;
  html: string;
  coverUrl: string | null;
  coverAlt: string;
  coverWidth: number | null;
  categoryId: string | null;
  tags: string[];
};

export const SEO_TITLE_MAX = 60;
export const DESCRIPTION_MIN = 120;
export const DESCRIPTION_MAX = 160;
export const MIN_WORDS = 600;

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(html: string): number {
  return plainText(html).split(" ").filter(Boolean).length;
}

/** Links internos (para páginas do próprio site) no corpo do artigo. */
export function internalLinks(html: string): string[] {
  return [...html.matchAll(/<a [^>]*href="(\/[^"#]*)[^"]*"/g)].map((m) => m[1]);
}

/** Imagens do corpo sem alt (ou com alt vazio). */
export function imagesWithoutAlt(html: string): number {
  return [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\salt="[^"]+"/.test(m[0])).length;
}

/** Saltos na hierarquia de títulos (h2 → h4 sem h3) e h1 dentro do corpo. */
function headingIssues(html: string): { h1: boolean; skip: boolean; h2: number } {
  const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  let skip = false;
  let last = 1;
  for (const level of levels) {
    if (level > last + 1) skip = true;
    last = level;
  }
  return { h1: levels.includes(1), skip, h2: levels.filter((l) => l === 2).length };
}

export function runChecks(input: CheckInput): Check[] {
  const checks: Check[] = [];
  const add = (id: string, level: CheckLevel, label: string) => checks.push({ id, level, label });

  const title = input.title.trim();
  const seoTitle = (input.seoTitle.trim() || title).trim();
  const description = (input.metaDescription.trim() || input.excerpt.trim()).trim();
  const words = countWords(input.html);
  const headings = headingIssues(input.html);
  const links = internalLinks(input.html);
  const noAlt = imagesWithoutAlt(input.html);
  const keyword = normalize(input.focusKeyword);
  const text = normalize(plainText(input.html));
  const firstParagraph = normalize(plainText(/<p\b[^>]*>([\s\S]*?)<\/p>/.exec(input.html)?.[1] ?? ""));

  add("titulo", title ? "ok" : "erro", title ? "Título preenchido" : "Escreva o título do artigo");
  add("slug", input.slug ? "ok" : "erro", input.slug ? `Endereço: /blog/${input.slug}` : "Defina o endereço (slug)");
  add(
    "seo-titulo",
    seoTitle.length <= SEO_TITLE_MAX ? "ok" : "aviso",
    `Título no Google com ${seoTitle.length} caracteres (até ${SEO_TITLE_MAX})`,
  );
  add(
    "descricao",
    description.length >= DESCRIPTION_MIN && description.length <= DESCRIPTION_MAX ? "ok" : "aviso",
    description
      ? `Descrição com ${description.length} caracteres (${DESCRIPTION_MIN}–${DESCRIPTION_MAX})`
      : "Escreva a meta description (ou o resumo)",
  );
  add("conteudo", words > 0 ? "ok" : "erro", words > 0 ? `${words} palavras` : "O artigo está sem texto");
  if (words > 0 && words < MIN_WORDS) add("tamanho", "aviso", `Texto curto: mire ${MIN_WORDS}+ palavras`);
  add("h1", headings.h1 ? "erro" : "ok", headings.h1 ? "Há um título H1 no corpo: use H2 (o H1 é o título)" : "Sem H1 no corpo");
  add("hierarquia", headings.skip ? "aviso" : "ok", headings.skip ? "Títulos pulam nível (ex.: H2 → H4)" : "Títulos em ordem");
  if (words >= 300 && headings.h2 < 2) add("secoes", "aviso", "Divida o texto em seções com subtítulos (H2)");
  add(
    "alt",
    noAlt ? "erro" : "ok",
    noAlt ? `${noAlt} imagem(ns) do texto sem texto alternativo` : "Imagens do texto com texto alternativo",
  );
  add(
    "capa",
    !input.coverUrl ? "aviso" : !input.coverAlt.trim() ? "erro" : "ok",
    !input.coverUrl
      ? "Sem imagem destacada (o card e o compartilhamento ficam sem imagem)"
      : !input.coverAlt.trim()
        ? "Imagem destacada sem texto alternativo"
        : "Imagem destacada com texto alternativo",
  );
  if (input.coverUrl && input.coverWidth && input.coverWidth < 1200) {
    add("capa-tamanho", "aviso", `Imagem destacada com ${input.coverWidth}px de largura (ideal: 1200×630 ou maior)`);
  }
  add(
    "links",
    links.length >= 2 ? "ok" : "aviso",
    links.length >= 2 ? `${links.length} links internos` : `${links.length} link(s) interno(s): use pelo menos 2`,
  );
  add("categoria", input.categoryId ? "ok" : "aviso", input.categoryId ? "Categoria escolhida" : "Escolha uma categoria");
  add("tags", input.tags.length ? "ok" : "aviso", input.tags.length ? `${input.tags.length} tag(s)` : "Adicione tags");

  if (keyword) {
    add("kw-titulo", normalize(seoTitle).includes(keyword) ? "ok" : "aviso", "Palavra-chave no título");
    // Mesma normalização do slug (sem acento e sem palavras vazias): "reativação de clientes"
    // está em "reativacao-clientes-inativos".
    const slugWords = new Set(input.slug.split("-"));
    const keywordInSlug = slugify(input.focusKeyword, 200).split("-").every((word) => slugWords.has(word));
    add("kw-slug", keywordInSlug ? "ok" : "aviso", "Palavra-chave no endereço");
    add("kw-inicio", firstParagraph.includes(keyword) ? "ok" : "aviso", "Palavra-chave no primeiro parágrafo");
    add("kw-descricao", normalize(description).includes(keyword) ? "ok" : "aviso", "Palavra-chave na descrição");
    const count = keyword ? text.split(keyword).length - 1 : 0;
    add("kw-texto", count >= 2 ? "ok" : "aviso", `Palavra-chave aparece ${count}× no texto`);
  } else {
    add("kw", "aviso", "Defina a palavra-chave foco");
  }
  return checks;
}

/** Erros que impedem publicar. */
export function blockingErrors(checks: Check[]): Check[] {
  return checks.filter((c) => c.level === "erro");
}
