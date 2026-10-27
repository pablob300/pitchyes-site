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
      /**
       * "clientes" (padrão): a lista global de clientes (/_site), a mesma da home — `items`
       * é ignorado. "proprio": os logos deste bloco (ex.: "Na imprensa" das landing pages).
       */
      source?: "clientes" | "proprio";
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
  // --- Blocos das landing pages (/conteudo/<slug>) ---------------------------------
  | {
      /** Topo da landing page: chamada, marcadores e o formulário ao lado. Leva o único <h1>. */
      kind: "heroForm";
      eyebrow?: string;
      title: string;
      lead: string;
      bullets: string[];
      /** Linha curta de prova abaixo dos marcadores ("20Mi+ ligações · 400+ empresas"). */
      proof?: string;
      formTitle: string;
      submitLabel: string;
      /** Linha abaixo do botão de envio ("Sem compromisso…"). */
      formNote?: string;
    }
  | {
      /** Vídeo do YouTube: capa primeiro, o player só carrega no clique. */
      kind: "video";
      eyebrow?: string;
      title: string;
      lead?: string;
      /** Id do vídeo (o trecho depois de "v=" ou de "youtu.be/"). */
      videoId: string;
      /** Texto alternativo da capa. */
      alt: string;
      /** Capa servida pelo próprio site; sem ela, usa a capa do YouTube. */
      poster?: string;
      stepsTitle?: string;
      steps?: string[];
      stats?: { value: string; label: string }[];
      quote?: string;
      person?: string;
    }
  | {
      /** Funil de resultados: cada etapa com o número, o percentual e o nome. */
      kind: "funnel";
      eyebrow?: string;
      title: string;
      lead?: string;
      steps: { value: string; percent: string; label: string }[];
      note?: string;
    }
  | {
      /** Depoimentos em texto, com nota em estrelas. */
      kind: "testimonials";
      eyebrow?: string;
      title: string;
      lead?: string;
      stats?: { value: string; label: string }[];
      items: { quote: string; name: string; role: string; company: string }[];
    }
  | {
      /** Faixa final da landing page: título, marcadores e o botão para o formulário. */
      kind: "ctaFinal";
      title: string;
      lead?: string;
      items: string[];
      button: string;
    }
) & {
  id?: string;
  /** Landing pages: texto do item no menu de âncoras do topo (sem isto, o bloco não entra no menu). */
  menuLabel?: string;
  /** Landing pages: texto do botão abaixo do bloco, que leva ao formulário. */
  cta?: string;
};

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
