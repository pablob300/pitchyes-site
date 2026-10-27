import type { PageContent } from "./types";

// Planos e preços da tabela comercial (docs/Planos----5b70aef1-….jpg, out/2026): Blitz
// (pré-pago), Starter, Pro e Enterprise. O Blitz aparece só na escolha de plano — o
// comparativo completo é dos três planos com contrato.
// TODO(comercial): confirmar se R$ 1.249 / 2.449 / 3.997 são valores mensais (a tabela não
// diz o período) e se os grupos "Infraestrutura", "Recursos", "Segurança" e "Suporte" do
// comparativo — herdados da estrutura de referência — valem para os planos novos.
export const planos: PageContent = {
  seoTitle: "Preços de IA de voz: planos por minuto",
  seoDescription:
    "Uma tarifa por minuto que já inclui modelo de linguagem, transcrição, síntese de voz e telefonia. Sem cobrança por token, sem sobretaxa por funcionalidade.",
  eyebrow: "Planos",
  h1: "Planos de IA de voz: um valor por minuto, sem surpresa na fatura.",
  lead: "A tarifa cobre o modelo de linguagem, a transcrição, a síntese de voz e a telefonia. Você não paga por token, não recebe fatura de terceiros e não descobre custo novo ao ligar uma funcionalidade.",
  blocks: [
    {
      kind: "pricing",
      title: "Escolha o plano.",
      lead: "Comece no pré-pago e migre de plano quando o volume justificar. O agente e as integrações continuam os mesmos.",
      note: "Valores em reais. Blitz: R$ 250 referente a 100 minutos (R$ 2,50 por minuto), pago antes do uso. Minutos cobrados pelo tempo real de conversa.",
      plans: [
        {
          name: "Blitz",
          audience: "Pré-pago · pequenas empresas",
          price: "R$ 250",
          priceUnit: "/100 min",
          fee: "R$ 2,50 por minuto · sem contrato, só o termo de aceite",
          features: [
            "Pagamento pré-pago, mínimo de 100 minutos",
            "1 ligação simultânea",
            "1 assistente e 1 cadência simultânea",
            "Material de apoio",
            "Reunião com CS avulsa: R$ 200/h",
            "A cada 1.000 minutos, 1 reunião de CS de brinde",
          ],
          cta: { label: "Começar no pré-pago", href: "/contato" },
        },
        {
          name: "Starter",
          audience: "Pequenas e médias empresas",
          price: "R$ 1.249",
          fee: "Minutos avulsos a R$ 2,00 · mínimo de 100 minutos",
          features: [
            "3 ligações simultâneas",
            "3 assistentes e 1 cadência simultânea",
            "Integração por API aberta ou avulsa (R$ 250/h)",
            "1 reunião com CS · adicionais a R$ 200/h",
            "Número dedicado opcional: R$ 99/mês",
            "A cada 1.000 minutos, 1 reunião de CS de brinde",
            "Material de apoio · pagamento no cartão",
          ],
          cta: { label: "Falar com vendas", href: "/contato" },
        },
        {
          name: "Pro",
          audience: "Médias empresas",
          price: "R$ 2.449",
          fee: "700 minutos a R$ 1,80 por minuto",
          features: [
            "10 ligações simultâneas",
            "Assistentes e cadências ilimitados",
            "Reuniões com CS ilimitadas",
            "Número dedicado com nome e logo",
            "Integração por API aberta ou avulsa (R$ 250/h)",
            "Material de apoio · boleto ou cartão",
          ],
          cta: { label: "Falar com vendas", href: "/contato" },
          highlight: true,
        },
        {
          name: "Enterprise",
          audience: "Grandes empresas",
          price: "R$ 3.997",
          fee: "1.000 minutos a R$ 1,40 por minuto",
          features: [
            "30 ligações simultâneas",
            "Integração inclusa",
            "Assistentes e cadências ilimitados",
            "Reuniões com CS ilimitadas",
            "Número dedicado com nome e logo",
            "Material de apoio · boleto ou cartão",
          ],
          cta: { label: "Falar com vendas", href: "/contato" },
        },
      ],
    },
    {
      kind: "table",
      title: "Comparativo completo.",
      lead: "O que muda entre Starter, Pro e Enterprise, item a item. O Blitz pré-pago fica fora: é a porta de entrada, sem contrato.",
      columns: ["Starter", "Pro", "Enterprise"],
      groups: [
        {
          title: "Plano e minutos",
          rows: [
            { label: "Para quem", values: ["Pequenas e médias empresas", "Médias empresas", "Grandes empresas"] },
            { label: "Valor do plano", values: ["R$ 1.249", "R$ 2.449", "R$ 3.997"] },
            { label: "Minutos", values: ["Avulsos", "700", "1.000"] },
            { label: "Mínimo de minutos", values: ["100", "100", "100"] },
            { label: "Preço do minuto", values: ["R$ 2,00", "R$ 1,80", "R$ 1,40"] },
            { label: "Ligações simultâneas", values: ["3", "10", "30"] },
            { label: "Assistentes", values: ["3", "Ilimitados", "Ilimitados"] },
            { label: "Cadências simultâneas", values: ["1", "Ilimitadas", "Ilimitadas"] },
          ],
        },
        {
          title: "Integração, atendimento e contrato",
          rows: [
            { label: "Integração", values: ["API aberta ou avulsa (R$ 250/h)", "API aberta ou avulsa (R$ 250/h)", "Inclusa"] },
            { label: "Reunião com CS", values: ["1 reunião · adicionais a R$ 200/h", "Ilimitada", "Ilimitada"] },
            { label: "Brinde", values: ["1 reunião de CS a cada 1.000 minutos", "—", "—"] },
            { label: "Material de apoio", values: ["Sim", "Sim", "Sim"] },
            { label: "Número dedicado exclusivo", values: ["Opcional: R$ 99/mês", "Com nome e logo", "Com nome e logo"] },
            { label: "Contrato", values: ["Sim", "Sim", "Sim"] },
            { label: "Pagamento", values: ["Cartão", "Boleto ou cartão", "Boleto ou cartão"] },
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
          a: "No Blitz, não: é pré-pago, com termo de aceite, e você paga só pelos minutos que comprar. Starter, Pro e Enterprise têm contrato; prazo e condições são combinados com o time comercial.",
        },
        {
          q: "O que é o plano Blitz pré-pago?",
          a: "É a porta de entrada para pequenas empresas: R$ 250 por 100 minutos (R$ 2,50 por minuto), pagos antes do uso, com 1 ligação simultânea, 1 assistente e material de apoio. Não inclui integração nem número dedicado; quando o volume crescer, a migração para o Starter mantém o mesmo agente.",
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
