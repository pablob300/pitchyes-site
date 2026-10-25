import { SITE_CONTENT_PATH } from "@/content/site";

// Quais páginas já têm editor visual de conteúdo.
//
// O editor é construído PÁGINA POR PÁGINA: cada uma precisa dos ganchos `data-edit` nos
// componentes e de um schema de campos. Enquanto não tem, o botão "Editar Conteúdo"
// continua desabilitado no Page Editor — e a API recusa o caminho.
//
// Esta lista é a fonte única dos dois lados. Ligar a próxima página é acrescentar o
// caminho aqui, depois de instrumentar os componentes dela.

export const contentEditablePaths: string[] = ["/"];

/** Páginas que o editor abre. O conteúdo global não tem página própria: entra pela home. */
export function isContentEditable(path: string): boolean {
  return contentEditablePaths.includes(path);
}

/** Caminhos que a API aceita gravar — as páginas mais o conteúdo global. */
export function writableContentPaths(): string[] {
  return [...contentEditablePaths, SITE_CONTENT_PATH];
}

/** "/" → "/editor"; "/planos" → "/editor/planos". */
export function editorHref(path: string): string {
  return path === "/" ? "/editor" : `/editor${path}`;
}

/** O inverso: os segmentos da rota do editor viram o caminho da página. */
export function pathFromEditorSegments(segments: string[] | undefined): string {
  if (!segments || segments.length === 0) return "/";
  return `/${segments.join("/")}`;
}
