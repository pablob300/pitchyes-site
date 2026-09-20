import type { PageContent } from "./types";

// Hub de Soluções. Termos-alvo: "ia de voz para empresas", "agente de voz",
// "automatizar ligações", "call center com inteligência artificial".
export const solucoes: PageContent = {
  seoTitle: "Soluções de IA de voz",
  seoDescription:
    "Agentes de voz que fazem e recebem ligações em escala: prospecção, atendimento, agendamento e cobrança, integrados à sua telefonia e ao seu CRM.",
  eyebrow: "Soluções",
  h1: "Agentes de voz que resolvem a ligação inteira.",
  lead: "A PitchYes automatiza as ligações que hoje exigem uma pessoa: o agente entende o que foi dito, consulta seus sistemas, executa a ação e registra tudo. Ativo e receptivo, na mesma plataforma.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "features",
      eyebrow: "Por tipo de ligação",
      title: "Duas frentes, um mesmo agente.",
      lead: "O mesmo agente conversa, transfere para um humano quando necessário e devolve o contexto completo para a sua equipe.",
      columns: 2,
      items: [
        {
          title: "Ligações ativas",
          text: "Prospecção, qualificação de leads, confirmação de reuniões, recuperação de carrinho e cobrança amigável, com discagem em escala e horário controlado.",
          href: "/solucoes/ativo",
        },
        {
          title: "Atendimento receptivo",
          text: "Substituição de URA, triagem, agendamento, segunda via e suporte de primeiro nível, 24 horas por dia, sem fila e sem menu de teclado.",
          href: "/solucoes/receptivo",
        },
      ],
    },
    {
      kind: "features",
      eyebrow: "Casos de uso",
      title: "O que o agente faz numa ligação real.",
      lead: "Cada caso abaixo é uma conversa completa: identificação, consulta em sistema, decisão e registro.",
      items: [
        { title: "Qualificação de leads", text: "Liga em minutos após o cadastro, confirma perfil, orçamento e urgência, e transfere só o que está pronto para o vendedor." },
        { title: "Agendamento e confirmação", text: "Marca, confirma e reagenda compromissos direto na agenda da equipe, com lembrete por WhatsApp e redução de faltas." },
        { title: "Substituição de URA", text: "Troca o menu de teclado por conversa: a pessoa diz o que precisa e o agente resolve ou direciona na hora." },
        { title: "Suporte de primeiro nível", text: "Responde dúvidas recorrentes com base na sua documentação, abre chamado e transfere casos complexos com o histórico." },
        { title: "Cobrança e negociação", text: "Lembra vencimentos, apresenta condições aprovadas e envia o link de pagamento, sempre dentro do script autorizado." },
        { title: "Pesquisa e pós-venda", text: "Coleta avaliação, mede satisfação e devolve os dados estruturados para o seu CRM, sem planilha no meio do caminho." },
      ],
    },
    {
      kind: "steps",
      title: "Como uma operação entra no ar.",
      lead: "Do primeiro diagnóstico ao acompanhamento diário, com a sua equipe junto em cada etapa.",
      steps: [
        { label: "Dia 01", title: "Descoberta", text: "Mapeamos o processo atual, os sistemas envolvidos e as regras que o agente precisa seguir." },
        { label: "Dia 03", title: "Construção", text: "Roteiro, voz, integrações e regras de transferência configurados no seu ambiente." },
        { label: "Dia 05", title: "Testes", text: "Cenários reais e casos de borda validados antes de qualquer ligação com cliente." },
        { label: "Dia 07", title: "Produção", text: "Operação no ar, com acompanhamento das ligações e ajustes finos na primeira semana." },
      ],
    },
    {
      kind: "links",
      title: "Escolha pelo seu contexto.",
      lead: "As mesmas capacidades, organizadas do jeito que a sua empresa pensa.",
      items: [
        { title: "Por setor", text: "Saúde, seguros, serviços financeiros, imobiliário, energia e tecnologia.", href: "/solucoes/por-setor" },
        { title: "Por função", text: "Vendas, atendimento, cobrança, agendamento e operações.", href: "/solucoes/por-funcao" },
      ],
    },
    {
      kind: "checklist",
      title: "O que vem junto, sem custo extra de integração.",
      items: [
        "Conexão com a sua telefonia atual ou tronco SIP, sem trocar de operadora",
        "Integração com CRM, agenda e sistemas internos por API",
        "Transcrição, gravação e avaliação de todas as ligações",
        "Transferência para humano com o contexto da conversa",
        "Memória entre canais: voz, WhatsApp, SMS e chat do site",
        "Ambiente de testes com cenários reais antes de ir ao ar",
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes sobre as soluções.",
      items: [
        {
          q: "A IA consegue lidar com uma conversa que foge do roteiro?",
          a: "Sim. O agente lida com interrupção, sotaque, ruído e mudança de assunto, e volta ao objetivo da ligação. Quando o pedido sai do que foi autorizado, ele transfere para uma pessoa com o histórico da conversa, em vez de improvisar.",
        },
        {
          q: "Quanto tempo leva para colocar a primeira operação no ar?",
          a: "A maioria dos agentes entra em produção em cerca de sete dias, seguindo as etapas de descoberta, construção e testes. Fluxos com muitas integrações ou regras de compliance podem levar de duas a seis semanas.",
        },
        {
          q: "Preciso trocar minha telefonia ou meu CRM?",
          a: "Não. A PitchYes se conecta ao que você já usa: sua operadora ou tronco SIP, CRM, agenda e sistemas internos. Se preferir, também oferecemos a telefonia integrada.",
        },
        {
          q: "Como a IA se comporta em ligações reguladas?",
          a: "O agente segue o roteiro aprovado, faz as declarações obrigatórias quando configuradas e registra tudo em trilha de auditoria. A plataforma opera em conformidade com a LGPD e mantém certificações de segurança.",
        },
      ],
    },
  ],
};
