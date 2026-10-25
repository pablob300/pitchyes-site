// Content model for the inner pages. Each page is data (here) + the block renderer
// (components/blocks/ContentPage.tsx), so copy stays reviewable in one place.
// SEO rules for new pages: ../../SEO.md

/** `id` opcional vira âncora da seção (ex. botão "#clientes" no topo da página). */
export type Block = (
  | { kind: "prose"; title?: string; eyebrow?: string; paragraphs: string[] }
  | {
      kind: "features";
      eyebrow?: string;
      title: string;
      lead?: string;
      columns?: 2 | 3;
      items: { title: string; text: string; href?: string }[];
    }
  | { kind: "steps"; title: string; lead?: string; steps: { label: string; title: string; text: string }[] }
  | { kind: "stats"; title?: string; lead?: string; items: { value: string; label: string }[] }
  | { kind: "checklist"; title: string; lead?: string; items: string[] }
  | {
      kind: "cases";
      title: string;
      lead?: string;
      items: { company: string; sector: string; headline: string; quote?: string; person?: string; pending?: boolean }[];
    }
  | {
      /** Parede de logos: a imagem da marca em cima, o nome embaixo. */
      kind: "logos";
      title: string;
      lead?: string;
      items: { name: string; logo: string; width: number; height: number }[];
    }
  | {
      kind: "pricing";
      title: string;
      lead?: string;
      note?: string;
      plans: {
        name: string;
        audience: string;
        price: string;
        priceUnit?: string;
        fee: string;
        features: string[];
        cta: { label: string; href: string };
        highlight?: boolean;
      }[];
    }
  | {
      kind: "table";
      title: string;
      lead?: string;
      columns: string[];
      groups: { title: string; rows: { label: string; values: string[] }[] }[];
    }
  | {
      /** Formulário de contato com os canais oficiais ao lado (ver components/forms/LeadForm). */
      kind: "contact";
      /** Id do formulário em lib/leads.ts. */
      form: string;
      title: string;
      benefits?: string[];
      submitLabel: string;
      channels: { label: string; value: string; hint?: string; href?: string }[];
      highlight?: { title: string; text: string; stats?: { value: string; label: string }[] };
    }
  | { kind: "faq"; title: string; items: { q: string; a: string }[] }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "links"; title: string; lead?: string; items: { title: string; text: string; href: string }[] }
) & { id?: string };

export type PageContent = {
  /** <title> (without the “| PitchYes” suffix) — keep under ~60 characters. */
  seoTitle: string;
  /** <meta name="description"> — 120–160 characters, with a reason to click. */
  seoDescription: string;
  eyebrow?: string;
  h1: string;
  lead: string;
  cta?: { label: string; href: string };
  blocks: Block[];
};

/** Questions/answers of a page, for the FAQPage structured data. */
export function faqItems(content: PageContent) {
  return content.blocks.flatMap((b) => (b.kind === "faq" ? b.items : []));
}
