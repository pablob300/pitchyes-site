// Slug de SEO: curto, sem acento, sem palavras vazias, palavra-chave na frente.
// Usado pelo editor (geração automática a partir do título), pelas categorias/tags e pelo
// script de importação. Sem "server-only": o editor roda no navegador.

const STOPWORDS = new Set([
  "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "da", "do", "das", "dos", "e", "em",
  "no", "na", "nos", "nas", "para", "pra", "por", "pelo", "pela", "com", "sem", "que", "como",
  "seu", "sua", "seus", "suas", "ao", "aos", "à", "às", "se", "ou", "mais", "muito", "ja", "já",
  "isso", "esse", "essa", "este", "esta", "eh", "é", "voce", "você", "nao", "não", "the", "of",
]);

export const SLUG_MAX = 60;

/** Texto → slug sem acento e sem símbolos (mantém todas as palavras). */
export function slugifyRaw(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug de SEO: tira palavras vazias e corta em até `max` caracteres, sem quebrar palavra. */
export function slugify(text: string, max = SLUG_MAX): string {
  const words = slugifyRaw(text).split("-").filter(Boolean);
  const kept = words.filter((w) => !STOPWORDS.has(w));
  const parts = kept.length >= 2 ? kept : words;
  let slug = "";
  for (const part of parts) {
    const next = slug ? `${slug}-${part}` : part;
    if (next.length > max) break;
    slug = next;
  }
  return slug || slugifyRaw(text).slice(0, max).replace(/-+$/, "");
}

/** Só caracteres válidos, para validar o que alguém digitou no campo de slug. */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 90;
}
