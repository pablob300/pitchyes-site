import type { PageContent } from "./types";
import { clients } from "./clients";

// TODO(conteúdo): métricas e citações por cliente precisam ser fornecidas e autorizadas.
// Só o depoimento do Leandro Vasconcelos (OPEN Datacenter) está confirmado (wireframe).
export const clientes: PageContent = {
  seoTitle: "Clientes",
  seoDescription:
    "Empresas de energia, tecnologia, serviços e educação que automatizam ligações com a PitchYes — e o que mudou na operação de cada uma.",
  eyebrow: "Clientes",
  h1: "Empresas que colocaram a IA no telefone.",
  lead: "São operações de energia, tecnologia, serviços e educação que usam a PitchYes para atender, qualificar e acompanhar ligações todos os dias. Aqui estão elas e o tipo de conversa que a IA assumiu.",
  cta: { label: "Fale com nossa IA", href: "/#fale-com-a-ia" },
  blocks: [
    { kind: "logos", title: "Empresas que confiam na PitchYes.", items: clients },
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
        "Todas começaram pequeno: um tipo de ligação, um indicador, uma semana de piloto. Nenhuma trocou de CRM ou de telefonia para isso.",
        "Depois do piloto, o caminho costuma ser o mesmo: ampliar o horário de cobertura, incluir um segundo tipo de chamada e conectar mais um sistema. O agente cresce junto com a operação, sem mudança de plataforma.",
        "Se você quiser conversar com alguém que já passou por essa implantação, podemos apresentar um cliente do seu setor.",
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
