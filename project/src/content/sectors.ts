// Setores atendidos: lista GLOBAL do site (/_site, seção "Setores" do painel), como a de
// clientes. Alimenta /solucoes/por-setor e qualquer bloco de cards com `source: "setores"`;
// publicar a lista em qualquer página muda todas.
//
// Este é o padrão do código: depois da primeira publicação pelo painel, a lista do banco
// substitui esta inteira (lista não mescla, ver lib/content/merge.ts).

export type Sector = {
  title: string;
  text: string;
  /** Card de fechamento, em destaque (ex.: "Mais 20 setores do mercado brasileiro"). */
  highlight?: boolean;
};

export const sectors: Sector[] = [
  {
    title: "Saúde",
    text: "Confirmação e remarcação de consultas, preparo de exames, triagem de pedidos e redução de faltas na agenda. Dados sensíveis tratados com os controles exigidos pelo setor.",
  },
  {
    title: "Seguros",
    text: "Cotação inicial, aviso de sinistro, atualização de status e renovação de apólice, com as declarações obrigatórias registradas na gravação.",
  },
  {
    title: "Serviços financeiros",
    text: "Cobrança e negociação dentro das condições aprovadas, confirmação de transações e atendimento de dúvidas, com confirmação de identidade antes de qualquer informação.",
  },
  {
    title: "Imobiliário",
    text: "Qualificação de interessados, agendamento de visitas, confirmação com o corretor e retomada de contatos antigos da carteira.",
  },
  {
    title: "Energia e utilities",
    text: "Segunda via, leitura, agendamento de visita técnica e comunicação de interrupções, absorvendo picos de volume sem fila.",
  },
  {
    title: "Tecnologia e serviços B2B",
    text: "Resposta imediata a leads, qualificação por critério e confirmação de reuniões para equipes comerciais com meta agressiva.",
  },
  // TODO(comercial): revisar os textos de Automotivo e Provedores de Internet.
  {
    title: "Automotivo",
    text: "Resposta em segundos a quem pediu cotação ou test-drive, agendamento de revisão, confirmação de visitas à loja e retomada de propostas paradas.",
  },
  {
    title: "Provedores de Internet",
    text: "Suporte de primeiro nível, segunda via, aviso de manutenção e oferta de upgrade de plano, absorvendo picos de chamadas sem aumentar a equipe.",
  },
  {
    title: "Mais 20 setores do mercado brasileiro",
    text: "Educação, varejo, logística, franquias e outros: se a operação depende de ligação, o agente aprende o vocabulário e as regras do seu negócio.",
    highlight: true,
  },
];
