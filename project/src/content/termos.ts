import type { PageContent } from "./types";

// TODO(jurídico): RASCUNHO. Precisa de revisão jurídica antes da publicação no domínio
// definitivo — foro, razão social, condições comerciais e limitação de responsabilidade.
export const termos: PageContent = {
  seoTitle: "Termos de Uso",
  seoDescription:
    "Condições de uso do site e da plataforma de IA de voz da PitchYes: responsabilidades, uso aceitável, propriedade intelectual e suporte.",
  eyebrow: "Legal",
  h1: "Termos de Uso",
  lead: "Estes termos regem o uso do site da PitchYes e, de forma complementar ao contrato assinado, o uso da plataforma de IA de voz.",
  blocks: [
    {
      kind: "prose",
      paragraphs: [
        "Versão em revisão jurídica. Razão social, foro e condições comerciais completas serão publicados na versão final.",
      ],
    },
    {
      kind: "prose",
      title: "1. Aceite",
      paragraphs: [
        "Ao acessar o site ou utilizar a plataforma, você concorda com estes termos. Se você aceita em nome de uma empresa, declara ter poderes para isso.",
      ],
    },
    {
      kind: "prose",
      title: "2. Uso da plataforma",
      paragraphs: [
        "A plataforma é licenciada para uso conforme o plano contratado. O cliente é responsável pelas credenciais de acesso, pelo conteúdo dos roteiros configurados e pela base de contatos utilizada nas ligações.",
      ],
    },
    {
      kind: "checklist",
      title: "3. Uso aceitável",
      lead: "Não é permitido utilizar a plataforma para:",
      items: [
        "Ligações sem base legal adequada ou em desrespeito a pedidos de não contato",
        "Prática de fraude, engano quanto à identidade do contratante ou assédio",
        "Conteúdo ilegal, discriminatório ou que viole direitos de terceiros",
        "Tentativa de burlar limites técnicos, medidas de segurança ou auditoria",
        "Revenda do serviço sem autorização contratual",
      ],
    },
    {
      kind: "prose",
      title: "4. Responsabilidades",
      paragraphs: [
        "A PitchYes é responsável por disponibilizar a plataforma conforme o contrato e o nível de serviço acordado. O cliente é responsável pelo uso que faz do serviço, pelo cumprimento das regras do seu setor e pelas informações inseridas nos roteiros.",
      ],
    },
    {
      kind: "prose",
      title: "5. Propriedade intelectual",
      paragraphs: [
        "A plataforma, a marca e os materiais do site são de propriedade da PitchYes. O conteúdo inserido pelo cliente, assim como as gravações e transcrições das suas ligações, permanecem de propriedade do cliente.",
      ],
    },
    {
      kind: "prose",
      title: "6. Disponibilidade e suporte",
      paragraphs: [
        "Trabalhamos para manter a plataforma disponível conforme o SLA do plano. Manutenções programadas são comunicadas com antecedência. Os canais de suporte variam conforme o plano contratado.",
      ],
    },
    {
      kind: "prose",
      title: "7. Alterações",
      paragraphs: [
        "Estes termos podem ser atualizados. Mudanças relevantes serão comunicadas aos clientes ativos, e a data de atualização será indicada nesta página.",
      ],
    },
    {
      kind: "links",
      title: "Documentos relacionados",
      items: [
        { title: "Política de Privacidade", text: "Como tratamos dados pessoais.", href: "/privacidade" },
        { title: "Contato", text: "Dúvidas sobre estes termos.", href: "/contato" },
      ],
    },
  ],
};
