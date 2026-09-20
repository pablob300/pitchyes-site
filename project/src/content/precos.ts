import type { PageContent } from "./types";

// Estrutura de planos e tabela espelhando bland.ai/pricing, com valores em reais.
// TODO(comercial): validar os valores antes da publicação no domínio definitivo —
// são conversões de referência, não uma tabela aprovada.
export const precos: PageContent = {
  seoTitle: "Preços e planos",
  seoDescription:
    "Uma tarifa por minuto que já inclui modelo de linguagem, transcrição, síntese de voz e telefonia. Sem cobrança por token, sem sobretaxa por funcionalidade.",
  eyebrow: "Preços",
  h1: "Um valor por minuto. Sem surpresa na fatura.",
  lead: "A tarifa cobre o modelo de linguagem, a transcrição, a síntese de voz e a telefonia. Você não paga por token, não recebe fatura de terceiros e não descobre custo novo ao ligar uma funcionalidade.",
  blocks: [
    {
      kind: "pricing",
      title: "Escolha pelo tamanho da operação.",
      lead: "Comece testando e migre de plano quando o volume justificar. O agente e as integrações continuam os mesmos.",
      note: "Valores em reais, sem impostos. Minutos são cobrados pelo tempo real de conversa. Transferência para humano é cobrada à parte, por minuto transferido.",
      plans: [
        {
          name: "Start",
          audience: "Para desenvolvedores",
          price: "R$ 0,79",
          priceUnit: "/min",
          fee: "Sem mensalidade de plataforma",
          features: [
            "R$ 0,28 por minuto de transferência",
            "10 ligações simultâneas",
            "100 ligações por dia",
            "10 bases de conhecimento",
            "Créditos iniciais para teste, sem cartão",
            "Um número de entrada incluso",
          ],
          cta: { label: "Começar a testar", href: "/contato" },
        },
        {
          name: "Build",
          audience: "Para times",
          price: "R$ 0,69",
          priceUnit: "/min",
          fee: "R$ 1.590/mês de plataforma",
          features: [
            "R$ 0,22 por minuto de transferência",
            "50 ligações simultâneas",
            "2.000 ligações por dia",
            "50 bases de conhecimento",
            "WhatsApp, SMS e chat do site",
            "Monitoramento e avaliação de ligações",
          ],
          cta: { label: "Falar com vendas", href: "/contato" },
          highlight: true,
        },
        {
          name: "Enterprise",
          audience: "Para organizações",
          price: "Sob consulta",
          fee: "Contratado por volume",
          features: [
            "Simultaneidade sob medida",
            "Implantação dedicada ou em nuvem privada",
            "Engenharia dedicada na implantação",
            "BAA, SSO e residência de dados",
            "SLA e fila de prioridade",
            "Canal direto com o time de engenharia",
          ],
          cta: { label: "Falar com vendas", href: "/contato" },
        },
      ],
    },
    {
      kind: "table",
      title: "Comparativo completo.",
      lead: "O que muda de um plano para o outro, item a item.",
      columns: ["Start", "Build", "Enterprise"],
      groups: [
        {
          title: "Uso e escala",
          rows: [
            { label: "Minuto de conversa", values: ["R$ 0,79", "R$ 0,69", "Sob consulta"] },
            { label: "Minuto de transferência", values: ["R$ 0,28", "R$ 0,22", "Sob consulta"] },
            { label: "Mensalidade de plataforma", values: ["R$ 0", "R$ 1.590", "Contratada"] },
            { label: "Ligações simultâneas", values: ["10", "50", "Sob medida"] },
            { label: "Ligações por dia", values: ["100", "2.000", "Sem limite fixo"] },
            { label: "Bases de conhecimento", values: ["10", "50", "Sem limite fixo"] },
          ],
        },
        {
          title: "Infraestrutura e confiabilidade",
          rows: [
            { label: "Disponibilidade (SLA)", values: ["99,9%", "99,9%", "99,9% com contrato"] },
            { label: "Trava de versão do agente", values: ["—", "Sim", "Sim"] },
            { label: "Servidores dedicados", values: ["—", "—", "Sim"] },
            { label: "Fila de prioridade", values: ["—", "—", "Sim"] },
            { label: "Implantação em nuvem privada", values: ["—", "—", "Sim"] },
            { label: "Voz personalizada", values: ["—", "Opcional", "Sim"] },
          ],
        },
        {
          title: "Recursos principais",
          rows: [
            { label: "Integrações com CRM, agenda e telefonia", values: ["Sim", "Sim", "Sim"] },
            { label: "Fluxos de conversa", values: ["Sim", "Sim", "Sim"] },
            { label: "Testes de cenário antes de ir ao ar", values: ["Sim", "Sim", "Sim"] },
            { label: "WhatsApp, SMS e chat do site", values: ["—", "Sim", "Sim"] },
            { label: "Memória unificada entre canais", values: ["—", "Sim", "Sim"] },
          ],
        },
        {
          title: "Recursos avançados",
          rows: [
            { label: "Transferência com contexto para humano", values: ["Sim", "Sim", "Sim"] },
            { label: "Regras de proteção do roteiro", values: ["Básicas", "Completas", "Completas"] },
            { label: "Monitoramento em tempo real", values: ["—", "Sim", "Sim"] },
            { label: "Avaliação automática de ligações", values: ["—", "Sim", "Sim"] },
            { label: "Detecção de lacunas na base de conhecimento", values: ["—", "Sim", "Sim"] },
          ],
        },
        {
          title: "Segurança e conformidade",
          rows: [
            { label: "Criptografia em repouso e em trânsito", values: ["Sim", "Sim", "Sim"] },
            { label: "Conformidade com a LGPD", values: ["Sim", "Sim", "Sim"] },
            { label: "Trilha de auditoria por ligação", values: ["Sim", "Sim", "Sim"] },
            { label: "BAA (dados de saúde)", values: ["—", "—", "Sim"] },
            { label: "SSO e acesso por função", values: ["—", "Opcional", "Sim"] },
            { label: "Residência de dados", values: ["—", "—", "Sim"] },
          ],
        },
        {
          title: "Suporte",
          rows: [
            { label: "Documentação e e-mail", values: ["Sim", "Sim", "Sim"] },
            { label: "Canal dedicado com o time", values: ["—", "Sim", "Sim"] },
            { label: "Engenharia dedicada na implantação", values: ["—", "—", "Sim"] },
          ],
        },
      ],
    },
    {
      kind: "faq",
      title: "Perguntas frequentes sobre preço.",
      items: [
        {
          q: "Como funciona a cobrança por minuto?",
          a: "Uma única tarifa por minuto cobre o modelo de linguagem, a transcrição de voz, a síntese de voz e a telefonia. Não há cobrança por token, sobretaxa por funcionalidade nem faturas separadas de fornecedores. O valor acompanha o uso.",
        },
        {
          q: "Posso usar minha própria telefonia?",
          a: "Sim. A PitchYes funciona com a sua conta de telefonia atual ou com tronco SIP de qualquer operadora. Quem usa a própria operadora não paga a telefonia embutida na tarifa.",
        },
        {
          q: "Como a PitchYes se compara a plataformas que cobram por componente?",
          a: "Plataformas que cobram só pela orquestração deixam de fora o modelo de linguagem, a transcrição, a síntese de voz e a telefonia, que chegam em faturas separadas. Aqui esses custos já estão na tarifa por minuto, o que torna a previsão de gasto mais simples.",
        },
        {
          q: "Existe compromisso de permanência?",
          a: "Nos planos Start e Build, não: o uso é medido mês a mês. Contratos Enterprise são negociados por volume, com condições e SLA definidos em conjunto.",
        },
        {
          q: "Em quanto tempo a operação começa a rodar?",
          a: "A maioria dos agentes entra em produção em cerca de sete dias. Operações com muitas integrações ou regras de compliance podem levar de duas a seis semanas.",
        },
      ],
    },
    {
      kind: "links",
      title: "Continue por aqui.",
      items: [
        { title: "Soluções", text: "O que o agente faz em ligações ativas e receptivas.", href: "/solucoes" },
        { title: "Integrações", text: "Telefonia, CRM, agenda e mensageria conectados ao agente.", href: "/recursos/integracoes" },
      ],
    },
  ],
};
