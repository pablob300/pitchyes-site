import type { PageContent } from "./types";

// TODO(produto): as 5 novidades abaixo são CONTEÚDO DE MODELO (datas e textos de exemplo, a
// partir de recursos que já existem). Trocar pelas novidades reais pelo painel e desligar
// "Conteúdo de modelo" no bloco; até lá elas ficam fora do /llms-full.txt (sample: true).
export const novidades: PageContent = {
  seoTitle: "Novidades da plataforma de IA de voz",
  seoDescription:
    "As novidades da plataforma de IA de voz da PitchYes, da mais recente para a mais antiga: o que chegou, quando e o que muda para quem já tem operação no ar.",
  eyebrow: "Recursos",
  h1: "Novidades da plataforma de IA de voz da PitchYes.",
  lead: "Esta página acompanha a evolução da PitchYes: o que chegou à plataforma, quando, e o que muda para quem está com uma operação no ar. As novidades aparecem da mais recente para a mais antiga.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "timeline",
      title: "Últimas novidades.",
      sample: true,
      items: [
        {
          date: "2026-10-20",
          title: "Testes de cenário antes de ir ao ar",
          text: "Rode casos de borda antes de publicar uma mudança no roteiro e veja quantos cenários passam, para nenhuma ligação real servir de teste.",
        },
        {
          date: "2026-09-15",
          title: "Transferência com contexto",
          text: "Quem recebe uma ligação transferida pelo agente começa com o resumo da conversa e os dados coletados, sem pedir para o cliente repetir.",
        },
        {
          date: "2026-08-12",
          title: "Omnichannel com memória",
          text: "Voz, WhatsApp, SMS e chat do site passam a compartilhar o mesmo contexto: o cliente continua a conversa de onde parou, em qualquer canal.",
        },
        {
          date: "2026-07-08",
          title: "Observabilidade em tempo real",
          text: "Acompanhe as ligações enquanto acontecem, com transcrição, avaliação automática e busca pelo conteúdo das conversas.",
        },
        {
          date: "2026-06-03",
          title: "Controles de segurança",
          text: "Criptografia, acesso por função, trilha de auditoria e opções de residência de dados disponíveis para todas as operações.",
        },
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
