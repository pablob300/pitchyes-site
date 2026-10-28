import type { PageContent } from "./types";

// Termos-alvo: "ligações operacionais com IA", "cobrança automatizada por telefone",
// "recuperação de carrinho abandonado por ligação", "pesquisa de satisfação por voz".
// TODO(comercial): revisar o texto com o time antes de divulgar a página em campanha.
export const solucoesOperacional: PageContent = {
  seoTitle: "Ligações operacionais com IA: cobrança e avisos",
  seoDescription:
    "Cobrança, recuperação de carrinho, onboarding, avisos e pesquisas de satisfação com agentes de voz que ligam para milhares de clientes sem ocupar a sua equipe.",
  eyebrow: "Soluções",
  h1: "Ligações operacionais com IA de voz: a rotina que não pode parar.",
  lead: "Toda empresa tem ligações que precisam acontecer todos os dias: lembrar um vencimento, recuperar uma compra que ficou pelo caminho, dar boas-vindas a um cliente novo, ouvir quem acabou de ser atendido. O agente da PitchYes faz essa rotina inteira com voz natural, no volume que a operação pedir.",
  cta: { label: "Fale com nossa IA", href: "/conteudo/cadastro" },
  blocks: [
    {
      kind: "features",
      title: "O que entra na ligação operacional.",
      lead: "São conversas com cliente que já existe: o objetivo é resolver, lembrar ou ouvir, e não vender do zero.",
      items: [
        {
          title: "Cobrança e recuperação de inadimplentes",
          text: "Lembra o vencimento antes da data, retoma quem atrasou, apresenta as condições que você aprovou e envia o link ou o código de pagamento na hora, por WhatsApp ou SMS.",
        },
        {
          title: "Carrinho e cadastro abandonados",
          text: "Liga para quem parou no meio da compra ou do cadastro, entende o que travou e ajuda a concluir, ou registra o motivo para a sua equipe agir.",
        },
        {
          title: "Onboarding de clientes",
          text: "Dá boas-vindas, confirma dados, explica os primeiros passos e agenda a ativação, para o cliente novo não se perder nos primeiros dias.",
        },
        {
          title: "Pesquisa de satisfação",
          text: "Aplica NPS e pesquisas curtas logo depois do atendimento ou da entrega, com respostas estruturadas e o comentário de cada cliente transcrito.",
          href: "/solucoes/por-funcao",
        },
        {
          title: "Confirmações e lembretes",
          text: "Confirma consultas, entregas, visitas técnicas e compromissos, reagenda quando a pessoa não pode e avisa a equipe sobre cada mudança.",
        },
        {
          title: "Avisos em massa",
          text: "Comunica mudanças de horário, interrupções, atualizações cadastrais e campanhas para toda a base, com registro de quem recebeu e do que foi dito.",
        },
      ],
    },
    {
      kind: "prose",
      title: "Por que voz, e não só mensagem.",
      paragraphs: [
        "Mensagem é fácil de ignorar. A ligação abre uma conversa: o cliente pergunta, negocia, explica por que não pagou ou por que desistiu da compra, e o agente responde na hora. É essa troca que transforma um aviso em uma solução.",
        "O problema sempre foi o custo. Ligar para toda a base exige gente, e gente ocupada com ligação repetitiva não está resolvendo o que realmente precisa de atenção. O agente de voz assume esse volume e devolve para a equipe apenas os casos que pedem decisão humana, já com o resumo da conversa.",
        "A ligação operacional também é a que mais depende de sistema. Uma cobrança só fecha se as condições vierem do financeiro; uma confirmação só resolve se escrever na agenda certa. Por isso o agente consulta e atualiza os seus sistemas durante a conversa, e não só no fim do dia.",
      ],
    },
    {
      kind: "checklist",
      title: "Regras que você define antes da primeira ligação.",
      lead: "A operação roda dentro dos limites que a sua empresa aprova.",
      items: [
        "Janela de horário e dias permitidos para cada tipo de ligação",
        "Número de tentativas por contato e intervalo entre elas",
        "Condições de negociação que o agente pode oferecer, e o que exige um humano",
        "Confirmação de identidade antes de falar de valores ou dados pessoais",
        "Lista de exclusão e respeito a pedidos de não contato",
        "Gravação, transcrição e trilha de auditoria de todas as ligações",
      ],
    },
    {
      kind: "steps",
      title: "Como a operação entra no ar.",
      steps: [
        { label: "Etapa 01", title: "Jornada e regras", text: "Escolhemos a ligação que mais pesa hoje e definimos o que o agente pode resolver sozinho." },
        { label: "Etapa 02", title: "Integração", text: "Conectamos o agente ao CRM, ao financeiro ou à agenda, para consultar e registrar durante a conversa." },
        { label: "Etapa 03", title: "Piloto", text: "Uma parte da base valida o roteiro, as objeções mais comuns e o momento certo de transferir." },
        { label: "Etapa 04", title: "Escala", text: "A base inteira entra na rotina, com acompanhamento das ligações e ajustes contínuos." },
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes sobre ligações operacionais.",
      items: [
        {
          q: "O que é uma ligação operacional?",
          a: "É a ligação de rotina para quem já é cliente: cobrança, lembrete, confirmação, onboarding, pesquisa ou aviso. Diferente da prospecção, o objetivo é resolver um assunto da relação que já existe.",
        },
        {
          q: "O agente consegue negociar uma dívida?",
          a: "Sim, dentro das condições que a sua empresa aprovar. Ele apresenta as opções, confirma o acordo, envia o link de pagamento e registra tudo no sistema. O que fugir das regras vai para um humano com o resumo da conversa.",
        },
        {
          q: "Dá para ligar para toda a base de uma vez?",
          a: "Sim. As ligações acontecem em paralelo, respeitando a janela de horário e o limite de tentativas que você definir, sem precisar aumentar a equipe para dar conta do volume.",
        },
        {
          q: "Como os resultados chegam para a minha equipe?",
          a: "Cada ligação gera transcrição, resumo e os campos que você escolher, gravados no seu CRM ou sistema. A equipe acompanha em tempo real e recebe só os casos que precisam de ação.",
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Ligações ativas", text: "Prospecção, qualificação de leads e confirmação de reuniões.", href: "/solucoes/ativo" },
        { title: "Atendimento receptivo", text: "Quem liga para a sua empresa é atendido na hora, 24 horas por dia.", href: "/solucoes/receptivo" },
        { title: "Integrações", text: "Como o agente se conecta ao CRM, ao financeiro e à agenda.", href: "/recursos/integracoes" },
      ],
    },
  ],
};
