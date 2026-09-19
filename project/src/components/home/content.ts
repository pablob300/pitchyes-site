// Homepage copy — follows docs/PitchYes — Wireframe Homepage (Desktop).pdf.
// FAQ answers are not in the wireframe; adapted from bland.ai's FAQ with PitchYes naming.

export const hero = {
  titleBefore: "IA de voz para setores que exigem ",
  titleAccent: "segurança e confiança",
  titleAfter: ": saúde, seguros, serviços financeiros e mais.",
  lead: "Construída para ligações de alto risco, onde segurança e confiança realmente importam.",
  cta: "Fale com nossa IA",
  stat: { value: "20.000.000+", label: "ligações realizadas até hoje" },
  widget: {
    eyebrow: "Fale com um agente",
    agents: ["PitchYes", "Saúde", "Seguros", "Financeiro", "Imobiliário"],
    hint: "Clique para falar com um agente",
  },
};

export const clientLogos = {
  title: "Empresas que confiam na PitchYes.",
  // TODO: swap names for the clients' logo files (SVG) when available.
  names: [
    "Sofia Energia",
    "Vantage Energia",
    "MaxNet",
    "Plaza",
    "Grupo Hellu's Prime",
    "OPEN Datacenter",
    "Employability",
    "Senior Sistemas",
    "Prospecta Global",
    "Método 12P",
    "MidHaus",
    "Cooperativa",
  ],
};

export const platform = {
  eyebrow: "Plataforma",
  title: "Uma plataforma. Toda ligação.",
  lead: "A PitchYes automatiza as ligações que hoje exigem um humano, rodando com infraestrutura própria para máxima segurança.",
  pillars: [
    { key: "infra", eyebrow: "Infraestrutura", title: "Confiabilidade em cada ligação.", text: "Modelo próprio para chamadas de voz. Seus dados nunca passam por terceiros." },
    { key: "build", eyebrow: "Construir", title: "Agentes prontos para produção, sem experiência.", text: "Descreva o que precisa. Nenhuma experiência em IA de voz é necessária." },
    { key: "test", eyebrow: "Testar", title: "Teste todo cenário antes de ir ao ar.", text: "Rode testes em cada caso de borda antes de colocar em produção." },
    { key: "omni", eyebrow: "Omnichannel", title: "Um agente, todos os canais.", text: "Voz, WhatsApp, SMS e chat do site. Memória unificada entre canais." },
    { key: "observe", eyebrow: "Observabilidade", title: "Veja exatamente o que acontece, sempre.", text: "Acompanhe ligações em tempo real com qualidade nível enterprise." },
    { key: "integrations", eyebrow: "Integrações", title: "Conecta com o que você já usa.", text: "Funciona com sua telefonia, CRM e agenda atuais, sem fricção." },
  ],
} as const;

export const latency = {
  title: "E tudo isso com uma latência tão baixa que você mal percebe.",
  unit: "ms",
  // Bars are proportional to the largest value; each bar and its number count up from
  // zero over `duration` seconds when the section scrolls into view.
  rows: [
    { label: "PitchYes", value: 400, duration: 1, highlight: true },
    { label: "Média do mercado", value: 1240, duration: 3, highlight: false },
  ],
};

export type Testimonial = {
  name: string;
  role: string;
  headline?: string;
  quote?: string;
};

export const testimonials = {
  eyebrow: "Clientes reais",
  title: "Clientes reais. Resultado real.",
  lead: "Como empresas de energia, tecnologia e serviços estão automatizando ligações com a PitchYes.",
  // TODO: add video files, plus headline/quote for each client (only Leandro's is in the wireframe).
  items: [
    {
      name: "Leandro Vasconcelos",
      role: "CEO, OPEN Datacenter",
      headline: "De horas para minutos no volume de ligações.",
      quote: "Equipe de mais de 40 vendedores. A IA da PitchYes fez o que levava horas, em minutos.",
    },
    { name: "Guilherme Pacheco", role: "Diretor, Alves Pacheco" },
    { name: "Raphael Garcia", role: "Diretor Comercial, Plaza" },
    { name: "Claudio Riccioppo", role: "CEO, Employability" },
  ] satisfies Testimonial[],
};

export const rollout = {
  title: "Sua operação com IA de voz, ao vivo em poucos dias.",
  steps: [
    { day: "Dia 01", title: "Descoberta", text: "Entendimento do seu processo comercial" },
    { day: "Dia 03", title: "Construção", text: "Script, voz e integrações configuradas" },
    { day: "Dia 05", title: "Testes", text: "Cenários reais validados antes do ar" },
    { day: "Dia 07 · Ao vivo", title: "Em produção", text: "Sua equipe acompanha ligações diariamente", live: true },
  ],
};

