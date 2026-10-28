// Fonte única dos clientes: a home (slider), /clientes (grade) e as landing pages leem daqui.
// Os logos vêm dos sites e perfis das próprias empresas (outubro de 2026), em
// /public/logos/clientes: SVG quando a empresa publica um, senão WebP sem perdas com a borda
// transparente cortada. Tenda, Grupo Navesa, NewChase e Método 12P só publicam a versão
// branca do logo; aqui o branco foi pintado com a cor da marca (Tenda #E20721, Navesa
// #244E83) ou grafite, para aparecer no fundo claro. Logo novo: mesmo padrão, altura 48 no
// `height` e a largura proporcional.
//
// Esta lista é o PADRÃO: o painel pode sobrescrever (conteúdo global "/_site", seção
// "Clientes (logos)").

export type Client = {
  name: string;
  /** SVG ou WebP em /public/logos/clientes, com fundo transparente. */
  logo: string;
  width: number;
  height: number;
};

export const clients: Client[] = [
  { name: "Senior Sistemas", logo: "/logos/clientes/senior-sistemas.svg", width: 151, height: 48 },
  { name: "OPEN Datacenter", logo: "/logos/clientes/open-datacenter-v2.svg", width: 73, height: 48 },
  { name: "Autoglass", logo: "/logos/clientes/autoglass.svg", width: 104, height: 48 },
  { name: "Tenda", logo: "/logos/clientes/tenda.webp", width: 200, height: 48 },
  { name: "Thomson Reuters", logo: "/logos/clientes/thomson-reuters.svg", width: 338, height: 48 },
  { name: "Moura Dubeux", logo: "/logos/clientes/moura-dubeux.svg", width: 87, height: 48 },
  { name: "Método 12P", logo: "/logos/clientes/metodo-12p.webp", width: 115, height: 48 },
  { name: "Prospecta Global", logo: "/logos/clientes/prospecta-global-v2.webp", width: 43, height: 48 },
  { name: "Grupo NewChase", logo: "/logos/clientes/grupo-newchase.webp", width: 140, height: 48 },
  { name: "Vantage Energia", logo: "/logos/clientes/vantage-energia.webp", width: 218, height: 48 },
  { name: "RE/MAX", logo: "/logos/clientes/remax.svg", width: 175, height: 48 },
  { name: "Grupo Navesa", logo: "/logos/clientes/grupo-navesa.webp", width: 200, height: 48 },
  { name: "Laboratório Duarte", logo: "/logos/clientes/laboratorio-duarte.svg", width: 167, height: 48 },
];
