// Single source of truth for the site map: header, footer, placeholder pages and
// sitemap-paginas.xml all read from here. When a page gets real content, create its own
// route file (it takes precedence over app/[...slug]) and set `placeholder: false`.

export type SitePage = {
  path: string;
  title: string;
  description: string;
  placeholder: boolean;
  /** Content last reviewed (YYYY-MM-DD) — feeds <lastmod> in the sitemap. Bump it when the page's copy changes. */
  updated: string;
};

export const pages = [
  { path: "/", title: "Início", description: "IA de voz para setores que exigem segurança e confiança: saúde, seguros, serviços financeiros e mais.", placeholder: false, updated: "2026-11-09" },

  { path: "/solucoes", title: "Soluções", description: "Como a IA de voz da PitchYes atende ligações ativas e receptivas em escala.", placeholder: false, updated: "2026-10-28" },
  { path: "/solucoes/ativo", title: "Ligações ativas", description: "Prospecção, qualificação de leads, confirmação de reuniões e follow-up com IA de voz.", placeholder: false, updated: "2026-10-26" },
  { path: "/solucoes/receptivo", title: "Atendimento receptivo", description: "Todo cliente atendido, qualificado e direcionado, 24 horas por dia.", placeholder: false, updated: "2026-10-27" },
  { path: "/solucoes/operacional", title: "Ligações operacionais", description: "Cobrança, recuperação de carrinho, onboarding, avisos e pesquisas com IA de voz.", placeholder: false, updated: "2026-10-28" },
  { path: "/solucoes/por-setor", title: "Soluções por setor", description: "IA de voz para saúde, seguros, finanças, imóveis, automotivo, provedores de internet e mais.", placeholder: false, updated: "2026-10-28" },
  { path: "/solucoes/por-funcao", title: "Soluções por função", description: "IA de voz para vendas, atendimento, cobrança e operações.", placeholder: false, updated: "2026-10-26" },

  { path: "/clientes", title: "Clientes", description: "Empresas que automatizam ligações com a PitchYes.", placeholder: false, updated: "2026-10-28" },
  { path: "/clientes/cases", title: "Cases", description: "Resultados reais de clientes que usam a IA de voz da PitchYes.", placeholder: false, updated: "2026-11-09" },

  // Era /precos até 25/10/2026; o endereço antigo redireciona com 301 (next.config.ts).
  { path: "/planos", title: "Planos", description: "Planos e valores da PitchYes: uma tarifa por minuto, sem cobranças escondidas.", placeholder: false, updated: "2026-10-28" },

  { path: "/recursos/integracoes", title: "Integrações", description: "A PitchYes conecta com sua telefonia, CRM e agenda atuais.", placeholder: false, updated: "2026-10-26" },
  { path: "/recursos/novidades", title: "Novidades", description: "Lançamentos e atualizações da plataforma PitchYes.", placeholder: false, updated: "2026-10-28" },

  // Blog próprio (D1, editado em /admin/blog). As URLs de artigos, categorias e tags vêm do
  // banco e entram em sitemap-blog.xml; aqui ficam só as duas páginas fixas.
  { path: "/blog", title: "Blog", description: "Artigos sobre IA de voz, vendas e atendimento.", placeholder: false, updated: "2026-10-26" },
  { path: "/blog/categorias", title: "Categorias do blog", description: "Todas as categorias de artigos do blog da PitchYes.", placeholder: false, updated: "2026-10-26" },

  { path: "/sobre", title: "Sobre a PitchYes", description: "Empresa brasileira de voz conversacional com IA para contato, vendas, suporte e atendimento.", placeholder: false, updated: "2026-10-28" },
  { path: "/carreiras", title: "Carreiras", description: "Trabalhe na PitchYes.", placeholder: false, updated: "2026-10-28" },
  { path: "/contato", title: "Contato", description: "Agende uma demonstração gratuita de 30 minutos com o time da PitchYes.", placeholder: false, updated: "2026-10-28" },

  { path: "/privacidade", title: "Política de Privacidade", description: "Como a PitchYes coleta, usa e protege dados pessoais.", placeholder: false, updated: "2026-10-25" },
  { path: "/termos", title: "Termos de Uso", description: "Termos de uso do site e da plataforma PitchYes.", placeholder: false, updated: "2026-09-19" },
] as const satisfies readonly SitePage[];

export type PagePath = (typeof pages)[number]["path"];

export function getPage(path: string): SitePage | undefined {
  return pages.find((p) => p.path === path);
}

/**
 * Para onde vai cada intenção (regra comercial, out/2026):
 * - "Fale com nossa IA", demonstração, orçamento, falar com vendas → landing page de cadastro
 *   (TALK_TO_AI_HREF). Ela vive no banco (Landing Pages): desligar "Cadastro" no painel
 *   quebra todos esses botões.
 * - Cliente que quer falar com a empresa → /contato.
 * - Quem procura emprego → LinkedIn (CAREERS_HREF), a partir de /carreiras.
 */
export const TALK_TO_AI_HREF = "/conteudo/cadastro";
export const CAREERS_HREF = "https://www.linkedin.com/company/pitchyes";

/** Página de agradecimento de todas as landing pages (fora do sitemap, noindex). */
export const THANK_YOU_HREF = "/conteudo/obrigado";

export type NavLink = { label: string; href: PagePath };
export type NavItem = NavLink | { label: string; children: NavLink[] };

export const mainNav: NavItem[] = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Clientes", href: "/clientes" },
  { label: "Planos", href: "/planos" },
  { label: "Integrações", href: "/recursos/integracoes" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Soluções",
    links: [
      { label: "Ativo", href: "/solucoes/ativo" },
      { label: "Receptivo", href: "/solucoes/receptivo" },
      { label: "Operacional", href: "/solucoes/operacional" },
      { label: "Por Setor", href: "/solucoes/por-setor" },
      { label: "Por Função", href: "/solucoes/por-funcao" },
    ],
  },
  {
    title: "Clientes",
    links: [
      { label: "Listagem de clientes", href: "/clientes" },
      { label: "Cases", href: "/clientes/cases" },
    ],
  },
  { title: "Planos", links: [{ label: "Planos e valores", href: "/planos" }] },
  {
    title: "Recursos",
    links: [
      { label: "Integrações", href: "/recursos/integracoes" },
      { label: "Novidades", href: "/recursos/novidades" },
    ],
  },
  {
    title: "Blog",
    links: [
      { label: "Artigos", href: "/blog" },
      { label: "Categorias", href: "/blog/categorias" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre a PitchYes", href: "/sobre" },
      { label: "Carreiras", href: "/carreiras" },
      { label: "Contato", href: "/contato" },
    ],
  },
];

export const legalNav: NavLink[] = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
];