// TODO: legal/compliance must confirm validity and scope of each certification (wireframe note).
export const security = {
  title: "Construída para setores complexos e regulados.",
  lead: "Criptografia, trilhas de auditoria e certificações que passam por segurança, procurement e jurídico. Seus dados continuam seus. Nenhum terceiro acessa uma única ligação.",
  // One column per certification; controls[i] sits under certifications[i].
  certifications: [
    { status: "Auditado", name: "SOC 2", detail: "Type II" },
    { status: "Auditado", name: "HIPAA", detail: "BAA" },
    { status: "Auditado", name: "PCI DSS", detail: "v4.0" },
    { status: "Certificado", name: "FedRAMP", detail: "20x Class A" },
  ],
  controls: [
    { title: "Criptografia", text: "AES-256 em repouso. TLS 1.3 em trânsito. Chaves protegidas por HSM." },
    { title: "Residência de dados", text: "Opções de implantação no Brasil e no exterior, sob demanda." },
    { title: "Controle de acesso", text: "Acesso por função com privilégio mínimo. MFA em todo sistema de produção." },
    { title: "Resposta a incidentes", text: "Engenharia de plantão 24/7. Runbooks documentados. Notificação com SLA." },
  ],
  cta: "Ver Política de Privacidade",
};

export const useCases = {
  title: "Como as empresas usam a PitchYes.",
  items: [
    { title: "Substituição de URA", text: "Troque o menu de teclado por conversa em linguagem natural." },
    { title: "Central de atendimento com IA", text: "Milhares de ligações simultâneas, o dia inteiro, sem aumentar equipe." },
    { title: "Atendimento receptivo", text: "Todo cliente atendido, qualificado e direcionado, 24 horas por dia." },
    { title: "Ligações em qualquer escala", text: "Do primeiro teste a milhões de ligações, sem trocar de plataforma." },
    { title: "Prospecção ativa", text: "Qualifica leads, confirma reuniões e faz follow-up, em escala." },
    { title: "Inteligência de chamadas", text: "Toda ligação transcrita, avaliada e pesquisável." },
    { title: "Atendimento automático 24/7", text: "Cobre noites, fins de semana e picos de volume." },
    { title: "Agente de telefone com IA", text: "Segue seu roteiro à risca e usa os sistemas que sua equipe já tem." },
    { title: "IA de voz conversacional", text: "Lida com interrupção, sotaque e mudança de assunto como um humano." },
    { title: "Central de contato omnichannel", text: "Telefone, WhatsApp e chat em um só lugar, tudo registrado." },
  ],
};

export const faq = {
  title: "Perguntas frequentes.",
  items: [
    {
      q: "O que é a PitchYes?",
      a: "A PitchYes é uma plataforma enterprise de IA de voz. Empresas usam a PitchYes para criar, operar e monitorar agentes de telefone com IA que conduzem conversas reais em escala. Os agentes fazem e recebem ligações, soam humanos, rodam na infraestrutura própria da PitchYes e se conectam às ferramentas que sua equipe já usa.",
    },
    {
      q: "Como funciona a cobrança por minuto?",
      a: "Uma única tarifa por minuto cobre o modelo de linguagem, a transcrição de voz, a síntese de voz e a telefonia. Não há cobrança por token, sobretaxa por funcionalidade nem faturas separadas de fornecedores. O valor acompanha o uso, e os planos enterprise são contratados com base em volume, infraestrutura dedicada e requisitos de conformidade.",
    },
    {
      q: "Quanto tempo leva para implantar um agente?",
      a: "A maioria dos agentes entra em produção em poucos dias, seguindo as etapas de descoberta, construção e testes. Fluxos de conversa mais complexos, com muitas integrações, podem levar de duas a seis semanas. Nosso time de engenharia trabalha junto com o seu para construir, otimizar e escalar a operação.",
    },
    {
      q: "Como a PitchYes lida com LGPD e certificações de segurança?",
      a: "A PitchYes possui certificações SOC 2 Type I e Type II, HIPAA (com BAA assinado) e PCI DSS, e opera em conformidade com a LGPD. A plataforma foi construída em torno desses padrões, e não adaptada a eles depois. Seus dados continuam seus: nenhum terceiro acessa suas ligações.",
    },
    {
      q: "A PitchYes pode substituir minha central de atendimento?",
      a: "Sim. A PitchYes foi projetada para atender 100% das ligações, com milhares de chamadas simultâneas, 24 horas por dia, sem aumentar a equipe. A maioria dos clientes chega lá de forma gradual: começa por um tipo de ligação, mede os resultados e amplia a cobertura.",
    },
    {
      q: "Qual a diferença entre a PitchYes e uma URA?",
      a: "Uma URA obriga quem liga a navegar por menus no teclado. A PitchYes substitui isso por conversa: a pessoa diz o que precisa, e o agente entende, age e resolve em linguagem natural.",
    },
    {
      q: "A IA substitui humanos ou trabalha junto com eles?",
      a: "A PitchYes foi projetada para atender 100% das ligações, mas a maioria dos clientes chega lá aos poucos. Nesse caminho, a IA trabalha junto com a sua equipe: assume o volume repetitivo e libera as pessoas para as conversas que mais precisam delas.",
    },
    {
      q: "A PitchYes atende em outros idiomas além do português?",
      a: "Sim. A PitchYes atende nativamente em mais de 40 idiomas, com tradução em tempo real disponível em 23 deles.",
    },
    {
      q: "Preciso trocar meu CRM ou sistema atual?",
      a: "Não. A PitchYes se conecta ao que você já usa, como CRMs (HubSpot, Salesforce), agenda e telefonia. Você pode manter sua operadora ou tronco SIP atual, ou usar a telefonia integrada da PitchYes.",
    },
  ],
};

export const finalCta = {
  title: "IA de voz segura, que se paga sozinha.",
  cta: "Fale com nossa IA",
};
