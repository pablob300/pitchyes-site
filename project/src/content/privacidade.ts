import type { PageContent } from "./types";

// TODO(jurídico): RASCUNHO. Precisa de revisão jurídica antes da publicação no domínio
// definitivo — inclusive razão social, CNPJ, endereço, canal do encarregado (DPO) e prazos.
export const privacidade: PageContent = {
  seoTitle: "Política de Privacidade",
  seoDescription:
    "Como a PitchYes coleta, usa, compartilha e protege dados pessoais no site e na plataforma de IA de voz, e como exercer os seus direitos na LGPD.",
  eyebrow: "Legal",
  h1: "Política de Privacidade",
  lead: "Esta política explica como a PitchYes trata dados pessoais no site e na plataforma de IA de voz, e como você exerce os direitos previstos na Lei Geral de Proteção de Dados (LGPD).",
  blocks: [
    {
      kind: "prose",
      paragraphs: [
        "Versão em revisão jurídica. Os dados de identificação da empresa e o canal do encarregado serão publicados na versão final.",
      ],
    },
    {
      kind: "prose",
      title: "1. Quem trata os seus dados",
      paragraphs: [
        "A PitchYes atua de duas formas. No site, somos controladores dos dados de quem navega e entra em contato. Na plataforma, atuamos como operadores: tratamos os dados das ligações em nome do cliente contratante, que define a finalidade do tratamento.",
      ],
    },
    {
      kind: "prose",
      title: "2. Dados que coletamos",
      paragraphs: [
        "No site: dados de contato que você informa (nome, e-mail, telefone, empresa) e dados técnicos de navegação necessários para segurança e funcionamento.",
        "Na plataforma: gravações e transcrições das ligações, identificadores do contato, resultados do atendimento e registros técnicos da chamada. O escopo exato é definido no contrato com cada cliente.",
      ],
    },
    {
      kind: "prose",
      title: "3. Para que usamos",
      paragraphs: [
        "Responder a solicitações de contato, prestar e operar o serviço contratado, garantir segurança e prevenir fraude, cumprir obrigações legais e regulatórias e melhorar a qualidade do atendimento, sempre dentro da finalidade informada.",
      ],
    },
    {
      kind: "prose",
      title: "4. Compartilhamento",
      paragraphs: [
        "Não vendemos dados pessoais. Compartilhamos apenas com fornecedores necessários à operação (como infraestrutura e telefonia), sob contrato e com obrigação de confidencialidade, ou quando exigido por autoridade competente.",
      ],
    },
    {
      kind: "prose",
      title: "5. Segurança e retenção",
      paragraphs: [
        "Aplicamos criptografia em repouso e em trânsito, acesso por função com privilégio mínimo, autenticação forte em sistemas de produção e trilha de auditoria. Os dados são mantidos pelo tempo necessário à finalidade e aos prazos legais, e depois eliminados ou anonimizados.",
      ],
    },
    {
      kind: "checklist",
      title: "6. Seus direitos",
      lead: "Conforme a LGPD, você pode solicitar a qualquer momento:",
      items: [
        "Confirmação da existência de tratamento e acesso aos dados",
        "Correção de dados incompletos, inexatos ou desatualizados",
        "Anonimização, bloqueio ou eliminação de dados desnecessários",
        "Portabilidade dos dados a outro fornecedor",
        "Informação sobre com quem compartilhamos seus dados",
        "Revogação do consentimento, quando o tratamento se basear nele",
      ],
    },
    {
      kind: "prose",
      title: "7. Cookies",
      paragraphs: [
        "Usamos apenas o necessário para o funcionamento e a segurança do site. Se passarmos a usar cookies de análise ou publicidade, esta política será atualizada e o consentimento será solicitado antes da coleta.",
      ],
    },
    {
      kind: "prose",
      title: "8. Como falar com a gente",
      paragraphs: [
        "Pedidos relacionados a dados pessoais podem ser feitos pela página de contato. Na versão final desta política será publicado o canal direto do encarregado pelo tratamento de dados (DPO).",
      ],
    },
    {
      kind: "links",
      title: "Documentos relacionados",
      items: [
        { title: "Termos de Uso", text: "Regras de uso do site e da plataforma.", href: "/termos" },
        { title: "Contato", text: "Canal para exercer os seus direitos.", href: "/contato" },
      ],
    },
  ],
};
