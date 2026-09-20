import type { PageContent } from "./types";

// TODO(RH): substituir por vagas reais quando houver processo aberto; hoje a página
// descreve como trabalhamos e recebe candidaturas espontâneas.
export const carreiras: PageContent = {
  seoTitle: "Carreiras",
  seoDescription:
    "Trabalhe com IA de voz aplicada a operações reais de vendas e atendimento. Veja como trabalhamos, o que procuramos e como enviar sua candidatura.",
  eyebrow: "Empresa",
  h1: "Construa a IA que atende milhões de ligações.",
  lead: "Trabalhar na PitchYes é lidar com produção desde o primeiro dia: agentes que falam com clientes reais, em operações que não podem parar. Quem entra aqui vê o efeito do próprio trabalho na mesma semana.",
  cta: { label: "Enviar candidatura", href: "/contato" },
  blocks: [
    {
      kind: "features",
      title: "Como trabalhamos.",
      items: [
        { title: "Perto do cliente", text: "Quem constrói acompanha as ligações reais da operação. A distância entre o código e o resultado é de horas." },
        { title: "Ciclos curtos", text: "Publicamos com frequência, medimos e ajustamos. Projeto de seis meses sem contato com o usuário não existe aqui." },
        { title: "Responsabilidade clara", text: "Cada frente tem dono. Autonomia para decidir vem junto com a responsabilidade pelo resultado." },
        { title: "Qualidade como requisito", text: "Segurança, testes e observabilidade não são etapa final: são parte de entregar qualquer coisa." },
      ],
    },
    {
      kind: "checklist",
      title: "O que procuramos em quem entra.",
      items: [
        "Vontade de entender o negócio do cliente, não só o problema técnico",
        "Clareza para escrever e explicar decisões",
        "Cuidado com dado sensível e com o que vai ao ar",
        "Capacidade de começar simples e melhorar com evidência",
        "Autonomia para levantar problema antes que ele vire incidente",
      ],
    },
    {
      kind: "prose",
      title: "Áreas com que trabalhamos.",
      paragraphs: [
        "Engenharia de software e de voz, implantação e sucesso do cliente, vendas e operações. Mesmo nas funções não técnicas, todo mundo convive com o produto: ouvir ligações faz parte da rotina.",
        "Não temos vagas abertas publicadas neste momento. Ainda assim, recebemos candidaturas espontâneas e olhamos todas — conte no que você quer trabalhar e o que já construiu.",
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Sobre a PitchYes", text: "Por que escolhemos voz e como conduzimos as implantações.", href: "/sobre" },
        { title: "Contato", text: "Envie sua candidatura ou fale com o time.", href: "/contato" },
      ],
    },
  ],
};
