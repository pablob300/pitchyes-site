#!/usr/bin/env node
// Auditoria de SEO contra o site publicado (sem dependências).
//
//   node scripts/seo-audit.mjs [base-url]
//
// Lê /sitemap-paginas.xml, baixa cada página e confere o que as regras do SEO.md exigem:
// título, descrição, canonical, um único <h1>, dados estruturados e volume de texto.
// Só olha o HTML do servidor — é exatamente o que o robô lê.

const base = (process.argv[2] ?? "https://pitchyes-site.borges-filho.workers.dev").replace(/\/$/, "");

const staging = /workers\.dev$/.test(new URL(base).hostname);

const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;
const WORDS_MIN = 300;

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const one = (html, re) => (html.match(re)?.[1] ?? "").trim();

async function audit(path) {
  const url = base + path;
  const res = await fetch(url, { headers: { "user-agent": "pitchyes-seo-audit" } });
  const html = await res.text();
  const problems = [];

  const title = one(html, /<title>([\s\S]*?)<\/title>/i);
  const desc = one(html, /<meta name="description" content="([^"]*)"/i);
  const canonical = one(html, /<link rel="canonical" href="([^"]*)"/i);
  const robots = one(html, /<meta name="robots" content="([^"]*)"/i);
  const og = one(html, /<meta property="og:image" content="([^"]*)"/i);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1]));
  const levels = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map((m) => Number(m[1]));
  const schemas = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  const words = strip(html).split(" ").filter(Boolean).length;

  if (res.status !== 200) problems.push(`HTTP ${res.status}`);
  if (!title) problems.push("sem <title>");
  else if (title.length > TITLE_MAX) problems.push(`título com ${title.length} caracteres (máx. ${TITLE_MAX})`);
  if (!desc) problems.push("sem description");
  else if (desc.length < DESC_MIN || desc.length > DESC_MAX)
    problems.push(`description com ${desc.length} caracteres (${DESC_MIN}–${DESC_MAX})`);
  if (!canonical) problems.push("sem canonical");
  // No workers.dev o site é noindex de propósito (ver lib/site.ts); só é erro no domínio real.
  if (/noindex/i.test(robots) && !staging) problems.push(`robots: ${robots}`);
  if (!og) problems.push("sem og:image");
  if (h1s.length !== 1) problems.push(`${h1s.length} <h1>`);
  for (let i = 1; i < levels.length; i++)
    if (levels[i] - levels[i - 1] > 1) { problems.push(`salto h${levels[i - 1]} → h${levels[i]}`); break; }
  if (!schemas.includes("WebPage")) problems.push("sem WebPage em JSON-LD");
  if (path !== "/" && !schemas.includes("BreadcrumbList")) problems.push("sem BreadcrumbList");
  for (const img of imgs) if (!/\salt=/i.test(img[0])) { problems.push("imagem sem alt"); break; }
  if (words < WORDS_MIN) problems.push(`${words} palavras (mín. ${WORDS_MIN})`);

  return { path, title, desc, h1: h1s[0] ?? "", words, schemas: [...new Set(schemas)], problems };
}

const sitemap = await (await fetch(`${base}/sitemap-paginas.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (!paths.length) { console.error("sitemap-paginas.xml vazio ou inacessível:", base); process.exit(1); }

console.log(`Auditoria de ${paths.length} páginas em ${base}\n`);
let failed = 0;
let total = 0;
for (const path of paths) {
  const r = await audit(path);
  total += r.words;
  if (r.problems.length) failed++;
  console.log(`${r.problems.length ? "✗" : "✓"} ${r.path}`);
  console.log(`   título ${r.title.length} · descrição ${r.desc.length} · ${r.words} palavras · ${r.schemas.join(", ")}`);
  for (const p of r.problems) console.log(`   → ${p}`);
}
console.log(`\n${paths.length - failed}/${paths.length} páginas sem problemas · ${total} palavras · média ${Math.round(total / paths.length)}`);
process.exit(failed ? 1 : 0);
