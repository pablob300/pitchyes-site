import { carreiras } from "@/content/carreiras";
import { clientes } from "@/content/clientes";
import { clientesCases } from "@/content/clientes-cases";
import { contato } from "@/content/contato";
import { integracoes } from "@/content/integracoes";
import { novidades } from "@/content/novidades";
import { planos } from "@/content/planos";
import { privacidade } from "@/content/privacidade";
import { sobre } from "@/content/sobre";
import { solucoes } from "@/content/solucoes";
import { solucoesAtivo } from "@/content/solucoes-ativo";
import { solucoesPorFuncao } from "@/content/solucoes-por-funcao";
import { solucoesPorSetor } from "@/content/solucoes-por-setor";
import { solucoesReceptivo } from "@/content/solucoes-receptivo";
import { termos } from "@/content/termos";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "./seo";

// Título e descrição que cada página mostra quando NADA foi editado no painel.
//
// Cuidado com a tentação de usar lib/routes.ts aqui: o título de lá é o nome curto
// do menu ("Planos"), enquanto a página serve o título de SEO do arquivo de conteúdo
// ("Planos e preços"). Se o Page Editor mostrasse o do menu como padrão, "Restaurar
// padrão" trocaria o título que está no ar. Por isso esta tabela vem dos mesmos
// dados que as páginas usam.

export type PageDefault = { title: string; description: string };

const byPath: Record<string, PageDefault> = {
  // A home é a única cujo título é o próprio nome do site, sem o sufixo.
  "/": { title: `${SITE_NAME} — ${SITE_TAGLINE}`, description: SITE_DESCRIPTION },
  "/solucoes": { title: solucoes.seoTitle, description: solucoes.seoDescription },
  "/solucoes/ativo": { title: solucoesAtivo.seoTitle, description: solucoesAtivo.seoDescription },
  "/solucoes/receptivo": { title: solucoesReceptivo.seoTitle, description: solucoesReceptivo.seoDescription },
  "/solucoes/por-setor": { title: solucoesPorSetor.seoTitle, description: solucoesPorSetor.seoDescription },
  "/solucoes/por-funcao": { title: solucoesPorFuncao.seoTitle, description: solucoesPorFuncao.seoDescription },
  "/clientes": { title: clientes.seoTitle, description: clientes.seoDescription },
  "/clientes/cases": { title: clientesCases.seoTitle, description: clientesCases.seoDescription },
  "/planos": { title: planos.seoTitle, description: planos.seoDescription },
  "/recursos/integracoes": { title: integracoes.seoTitle, description: integracoes.seoDescription },
  "/recursos/novidades": { title: novidades.seoTitle, description: novidades.seoDescription },
  "/sobre": { title: sobre.seoTitle, description: sobre.seoDescription },
  "/carreiras": { title: carreiras.seoTitle, description: carreiras.seoDescription },
  "/contato": { title: contato.seoTitle, description: contato.seoDescription },
  "/privacidade": { title: privacidade.seoTitle, description: privacidade.seoDescription },
  "/termos": { title: termos.seoTitle, description: termos.seoDescription },
  // Blog: o texto das listagens mora em lib/blog/listing.tsx; aqui só o padrão de SEO.
  "/blog": {
    title: "Blog sobre IA de voz, vendas e atendimento",
    description:
      "Artigos sobre IA de voz, prospecção, atendimento e gestão comercial: como empresas usam ligações automatizadas para vender mais e atender na hora.",
  },
  "/blog/categorias": {
    title: "Categorias do blog",
    description:
      "Todos os temas do blog da PitchYes: prospecção e vendas, atendimento, IA de voz e gestão comercial, com os artigos de cada assunto reunidos.",
  },
};

/** Padrão da página; cai para os valores de routes.ts em endereço sem conteúdo próprio. */
export function pageDefault(path: string, routeTitle: string, routeDescription: string): PageDefault {
  return byPath[path] ?? { title: routeTitle, description: routeDescription };
}

export const pageDefaults = byPath;
