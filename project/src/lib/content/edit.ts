// Ganchos que o editor visual usa para saber onde cada campo está na tela.
//
// REGRA INEGOCIÁVEL: o modo editor só acrescenta ATRIBUTO, nunca elemento. Nada de
// `{editable && <button/>}` dentro de um componente de seção — no instante em que o
// editor renderizar um nó a mais, o HTML público e o do editor divergem, e um dia a
// moldura do editor vai para o ar. Contornos, alças e botões moram no painel, em
// sobreposições calculadas a partir do getBoundingClientRect() dos nós [data-edit].
//
// Consequência prática: no site público `edit()` devolve um objeto vazio, então o HTML
// não ganha um único byte. Isso é conferido com `curl -s <home> | wc -c`.

/** Recebe o ponteiro do campo ("hero.lead", "faq.items.3.q") e devolve o que espalhar no JSX. */
export type EditFn = (pointer: string) => Record<string, string>;

/** Site público: nenhum atributo extra. */
export const noEdit: EditFn = () => ({});

const markEdit: EditFn = (pointer) => ({ "data-edit": pointer });

export function editFn(editable: boolean | undefined): EditFn {
  return editable ? markEdit : noEdit;
}

/** Prefixa um ponteiro, para uma seção não precisar repetir o próprio nome. */
export function scoped(edit: EditFn, prefix: string): EditFn {
  return (pointer) => edit(pointer ? `${prefix}.${pointer}` : prefix);
}
