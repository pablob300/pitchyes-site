import type { PageContent } from "./types";

// Termos-alvo: "ia de voz para clínicas", "atendimento automatizado seguros",
// "cobrança automatizada financeiro", "agente de voz imobiliária".
export const solucoesPorSetor: PageContent = {
  seoTitle: "IA de voz por setor: saúde, seguros e imóveis",
  seoDescription:
    "Como a IA de voz da PitchYes atende saúde, seguros, serviços financeiros, imobiliário, energia e tecnologia, respeitando as regras de cada setor.",
  eyebrow: "Soluções",
  h1: "IA de voz por setor: cada um tem uma ligação crítica. Começamos por ela.",
  lead: "A conversa que não pode dar errado muda conforme o negócio: uma confirmação de consulta, um aviso de sinistro, uma negociação de dívida. O agente é configurado para o vocabulário, as regras e os sistemas do seu setor.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "features",
      title: "Setores que atendemos.",
      lead: "Em todos eles, o agente conversa, consulta o sistema, executa a ação e registra a ligação para auditoria.",
      items: [
        {
          title: "Saúde",
          text: "Confirmação e remarcação de consultas, preparo de exames, triagem de pedidos e redução de faltas na agenda. Dados sensíveis tratados com os controles exigidos pelo setor.",
        },
        {
          title: "Seguros",
          text: "Cotação inicial, aviso de sinistro, atualização de status e renovação de apólice, com as declarações obrigatórias registradas na gravação.",
        },
        {
          title: "Serviços financeiros",
          text: "Cobrança e negociação dentro das condições aprovadas, confirmação de transações e atendimento de dúvidas, com confirmação de identidade antes de qualquer informação.",
        },
        {
          title: "Imobiliário",
          text: "Qualificação de interessados, agendamento de visitas, confirmação com o corretor e retomada de contatos antigos da carteira.",
        },
        {
          title: "Energia e utilities",
          text: "Segunda via, leitura, agendamento de visita técnica e comunicação de interrupções, absorvendo picos de volume sem fila.",
        },
        {
          title: "Tecnologia e serviços B2B",
          text: "Resposta imediata a leads, qualificação por critério e confirmação de reuniões para equipes comerciais com meta agressiva.",
        },
      ],
    },
    {
      kind: "prose",
      title: "O que muda de um setor para outro.",
      paragraphs: [
        "A tecnologia é a mesma; o que muda são três camadas. A primeira é o vocabulário: o agente precisa entender carência, franquia, coparticipação ou vistoria com a mesma naturalidade com que a sua equipe entende.",
        "A segunda é a regra. Em setores regulados existem declarações obrigatórias, limites do que pode ser oferecido por telefone e exigência de registro. Isso entra no roteiro e é verificado nos testes antes de qualquer ligação com cliente.",
        "A terceira é o sistema. Uma confirmação de consulta só resolve se escrever na agenda certa; uma negociação só fecha se as condições vierem do sistema de crédito. Por isso a integração faz parte da implantação, e não de um projeto futuro.",
      ],
    },
    {
      kind: "checklist",
      title: "Exigências de setores regulados que já atendemos.",
      items: [
        "Confirmação de identidade antes de divulgar qualquer dado",
        "Declarações obrigatórias registradas em gravação e transcrição",
        "Limite do que o agente pode oferecer, com escalonamento para humano",
        "Trilha de auditoria por ligação, com quem falou, o que foi dito e o que mudou",
        "Criptografia em repouso e em trânsito, com opções de residência de dados",
        "Operação em conformidade com a LGPD",
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Por função", text: "A mesma plataforma vista pela ótica de vendas, atendimento e cobrança.", href: "/solucoes/por-funcao" },
        { title: "Clientes", text: "Empresas que já automatizam ligações com a PitchYes.", href: "/clientes" },
      ],
    },
  ],
};
