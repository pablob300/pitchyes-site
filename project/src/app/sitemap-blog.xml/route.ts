import { urlsetResponse } from "@/lib/sitemap";
import { blogEntries } from "@/lib/sitemap-entries";

// Tudo do blog que é indexável (regras em lib/sitemap-entries.ts).
export const revalidate = 300;

export async function GET() {
  return urlsetResponse(await blogEntries());
}
