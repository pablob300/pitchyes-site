import type { PageContent } from "./types";

// TODO(produto): confirmar a lista de integrações nativas antes da publicação no domínio.
// O texto fala em conectar "por API" onde não há integração pronta confirmada.
export const integracoes: PageContent = {
  seoTitle: "Integrações de IA de voz com CRM e telefonia",
  seoDescription:
    "A PitchYes conecta com a telefonia, o CRM, a agenda e o WhatsApp que a sua empresa já usa — por integração nativa ou API, sem trocar de sistema.",
  eyebrow: "Recursos",
  h1: "Integrações da IA de voz: o agente trabalha dentro das suas ferramentas.",
  lead: "Uma ligação só resolve quando escreve no sistema certo: a agenda marcada, o lead atualizado, o chamado aberto. A PitchYes se conecta ao que já existe na sua empresa, em vez de pedir que você troque de ferramenta.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "features",
      title: "Categorias de integração.",
      lead: "Do tronco de telefonia ao sistema interno feito em casa.",
      items: [
        {
          title: "Telefonia",
          text: "Sua operadora atual, tronco SIP ou a telefonia integrada da PitchYes. Você mantém os números e a portabilidade.",
        },
        {
          title: "CRM",
          text: "Criação e atualização de registros, campos estruturados preenchidos na conversa e histórico da ligação anexado ao contato.",
        },
        {
          title: "Agenda",
          text: "Consulta de disponibilidade real, marcação, confirmação e remarcação direto no calendário da equipe.",
        },
        {
          title: "WhatsApp e mensageria",
          text: "Envio de confirmação, link de pagamento e documentos, com memória compartilhada entre a ligação e a conversa por texto.",
        },
        {
          title: "Helpdesk e chamados",
          text: "Abertura e consulta de tickets durante a ligação, com número de protocolo informado ao cliente na hora.",
        },
        {
          title: "Sistemas internos",
          text: "ERP, sistema de crédito, prontuário ou qualquer serviço com API: o agente consulta e escreve durante a conversa.",
        },
      ],
    },
    {
      kind: "prose",
      title: "Como a conexão é feita.",
      paragraphs: [
        "Na implantação, mapeamos quais dados o agente precisa ler e quais ele pode escrever. Cada ação vira uma chamada de API autorizada, com credenciais próprias e escopo restrito ao necessário.",
        "Quando o sistema não tem integração pronta, conectamos por API, webhook ou por uma camada intermediária — e os testes de cenário cobrem também os casos de falha: o que o agente faz se o sistema não responder.",
        "Nada disso exige mudar a ferramenta que a sua equipe usa hoje. O objetivo é que o registro da ligação apareça onde as pessoas já olham.",
      ],
    },
    {
      kind: "checklist",
      title: "O que o time técnico costuma perguntar.",
      items: [
        "Autenticação por credencial dedicada, com escopo mínimo",
        "Webhooks para eventos de início, fim e resultado da ligação",
        "Exportação de transcrição e gravação para o seu armazenamento",
        "Ambiente de testes separado do de produção",
        "Comportamento definido para indisponibilidade de sistema",
        "Trilha de auditoria de cada leitura e escrita feita pelo agente",
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes sobre integrações.",
      items: [
        {
          q: "Preciso trocar meu CRM ou sistema atual?",
          a: "Não. A PitchYes se conecta ao que você já usa, por integração nativa ou API. Você mantém CRM, agenda, helpdesk e telefonia.",
        },
        {
          q: "E se o meu sistema for interno, feito pela minha equipe?",
          a: "Funciona da mesma forma, desde que ele exponha uma API. Definimos junto com o seu time quais operações o agente pode executar e com quais limites.",
        },
        {
          q: "As gravações e transcrições podem ficar no meu ambiente?",
          a: "Sim. É possível exportar gravação e transcrição para o seu armazenamento, e contratos Enterprise permitem definir a residência dos dados.",
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Soluções", text: "O que o agente faz em cada tipo de ligação.", href: "/solucoes" },
        { title: "Novidades", text: "O que foi lançado recentemente na plataforma.", href: "/recursos/novidades" },
      ],
    },
  ],
};
