import type { PageContent } from "./types";
import { clients } from "./clients";

// TODO(conteúdo): métricas e citações por cliente precisam ser fornecidas e autorizadas.
// Só o depoimento do Leandro Vasconcelos (OPEN Datacenter) está confirmado (wireframe).
export const clientes: PageContent = {
  seoTitle: "Clientes",
  seoDescription:
    "Empresas de energia, tecnologia, serviços e educação que automatizam ligações com a PitchYes — e o que mudou na operação de cada uma.",
  eyebrow: "Clientes",
  h1: "Empresas que já colocaram a IA de voz da PitchYes para conversar.",
  lead: "Empresas de energia, tecnologia, serviços, educação, varejo e outros setores já usam a IA de voz da PitchYes para atender, qualificar, acompanhar e transformar ligações em oportunidades.",
  // Desce até a parede de logos, nesta mesma página.
  cta: { label: "Conheça quem já usa a PitchYes", href: "#clientes" },
  blocks: [
    { kind: "logos", id: "clientes", title: "Empresas que confiam na PitchYes.", items: clients },
    {
      kind: "cases",
      title: "O que mudou na operação.",
      lead: "Cada empresa começou por um tipo de ligação e ampliou a partir do resultado.",
      items: [
        {
          company: "OPEN Datacenter",
          sector: "Tecnologia",
          headline: "De horas para minutos no volume de ligações.",
          quote: "Equipe de mais de 40 vendedores. A IA da PitchYes fez o que levava horas, em minutos.",
          person: "Leandro Vasconcelos, CEO",
        },
        { company: "Plaza", sector: "Serviços", headline: "Qualificação de leads antes do time comercial entrar.", pending: true },
        { company: "Employability", sector: "Educação", headline: "Atendimento e triagem de candidatos em escala.", pending: true },
        { company: "Alves Pacheco", sector: "Serviços", headline: "Confirmação de compromissos e retorno a contatos parados.", pending: true },
        { company: "Sofia Energia", sector: "Energia", headline: "Atendimento receptivo e agendamento de visitas técnicas.", pending: true },
        { company: "Senior Sistemas", sector: "Tecnologia", headline: "Suporte de primeiro nível e direcionamento por contexto.", pending: true },
      ],
    },
    {
      kind: "prose",
      title: "O que essas operações têm em comum.",
      paragraphs: [
        "Todas começaram pequeno: uma ligação, um indicador e uma semana de piloto. Sem trocar CRM. Sem mudar a telefonia. Sem virar a operação de cabeça para baixo.",
        "Quando o resultado aparece, a expansão acontece naturalmente: mais horários, novos tipos de conversa e mais integrações. O agente cresce junto com a operação, sem exigir uma nova plataforma. E se quiser ouvir quem já passou por isso, podemos conectar você a um cliente do seu setor.",
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Cases", text: "Os casos em detalhe: contexto, o que foi automatizado e o resultado.", href: "/clientes/cases" },
        { title: "Soluções por setor", text: "Como a operação é configurada em cada segmento.", href: "/solucoes/por-setor" },
      ],
    },
  ],
};
