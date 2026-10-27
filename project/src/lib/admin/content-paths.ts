import "server-only";
import { writableContentPaths } from "@/lib/content/pages";
import { getLandingById, LANDING_CONTENT_PATH } from "@/lib/landing-db";

// Caminhos de conteúdo que a API do editor aceita: as páginas do site (lista fixa, em
// lib/content/pages.ts), o conteúdo global e o de cada landing page que existe ("/_lp/<id>").

/** Id da landing page dona do caminho, ou null se o caminho não for de landing page. */
export function landingIdOf(path: string): string | null {
  return LANDING_CONTENT_PATH.exec(path)?.[1] ?? null;
}

export async function isWritableContentPath(path: string): Promise<boolean> {
  if (writableContentPaths().includes(path)) return true;
  const id = landingIdOf(path);
  return id ? Boolean(await getLandingById(id)) : false;
}
