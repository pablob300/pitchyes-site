import { carreiras } from "./carreiras";
import { clientes } from "./clientes";
import { clientesCases } from "./clientes-cases";
import { contato } from "./contato";
import { integracoes } from "./integracoes";
import { novidades } from "./novidades";
import { planos } from "./planos";
import { privacidade } from "./privacidade";
import { sobre } from "./sobre";
import { solucoes } from "./solucoes";
import { solucoesAtivo } from "./solucoes-ativo";
import { solucoesPorFuncao } from "./solucoes-por-funcao";
import { solucoesPorSetor } from "./solucoes-por-setor";
import { solucoesReceptivo } from "./solucoes-receptivo";
import { termos } from "./termos";
import type { PageContent } from "./types";

// Páginas internas (modelo PageContent, renderizadas por ContentPage): o texto padrão de
// cada uma, por caminho. É a fonte única do editor visual dessas páginas — o que está aqui
// aparece em /admin/paginas com "Editar Conteúdo" (lib/content/pages.ts).
//
// Página interna nova: crie o arquivo de conteúdo, a rota (que lê com getInnerPageContent)
// e acrescente uma linha aqui.
export const innerPages: Record<string, PageContent> = {
  "/solucoes": solucoes,
  "/solucoes/ativo": solucoesAtivo,
  "/solucoes/receptivo": solucoesReceptivo,
  "/solucoes/por-setor": solucoesPorSetor,
  "/solucoes/por-funcao": solucoesPorFuncao,
  "/clientes": clientes,
  "/clientes/cases": clientesCases,
  "/planos": planos,
  "/recursos/integracoes": integracoes,
  "/recursos/novidades": novidades,
  "/sobre": sobre,
  "/carreiras": carreiras,
  "/contato": contato,
  "/privacidade": privacidade,
  "/termos": termos,
};

export function innerPageDefaults(path: string): PageContent | null {
  return innerPages[path] ?? null;
}
