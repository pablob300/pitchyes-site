import type { PageContent } from "./types";

// TODO(contato): inserir e-mail, telefone/WhatsApp e endereço oficiais.
// Enquanto não houver, a página direciona para o agente de voz do site.
export const contato: PageContent = {
  seoTitle: "Contato",
  seoDescription:
    "Fale com o time da PitchYes: converse com nosso agente de voz, peça uma demonstração para a sua operação ou envie sua candidatura.",
  eyebrow: "Empresa",
  h1: "Fale com a gente — ou com a nossa IA.",
  lead: "A forma mais rápida de entender o produto é ouvir o agente trabalhando. Você também pode pedir uma demonstração com um especialista, que analisa a sua operação antes da conversa.",
  cta: { label: "Falar com nossa IA agora", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "features",
      title: "Por onde você prefere começar.",
      columns: 3,
      items: [
        { title: "Conversar com o agente", text: "Escolha um setor na página inicial e fale com o agente pelo navegador. É a própria plataforma funcionando." },
        { title: "Demonstração com especialista", text: "Analisamos o tipo de ligação que você quer automatizar e mostramos como ficaria na sua operação." },
        { title: "Time técnico", text: "Dúvidas sobre integração, segurança ou implantação: falamos direto com quem vai executar." },
      ],
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
        "Os dados enviados no contato são usados apenas para responder à sua solicitação, conforme a nossa Política de Privacidade. Você pode pedir a exclusão a qualquer momento.",
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
          q: "Vocês atendem empresas fora do Brasil?",
          a: "Sim. A plataforma atende nativamente em mais de 40 idiomas, com tradução em tempo real em 23 deles. As condições comerciais para operações internacionais são tratadas caso a caso.",
        },
        {
          q: "Como faço para trabalhar na PitchYes?",
          a: "Envie sua candidatura por este mesmo canal, contando no que você quer trabalhar e o que já construiu. A página de carreiras explica como trabalhamos.",
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
