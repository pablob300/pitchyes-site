import type { PageContent } from "./types";

// Termos-alvo: "automatizar prospecção", "reduzir custo de call center",
// "agente de voz para cobrança", "agendamento automático por telefone".
export const solucoesPorFuncao: PageContent = {
  seoTitle: "IA de voz para vendas, cobrança e atendimento",
  seoDescription:
    "Vendas, atendimento, cobrança, agendamento e operações: veja o que muda em cada área quando as ligações repetitivas passam a ser feitas por IA de voz.",
  eyebrow: "Soluções",
  h1: "IA de voz por função: cada área ganha de volta o tempo do telefone.",
  lead: "A ligação repetitiva é a mesma em quase toda empresa: confirmar, cobrar, agendar, avisar. Quando o agente assume esse volume, cada área passa a usar as pessoas no que exige julgamento.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "features",
      title: "Funções que a PitchYes atende.",
      items: [
        {
          title: "Vendas",
          text: "Resposta imediata ao lead, qualificação por critério e confirmação de reuniões. O vendedor entra quando a conversa já avançou.",
        },
        {
          title: "Atendimento ao cliente",
          text: "Triagem sem URA, resolução de pedidos recorrentes e transferência com contexto. Menos fila, menos repetição.",
        },
        {
          title: "Cobrança",
          text: "Lembretes, negociação dentro das condições aprovadas e envio de link de pagamento, com registro de cada tentativa.",
        },
        {
          title: "Agendamento",
          text: "Marcação, confirmação e remarcação na agenda real da equipe, com lembrete por mensagem e menos faltas.",
        },
        {
          title: "Operações e logística",
          text: "Confirmação de entrega, aviso de atraso e coleta de informação em campo, sem ocupar o time de rota.",
        },
        {
          title: "Recursos humanos",
          text: "Triagem inicial de candidatos, confirmação de entrevistas e pesquisa de clima, com respostas estruturadas.",
        },
      ],
    },
    {
      kind: "prose",
      title: "A conta que cada gestor faz.",
      paragraphs: [
        "Em vendas, a métrica é o tempo até o primeiro contato e quantas reuniões acontecem de fato. Em atendimento, é o tempo de espera e quanto se resolve sem transferir. Em cobrança, é a taxa de contato efetivo e a promessa de pagamento cumprida.",
        "O agente de voz age exatamente nesses números, porque ele executa a parte previsível da operação: ligar rápido, ligar sempre, ligar de novo no horário certo, registrar tudo. O ganho não vem de substituir o julgamento humano, e sim de liberar as pessoas das tentativas que não exigem julgamento nenhum.",
        "Por isso a implantação começa por um tipo de ligação, com um indicador combinado. Se o número se move, amplia-se a cobertura.",
      ],
    },
    {
      kind: "steps",
      title: "Como escolher por onde começar.",
      steps: [
        { label: "Passo 01", title: "Liste as ligações", text: "Quais chamadas a equipe repete todo dia, com o mesmo roteiro." },
        { label: "Passo 02", title: "Meça o custo", text: "Quanto tempo elas consomem e o que deixa de ser feito por causa delas." },
        { label: "Passo 03", title: "Escolha o indicador", text: "Um número claro: tempo de resposta, contato efetivo, faltas na agenda." },
        { label: "Passo 04", title: "Rode o piloto", text: "Uma frente, sete dias, resultado comparado com o período anterior." },
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes por função.",
      items: [
        {
          q: "A IA substitui humanos ou trabalha junto com eles?",
          a: "A PitchYes foi projetada para atender 100% das ligações, mas a maioria dos clientes chega lá aos poucos. Nesse caminho, a IA assume o volume repetitivo e libera as pessoas para as conversas que mais precisam delas.",
        },
        {
          q: "Como medir o retorno?",
          a: "Combinamos um indicador antes do piloto — tempo de resposta ao lead, contato efetivo na cobrança, faltas na agenda — e comparamos com o mesmo período anterior. Todas as ligações ficam transcritas e avaliadas, então a análise é sobre dados, não sobre impressão.",
        },
        {
          q: "Minha equipe precisa aprender a programar?",
          a: "Não. O agente é descrito em linguagem natural: você explica o que ele deve fazer e as regras a seguir. Nenhuma experiência em IA de voz é necessária.",
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Por setor", text: "Saúde, seguros, financeiro, imobiliário, energia e tecnologia.", href: "/solucoes/por-setor" },
        { title: "Planos", text: "Uma tarifa por minuto, com tudo incluído.", href: "/planos" },
      ],
    },
  ],
};
