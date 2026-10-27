import type { PageContent } from "./types";

// TODO(produto): esta página descreve capacidades já disponíveis, sem datas de lançamento.
// Quando houver um registro real de releases, trocar por entradas datadas.
export const novidades: PageContent = {
  seoTitle: "Novidades da plataforma de IA de voz",
  seoDescription:
    "O que já está disponível na plataforma de IA de voz da PitchYes: canais, testes de cenário, observabilidade, integrações e controles de segurança.",
  eyebrow: "Recursos",
  h1: "O que já está disponível na plataforma de IA de voz.",
  lead: "Esta página acompanha a evolução da PitchYes. Abaixo, as capacidades disponíveis hoje para quem está com uma operação no ar — e o que estamos construindo em seguida.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "features",
      title: "Disponível hoje.",
      items: [
        { title: "Agentes em linguagem natural", text: "Descreva o que o agente deve fazer e as regras a seguir. Nenhuma experiência em IA de voz é necessária." },
        { title: "Testes de cenário", text: "Rode casos de borda antes de ir ao ar e veja quantos cenários passam a cada mudança do roteiro." },
        { title: "Omnichannel com memória", text: "Voz, WhatsApp, SMS e chat do site com o mesmo contexto: o cliente não repete o que já disse." },
        { title: "Observabilidade", text: "Acompanhe ligações em tempo real, com transcrição, avaliação automática e busca por conteúdo." },
        { title: "Transferência com contexto", text: "A pessoa que recebe a transferência começa com o resumo da conversa e os dados coletados." },
        { title: "Controles de segurança", text: "Criptografia, acesso por função, trilha de auditoria e opções de residência de dados." },
      ],
    },
    {
      kind: "prose",
      title: "Em construção.",
      paragraphs: [
        "Estamos trabalhando em relatórios comparativos por campanha, para acompanhar a evolução de um mesmo roteiro ao longo do tempo, e em novos conectores nativos para as ferramentas mais pedidas pelos clientes.",
        "Se a sua operação depende de uma integração específica, fale com a gente: a fila de conectores é priorizada pelo que os clientes precisam para entrar em produção.",
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Integrações", text: "Como conectar telefonia, CRM, agenda e sistemas internos.", href: "/recursos/integracoes" },
        { title: "Blog", text: "Artigos sobre IA de voz, vendas e atendimento.", href: "/blog" },
      ],
    },
  ],
};
