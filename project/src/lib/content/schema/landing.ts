import type { LandingDoc } from "@/content/landing/modelo";
import { blockSection, kindLabel, landingBlockFields } from "./inner";
import type { PageSchema, SectionSpec } from "./types";

// Gaveta do editor de uma landing page, gerada a partir dos blocos dela (como nas páginas
// internas), com duas diferenças: a chave de cada bloco é estável ("blocos.<chave>"), e todo
// bloco ganha os campos de landing page (item do menu e botão para o formulário).
// Título e descrição para o Google ficam em "Configurações da página", na lista.
export function buildLandingSchema(path: string, label: string, doc: LandingDoc): PageSchema {
  const sections: SectionSpec[] = doc.sections.flatMap(({ key }, i) => {
    const block = doc.blocos[key];
    if (!block?.kind) return [];
    const name = ("title" in block && block.title) || kindLabel(block.kind);
    const spec = blockSection(block, `blocos.${key}`, `${i + 1}. ${name}`);
    // A chave da seção é a do bloco (a mesma de `sections`): é por ela que a lista de
    // ordem acha o nome e abre a gaveta.
    return [{ ...spec, key, fields: [...spec.fields, ...landingBlockFields] }];
  });
  return { path, label, sections };
}
