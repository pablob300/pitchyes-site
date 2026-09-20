import type { PageContent } from "./types";

// Termos-alvo: "substituir URA", "URA conversacional", "atendimento telefônico 24 horas",
// "central de atendimento com IA", "atendimento receptivo automatizado".
export const solucoesReceptivo: PageContent = {
  seoTitle: "Atendimento receptivo com IA de voz",
  seoDescription:
    "Troque a URA por conversa: o agente atende na primeira chamada, resolve o pedido ou direciona com contexto, 24 horas por dia e sem fila de espera.",
  eyebrow: "Soluções",
  h1: "Ninguém mais espera na fila para ser atendido.",
  lead: "O agente da PitchYes atende toda chamada no primeiro toque, entende o pedido em linguagem natural, consulta seus sistemas e resolve — ou transfere para a pessoa certa com o histórico pronto.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "features",
      title: "O que o receptivo resolve sozinho.",
      lead: "Os pedidos que enchem a fila são também os mais previsíveis. São eles que saem do caminho da sua equipe.",
      items: [
        { title: "Triagem e direcionamento", text: "Identifica o cliente, entende o motivo da ligação e leva direto à área certa, sem menu de teclado." },
        { title: "Agendamento e remarcação", text: "Marca, confirma e remarca compromissos na agenda da equipe, com confirmação por mensagem." },
        { title: "Status e segunda via", text: "Consulta pedido, contrato ou fatura no seu sistema e envia o documento por WhatsApp ou e-mail." },
        { title: "Dúvidas recorrentes", text: "Responde com base na sua documentação, sempre com a informação oficial, sem inventar resposta." },
        { title: "Abertura de chamado", text: "Registra a ocorrência com os dados obrigatórios e informa o prazo no mesmo atendimento." },
        { title: "Picos e fora do horário", text: "Absorve noites, fins de semana e picos sazonais sem contratar temporários." },
      ],
    },
    {
      kind: "prose",
      title: "Por que a URA irrita e a conversa resolve.",
      paragraphs: [
        "A URA obriga a pessoa a traduzir o problema dela para o seu organograma: aperte 1 para financeiro, 2 para suporte. Quando ela erra a opção, recomeça. Quando acerta, entra numa fila para repetir tudo de novo para o atendente.",
        "Com a PitchYes, a pergunta é simples: o que você precisa? A pessoa responde do jeito dela, o agente entende a intenção, confirma a identidade e executa. Se precisar de um humano, a transferência vai com o resumo da conversa e os dados já coletados.",
        "O resultado aparece em três números que a operação acompanha de perto: tempo até o primeiro atendimento, percentual de chamadas resolvidas sem transferência e abandono na fila.",
      ],
    },
    {
      kind: "stats",
      title: "O que muda na operação.",
      lead: "Indicadores que acompanhamos junto com a sua equipe desde a primeira semana.",
      items: [
        { value: "24/7", label: "Cobertura de atendimento, incluindo feriados e madrugada" },
        { value: "0", label: "Tempo de fila: toda chamada é atendida no primeiro toque" },
        { value: "100%", label: "Das ligações transcritas, avaliadas e pesquisáveis" },
        { value: "400ms", label: "Latência média de resposta na conversa" },
      ],
    },
    {
      kind: "checklist",
      title: "Requisitos que a operação receptiva costuma exigir.",
      items: [
        "Manter o número atual e a operadora, com encaminhamento para o agente",
        "Transferência para humano com contexto, dentro e fora do horário comercial",
        "Consulta a sistemas internos durante a ligação, por API",
        "Confirmação de identidade antes de dar qualquer informação sensível",
        "Registro em trilha de auditoria, com gravação e transcrição",
        "Fallback para fila humana em caso de indisponibilidade de sistema",
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes sobre atendimento receptivo.",
      items: [
        {
          q: "A PitchYes pode substituir minha central de atendimento?",
          a: "Pode. A plataforma foi projetada para atender 100% das ligações, com milhares de chamadas simultâneas. A maioria dos clientes chega lá aos poucos: começa por um tipo de chamada, mede o resultado e amplia a cobertura.",
        },
        {
          q: "Qual a diferença entre a PitchYes e uma URA?",
          a: "A URA obriga quem liga a navegar por menus no teclado. A PitchYes substitui isso por conversa: a pessoa diz o que precisa, e o agente entende, age e resolve em linguagem natural.",
        },
        {
          q: "Preciso trocar meu número de telefone?",
          a: "Não. Você mantém o número e a operadora atuais. Basta encaminhar as chamadas para o agente, e a transferência para a sua equipe continua funcionando como hoje.",
        },
        {
          q: "E quando o cliente prefere falar com uma pessoa?",
          a: "O agente transfere imediatamente e envia o resumo do atendimento. Fora do horário, ele registra o pedido e agenda o retorno, em vez de deixar a pessoa sem resposta.",
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Ligações ativas", text: "Prospecção, qualificação e confirmação de reuniões em escala.", href: "/solucoes/ativo" },
        { title: "Integrações", text: "Telefonia, CRM, agenda e WhatsApp conectados ao agente.", href: "/recursos/integracoes" },
      ],
    },
  ],
};
