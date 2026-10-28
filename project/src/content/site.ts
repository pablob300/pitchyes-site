import { clients, type Client } from "./clients";
import { sectors, type Sector } from "./sectors";

// Conteúdo que NÃO é de uma página só: aparece em todas elas.
//
// A faixa de CTA final é renderizada pelo layout (components/layout/SiteChrome.tsx), e a
// parede de logos alimenta tanto a home quanto /clientes. Por isso os dois moram aqui e,
// no editor, ficam sob o caminho reservado "/_site": publicar essa parte revalida o site
// inteiro, não uma página.

export type FinalCta = {
  title: string;
  /** Só o rótulo do botão: o endereço é TALK_TO_AI_HREF, de lib/routes.ts. */
  cta: string;
};

export type SiteContent = {
  finalCta: FinalCta;
  clients: Client[];
  /** Setores atendidos (content/sectors.ts): /solucoes/por-setor e blocos com source "setores". */
  sectors: Sector[];
};

/** Caminho reservado do conteúdo global no banco e no editor. */
export const SITE_CONTENT_PATH = "/_site";

export const siteDefaults: SiteContent = {
  finalCta: {
    title: "Sua IA de voz sob medida para sua empresa.",
    cta: "Fale com nossa IA",
  },
  clients,
  sectors,
};
