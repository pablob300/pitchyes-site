import type { PageContent } from "./types";

// TODO(empresa): confirmar história, ano de fundação, tamanho do time e sede.
// O texto evita afirmar dados não verificados — fala de posicionamento e método.
export const sobre: PageContent = {
  seoTitle: "Sobre a PitchYes",
  seoDescription:
    "Quem somos: uma empresa brasileira de IA de voz para automação de vendas e atendimento, construída para operações que dependem do telefone todos os dias.",
  eyebrow: "Empresa",
  h1: "Construímos a IA que fala com o seu cliente.",
  lead: "A PitchYes é uma empresa brasileira de IA de voz para automação de vendas e atendimento. Nosso trabalho começa onde a maioria das automações para: na ligação que precisa ser resolvida do começo ao fim.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "prose",
      title: "Por que voz.",
      paragraphs: [
        "O telefone continua sendo o canal onde as decisões acontecem: a consulta é confirmada, a dívida é negociada, a venda avança. É também o canal mais caro de operar e o primeiro a quebrar quando o volume cresce.",
        "A automação tradicional tentou resolver isso com menus e mensagens prontas, empurrando o esforço para o cliente. A IA de voz permite o contrário: a pessoa fala do jeito dela, e o sistema se adapta.",
        "Construímos a PitchYes para esse cenário, com um princípio simples: um agente só é útil se resolver a ligação inteira — entender, consultar o sistema, executar a ação e registrar o que aconteceu.",
      ],
    },
    {
      kind: "features",
      title: "Como trabalhamos.",
      items: [
        { title: "Começar pequeno e medir", text: "Uma frente de ligação, um indicador combinado, uma semana de piloto. A ampliação vem do resultado, não da promessa." },
        { title: "Entrar na operação, não ao lado dela", text: "O agente usa a telefonia, o CRM e a agenda que já existem. Se o registro não aparece onde a equipe olha, não serve." },
        { title: "Testar antes do cliente ouvir", text: "Cada mudança de roteiro passa por cenários de teste, incluindo os casos em que o sistema falha." },
        { title: "Transparência no que a IA faz", text: "Toda ligação fica transcrita, avaliada e disponível para auditoria. Quem opera precisa saber exatamente o que foi dito." },
      ],
    },
    {
      kind: "checklist",
      title: "No que não abrimos mão.",
      items: [
        "Segurança e conformidade tratadas como requisito, não como item de roadmap",
        "Dados do cliente que continuam sendo do cliente",
        "Transferência para humano sempre disponível, com contexto",
        "Nenhum agente no ar sem testes de cenário aprovados",
        "Discurso alinhado ao que o produto realmente faz",
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Carreiras", text: "Como trabalhamos e o que procuramos em quem entra.", href: "/carreiras" },
        { title: "Contato", text: "Fale com o time comercial ou técnico.", href: "/contato" },
      ],
    },
  ],
};
