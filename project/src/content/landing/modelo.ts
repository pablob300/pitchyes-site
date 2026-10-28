import type { Block } from "@/content/types";

// Modelo padrão das landing pages (/conteudo/<slug>).
//
// Veio da página converse.pitchyes.com.br/cadastro: mesma sequência de blocos e mesmo texto
// (revisado), com o visual do design system deste site. "Criar página" no painel COPIA este
// modelo para o banco — mudar algo aqui só afeta as páginas criadas depois.
//
// TODO(comercial): os números abaixo vieram da página de referência e ainda não têm fonte
// (SEO.md §1.5): 25Mi+ ligações, 400+ empresas, 85% de eficiência,
// 6h/dia, 98%, 5 min, funil de 1.000 ligações, 300%/70%/85%/ROI em 30 dias, 94,7%/92%/76%,
// 4.9/5, 99,9% de disponibilidade. Por isso as landing pages ficam fora do /llms.txt.
// TODO(jurídico): comparativo com concorrentes citados pelo nome e o depoimento de
// "Marina Rodriguez, GrowthCore" (não é um cliente conhecido) — confirmar antes de usar.

export type LandingSection = { key: string; hidden?: boolean };

/** Conteúdo de uma landing page: os blocos por chave estável e a ordem deles. */
export type LandingDoc = {
  sections: LandingSection[];
  blocos: Record<string, Block>;
};

/** Âncora do formulário: todo botão de chamada da landing page leva para cá. */
export const FORM_ANCHOR = "formulario";

