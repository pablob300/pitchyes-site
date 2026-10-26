import type { Metadata } from "next";
import { listingMetadata, ListingPage } from "@/lib/blog/listing";

// Página 1 do blog. As seguintes: /blog/pagina/[n].
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return listingMetadata({ kind: "blog" }, 1);
}

export default async function Page() {
  return <ListingPage target={{ kind: "blog" }} page={1} />;
}
