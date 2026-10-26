#!/usr/bin/env node
// Importa o blog antigo (pitchyes.com.br/blog: app Lovable que lê do Supabase) para o blog
// próprio (D1 + R2). Só leitura na origem: usa a mesma chave pública que o site antigo
// manda para qualquer visitante, extraída do bundle publicado.
//
//   node scripts/blog-import.mjs              gera tudo e mostra o relatório (não grava nada)
//   node scripts/blog-import.mjs --aplicar    sobe as capas para o R2 e grava no D1
//
// As decisões editoriais (categorias, slugs, tags, SEO, alt das capas) estão em
// scripts/blog-import/mapa.json. O texto dos artigos vem como está, para revisão humana.
// Rodar de novo é seguro: ids são determinísticos e a gravação substitui o que importou antes.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import sharp from "sharp";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MAP = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/blog-import/mapa.json"), "utf8"));
const OUT = path.join(os.tmpdir(), "pitchyes-blog-import");
const APPLY = process.argv.includes("--aplicar");
const ORIGIN = "https://www.pitchyes.com.br";
const DB = "pitchyes-leads";
const BUCKET = "pitchyes-site-midia";

fs.mkdirSync(path.join(OUT, "capas"), { recursive: true });

const id = (prefix, key) => `${prefix}_imp${createHash("sha1").update(key).digest("hex").slice(0, 20)}`;
const sql = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// ── 1. Origem ────────────────────────────────────────────────────────────────
async function source() {
  const html = await (await fetch(`${ORIGIN}/blog/`)).text();
  const bundle = /src="(\/assets\/index-[^"]+\.js)"/.exec(html)?.[1];
  if (!bundle) throw new Error("Bundle do site antigo não encontrado.");
  const js = await (await fetch(`${ORIGIN}${bundle}`)).text();
  const url = /https:\/\/[a-z0-9]+\.supabase\.co/.exec(js)?.[0];
  const key = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.exec(js)?.[0];
  if (!url || !key) throw new Error("Endereço ou chave pública do Supabase não encontrados no bundle.");
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const res = await fetch(`${url}/rest/v1/blog_posts?select=*&status=eq.published&order=published_at.desc`, { headers });
  if (!res.ok) throw new Error(`Supabase respondeu ${res.status}`);
  return res.json();
}

