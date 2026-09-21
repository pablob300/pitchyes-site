// Fonte única dos clientes: a home (slider) e /clientes (grade) leem daqui.
// TODO(marca): as imagens em /public/logos são de MARCAÇÃO, geradas por código, só para
// validar o comportamento (cinza que ganha cor no hover). Substituir pelos arquivos reais
// das marcas — mesmo nome de arquivo, proporção parecida (260x80) e fundo transparente.

export type Client = {
  name: string;
  /** SVG em /public/logos, com fundo transparente. */
  logo: string;
  width: number;
  height: number;
};

export const clients: Client[] = [
  { name: "Sofia Energia", logo: "/logos/sofia-energia.svg", width: 250, height: 48 },
  { name: "Vantage Energia", logo: "/logos/vantage-energia.svg", width: 279, height: 48 },
  { name: "MaxNet", logo: "/logos/maxnet.svg", width: 158, height: 48 },
  { name: "Plaza", logo: "/logos/plaza.svg", width: 142, height: 48 },
  { name: "Grupo Hellu's Prime", logo: "/logos/grupo-hellu-s-prime.svg", width: 302, height: 48 },
  { name: "OPEN Datacenter", logo: "/logos/open-datacenter.svg", width: 279, height: 48 },
  { name: "Employability", logo: "/logos/employability.svg", width: 250, height: 48 },
  { name: "Senior Sistemas", logo: "/logos/senior-sistemas.svg", width: 279, height: 48 },
  { name: "Prospecta Global", logo: "/logos/prospecta-global.svg", width: 294, height: 48 },
  { name: "Método 12P", logo: "/logos/metodo-12p.svg", width: 225, height: 48 },
  { name: "MidHaus", logo: "/logos/midhaus.svg", width: 175, height: 48 },
  { name: "Cooperativa Uirapuru", logo: "/logos/cooperativa-uirapuru.svg", width: 314, height: 48 },
];