const blocks: [string, Block][] = [
  [
    "inicio",
    {
      kind: "heroForm",
      id: "inicio",
      menuLabel: "Início",
      eyebrow: "IA de voz para ligações",
      title: "Sua empresa trabalha enquanto nossa IA liga por você.",
      lead:
        "Ligações ativas e receptivas, qualificação de leads, atendimento ao cliente e integração com WhatsApp e e-mail, tudo feito por agentes de IA que conversam como pessoas.",
      bullets: [
        "Ligações automatizadas de vendas, pesquisas e avisos",
        "Qualificação de leads em tempo real",
        "Atendimento ao cliente 24 horas por dia, 7 dias por semana",
        "Integração com WhatsApp e e-mail",
      ],
      proof: "25Mi+ ligações · 400+ empresas · 85% de eficiência",
      formTitle: "Fale com a PitchYes",
      submitLabel: "Quero conhecer",
      formNote: "Sem compromisso. Resposta em até 2 horas úteis.",
    },
  ],
  [
    "numeros",
    {
      kind: "stats",
      id: "numeros",
      cta: "Quero começar agora",
      items: [
        { value: "25Mi+", label: "Ligações realizadas" },
        { value: "400+", label: "Empresas clientes" },
        { value: "85%", label: "Aumento na eficiência" },
        { value: "6h/dia", label: "Tempo economizado por equipe" },
      ],
    },
  ],
  [
    "comparativo",
    {
      // Mesma tabela do converse.pitchyes.com.br ("Por que escolher a PitchYes?"). As fontes de
      // "Meses quando entregue" são reclamações públicas no Reclame Aqui, linkadas na célula.
      kind: "table",
      id: "comparativo",
      menuLabel: "Comparativo",
      title: "Por que escolher a PitchYes?",
      lead: "Compare nossa solução com outras plataformas de IA para vendas e veja por que somos a melhor opção.",
      cta: "Comece agora com a PitchYes",
      compare: true,
      rowHeader: "Recursos",
      columns: ["PitchYes", "Prospct.ai", "3C", "Viver de IA"],
      groups: [
        {
          title: "",
          rows: [
            { label: "Preço inicial", values: ["$$", "$$$$", "$$$", "$$$$"] },
            {
              label: "Reputação no Reclame Aqui",
              values: [
                "[Reclame Aqui](https://www.reclameaqui.com.br/empresa/pitchyes-desenvolvimento/lista-reclamacoes/)",
                "[Reclame Aqui](https://www.reclameaqui.com.br/empresa/growth-machine-consultoria/)",
                "[Reclame Aqui](https://www.reclameaqui.com.br/empresa/3c-plus-tecnologia-da-informacao/)",
                "[Reclame Aqui](https://www.reclameaqui.com.br/empresa/viver-de-ia/)",
              ],
            },
            {
              label: "Velocidade para ROI",
              values: [
                "Dias",
                "[Meses quando entregue](https://www.reclameaqui.com.br/growth-machine-consultoria/ia-sdr-growth-machine-pessimo-servico_6S_cCTSaMPMw_dyU/)",
                "[Meses quando entregue](https://www.reclameaqui.com.br/3c-plus-tecnologia-da-informacao/nao-recebi-o-agente-de-ia-e-o-discador-da-3c-plus-apresenta-falhas_-s5qTILyFYHPBk-a/)",
                "[Meses quando entregue](https://www.reclameaqui.com.br/viver-de-ia/viver-de-ia-nao-cancelou-meu-servico-e-continua-me-cobrando_XzanPZ2efvJx_czZ/)",
              ],
            },
            { label: "Suporte dedicado vitalício", values: ["Sim", "Não", "Não", "Não"] },
            { label: "Implantação rápida a 4 mãos", values: ["Sim", "Não", "Não", "Não"] },
            { label: "Ligações com números de celular exclusivos", values: ["Sim", "Sim", "Sim", "Não"] },
            { label: "Grupo de WhatsApp para acompanhamento diário", values: ["Sim", "Não", "Não", "Não"] },
            { label: "Cobra apenas por conversas reais (não por tentativas/caixa postal)", values: ["Sim", "Não", "Sim", "Não"] },
            { label: "Personalização de cadências de contato", values: ["Sim", "Sim", "Não", "Não"] },
          ],
        },
      ],
    },
  ],
  [
    "imprensa",
    {
      kind: "logos",
      id: "imprensa",
      source: "proprio",
      title: "Veja onde a PitchYes apareceu",
      lead: "O mercado está reconhecendo a revolução nas ligações por voz. Também saímos em mais de 100 outros veículos.",
      cta: "Falar com a PitchYes",
      items: [
        { name: "O Globo", logo: "/logos/imprensa/o-globo.webp", width: 406, height: 96 },
        { name: "Valor Econômico", logo: "/logos/imprensa/valor-economico.webp", width: 275, height: 96 },
        { name: "IG", logo: "/logos/imprensa/ig.webp", width: 91, height: 96 },
        { name: "Terra", logo: "/logos/imprensa/terra.webp", width: 75, height: 96 },
        { name: "Estado de Minas", logo: "/logos/imprensa/estado-de-minas.webp", width: 685, height: 96 },
      ],
    },
  ],
  [
    "demonstracao",
    {
      kind: "video",
      id: "demonstracao",
      menuLabel: "Demonstração",
      eyebrow: "Ver na prática",
      title: "Veja a nossa IA em ação",
      lead: "Assista a uma ligação real e veja como a IA de voz pode transformar as suas vendas na prática.",
      videoId: "BkdjBEooc1o",
      alt: "Demonstração da IA de voz da PitchYes em uma ligação",
      poster: "/images/landing/demonstracao.webp",
      stepsTitle: "Como funciona",
      steps: ["Preencha seus dados", "Nosso time agenda a sua demonstração", "Converse com a IA e veja a tecnologia funcionando"],
      stats: [
        { value: "98%", label: "Ficam impressionados" },
        { value: "5 min", label: "Duração média da conversa" },
      ],
      quote: "Ontem fiquei 10 minutos no telefone conversando com a IA e já não sei se realmente é IA, foi muito longe a conversa.",
      person: "Guilherme, CEO da Alves Pacheco",
      cta: "Quero saber mais",
    },
  ],
  [
    "solucoes",
    {
      // Mesma grade "Como as empresas usam a PitchYes" da home, sem links: a landing page não
      // leva para o resto do site.
      kind: "useCases",
      id: "solucoes",
      menuLabel: "Soluções",
      title: "Como as empresas usam a PitchYes",
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
    },
  ],
  [
    "eficiencia",
    {
      kind: "stats",
      id: "eficiencia",
      title: "Eficiência da IA: 94,7%",
      bars: true,
      items: [
        { value: "92%", label: "Qualificação" },
        { value: "76%", label: "Conversão" },
      ],
      cta: "Quero ver na prática",
    },
  ],
  [
    "integracoes",
    {
      kind: "features",
      id: "integracoes",
      menuLabel: "Integrações",
      eyebrow: "Integrações",
      title: "Integrações com o seu CRM",
      lead: "Conecte a PitchYes aos CRMs mais usados do mercado ou use a sua própria lista de contatos.",
      items: [
        { title: "Salesforce", text: "Integração completa, com sincronização de leads e oportunidades nos dois sentidos." },
        { title: "Pipedrive", text: "Conecte seus funis e automatize o acompanhamento dos contatos." },
        { title: "Nectar", text: "Potencialize o seu CRM brasileiro com IA de voz." },
        { title: "HubSpot", text: "Some prospecção ativa ao seu marketing de entrada." },
        { title: "+80 CRMs", text: "E muitos outros CRMs do mercado." },
      ],
    },
  ],
  [
    "comecar",
    {
      kind: "steps",
      id: "comecar",
      title: "Como começar em 4 passos",
      lead: "Em todas as integrações: sincronização automática, campos personalizados, atualização de status, importação de contatos e notas automáticas.",
      steps: [
        { label: "Passo 1", title: "Conecte seu CRM ou envie uma lista", text: "Envie a sua lista de contatos ou deixe a nossa equipe configurar a integração com o seu CRM." },
        { label: "Passo 2", title: "Configure as campanhas", text: "Defina roteiros, horários e critérios de qualificação." },
        { label: "Passo 3", title: "Inicie as ligações", text: "A IA começa a ligar automaticamente." },
        { label: "Passo 4", title: "Acompanhe os resultados", text: "Monitore o desempenho em tempo real e receba relatórios detalhados." },
      ],
      cta: "Falar com um especialista",
    },
  ],
  [
    "depoimentos",
    {
      kind: "testimonials",
      id: "depoimentos",
      menuLabel: "Depoimentos",
      eyebrow: "O que nossos clientes dizem",
      title: "O que nossos clientes dizem",
      lead: "Empresas de todos os tamanhos estão transformando suas vendas com a IA de voz da PitchYes.",
      stats: [
        { value: "4.9/5", label: "Avaliação média" },
        { value: "98%", label: "Taxa de satisfação" },
        { value: "400+", label: "Empresas atendidas" },
        { value: "24h", label: "Suporte técnico" },
      ],
      items: [
        {
          quote: "Plataforma extremamente bem feita. O agente conversa como se fosse uma pessoa mesmo, além de a experiência inicial ser muito fluida.",
          name: "Raphael Garcia",
          role: "Diretor Comercial",
          company: "Plaza",
        },
        {
          quote: "Estamos trabalhando com a IA e os resultados estão sendo muito favoráveis. Alta conversão em agendamento de horário, o que é maravilhoso no nosso segmento. Recomendo.",
          name: "Jordana Costa",
          role: "Gerente",
          company: "Grupo Hellu's Prime",
        },
        {
          quote: "Temos uma equipe de mais de 40 vendedores. A inteligência artificial da PitchYes realmente fez uma grande diferença nas ligações. O que levava horas, agora conseguimos fazer em minutos.",
          name: "Leandro Vasconcelos",
          role: "CEO",
          company: "OPEN Datacenter",
        },
        {
          quote: "Excelente. Estou comparando com os SDRs humanos da minha equipe. Muito mais barato e liga muito mais!",
          name: "Claudio Riccioppo de Moraes",
          role: "CEO",
          company: "Employability Assessoria Profissional",
        },
        {
          quote: "Usei a IA da PitchYes e fiquei 10 minutos no telefone com ela. No fim, nem sabia mais se era IA ou gente de verdade. Inacreditável.",
          name: "Guilherme Pacheco",
          role: "Diretor",
          company: "Alves Pacheco Advogados",
        },
        {
          quote: "Nossa equipe estava sobrecarregada com prospecção manual. A PitchYes liberou nossos vendedores para focar no que fazem de melhor: fechar negócios. Aumento de 60% nas vendas no primeiro trimestre.",
          name: "Marina Rodriguez",
          role: "VP de Vendas",
          company: "GrowthCore",
        },
      ],
    },
  ],
  [
    "clientes",
    {
      kind: "logos",
      id: "clientes",
      source: "clientes",
      title: "Empresas de todos os segmentos confiam na PitchYes",
      cta: "Acelerar minhas vendas",
      items: [],
    },
  ],
  [
    "segmentos",
    {
      kind: "features",
      id: "segmentos",
      menuLabel: "Segmentos",
      eyebrow: "Soluções por segmento",
      title: "Veja como a PitchYes funciona no seu mercado",
      items: [
        { title: "Concessionárias", text: "Responda todo interessado no carro em segundos e agende test-drives automaticamente." },
        { title: "Clínicas", text: "Pare de perder pacientes por ligações não atendidas e confirme consultas sem esforço." },
        { title: "Provedores de internet", text: "Atenda picos de suporte e venda planos sem aumentar a equipe." },
        { title: "Proteção veicular", text: "Ligue para cada cotação na hora e qualifique associados antes do consultor." },
        { title: "Imobiliárias", text: "Qualifique leads de portais e agende visitas enquanto o corretor fecha negócios." },
        { title: "Crédito consignado", text: "Ofereça crédito em escala e encaminhe só quem está pronto para contratar." },
      ],
    },
  ],
  [
    "perguntas",
    {
      kind: "faq",
      id: "perguntas",
      title: "Respostas para quem está quase decidido",
      cta: "Quero começar agora",
      items: [
        { q: "O que é a PitchYes?", a: "A PitchYes é uma plataforma de IA de voz que faz e recebe ligações com conversas naturais e humanizadas. A tecnologia permite que empresas ampliem a capacidade de atendimento, vendas e qualificação de leads sem aumentar a equipe na mesma proporção." },
        { q: "Como funciona a IA de voz da PitchYes?", a: "A IA atende ou faz ligações, entende o contexto da conversa, faz perguntas, responde dúvidas, qualifica oportunidades e pode transferir o contato para um atendente humano quando necessário." },
        { q: "A IA da PitchYes parece um robô?", a: "Não. A PitchYes foi desenvolvida para conduzir conversas naturais e fluidas, com capacidade de entender o contexto, lidar com interrupções, responder perguntas e manter um diálogo parecido com o de uma conversa humana." },
        { q: "A PitchYes pode atender as ligações que a minha empresa recebe?", a: "Sim. A IA receptiva atende as chamadas recebidas, identifica a necessidade do cliente, responde dúvidas, qualifica oportunidades e direciona o atendimento para o setor certo." },
        { q: "A PitchYes pode transferir ligações para vendedores ou atendentes?", a: "Sim. Quando identifica uma oportunidade qualificada ou uma situação que exige atendimento humano, a IA transfere a ligação em tempo real." },
        { q: "Quais empresas podem usar a PitchYes?", a: "Empresas que recebem ou fazem um volume significativo de ligações, como clínicas, imobiliárias, concessionárias, instituições de ensino, empresas de serviços, varejo e operações comerciais em geral." },
        { q: "A IA funciona 24 horas por dia?", a: "Sim. A PitchYes atende clientes 24 horas por dia, 7 dias por semana, inclusive fins de semana e feriados." },
        { q: "A PitchYes substitui a minha equipe de atendimento?", a: "Não necessariamente. Na maioria dos casos, a IA complementa a equipe: assume tarefas repetitivas, triagens e qualificações para que as pessoas foquem em atividades mais estratégicas." },
        { q: "Quanto custa implementar uma IA de voz?", a: "O investimento varia conforme o volume de ligações, os objetivos da operação e a complexidade do fluxo de atendimento. A PitchYes tem planos para empresas de vários portes." },
        { q: "Quanto tempo leva para implementar a solução?", a: "O prazo depende da complexidade do projeto, mas muitas operações começam a usar a IA poucos dias depois da configuração inicial." },
        { q: "A PitchYes integra com CRM?", a: "Sim. A plataforma se integra aos principais CRMs e sistemas usados pelas empresas para registrar informações e automatizar processos." },
        { q: "A IA consegue qualificar leads?", a: "Sim. A IA segue critérios definidos pela empresa para identificar interesse, perfil, necessidade e potencial de compra antes de encaminhar o contato a um vendedor." },
        { q: "É possível personalizar o atendimento?", a: "Sim. Cada IA é configurada de acordo com o processo, a linguagem, as regras de negócio e os objetivos de cada empresa." },
        { q: "Como a IA lida com perguntas inesperadas?", a: "A PitchYes usa modelos avançados de inteligência artificial, capazes de entender contextos diferentes e responder de forma natural mesmo quando a conversa sai do roteiro principal." },
        { q: "Quais são os benefícios de usar IA de voz no atendimento?", a: "Atendimento imediato, disponibilidade 24/7, menos chamadas perdidas, mais produtividade, melhor qualificação de oportunidades, escala na operação e redução de custos operacionais." },
        { q: "A PitchYes grava as ligações?", a: "Sim. As chamadas podem ser registradas para auditoria, treinamento, acompanhamento de qualidade e análise de desempenho da operação." },
        { q: "A PitchYes atende em português?", a: "Sim. A plataforma foi desenvolvida para o mercado brasileiro e tem alta qualidade de compreensão e conversação em português." },
        { q: "Como saber se a minha empresa precisa de uma IA de voz?", a: "Se a sua empresa perde ligações, demora para responder clientes, tem gargalos no atendimento ou dificuldade para escalar vendas e suporte, uma IA de voz pode trazer ganhos importantes de eficiência e receita." },
        { q: "O que diferencia a PitchYes de outras soluções de IA de voz?", a: "A PitchYes combina conversas humanizadas, implantação rápida, fluxos de atendimento personalizados e foco em resultado de negócio, para ampliar a capacidade de conversa da sua empresa em escala." },
      ],
    },
  ],
  [
    "contato",
    {
      kind: "ctaFinal",
      id: "contato",
      menuLabel: "Contato",
      title: "Sua concorrência já está usando IA. O que você está esperando?",
      lead: "Comece agora e veja os primeiros resultados em menos de 7 dias.",
      items: ["Implantação em até 7 dias úteis", "Roteiros personalizados para o seu negócio", "Integração com as suas ferramentas atuais", "Suporte dedicado incluso"],
      button: "Quero conhecer agora",
    },
  ],
];

