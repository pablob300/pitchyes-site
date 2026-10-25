import { company } from "@/lib/company";
import type { PageContent } from "./types";

// Posicionamento institucional: empresa de tecnologia de voz conversacional para contato,
// vendas, suporte e atendimento. A linha "Fale com todos. Converse com cada um." é a
// própria assinatura da PitchYes (pitchyes.com.br).
// TODO(empresa): ano de fundação, tamanho do time e nomes da liderança para a seção final.
export const sobre: PageContent = {
  seoTitle: "Sobre a PitchYes",
  seoDescription:
    "Empresa brasileira de tecnologia que desenvolve voz conversacional com IA para contato, vendas, suporte e atendimento. Conheça o que fazemos e como trabalhamos.",
  eyebrow: "Empresa",
  h1: "Fale com todos. Converse com cada um.",
  lead: "A PitchYes é uma empresa brasileira de tecnologia que desenvolve voz conversacional com inteligência artificial para contato, vendas, suporte e atendimento. Colocamos no telefone um agente que entende, decide e resolve — no volume de um discador e no cuidado de um bom atendente.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      kind: "prose",
      title: "Toda empresa tem uma fila de conversas que não acontecem.",
      paragraphs: [
        "O lead que chegou às 22h e foi respondido dois dias depois. A consulta que ninguém confirmou. A fatura que venceu sem um telefonema. O cliente que desistiu no terceiro toque da espera. Não é falta de processo: é falta de gente disponível no momento em que a conversa ainda valia alguma coisa.",
        "Foi para essa fila que a PitchYes foi construída. Nossa plataforma cria agentes de voz que fazem e recebem ligações em linguagem natural, conversam ao mesmo tempo com centenas de pessoas e tratam cada uma como se fosse a única. É o que a nossa assinatura quer dizer: falar com todos, sem deixar de conversar com cada um.",
        "Não entregamos um robô que lê um roteiro. Entregamos uma conversa que termina resolvida — com o sistema consultado, a ação executada e o registro no lugar onde a sua equipe já trabalha.",
      ],
    },
    {
      kind: "features",
      eyebrow: "O que fazemos",
      title: "Quatro frentes, a mesma tecnologia.",
      lead: "Um único agente aprende a operação da sua empresa e atua no ponto em que o telefone decide o resultado.",
      columns: 2,
      items: [
        {
          title: "Contato",
          text: "Primeiro toque em minutos, não em dias. O agente liga assim que o lead chega, confirma dados, qualifica e devolve para o time só o que merece atenção humana.",
          href: "/solucoes/ativo",
        },
        {
          title: "Vendas",
          text: "Prospecção, reativação de base, confirmação de reuniões e follow-up que ninguém tem tempo de fazer. A cadência não depende de humor, agenda ou sexta-feira à tarde.",
          href: "/solucoes",
        },
        {
          title: "Suporte",
          text: "Dúvidas recorrentes resolvidas na hora, com consulta aos sistemas durante a ligação. O que precisa de gente chega ao humano já com contexto, sem obrigar o cliente a repetir a história.",
          href: "/solucoes/receptivo",
        },
        {
          title: "Atendimento",
          text: "Ninguém na espera, 24 horas por dia, em português de gente. Agendamento, confirmação, triagem e direcionamento com a naturalidade de uma recepção bem treinada.",
          href: "/solucoes/por-funcao",
        },
      ],
    },
    {
      kind: "stats",
      title: "O que isso tem produzido.",
      lead: "Números divulgados pela PitchYes a partir da sua carteira de clientes.",
      items: [
        { value: "400+", label: "Empresas atendidas" },
        { value: "94%", label: "Taxa de sucesso" },
        { value: "3x", label: "Mais leads qualificados" },
      ],
    },
    {
      kind: "prose",
      title: "Por que voz, e não mais um chat.",
      paragraphs: [
        "O telefone continua sendo o canal onde as decisões acontecem: a consulta é confirmada, a dívida é negociada, a venda avança. É também o canal mais caro de operar e o primeiro a quebrar quando o volume cresce — por isso tanta empresa o empurrou para o menu de teclas.",
        "A automação tradicional resolveu o custo e destruiu a experiência: quem liga precisa aprender a falar do jeito da máquina. A voz conversacional inverte isso. A pessoa fala do jeito dela, se corrige no meio da frase, muda de assunto — e o agente acompanha.",
        "Trabalhamos com um princípio simples: um agente só é útil se resolver a ligação inteira. Entender o pedido, consultar o sistema, executar a ação, registrar o que aconteceu e, quando for o caso, passar para um humano com todo o contexto. Meio caminho é pior do que não automatizar.",
      ],
    },
    {
      kind: "steps",
      title: "Como uma operação entra no ar.",
      lead: "Nenhum projeto começa grande aqui. Começa medido.",
      steps: [
        {
          label: "Semana 1",
          title: "Diagnóstico",
          text: "Escolhemos uma frente de ligação com dor clara e um indicador que a empresa já acompanha.",
        },
        {
          label: "Semana 1",
          title: "Desenho do agente",
          text: "Roteiro, tom de voz, regras de negócio, transferências e integração com telefonia, CRM e agenda.",
        },
        {
          label: "Semana 2",
          title: "Piloto",
          text: "O agente atende um volume controlado. Cada ligação é transcrita, avaliada e ajustada.",
        },
        {
          label: "Depois",
          title: "Escala",
          text: "A ampliação vem do resultado do piloto: novas frentes, novos volumes, mesma régua de medição.",
        },
      ],
    },
    {
      kind: "checklist",
      title: "No que não abrimos mão.",
      lead: "Os compromissos que assumimos com quem coloca a marca na voz do agente:",
      items: [
        "Segurança e conformidade tratadas como requisito, não como item de roadmap",
        "Dados do cliente que continuam sendo do cliente, com tratamento conforme a LGPD",
        "Transferência para humano sempre disponível, com o contexto da conversa junto",
        "Nenhum agente no ar sem testes de cenário aprovados, inclusive os casos de falha",
        "Toda ligação transcrita e auditável por quem opera",
        "Discurso comercial alinhado ao que o produto realmente faz",
      ],
    },
    {
      kind: "faq",
      title: "Perguntas que sempre aparecem.",
      items: [
        {
          q: "O que é a PitchYes?",
          a: "Uma empresa brasileira de tecnologia que desenvolve agentes de voz com inteligência artificial. Eles fazem e recebem ligações em linguagem natural para contato, vendas, suporte e atendimento, integrados à telefonia, ao CRM e à agenda que a empresa já usa.",
        },
        {
          q: "A pessoa do outro lado percebe que está falando com uma IA?",
          a: "A conversa é natural: interrupção, correção e mudança de assunto são tratadas como em uma ligação humana. Ainda assim, defendemos a identificação do agente como inteligência artificial — é o que sustenta a confiança no longo prazo e o caminho que a regulação vem tomando.",
        },
        {
          q: "Que tipo de empresa usa a PitchYes?",
          a: "Operações que dependem do telefone todos os dias: saúde, seguros, serviços financeiros, educação, imobiliário e varejo, tanto em times comerciais quanto em centrais de atendimento e cobrança.",
        },
        {
          q: "Onde fica a PitchYes?",
          a: `A sede fica em Goiânia (GO), na ${company.address.full}, e o atendimento é feito para todo o Brasil.`,
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Soluções", text: "O que o agente resolve em ligações ativas e receptivas.", href: "/solucoes" },
        { title: "Clientes", text: "Empresas que já colocaram a operação de voz no ar.", href: "/clientes" },
        { title: "Carreiras", text: "Como trabalhamos e o que procuramos em quem entra.", href: "/carreiras" },
        { title: "Contato", text: "Agende uma demonstração com o time.", href: "/contato" },
      ],
    },
  ],
};
