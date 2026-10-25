import { company } from "@/lib/company";
import type { PageContent } from "./types";

// Texto oficial, copiado da política publicada em https://www.pitchyes.com.br/privacidade
// (última atualização declarada lá: janeiro de 2025). Não altere o conteúdo por conta própria:
// qualquer mudança precisa sair do jurídico e valer para os dois sites.
// TODO(jurídico): razão social completa e canal do encarregado (DPO) ainda não constam do texto.
export const privacidade: PageContent = {
  seoTitle: "Política de Privacidade",
  seoDescription:
    "Como a PitchYes coleta, usa, compartilha e protege dados pessoais no site e na plataforma de IA de voz, e como exercer os seus direitos na LGPD.",
  eyebrow: "Legal",
  h1: "Política de Privacidade",
  lead: "Última atualização: Janeiro de 2025",
  blocks: [
    {
      kind: "prose",
      title: "1. Informações Gerais",
      paragraphs: [
        `A PitchYes, pessoa jurídica de direito privado, com sede na ${company.address.full}, inscrita no CNPJ sob o nº 58.177.364/0001-21, leva a sua privacidade a sério e zela pela segurança e proteção de dados de todos os seus usuários.`,
        "Esta Política de Privacidade destina-se a informá-lo sobre como coletamos, usamos, comunicamos, divulgamos e fazemos uso de informações pessoais.",
      ],
    },
    {
      kind: "checklist",
      title: "2. Informações que Coletamos",
      lead: "Coletamos informações que você nos fornece diretamente, como:",
      items: [
        "Nome e informações de contato (e-mail, telefone)",
        "Informações da empresa (nome, setor, tamanho)",
        "Dados de uso da plataforma",
        "Informações de comunicação e feedback",
      ],
    },
    {
      kind: "checklist",
      title: "3. Como Usamos suas Informações",
      lead: "Utilizamos as informações coletadas para:",
      items: [
        "Fornecer e melhorar nossos serviços",
        "Comunicar sobre atualizações e novidades",
        "Oferecer suporte técnico",
        "Personalizar sua experiência",
        "Cumprir obrigações legais",
      ],
    },
    {
      kind: "checklist",
      title: "4. Compartilhamento de Informações",
      lead: "Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes situações:",
      items: [
        "Com seu consentimento explícito",
        "Para prestadores de serviços que nos auxiliam",
        "Quando exigido por lei ou autoridades competentes",
        "Para proteger nossos direitos legais",
      ],
    },
    {
      kind: "prose",
      title: "5. Segurança dos Dados",
      paragraphs: [
        "Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia SSL, controles de acesso rigorosos e monitoramento contínuo de nossa infraestrutura.",
      ],
    },
    {
      kind: "checklist",
      title: "6. Seus Direitos (LGPD)",
      lead: "De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:",
      items: [
        "Confirmação da existência de tratamento de dados",
        "Acesso aos seus dados pessoais",
        "Correção de dados incompletos, inexatos ou desatualizados",
        "Anonimização, bloqueio ou eliminação de dados",
        "Portabilidade dos dados",
        "Eliminação dos dados tratados com consentimento",
        "Revogação do consentimento",
      ],
    },
    {
      kind: "prose",
      title: "7. Retenção de Dados",
      paragraphs: [
        "Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, exceto quando a retenção por período mais longo for exigida ou permitida por lei.",
      ],
    },
    {
      kind: "prose",
      title: "8. Cookies e Tecnologias Similares",
      paragraphs: [
        "Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do site e personalizar conteúdo. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.",
      ],
    },
    {
      kind: "prose",
      title: "9. Alterações nesta Política",
      paragraphs: [
        "Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas por e-mail ou através de aviso em nosso site. A data da última atualização será sempre indicada no topo desta página.",
      ],
    },
    {
      kind: "prose",
      title: "10. Contato",
      paragraphs: [
        "Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade, entre em contato conosco:",
        "E-mail: privacidade@pitchyes.com.br",
        "Telefone: +55 (11) 5196-9381",
        `Endereço: ${company.address.full}`,
      ],
    },
    {
      kind: "links",
      title: "Documentos relacionados",
      items: [
        { title: "Termos de Uso", text: "Regras de uso do site e da plataforma.", href: "/termos" },
        { title: "Contato", text: "Canal para falar com o time da PitchYes.", href: "/contato" },
      ],
    },
  ],
};
