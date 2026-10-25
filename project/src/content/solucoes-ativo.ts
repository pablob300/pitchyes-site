import type { PageContent } from "./types";

// Termos-alvo: "prospecção ativa com IA", "qualificação de leads por telefone",
// "discador com inteligência artificial", "confirmação de reunião automática".
export const solucoesAtivo: PageContent = {
  seoTitle: "Ligações ativas com IA de voz",
  seoDescription:
    "Prospecção, qualificação de leads, confirmação de reuniões e cobrança com agentes de voz que ligam em escala e entregam só o que está pronto para o time.",
  eyebrow: "Soluções",
  h1: "Ligações ativas que chegam antes do concorrente.",
  lead: "Lead que espera esfria. O agente da PitchYes liga minutos depois do cadastro, qualifica pelo seu critério e passa a conversa para o vendedor com o contexto pronto — em dezenas de ligações simultâneas.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "features",
      title: "Onde a ligação ativa muda o resultado.",
      lead: "O agente assume o volume repetitivo e devolve para a equipe o tempo que ela deveria gastar vendendo.",
      items: [
        { title: "Resposta imediata a leads", text: "Assim que o formulário é enviado, o agente liga, confirma interesse e agenda. Quem responde primeiro conversa com quem ainda está com o assunto na cabeça." },
        { title: "Qualificação por critério", text: "Perfil, orçamento, autoridade e prazo conferidos na conversa, com as respostas gravadas no CRM em campos estruturados." },
        { title: "Confirmação de reuniões", text: "Lembrete no dia anterior, confirmação na hora certa e reagendamento automático quando a pessoa não puder." },
        { title: "Reativação de base", text: "Retoma contatos parados há meses, identifica quem voltou a ter interesse e devolve a lista já filtrada." },
        { title: "Cobrança amigável", text: "Lembra vencimentos, oferece as condições aprovadas e envia link de pagamento, sem constranger o cliente." },
        { title: "Pesquisa e pós-venda", text: "Mede satisfação logo após a entrega, com respostas estruturadas para acompanhar a evolução mês a mês." },
      ],
    },
    {
      kind: "prose",
      title: "Escala sem aumentar a equipe.",
      paragraphs: [
        "Uma equipe de dez pessoas faz, em média, algumas centenas de tentativas por dia. Boa parte não é atendida, e o vendedor gasta a maior parte do tempo discando em vez de conversando.",
        "O agente de voz inverte essa conta: ele faz as tentativas, absorve as não atendidas e leva ao vendedor apenas as conversas que avançaram. A equipe passa o dia falando com quem tem interesse real, e o volume deixa de depender de quantas pessoas estão na operação.",
        "Tudo isso acontece dentro das suas regras: horários permitidos, número de tentativas por contato, script aprovado e registro de cada ligação para auditoria.",
      ],
    },
    {
      kind: "checklist",
      title: "Controles da operação ativa.",
      lead: "O que você define antes da primeira ligação sair.",
      items: [
        "Janela de horário e dias permitidos por campanha",
        "Limite de tentativas e intervalo entre elas por contato",
        "Script aprovado, com o que o agente pode e não pode oferecer",
        "Regras de transferência para humano e fila de destino",
        "Lista de exclusão e respeito a pedidos de não contato",
        "Registro, transcrição e avaliação de todas as ligações",
      ],
    },
    {
      kind: "steps",
      title: "Do primeiro teste à operação diária.",
      steps: [
        { label: "Etapa 01", title: "Base e critério", text: "Definimos a origem dos contatos, o critério de qualificação e o que vai para o CRM." },
        { label: "Etapa 02", title: "Roteiro e voz", text: "Construímos o roteiro com o time comercial e escolhemos a voz do agente." },
        { label: "Etapa 03", title: "Piloto", text: "Uma campanha pequena valida abordagem, objeções e taxa de transferência." },
        { label: "Etapa 04", title: "Escala", text: "Volume ampliado com acompanhamento diário e ajustes no roteiro." },
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes sobre ligações ativas.",
      items: [
        {
          q: "A pessoa percebe que está falando com uma IA?",
          a: "O agente se identifica quando perguntado e sempre que a operação exigir. A conversa é natural: ele lida com interrupção e mudança de assunto, mas não finge ser humano se for questionado.",
        },
        {
          q: "Como isso se relaciona com a LGPD?",
          a: "A base de contatos continua sendo sua e o tratamento segue a finalidade declarada. O agente respeita pedidos de não contato, registra o consentimento quando aplicável e mantém trilha de auditoria de cada ligação.",
        },
        {
          q: "Quantas ligações simultâneas são possíveis?",
          a: "Do primeiro teste a milhares de chamadas simultâneas, sem trocar de plataforma. O limite é combinado no plano e acompanha o crescimento da operação.",
        },
        {
          q: "O que acontece quando o lead quer falar com uma pessoa?",
          a: "O agente transfere na hora para a fila configurada e passa o resumo da conversa, para o vendedor não começar do zero. Fora do horário, ele agenda o retorno.",
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Atendimento receptivo", text: "O outro lado da operação: quem liga para você é atendido na hora.", href: "/solucoes/receptivo" },
        { title: "Planos", text: "Tarifa por minuto e planos, sem cobrança por funcionalidade.", href: "/planos" },
      ],
    },
  ],
};
