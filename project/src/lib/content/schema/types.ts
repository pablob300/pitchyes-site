// Descrição dos campos editáveis de uma página.
//
// A gaveta lateral do editor é GERADA a partir daqui — não existe formulário escrito à
// mão por seção. É isto que faz a máquina escalar: ligar a próxima página é escrever o
// schema dela e espalhar os `data-edit` nos componentes, sem UI nova.

export type FieldType =
  /** Uma linha. */
  | "texto"
  /** Várias linhas, com **negrito**, *itálico* e [link](/caminho). */
  | "paragrafo"
  | "numero"
  /** Caminho de imagem (/public ou /midia), com envio de arquivo. */
  | "imagem"
  /** AAAA-MM-DD. */
  | "data"
  | "booleano"
  /** Várias linhas, texto puro (sem marcação) — páginas internas. */
  | "multilinha"
  /** Lista de textos, um por linha (parágrafos, itens de checklist, recursos de um plano). */
  | "linhas"
  /** Linhas de tabela: "Rótulo | valor 1 | valor 2". */
  | "tabela";

export type Field = {
  /** Ponteiro relativo à seção ("lead") ou ao item da lista ("controlTitle"). */
  pointer: string;
  label: string;
  type: FieldType;
  help?: string;
  /** Tamanho a partir do qual a gaveta avisa. Aviso, não trava. */
  max?: number;
  /** Campo que pode ficar vazio. Sem isto, a gaveta cobra preenchimento. */
  optional?: boolean;
  /** Proporção esperada da imagem (largura/altura), conferida no envio. */
  aspect?: number;
  /** Explica por que o campo não pode ser editado aqui. */
  readOnlyReason?: string;
};

export type ListSpec = {
  /** Ponteiro da lista, a partir da raiz da página ("faq.items"). */
  pointer: string;
  label: string;
  /** Campo de cada item usado como título na lista da gaveta. */
  titleField: string;
  fields: Field[];
  /** Item novo nasce com isto. */
  template: Record<string, unknown>;
  min?: number;
  max?: number;
  /**
   * Lista de tamanho fixo: dá para trocar o texto, não para adicionar nem remover.
   * É o caso das pilastras da Plataforma, que têm ilustração própria em JSX.
   */
  fixed?: boolean;
  help?: string;
};

export type SectionSpec = {
  key: string;
  label: string;
  /** Onde o conteúdo é gravado: a página, ou "/_site" quando aparece em todas elas. */
  scope: "pagina" | "site";
  /** Prefixo do ponteiro na gravação (vazio para o conteúdo global de primeiro nível). */
  prefix: string;
  fields: Field[];
  lists?: ListSpec[];
  note?: string;
  /** Seção que não pode ser ocultada nem reordenada, e o motivo. */
  lockedReason?: string;
};

export type PageSchema = {
  path: string;
  label: string;
  sections: SectionSpec[];
};
