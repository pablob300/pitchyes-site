import { urlsetResponse } from "@/lib/sitemap";
import { landingEntries } from "@/lib/sitemap-entries";

export const dynamic = "force-dynamic";

// Landing pages (/conteudo/<slug>): só as ativas e sem noindex. A data de revisão é a da
// última publicação do conteúdo ou mudança no painel.
export async function GET() {
  return urlsetResponse(await landingEntries());
}