// ── 2. Conteúdo: Markdown → HTML limpo ───────────────────────────────────────
function toHtml(post) {
  let md = post.content.replace(/\r\n/g, "\n");
  // Linhas só de hashtags no fim ("#IA #Vendas #PitchYes") são tags, não texto.
  md = md.replace(/^\s*(#\S+\s*){2,}$/gm, "");
  let html = marked.parse(md, { gfm: true, breaks: false });
  // O h1 é o título da página: no corpo vira h2. Um título repetido no começo sai.
  html = html.replace(/<h1(\s[^>]*)?>/g, "<h2>").replace(/<\/h1>/g, "</h2>");
  html = html.replace(/^\s*<h2[^>]*>([\s\S]*?)<\/h2>/, (m, inner) => (norm(inner.replace(/<[^>]+>/g, "")) === norm(post.title) ? "" : m));
  // Títulos de seção com negrito redundante e parágrafos vazios.
  html = html.replace(/<(h[2-4])([^>]*)><strong>([\s\S]*?)<\/strong><\/\1>/g, "<$1$2>$3</$1>");
  html = html.replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/g, "").replace(/\n{2,}/g, "\n");
  // Saltos de nível (h2 → h4) viram o nível seguinte, para a hierarquia não pular.
  let last = 1;
  html = html.replace(/<(\/?)h([2-6])>/g, (m, close, level) => {
    let n = Number(level);
    if (!close) {
      if (n > last + 1) n = last + 1;
      last = n;
      return `<h${n}>`;
    }
    return `</h${last}>`;
  });
  return html.trim();
}

function stats(html) {
  const words = html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").split(/\s+/).filter(Boolean).length;
  return { words, minutes: Math.max(1, Math.round(words / 200)) };
}

// ── 3. Links internos ────────────────────────────────────────────────────────
// Frases que, quando aparecem em outro artigo, pedem link para o artigo do assunto.
const ANCHORS = {
  "reativacao-clientes-inativos-b2b-ia": ["clientes inativos", "base de inativos", "reativação de clientes", "reativar clientes", "base de clientes"],
  "atendimento-franquias-expansao-ia-de-voz": ["expansão da franquia", "franquias", "franqueados"],
  "atendimento-24-horas-leads-fora-horario-comercial": ["horário comercial", "atendimento 24 horas", "24 horas por dia", "24/7"],
  "ia-de-voz-em-portugues-localizacao-vendas": ["sotaque", "sotaques", "português do Brasil", "regionalismos"],
  "ia-substitui-vendedor-tirador-de-pedido": ["tirador de pedido", "vendedor discador", "substituir o vendedor"],
  "automacao-engessada-vs-inteligencia-de-contexto": ["inteligência de contexto", "bots de voz", "sem parecer robótico", "robótico", "robóticas"],
  "fim-do-vendedor-heroi-infraestrutura-de-conversacao": ["vendedor herói", "infraestrutura de conversação", "talento individual"],
  "gratificacao-imediata-tempo-de-resposta-ao-cliente": ["gratificação imediata", "retornar depois", "retorno depois"],
  "atendimento-unificado-contexto-do-cliente": ["retrabalho", "histórico do cliente", "atendimento fragmentado"],
  "tempo-de-resposta-ao-lead-5-minutos": ["lead decay", "velocidade de resposta", "tempo de resposta", "contato imediato", "no momento certo"],
  "ia-ligacoes-frias-cold-calling": ["ligações frias", "cold calling"],
  "spin-selling-com-inteligencia-artificial": ["SPIN Selling", "metodologias de vendas", "metodologia de vendas"],
  "inteligencia-artificial-funil-de-vendas": ["funil de vendas"],
  "beneficios-inteligencia-artificial-prospeccao": ["prospecção empresarial", "previsões mais precisas", "novas oportunidades"],
  "inteligencia-artificial-bolha-ou-revolucao": ["bolha", "modismo", "moda passageira"],
  "expandir-equipe-de-vendas-com-ia": ["equipe de vendas", "aumentar a equipe", "contratar mais vendedores"],
  "etica-inteligencia-artificial-vendas-privacidade": ["privacidade", "dados pessoais", "invasivo"],
  "estrategias-de-ia-para-aumentar-vendas": ["Netflix", "Amazon", "recomendações personalizadas"],
  "cold-call-com-ia-ligacoes-frias": ["cold call", "ligação fria"],
  "mitos-e-verdades-ia-nas-vendas": ["substituir os vendedores", "substituir vendedores", "mitos"],
  "roteiros-de-ligacao-com-ia-que-convertem": ["roteiros de ligação", "roteiro de ligação", "roteiros de vendas"],
  "ia-nas-vendas-para-pequenas-empresas": ["pequenas empresas", "pequenos negócios", "pequena empresa"],
  "ia-redes-sociais-vendas-engajamento": ["redes sociais"],
  "ia-otimizacao-de-anuncios-roi": ["tráfego pago", "anúncios pagos", "campanhas de anúncios"],
  "ia-de-voz-o-que-os-clientes-acham": ["voz sintética", "vozes sintéticas", "percepção dos clientes"],
  "ia-generativa-scripts-de-vendas-copywriting": ["copywriting", "scripts de vendas", "script de vendas"],
  "reduzir-churn-saas-com-ia": ["churn", "cancelamento"],
  "analise-de-sentimento-tom-de-voz-vendas": ["análise de sentimento", "análise de sentimentos", "tom de voz"],
  "case-prospeccao-automatizada-ia-72-horas": ["prospecção automatizada", "leads frios em resultados"],
  "ia-de-voz-prospeccao-outbound": ["outbound", "personalização em escala"],
  "ia-de-voz-para-vendas-mil-ligacoes-por-dia": ["qualificação de leads", "qualificar leads", "milhares de ligações"],
  "termos-de-inteligencia-artificial-para-vendas": ["machine learning", "modelo de linguagem", "processamento de linguagem natural"],
  "como-funciona-voz-de-ia-que-vende": ["voz de IA", "inteligência semântica", "fluxo conversacional"],
  "como-usar-inteligencia-artificial-para-vender-mais": ["vender mais"],
  "inteligencia-artificial-substitui-sdr": ["SDRs", "SDR", "pré-vendas"],
  "follow-up-de-vendas-apos-ligacao-com-ia": ["follow-up", "follow up"],
  "futuro-da-prospeccao-com-inteligencia-artificial": ["prospecção B2B", "futuro da prospecção", "prospecção inteligente", "prospecção manual"],
  "vozes-realistas-ia-leads-frios": ["vozes realistas", "leads frios", "voz realista"],
  "ia-aumenta-conversao-de-leads-em-vendas": ["taxa de conversão", "taxas de conversão", "leads que não atendem"],
  "automatizar-agendamento-de-reunioes-com-ia": ["agendamento de reuniões", "agendar reuniões", "reuniões qualificadas"],
  "etica-automatizar-ligacoes-com-ia": ["LGPD", "ética", "transparência"],
  "diferenca-chatbot-ura-ia-de-voz": ["URA", "chatbots", "chatbot"],
  "integrar-automacao-por-voz-crm-marketing": ["CRMs", "CRM", "ferramentas de vendas"],
  "ia-nas-vendas-novo-perfil-do-consumidor": ["perfil do consumidor", "novo consumidor", "comportamento do consumidor"],
  "profissoes-do-futuro-em-vendas-com-ia": ["profissões do futuro", "novas profissões", "profissões"],
  "automacao-de-ligacoes-vantagens-e-cuidados": ["automação de ligações", "toque humano"],
  "ia-generativa-em-vendas-tendencias": ["IA generativa", "assistentes de vendas"],
  "vendedor-do-futuro-com-inteligencia-artificial": ["vendedor do futuro", "vendedores mais estratégicos", "vendedor estratégico"],
};

// Página comercial de cada categoria e as frases que levam até ela.
const COMMERCIAL = {
  "prospeccao-e-vendas": { href: "/solucoes/ativo", phrases: ["ligações automatizadas", "prospecção automatizada", "ligações ativas", "prospecção", "IA de voz"] },
  "atendimento-ao-cliente": { href: "/solucoes/receptivo", phrases: ["atendimento automatizado", "atendimento receptivo", "atendimento", "URA"] },
  "ia-de-voz": { href: "/solucoes", phrases: ["agentes de voz", "IA de voz", "ligações automatizadas"] },
  "gestao-comercial": { href: "/solucoes/por-funcao", phrases: ["time comercial", "equipe comercial", "IA de voz", "equipe de vendas"] },
  "ia-nos-negocios": { href: "/solucoes", phrases: ["IA de voz", "ligações automatizadas", "inteligência artificial"] },
};

/** Quantos links um artigo pode receber da importação (evita concentrar autoridade em poucos). */
const MAX_INCOMING = 5;

/** Liga a primeira ocorrência de `phrase` num <p> ou <li>, fora de link e de título. */
function linkFirst(html, phrase, href) {
  const parts = html.split(/(<[^>]+>)/);
  const stack = [];
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\p{L}\\p{N}])`, "iu");
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const tag = /^<(\/?)([a-z0-9]+)/i.exec(part);
    if (tag) {
      if (tag[1]) stack.pop();
      else if (!/\/>$/.test(part) && !["br", "img", "hr"].includes(tag[2].toLowerCase())) stack.push(tag[2].toLowerCase());
      continue;
    }
    const inside = stack.includes("p") || stack.includes("li");
    const blocked = stack.some((t) => ["a", "h2", "h3", "h4", "strong", "code"].includes(t));
    if (!inside || blocked) continue;
    const match = re.exec(part);
    if (!match) continue;
    parts[i] = part.slice(0, match.index) + `<a href="${href}">${match[1]}</a>` + part.slice(match.index + match[1].length);
    return { html: parts.join(""), anchor: match[1] };
  }
  return null;
}

// ── 4. Execução ──────────────────────────────────────────────────────────────
const posts = await source();
console.log(`Origem: ${posts.length} artigos publicados.`);

const byOld = new Map(MAP.artigos.map((a) => [a.old, a]));
const problems = [];
for (const p of posts) if (!byOld.has(p.slug)) problems.push(`Sem entrada no mapa: ${p.slug}`);
const kept = MAP.artigos.filter((a) => !a.duplicateOf);
const slugs = new Set();
for (const a of kept) {
  if (slugs.has(a.slug)) problems.push(`Slug repetido: ${a.slug}`);
  slugs.add(a.slug);
  if (a.slug.length > 60) problems.push(`Slug longo (${a.slug.length}): ${a.slug}`);
  if (a.seoTitle.length > 60) problems.push(`Título SEO longo (${a.seoTitle.length}): ${a.seoTitle}`);
  for (const t of a.tags) if (!MAP.tags.some((x) => x.slug === t)) problems.push(`Tag desconhecida ${t} em ${a.slug}`);
  if (!MAP.categorias.some((c) => c.slug === a.category)) problems.push(`Categoria desconhecida ${a.category}`);
}

const authorOf = (name) => MAP.autores.find((a) => a.origem.includes(name.trim())) ?? MAP.autores[0];
const records = [];
for (const post of posts) {
  const entry = byOld.get(post.slug);
  if (!entry || entry.duplicateOf) continue;
  const html = toHtml(post);
  const originalExcerpt = (post.excerpt ?? "").replace(/\s+/g, " ").trim();
  const meta = entry.meta ?? originalExcerpt;
  if (meta.length < 120 || meta.length > 160) problems.push(`Descrição fora da faixa (${meta.length}) em ${entry.slug}`);
  const autoSummary = /^O (texto|documento)\b/.test(originalExcerpt);
  const excerpt = originalExcerpt.length <= 220 && !autoSummary ? originalExcerpt : meta;
  records.push({ post, entry, html, meta, excerpt });
}

// Links internos: até 3 para artigos relacionados (mesma categoria e tags em comum,
// com prioridade para quem ainda não recebeu link, no máximo MAX_INCOMING por alvo) e 1
// para a página comercial da categoria. Âncora sempre descritiva (SEO.md §1.6).
const incoming = new Map();
const linkReport = [];
const relation = (x, y) => (x.entry.category === y.entry.category ? 2 : 0) + x.entry.tags.filter((t) => y.entry.tags.includes(t)).length;
const received = (rec) => incoming.get(rec.entry.slug) ?? 0;
const priority = (source, target) => relation(source, target) + (received(target) === 0 ? 3 : 0) - received(target);
for (const rec of records) rec.links = [];
for (let round = 0; round < 3; round++) {
  // Em cada rodada, cada artigo ganha no máximo um link novo: a malha cresce por igual.
  for (const rec of records) {
    if (rec.links.length > round) continue;
    const done = new Set(rec.links.map((l) => l.para));
    const candidates = records
      .filter((o) => o !== rec && !done.has(`/blog/${o.entry.slug}`) && received(o) < MAX_INCOMING)
      .sort((x, y) => priority(rec, y) - priority(rec, x) || y.post.published_at.localeCompare(x.post.published_at));
    candidateLoop: for (const other of candidates) {
      for (const phrase of ANCHORS[other.entry.slug] ?? []) {
        const result = linkFirst(rec.html, phrase, `/blog/${other.entry.slug}`);
        if (result) {
          rec.html = result.html;
          rec.links.push({ para: `/blog/${other.entry.slug}`, ancora: result.anchor });
          incoming.set(other.entry.slug, received(other) + 1);
          break candidateLoop;
        }
      }
    }
  }
}
// Fecha a malha: quem não recebeu link ganha um "Leia também" no artigo mais próximo que
// ainda tem espaço, e quem não aponta para ninguém ganha um para o mais próximo. A âncora é
// o título do artigo — descritiva por definição. Fica marcado no relatório para a revisão.
const readMore = (source, target) => {
  source.html += `\n<p><strong>Leia também:</strong> <a href="/blog/${target.entry.slug}">${target.post.title.trim()}</a></p>`;
  source.links.push({ para: `/blog/${target.entry.slug}`, ancora: target.post.title.trim(), tipo: "leia-tambem" });
  incoming.set(target.entry.slug, received(target) + 1);
};
const linksTo = (source, target) => source.links.some((l) => l.para === `/blog/${target.entry.slug}`);
for (const target of records.filter((r) => !received(r))) {
  const source = records
    .filter((r) => r !== target && r.links.length < 4 && !linksTo(r, target))
    .sort((x, y) => relation(target, y) - relation(target, x) || x.links.length - y.links.length)[0];
  if (source) readMore(source, target);
}
for (const source of records.filter((r) => !r.links.length)) {
  const target = records
    .filter((r) => r !== source && received(r) < MAX_INCOMING && !linksTo(source, r))
    .sort((x, y) => relation(source, y) - relation(source, x) || received(x) - received(y))[0];
  if (target) readMore(source, target);
}

for (const rec of records) {
  const commercial = COMMERCIAL[rec.entry.category];
  for (const phrase of commercial.phrases) {
    const result = linkFirst(rec.html, phrase, commercial.href);
    if (result) {
      rec.html = result.html;
      rec.links.push({ para: commercial.href, ancora: result.anchor });
      break;
    }
  }
  linkReport.push({ artigo: `/blog/${rec.entry.slug}`, links: rec.links });
}

// Capas: WebP, no máximo 1600px de largura.
for (const rec of records) {
  const src = rec.post.image_url.startsWith("http") ? rec.post.image_url : `${ORIGIN}${rec.post.image_url}`;
  const file = path.join(OUT, "capas", `${rec.entry.slug}.webp`);
  if (!fs.existsSync(file)) {
    const buffer = Buffer.from(await (await fetch(src)).arrayBuffer());
    await sharp(buffer).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(file);
  }
  const m = await sharp(file).metadata();
  rec.cover = { file, key: `blog/${rec.entry.slug}.webp`, width: m.width, height: m.height, bytes: fs.statSync(file).size };
}

// ── 5. SQL ───────────────────────────────────────────────────────────────────
const now = new Date().toISOString();
const lines = ["-- Gerado por scripts/blog-import.mjs. Substitui o que a importação anterior gravou."];
const authorId = (slug) => id("aut", slug);
const catId = (slug) => id("cat", slug);
const tagId = (slug) => id("tag", slug);

for (const a of MAP.autores) {
  lines.push(
    `INSERT OR REPLACE INTO blog_authors (id, slug, name, role, bio, same_as, created_at, updated_at) VALUES (${[authorId(a.slug), a.slug, a.name, a.role, a.bio, "[]", now, now].map(sql).join(", ")});`,
  );
}
MAP.categorias.forEach((c, i) => {
  lines.push(
    `INSERT OR REPLACE INTO blog_categories (id, slug, name, description, seo_title, meta_description, cta_path, position, created_at, updated_at) VALUES (${[catId(c.slug), c.slug, c.name, c.description, c.seoTitle, c.meta, c.cta, i + 1, now, now].map(sql).join(", ")});`,
  );
});
for (const t of MAP.tags) {
  lines.push(
    `INSERT OR REPLACE INTO blog_tags (id, slug, name, description, meta_description, created_at, updated_at) VALUES (${[tagId(t.slug), t.slug, t.name, t.description, t.description, now, now].map(sql).join(", ")});`,
  );
}

for (const rec of records) {
  const { post, entry, html } = rec;
  const pid = id("post", entry.slug);
  const s = stats(html);
  const author = authorOf(post.author ?? "");
  lines.push(`DELETE FROM blog_post_tags WHERE post_id = ${sql(pid)};`);
  lines.push(
    `INSERT OR REPLACE INTO blog_posts (id, slug, title, seo_title, meta_description, focus_keyword, excerpt, content_html, cover_url, cover_alt, cover_width, cover_height, author_id, category_id, status, published_at, updated_at, created_at, reading_minutes, word_count, featured, noindex, created_by, updated_by_name) VALUES (${[
      pid,
      entry.slug,
      post.title.trim(),
      entry.seoTitle,
      rec.meta,
      entry.focus,
      rec.excerpt,
      html,
      `/midia/${rec.cover.key}`,
      entry.alt,
      rec.cover.width,
      rec.cover.height,
      authorId(author.slug),
      catId(entry.category),
      "publicado",
      post.published_at,
      post.updated_at ?? post.published_at,
      post.created_at ?? post.published_at,
      s.minutes,
      s.words,
      post.featured ? 1 : 0,
      0,
      "importacao",
      "Importação do blog antigo",
    ]
      .map(sql)
      .join(", ")});`,
  );
  for (const t of entry.tags) lines.push(`INSERT OR IGNORE INTO blog_post_tags (post_id, tag_id) VALUES (${sql(pid)}, ${sql(tagId(t))});`);
  lines.push(
    `INSERT OR REPLACE INTO blog_media (id, key, url, alt, width, height, bytes, mime, created_at, created_by) VALUES (${[
      id("med", entry.slug),
      rec.cover.key,
      `/midia/${rec.cover.key}`,
      entry.alt,
      rec.cover.width,
      rec.cover.height,
      rec.cover.bytes,
      "image/webp",
      now,
      "importacao",
    ]
      .map(sql)
      .join(", ")});`,
  );
  // 301 do endereço antigo (mesmo domínio: o site novo substitui o antigo).
  if (post.slug !== entry.slug) {
    lines.push(`INSERT OR REPLACE INTO blog_redirects (from_path, to_path, reason, created_at) VALUES (${[`/blog/${post.slug}`, `/blog/${entry.slug}`, "slug do blog antigo", now].map(sql).join(", ")});`);
  }
}

// Duplicado → o artigo mantido; categorias antigas → novas.
for (const a of MAP.artigos.filter((x) => x.duplicateOf)) {
  const target = MAP.artigos.find((x) => x.old === a.duplicateOf);
  lines.push(`INSERT OR REPLACE INTO blog_redirects (from_path, to_path, reason, created_at) VALUES (${[`/blog/${a.old}`, `/blog/${target.slug}`, "artigo duplicado no blog antigo", now].map(sql).join(", ")});`);
}
for (const c of MAP.categorias) {
  for (const old of c.antigas) {
    lines.push(`INSERT OR REPLACE INTO blog_redirects (from_path, to_path, reason, created_at) VALUES (${[`/blog/categoria/${old}`, `/blog/categoria/${c.slug}`, "categoria do blog antigo", now].map(sql).join(", ")});`);
  }
}

const sqlFile = path.join(OUT, "importacao.sql");
fs.writeFileSync(sqlFile, `${lines.join("\n")}\n`);
fs.writeFileSync(path.join(ROOT, "scripts/blog-import/links.json"), `${JSON.stringify(linkReport, null, 2)}\n`);

// ── 6. Relatório e gravação ──────────────────────────────────────────────────
const totalLinks = linkReport.reduce((n, r) => n + r.links.length, 0);
console.log(`Artigos: ${records.length} (1 duplicado vira 301) · links internos inseridos: ${totalLinks}`);
console.log(`Sem link recebido de outro artigo: ${records.filter((r) => !received(r)).map((r) => `/blog/${r.entry.slug}`).join(", ") || "nenhum"}`);
console.log(`Sem nenhum link para outro artigo: ${linkReport.filter((r) => !r.links.some((l) => l.para.startsWith("/blog/"))).map((r) => r.artigo).join(", ") || "nenhum"}`);
console.log(`SQL: ${sqlFile} (${(fs.statSync(sqlFile).size / 1024).toFixed(0)} KB) · capas: ${path.join(OUT, "capas")}`);
if (problems.length) {
  console.log(`\nProblemas no mapa (${problems.length}):\n- ${problems.join("\n- ")}`);
  process.exitCode = 1;
}

if (APPLY) {
  if (problems.length) throw new Error("Corrija o mapa antes de aplicar.");
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  for (const rec of records) {
    execFileSync(npx, ["wrangler", "r2", "object", "put", `${BUCKET}/${rec.cover.key}`, "--file", rec.cover.file, "--content-type", "image/webp", "--remote"], {
      cwd: ROOT,
      stdio: "ignore",
      shell: process.platform === "win32",
    });
    process.stdout.write(".");
  }
  console.log("\nCapas no R2. Gravando no D1…");
  execFileSync(npx, ["wrangler", "d1", "execute", DB, "--remote", "--file", sqlFile, "--yes"], { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
  console.log("Importação concluída.");
}
