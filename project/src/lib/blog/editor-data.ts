import "server-only";
import { getSiteUrl } from "@/lib/site";
import { listAdminAuthors, listTerms } from "./admin";

// Dados que a tela do editor precisa além do artigo: listas para os campos da barra lateral.
export async function editorLookups() {
  const [categories, tags, authors] = await Promise.all([listTerms("categoria"), listTerms("tag"), listAdminAuthors()]);
  return {
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    allTags: tags.map((t) => t.name),
    authors: authors.map((a) => {
      let sameAs: string[] = [];
      try {
        sameAs = a.same_as ? (JSON.parse(a.same_as) as string[]) : [];
      } catch {
        sameAs = [];
      }
      return { id: a.id, name: a.name, role: a.role, bio: a.bio, sameAs };
    }),
    host: getSiteUrl().host,
  };
}
