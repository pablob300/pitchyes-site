import type { PageContent } from "./types";

// TODO(conteúdo): cada case precisa de números autorizados pelo cliente antes de publicar.
// Hoje só o depoimento da OPEN Datacenter está confirmado; os demais estão marcados.
export const clientesCases: PageContent = {
  seoTitle: "Cases de IA de voz: resultados de clientes",
  seoDescription:
    "Casos reais de operações que automatizaram ligações com IA de voz: o contexto, o que foi automatizado e o que mudou no indicador acompanhado.",
  eyebrow: "Clientes",
  h1: "Cases de IA de voz: o que aconteceu depois que a IA assumiu o telefone.",
  lead: "Cada case segue a mesma estrutura: o problema da operação, a ligação que foi automatizada, como foi a implantação e o indicador acompanhado antes e depois.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    {
      // Cases empilhados: para acrescentar um, adicione um item (pelo painel ou aqui).
      kind: "caseStories",
      items: [
        {
          eyebrow: "Case em destaque",
          title: "OPEN Datacenter: o trabalho de horas de 40 vendedores, em minutos.",
          videoId: "prSFv3IPWu8",
          alt: "Vídeo do case OPEN Datacenter, no canal da PitchYes no YouTube",
          paragraphs: [
            "A OPEN Datacenter tinha uma equipe comercial de mais de 40 vendedores e um gargalo conhecido: o tempo gasto em tentativas de contato que não viravam conversa. O volume dependia de quantas pessoas estavam discando.",
            "A PitchYes assumiu a primeira camada dessas ligações. O agente faz as tentativas, conversa com quem atende e entrega ao vendedor apenas as conversas que avançaram, com o contexto registrado.",
            "Nas palavras do CEO, Leandro Vasconcelos: “Equipe de mais de 40 vendedores. A IA da PitchYes fez o que levava horas, em minutos.”",
          ],
        },
      ],
    },
    {
      kind: "steps",
      title: "Como conduzimos uma implantação.",
      lead: "O mesmo roteiro em todos os cases desta página.",
      steps: [
        { label: "Semana 01", title: "Diagnóstico", text: "Qual ligação repete todo dia, quanto tempo consome e qual indicador vai medir o resultado." },
        { label: "Semana 01", title: "Construção", text: "Roteiro, voz, integrações e regras de transferência configurados no ambiente do cliente." },
        { label: "Semana 01", title: "Piloto", text: "Volume reduzido, ligações acompanhadas uma a uma, ajustes diários no roteiro." },
        { label: "Contínuo", title: "Escala", text: "Ampliação de horário, novos tipos de chamada e novos sistemas conectados." },
      ],
    },
    {
      kind: "cases",
      title: "Outras operações no ar.",
      lead: "Os números de cada uma serão publicados aqui conforme a autorização dos clientes.",
      items: [
        { company: "Plaza", sector: "Serviços", headline: "Qualificação de leads antes do time comercial entrar.", pending: true },
        { company: "Employability", sector: "Educação", headline: "Atendimento e triagem de candidatos em escala.", pending: true },
        { company: "Alves Pacheco", sector: "Serviços", headline: "Confirmação de compromissos e retomada de contatos.", pending: true },
        { company: "Sofia Energia", sector: "Energia", headline: "Receptivo e agendamento de visitas técnicas.", pending: true },
        { company: "MaxNet", sector: "Telecom", headline: "Suporte de primeiro nível e segunda via.", pending: true },
        { company: "Prospecta Global", sector: "Serviços B2B", headline: "Prospecção ativa com qualificação por critério.", pending: true },
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes sobre os cases.",
      items: [
        {
          q: "Posso conversar com um cliente antes de decidir?",
          a: "Sim. Quando faz sentido para os dois lados, apresentamos um cliente do seu setor que já passou pela implantação, para você ouvir a experiência sem intermediário.",
        },
        {
          q: "Em quanto tempo aparece resultado?",
          a: "O piloto costuma durar uma semana e já permite comparar com o período anterior. O que muda mais rápido é o tempo de resposta e o volume de tentativas; indicadores de conversão levam alguns ciclos comerciais.",
        },
        {
          q: "Vocês publicam os números de todos os clientes?",
          a: "Só com autorização. Os cases desta página que ainda não têm números publicados estão em produção, aguardando a liberação do cliente.",
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Clientes", text: "A lista de empresas que usam a PitchYes.", href: "/clientes" },
        { title: "Planos", text: "Quanto custa colocar uma operação no ar.", href: "/planos" },
      ],
    },
  ],
};
