import type { Metadata } from "next";
import { termParams, listingMetadata, ListingPage, parsePage } from "@/lib/blog/listing";

// Página do autor, páginas 2+.
export const revalidate = 60;
export function generateStaticParams() {
  return termParams("author", true);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }): Promise<Metadata> {
  const { slug, n } = await params;
  return listingMetadata({ kind: "author", slug }, parsePage(n));
}

export default async function Page({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  return <ListingPage target={{ kind: "author", slug }} page={parsePage(n)} />;
}
