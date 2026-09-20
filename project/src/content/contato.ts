import type { PageContent } from "./types";

// Canais oficiais e campos do formulário conforme a página de contato do pitchyes.com.br.
// Os envios são gravados pelo /api/leads e ficam visíveis em /admin/leads.
export const contato: PageContent = {
  seoTitle: "Contato",
  seoDescription:
    "Agende uma demonstração gratuita da PitchYes: 30 minutos, análise do seu processo atual e proposta customizada para a sua operação.",
  eyebrow: "Empresa",
  h1: "Pronto para transformar suas vendas?",
  lead: "Agende uma demonstração gratuita e descubra como a PitchYes pode revolucionar seus resultados de vendas em apenas 30 dias.",
  blocks: [
    {
      kind: "contact",
      form: "contato",
      title: "Agende sua Demonstração Gratuita",
      submitLabel: "Agendar Horário",
      benefits: [
        "Demonstração personalizada de 30 minutos",
        "Análise gratuita do seu processo atual",
        "Proposta customizada para sua empresa",
        "Setup gratuito e treinamento incluído",
      ],
      channels: [
        { label: "Telefone", value: "+55 (11) 5196-9381", href: "tel:+551151969381", hint: "Seg-Sex das 8h às 20h" },
        { label: "Email", value: "comercial@pitchyes.com.br", href: "mailto:comercial@pitchyes.com.br", hint: "Resposta em até 2 horas" },
        { label: "Endereço", value: "Rua 11, 250, 13º andar - Setor Central, Goiânia (GO), Brasil - 74015-170", hint: "Atendimento em todo Brasil" },
        { label: "Atendimento", value: "Atendimento via WhatsApp", hint: "Seg-Sex das 8h às 20h" },
      ],
      highlight: {
        title: "Junte-se a 400+ empresas",
        text: "Que já transformaram suas vendas com a PitchYes e obtiveram resultados excepcionais em menos de 30 dias.",
        stats: [
          { value: "94%", label: "Taxa de sucesso" },
          { value: "3x", label: "Mais leads qualificados" },
        ],
      },
    },
    {
      kind: "checklist",
      title: "Para a conversa render, tenha em mãos.",
      items: [
        "Qual ligação você quer automatizar primeiro",
        "Volume aproximado de chamadas por dia",
        "Quais sistemas precisam ser consultados durante a ligação",
        "Qual indicador você quer mover",
        "Restrições de compliance do seu setor",
      ],
    },
    {
      kind: "prose",
      title: "Sobre privacidade no contato.",
      paragraphs: [
        "Os dados enviados neste formulário são usados apenas para responder à sua solicitação e preparar a demonstração, conforme a nossa Política de Privacidade. Você pode pedir a exclusão a qualquer momento pelo e-mail privacidade@pitchyes.com.br.",
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes antes da conversa.",
      items: [
        {
          q: "Quanto tempo leva uma demonstração?",
          a: "Cerca de 30 minutos. Mostramos o agente funcionando em um cenário parecido com o seu e respondemos às dúvidas de integração e compliance. Se fizer sentido, saímos da conversa com um piloto desenhado.",
        },
        {
          q: "Preciso ter volume alto de ligações para falar com vocês?",
          a: "Não. O plano Start existe justamente para operações que estão começando ou querem testar um tipo de ligação antes de escalar.",
        },
        {
          q: "Em quanto tempo vocês respondem?",
          a: "O time comercial responde os contatos por e-mail em até 2 horas dentro do horário de atendimento, de segunda a sexta, das 8h às 20h.",
        },
        {
          q: "Vocês atendem empresas fora do Brasil?",
          a: "Sim. A plataforma atende nativamente em mais de 40 idiomas, com tradução em tempo real em 23 deles. As condições comerciais para operações internacionais são tratadas caso a caso.",
        },
        {
          q: "Como faço para trabalhar na PitchYes?",
          a: "Envie sua candidatura por este mesmo formulário, contando no que você quer trabalhar e o que já construiu. A página de carreiras explica como trabalhamos.",
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Preços", text: "Planos e tarifa por minuto, para chegar com o orçamento pronto.", href: "/precos" },
        { title: "Soluções", text: "O que o agente resolve em ligações ativas e receptivas.", href: "/solucoes" },
      ],
    },
  ],
};
