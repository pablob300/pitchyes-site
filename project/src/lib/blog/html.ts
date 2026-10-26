import "server-only";
import sanitizeHtml from "sanitize-html";
import { slugifyRaw } from "./slug";

// HTML dos artigos: o que o editor grava e o que o site mostra.
//
// 1. `sanitizeArticleHtml` roda ao SALVAR (API do painel) e de novo ao EXIBIR: só passam as
//    tags e atributos abaixo. Quem escreve é a equipe, mas o modo HTML aceita colagem de
//    qualquer lugar — script, estilo inline e evento não entram nunca.
// 2. `prepareArticleHtml` adapta para o site: id nos h2/h3 (sumário), imagens com
//    lazy/srcset, vídeo com youtube-nocookie e carregamento preguiçoso, links externos
//    com rel. Também devolve o sumário e as perguntas do bloco de FAQ (schema FAQPage).
//
// Blocos próprios do editor (todos HTML comum, editáveis no modo HTML):
//   <div data-cta>…<a href="/contato">…</a></div>           faixa de chamada
//   <div data-faq><h3>Pergunta</h3><p>Resposta</p>…</div>   perguntas → FAQPage
//   <div data-youtube-video><iframe src="…/embed/ID"></iframe></div>

const VIDEO_HOSTS = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];
const IMAGE_WIDTHS = [320, 640, 960, 1280, 1600];

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "strong", "b", "em", "i", "u", "s", "mark", "sub", "sup",
      "a", "ul", "ol", "li", "blockquote", "hr", "code", "pre",
      "figure", "figcaption", "img", "iframe", "div",
      "table", "thead", "tbody", "tr", "th", "td", "caption", "colgroup", "col",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "data-size"],
      iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "loading"],
      div: ["data-cta", "data-faq", "data-youtube-video"],
      figure: ["data-size"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
      code: ["class"],
      col: ["span"],
    },
    allowedClasses: { code: [/^language-[a-z0-9-]+$/] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    allowedIframeHostnames: VIDEO_HOSTS,
    // h1 é o título do artigo: no corpo, vira h2 (uma página, um h1 — SEO.md §1.2).
    transformTags: { h1: "h2", b: "strong", i: "em" },
    exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length,
  }).trim();
}

export type TocItem = { id: string; text: string; level: 2 | 3 };
export type FaqItem = { q: string; a: string };

function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Contagem de palavras e minutos de leitura (200 palavras por minuto). */
export function textStats(html: string): { words: number; minutes: number } {
  const words = textOf(html).split(" ").filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 200)) };
}

/** Variantes servidas por /midia?w= — só para imagens do nosso bucket. */
export function mediaSrcSet(src: string): string | null {
  if (!src.startsWith("/midia/")) return null;
  return IMAGE_WIDTHS.map((w) => `${src}?w=${w} ${w}w`).join(", ");
}

export function prepareArticleHtml(html: string): { html: string; toc: TocItem[]; faq: FaqItem[] } {
  let out = sanitizeArticleHtml(html);
  const toc: TocItem[] = [];
  const used = new Set<string>();

  // Âncoras nos h2/h3 para o sumário e para links diretos a uma seção.
  out = out.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_match, level: string, inner: string) => {
    const text = textOf(inner);
    let id = slugifyRaw(text).slice(0, 60).replace(/-+$/, "") || "secao";
    for (let n = 2; used.has(id); n++) id = `${id.replace(/-\d+$/, "")}-${n}`;
    used.add(id);
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });

  // Imagens: preguiçosas, decodificação assíncrona e srcset quando a imagem é do bucket.
  out = out.replace(/<img ([^>]*?)\/?>/g, (_match, attrs: string) => {
    const src = /src="([^"]+)"/.exec(attrs)?.[1] ?? "";
    const srcset = mediaSrcSet(src);
    const extra = [
      'loading="lazy"',
      'decoding="async"',
      srcset ? `srcset="${srcset}" sizes="(max-width: 760px) 100vw, 720px"` : "",
    ].filter(Boolean);
    return `<img ${attrs.trim()} ${extra.join(" ")} />`;
  });

  // Vídeo: domínio sem cookies do YouTube, carregamento só perto da tela, título acessível.
  out = out.replace(/<iframe ([^>]*?)>/g, (_match, attrs: string) => {
    let next = attrs.replace(/https:\/\/(www\.)?youtube\.com\/embed\//, "https://www.youtube-nocookie.com/embed/");
    if (!/loading=/.test(next)) next += ' loading="lazy"';
    if (!/title=/.test(next)) next += ' title="Vídeo"';
    if (!/allowfullscreen/.test(next)) next += " allowfullscreen";
    return `<iframe ${next.trim()}>`;
  });

  // Links externos: nunca passam autoridade sem querer e não dão acesso à aba de origem.
  out = out.replace(/<a ([^>]*?)>/g, (_match, attrs: string) => {
    const href = /href="([^"]+)"/.exec(attrs)?.[1] ?? "";
    if (!/^https?:\/\//.test(href)) return `<a ${attrs}>`;
    const clean = attrs.replace(/\s*rel="[^"]*"/, "");
    return `<a ${clean} rel="noopener noreferrer">`;
  });

  return { html: out, toc, faq: extractFaq(out) };
}

/** Perguntas do bloco <div data-faq>: cada h3 é uma pergunta, o que vem até o próximo h3 é a resposta. */
export function extractFaq(html: string): FaqItem[] {
  const items: FaqItem[] = [];
  for (const block of html.matchAll(/<div data-faq(?:="[^"]*")?>([\s\S]*?)<\/div>/g)) {
    const parts = block[1].split(/<h3[^>]*>/).slice(1);
    for (const part of parts) {
      const [q, ...rest] = part.split("</h3>");
      const a = textOf(rest.join(""));
      if (textOf(q) && a) items.push({ q: textOf(q), a });
    }
  }
  return items;
}
