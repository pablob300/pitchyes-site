import type { HomeContent } from "@/content/home.schema";

// Texto da página inicial — segue docs/PitchYes — Wireframe Homepage (Desktop).pdf.
// As respostas da FAQ não estão no wireframe; adaptadas da FAQ da bland.ai com o nome PitchYes.
//
// Este é o PADRÃO do código. Quando alguém edita a home no painel, a sobreposição vem do
// banco e é fundida sobre este objeto (lib/content/merge.ts): objeto mescla por chave,
// lista substitui inteira. Campo que ninguém tocou continua saindo daqui.

export const homeDefaults: HomeContent = {
  // Ordem em que as seções aparecem. O hero é fixo no topo: carrega o único <h1>.
  sections: [
    { key: "hero" },
    { key: "clientLogos" },
    { key: "platform" },
    { key: "latency" },
    { key: "caseHighlight" },
    { key: "testimonials" },
    { key: "rollout" },
    { key: "security" },
    { key: "useCases" },
    { key: "faq" },
  ],

  hero: {
    title: "IA de voz para:",
    titleWords: [
      { text: "Clínicas" },
      { text: "Imobiliárias" },
      { text: "Concessionárias" },
      { text: "Seguradoras" },
      { text: "Faculdades" },
      { text: "Corretoras" },
      { text: "Franquias" },
      { text: "Telecomunicação" },
    ],
    lead: "Atende, qualifica, agenda, transfere e liga.",
    cta: "Fale com nossa IA",
    stat: { value: "20.000.000+", label: "ligações realizadas até hoje" },
    widget: {
      // Each card reads "OUÇA NOSSO AGENTE DE" + the agent name, so names complete that phrase.
      eyebrow: "Ouça nosso agente de",
      // TODO(produto): os cinco MP3 em /public/audio são a MESMA locução de exemplo, só para
      // montar a estrutura. Substituir pela amostra real de cada setor, mesmo nome de arquivo.
      // TODO(produto): confirmar os setores; "Atendimento" ocupa o lugar do antigo "PitchYes".
      agents: [
        { name: "Saúde", audio: "/audio/agente-saude.mp3" },
        { name: "Seguros", audio: "/audio/agente-seguros.mp3" },
        { name: "Finanças", audio: "/audio/agente-financeiro.mp3" },
        { name: "Imóveis", audio: "/audio/agente-imobiliario.mp3" },
        { name: "Atendimento", audio: "/audio/agente-pitchyes.mp3" },
      ],
      hint: "Toque no card para ouvir o agente",
    },
  },

  // Mesmo case de /clientes/cases (content/clientes-cases.ts), sem número novo.
  caseHighlight: {
    eyebrow: "Case OPEN Datacenter",
    title: "O trabalho de horas de 40 vendedores, feito em minutos.",
    videoId: "prSFv3IPWu8",
    alt: "Vídeo do case OPEN Datacenter, no canal da PitchYes no YouTube",
    paragraphs: [
      "A OPEN Datacenter tinha uma equipe comercial de mais de 40 vendedores e um gargalo conhecido: o tempo gasto em tentativas de contato que não viravam conversa.",
      "A PitchYes assumiu a primeira camada dessas ligações. O agente faz as tentativas, conversa com quem atende e entrega ao time apenas as conversas que avançaram, com o contexto registrado.",
      "Nas palavras do CEO, Leandro Vasconcelos: “A IA da PitchYes fez o que levava horas, em minutos.”",
    ],
  },

  clientLogos: {
    title: "Empresas que confiam na PitchYes.",
  },

  platform: {
    eyebrow: "Plataforma",
    title: "Toda ligação importa.",
    lead: "A PitchYes é a plataforma de IA de voz que transforma espera em conversa e rotina de ligação em resultado.",
    pillars: [
      { key: "infra", eyebrow: "Infraestrutura", title: "Confiabilidade em cada ligação.", text: "Modelo próprio para chamadas de voz. Seus dados nunca passam por terceiros." },
      { key: "build", eyebrow: "Construir", title: "Agentes prontos para produção, sem experiência.", text: "Descreva o que precisa. Nenhuma experiência em IA de voz é necessária." },
      { key: "test", eyebrow: "Testar", title: "Teste todo cenário antes de ir ao ar.", text: "Rode testes em cada caso de borda antes de colocar em produção." },
      { key: "omni", eyebrow: "Omnichannel", title: "Um agente, todos os canais.", text: "Voz, WhatsApp, SMS e chat do site. Memória unificada entre canais." },
      { key: "observe", eyebrow: "Observabilidade", title: "Veja exatamente o que acontece, sempre.", text: "Acompanhe ligações em tempo real com qualidade nível enterprise." },
      { key: "integrations", eyebrow: "Integrações", title: "Conecta com o que você já usa.", text: "Funciona com sua telefonia, CRM e agenda atuais, sem fricção." },
    ],
  },

  latency: {
    title: "E tudo isso com uma latência tão baixa que você mal percebe.",
    unit: "ms",
    // Bars are proportional to the largest value; each bar and its number count up from
    // zero over `duration` seconds when the section scrolls into view.
    rows: [
      { label: "PitchYes", value: 800, duration: 1, highlight: true },
      { label: "Média do mercado", value: 1620, duration: 3, highlight: false },
    ],
  },

  testimonials: {
    eyebrow: "Clientes reais",
    title: "Clientes reais. Resultados reais.",
    lead: "Nenhuma prova é maior do que a palavra de quem já usa a IA de voz da PitchYes.",
    // Vídeos do canal da PitchYes no YouTube (Shorts). As capas em /images/depoimentos foram
    // extraídas do próprio vídeo, para a página não depender de um pedido ao YouTube.
    items: [
      {
        company: "Paybem",
        videoId: "7bTaV1HrFYg",
        thumb: "/images/depoimentos/paybem.webp",
        seconds: 74,
        published: "2025-11-28",
      },
      {
        company: "Top Master",
        videoId: "8-4ZIc3IP7c",
        thumb: "/images/depoimentos/top-master.webp",
        seconds: 103,
        published: "2025-11-28",
      },
      {
        company: "Grupo TGPM",
        videoId: "DIWdzNoeD2U",
        thumb: "/images/depoimentos/grupo-tgpm.webp",
        seconds: 59,
        published: "2025-11-28",
      },
      {
        company: "Mais Vida",
        videoId: "YUob3BDLV7A",
        thumb: "/images/depoimentos/mais-vida.webp",
        seconds: 119,
        published: "2025-11-28",
      },
      {
        company: "Sittax",
        videoId: "Gifdfv2cbaM",
        thumb: "/images/depoimentos/sittax.webp",
        seconds: 57,
        published: "2025-11-28",
      },
    ],
  },

  rollout: {
    title: "Sua operação com IA de voz, ao vivo em poucos dias.",
    steps: [
      { day: "Dia 01", title: "Descoberta", text: "Entendimento dos processos da sua empresa" },
      { day: "Dia 03", title: "Construção", text: "Script, voz e integrações configuradas" },
      { day: "Dia 05", title: "Testes", text: "Cenários reais validados antes do ar" },
      { day: "Dia 07 · Ao vivo", title: "Em produção", text: "Sua equipe acompanha ligações diariamente", live: true },
    ],
  },

  // TODO: legal/compliance must confirm validity and scope of each certification (wireframe note).
  security: {
    title: "Construída para setores complexos e regulados.",
    lead: "Criptografia, trilhas de auditoria e certificações que passam por segurança, procurement e jurídico. Seus dados continuam seus. Nenhum terceiro acessa uma única ligação.",
    // Uma coluna por item: a certificação em cima, o controle embaixo.
    items: [
      {
        status: "Auditado",
        name: "SOC 2",
        detail: "Type II",
        controlTitle: "Criptografia",
        controlText: "AES-256 em repouso. TLS 1.3 em trânsito. Chaves protegidas por HSM.",
      },
      {
        status: "Auditado",
        name: "HIPAA",
        detail: "BAA",
        controlTitle: "Residência de dados",
        controlText: "Opções de implantação no Brasil e no exterior, sob demanda.",
      },
      {
        status: "Auditado",
        name: "PCI DSS",
        detail: "v4.0",
        controlTitle: "Controle de acesso",
        controlText: "Acesso por função com privilégio mínimo. MFA em todo sistema de produção.",
      },
      {
        status: "Certificado",
        name: "FedRAMP",
        detail: "20x Class A",
        controlTitle: "Resposta a incidentes",
        controlText: "Engenharia de plantão 24/7. Runbooks documentados. Notificação com SLA.",
      },
    ],
    cta: "Ver Política de Privacidade",
  },

  useCases: {
    title: "Como as empresas usam a PitchYes.",
    items: [
      { title: "Substituição de URA", text: "Troque o menu de teclado por conversa em linguagem natural.", href: "/solucoes/receptivo" },
      { title: "Central de atendimento com IA", text: "Milhares de ligações simultâneas, o dia inteiro, sem aumentar equipe.", href: "/solucoes/receptivo" },
      { title: "Atendimento receptivo", text: "Todo cliente atendido, qualificado e direcionado, 24 horas por dia.", href: "/solucoes/receptivo" },
      { title: "Ligações em qualquer escala", text: "Do primeiro teste a milhões de ligações, sem trocar de plataforma.", href: "/planos" },
      { title: "Prospecção ativa", text: "Qualifica leads, confirma reuniões e faz follow-up, em escala.", href: "/solucoes/ativo" },
      { title: "Inteligência de chamadas", text: "Toda ligação transcrita, avaliada e pesquisável.", href: "/recursos/novidades" },
      { title: "Atendimento automático 24/7", text: "Cobre noites, fins de semana e picos de volume.", href: "/solucoes/receptivo" },
      { title: "Agente de telefone com IA", text: "Segue seu roteiro à risca e usa os sistemas que sua equipe já tem.", href: "/solucoes" },
      { title: "IA de voz conversacional", text: "Lida com interrupção, sotaque e mudança de assunto como um humano.", href: "/solucoes/por-funcao" },
      { title: "Central de contato omnichannel", text: "Telefone, WhatsApp e chat em um só lugar, tudo registrado.", href: "/recursos/integracoes" },
    ],
  },

  faq: {
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
  },
};