export const landingModel: LandingDoc = {
  sections: blocks.map(([key]) => ({ key })),
  blocos: Object.fromEntries(blocks),
};

/**
 * Bloco novo pela paleta "Adicionar bloco" do editor: um exemplo pronto de cada tipo, que
 * passa na conferência (lib/content/landing.ts) e já mostra o formato esperado.
 */
export const landingBlockTemplates: Partial<Record<Block["kind"], Block>> = {
  prose: { kind: "prose", title: "Novo bloco de texto", paragraphs: ["Escreva aqui o primeiro parágrafo."] },
  features: { kind: "features", title: "Novo bloco de cards", items: [{ title: "Card", text: "Texto do card." }] },
  steps: { kind: "steps", title: "Como funciona", steps: [{ label: "Passo 1", title: "Etapa", text: "Descrição da etapa." }] },
  stats: { kind: "stats", title: "Números", items: [{ value: "0", label: "Legenda" }] },
  checklist: { kind: "checklist", title: "Novo checklist", items: ["Item"] },
  table: { kind: "table", title: "Nova tabela", columns: ["PitchYes", "Outra opção"], groups: [{ title: "Grupo", rows: [{ label: "Item", values: ["Sim", "Não"] }] }] },
  faq: { kind: "faq", title: "Perguntas frequentes", items: [{ q: "Nova pergunta?", a: "Resposta." }] },
  image: { kind: "image", src: "/images/landing/demonstracao.webp", alt: "Descreva o que a imagem mostra" },
  video: { kind: "video", title: "Novo vídeo", videoId: "BkdjBEooc1o", alt: "Descreva o que o vídeo mostra" },
  funnel: { kind: "funnel", title: "Funil", steps: [{ value: "100", percent: "100%", label: "Etapa" }] },
  testimonials: { kind: "testimonials", title: "Depoimentos", items: [{ quote: "Depoimento.", name: "Nome", role: "Cargo", company: "Empresa" }] },
  logos: { kind: "logos", source: "proprio", title: "Logos", items: [{ name: "Empresa", logo: "/brand/pitchyes-symbol.svg", width: 120, height: 40 }] },
  useCases: { kind: "useCases", title: "Como as empresas usam a PitchYes", items: [{ title: "Caso de uso", text: "O que o agente resolve." }] },
  ctaFinal: { kind: "ctaFinal", title: "Chamada final", items: ["Benefício"], button: "Quero conhecer" },
};
