import "server-only";
import { homeDefaults } from "@/components/home/content";
import {
  FIXED_FIRST_SECTION,
  type HomeContent,
  type PillarKey,
  type Section,
  type SectionKey,
} from "@/content/home.schema";
import { siteDefaults, SITE_CONTENT_PATH, type SiteContent } from "@/content/site";
import { getPageContentData, type ContentStatus } from "@/lib/page-content";
import { mergeContent, parseOverride } from "./merge";

// Resolve o conteúdo de uma página: padrão do código + sobreposição do banco, validado.
//
// A validação existe porque o componente confia no formato. Platform indexa uma
// ilustração em JSX pela chave da pilastra; Latency divide pelo maior valor da lista.
// Uma linha ruim no banco não pode derrubar a home — então cada seção que não passa na
// conferência volta sozinha para o padrão do código, sem levar as outras junto.

const SECTION_KEYS: SectionKey[] = [
  "hero",
  "clientLogos",
  "platform",
  "latency",
  "testimonials",
  "rollout",
  "security",
  "useCases",
  "faq",
];

const PILLAR_KEYS: PillarKey[] = ["infra", "build", "test", "omni", "observe", "integrations"];

const text = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";
const positive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

/** Troca a seção pelo padrão do código quando ela não passa na conferência. */
function keep<T>(candidate: T, fallback: T, ok: (value: T) => boolean, where: string): T {
  if (ok(candidate)) return candidate;
  console.error(`[conteudo] seção inválida, usando o padrão do código: ${where}`);
  return fallback;
}

function validSections(sections: Section[]): Section[] {
  const seen = new Set<SectionKey>();
  const valid = sections.filter((s) => {
    if (!s || !SECTION_KEYS.includes(s.key) || seen.has(s.key)) return false;
    seen.add(s.key);
    return true;
  });
  // Seção que o banco não citou continua existindo: entra no fim, com o padrão dela.
  const missing = homeDefaults.sections.filter((s) => !seen.has(s.key));
  const all = [...valid, ...missing];
  // O hero carrega o único <h1>: nunca oculto, nunca fora do topo.
  return all.map((s) => (s.key === FIXED_FIRST_SECTION ? { key: s.key } : s));
}

export function resolveHome(override: unknown): HomeContent {
  const merged = mergeContent(homeDefaults, override);
  const d = homeDefaults;

  return {
    sections: validSections(merged.sections ?? d.sections),

    hero: keep(
      merged.hero,
      d.hero,
      (h) =>
        text(h.lead) &&
        text(h.cta) &&
        text(h.stat?.value) &&
        Array.isArray(h.widget?.agents) &&
        h.widget.agents.length > 0 &&
        h.widget.agents.every((a) => text(a.name) && text(a.audio)),
      "hero",
    ),

    clientLogos: keep(merged.clientLogos, d.clientLogos, (c) => text(c.title), "clientLogos"),

    platform: keep(
      {
        ...merged.platform,
        // Chave desconhecida não tem ilustração: fora, antes de chegar no componente.
        pillars: (merged.platform?.pillars ?? []).filter((p) => PILLAR_KEYS.includes(p.key)),
      },
      d.platform,
      (p) =>
        text(p.title) &&
        p.pillars.length > 0 &&
        p.pillars.every((pillar) => text(pillar.title) && text(pillar.text)),
      "platform",
    ),

    latency: keep(
      merged.latency,
      d.latency,
      (l) =>
        text(l.title) &&
        Array.isArray(l.rows) &&
        l.rows.length > 0 &&
        l.rows.every((r) => text(r.label) && positive(r.value) && positive(r.duration)),
      "latency",
    ),

    testimonials: keep(
      merged.testimonials,
      d.testimonials,
      (t) =>
        text(t.title) &&
        Array.isArray(t.items) &&
        t.items.length > 0 &&
        // seconds e published alimentam o VideoObject: dado estruturado errado é pior
        // do que dado estruturado ausente.
        t.items.every(
          (item) =>
            text(item.company) &&
            text(item.videoId) &&
            text(item.thumb) &&
            positive(item.seconds) &&
            /^\d{4}-\d{2}-\d{2}$/.test(item.published),
        ),
      "testimonials",
    ),

    rollout: keep(
      merged.rollout,
      d.rollout,
      (r) =>
        text(r.title) &&
        Array.isArray(r.steps) &&
        r.steps.length > 0 &&
        r.steps.every((s) => text(s.day) && text(s.title)),
      "rollout",
    ),

    security: keep(
      merged.security,
      d.security,
      (s) =>
        text(s.title) &&
        text(s.cta) &&
        Array.isArray(s.items) &&
        s.items.length > 0 &&
        s.items.every((item) => text(item.name) && text(item.controlTitle)),
      "security",
    ),

    useCases: keep(
      merged.useCases,
      d.useCases,
      (u) =>
        text(u.title) &&
        Array.isArray(u.items) &&
        u.items.length > 0 &&
        u.items.every((item) => text(item.title)),
      "useCases",
    ),

    faq: keep(
      merged.faq,
      d.faq,
      (f) =>
        text(f.title) &&
        Array.isArray(f.items) &&
        f.items.length > 0 &&
        f.items.every((item) => text(item.q) && text(item.a)),
      "faq",
    ),
  };
}

export function resolveSite(override: unknown): SiteContent {
  const merged = mergeContent(siteDefaults, override);
  return {
    finalCta: keep(
      merged.finalCta,
      siteDefaults.finalCta,
      (c) => text(c.title) && text(c.cta),
      "finalCta",
    ),
    clients: keep(
      merged.clients,
      siteDefaults.clients,
      (list) =>
        Array.isArray(list) &&
        list.length > 0 &&
        // O alt do logo sai do nome da empresa (SEO.md §1.7): sem nome, sem alt.
        list.every((c) => text(c.name) && text(c.logo) && positive(c.width) && positive(c.height)),
      "clients",
    ),
  };
}

export async function getHomeContent(status: ContentStatus): Promise<HomeContent> {
  return resolveHome(parseOverride(await getPageContentData("/", status)));
}

export async function getSiteContent(status: ContentStatus): Promise<SiteContent> {
  return resolveSite(parseOverride(await getPageContentData(SITE_CONTENT_PATH, status)));
}
