// Single source of truth for the site map: header, footer, placeholder pages and
// sitemap-paginas.xml all read from here. When a page gets real content, create its own
// route file (it takes precedence over app/[...slug]) and set `placeholder: false`.

export type SitePage = {
  path: string;
  title: string;
  description: string;
  placeholder: boolean;
};

export const pages = [
  { path: "/", title: "Início", description: "IA de voz para setores que exigem segurança e confiança: saúde, seguros, serviços financeiros e mais.", placeholder: false },

  { path: "/solucoes", title: "Soluções", description: "Como a IA de voz da PitchYes atende ligações ativas e receptivas em escala.", placeholder: true },
  { path: "/solucoes/ativo", title: "Ligações ativas", description: "Prospecção, qualificação de leads, confirmação de reuniões e follow-up com IA de voz.", placeholder: true },
  { path: "/solucoes/receptivo", title: "Atendimento receptivo", description: "Todo cliente atendido, qualificado e direcionado, 24 horas por dia.", placeholder: true },
  { path: "/solucoes/por-setor", title: "Soluções por setor", description: "IA de voz para saúde, seguros, serviços financeiros, imobiliário e mais.", placeholder: true },
  { path: "/solucoes/por-funcao", title: "Soluções por função", description: "IA de voz para vendas, atendimento, cobrança e operações.", placeholder: true },

  { path: "/clientes", title: "Clientes", description: "Empresas que automatizam ligações com a PitchYes.", placeholder: true },
  { path: "/clientes/cases", title: "Cases", description: "Resultados reais de clientes que usam a IA de voz da PitchYes.", placeholder: true },

  { path: "/precos", title: "Preços", description: "Planos e valores da PitchYes: uma tarifa por minuto, sem cobranças escondidas.", placeholder: true },

  { path: "/recursos/integracoes", title: "Integrações", description: "A PitchYes conecta com sua telefonia, CRM e agenda atuais.", placeholder: true },
  { path: "/recursos/novidades", title: "Novidades", description: "Lançamentos e atualizações da plataforma PitchYes.", placeholder: true },

  // Blog: standby — will be served from the headless WordPress (see lib/blog.ts).
  { path: "/blog", title: "Blog", description: "Artigos sobre IA de voz, vendas e atendimento.", placeholder: true },
  { path: "/blog/categorias", title: "Categorias do blog", description: "Todas as categorias de artigos do blog da PitchYes.", placeholder: true },

  { path: "/sobre", title: "Sobre a PitchYes", description: "Quem somos e por que construímos IA de voz para empresas.", placeholder: true },
  { path: "/carreiras", title: "Carreiras", description: "Trabalhe na PitchYes.", placeholder: true },
  { path: "/contato", title: "Contato", description: "Fale com o time da PitchYes.", placeholder: true },

  { path: "/privacidade", title: "Política de Privacidade", description: "Como a PitchYes coleta, usa e protege dados pessoais.", placeholder: true },
  { path: "/termos", title: "Termos de Uso", description: "Termos de uso do site e da plataforma PitchYes.", placeholder: true },
] as const satisfies readonly SitePage[];

export type PagePath = (typeof pages)[number]["path"];

export function getPage(path: string): SitePage | undefined {
  return pages.find((p) => p.path === path);
}

// Primary CTA target: the "talk to an agent" widget in the homepage hero.
export const TALK_TO_AI_HREF = "/#fale-com-a-ia";

export type NavLink = { label: string; href: PagePath };
export type NavItem = NavLink | { label: string; children: NavLink[] };

export const mainNav: NavItem[] = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Clientes", href: "/clientes" },
  { label: "Preços", href: "/precos" },
  {
    label: "Recursos",
    children: [
      { label: "Integrações", href: "/recursos/integracoes" },
      { label: "Novidades", href: "/recursos/novidades" },
    ],
  },
  { label: "Blog", href: "/blog" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Soluções",
    links: [
      { label: "Ativo", href: "/solucoes/ativo" },
      { label: "Receptivo", href: "/solucoes/receptivo" },
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
  { title: "Preços", links: [{ label: "Planos e valores", href: "/precos" }] },
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
