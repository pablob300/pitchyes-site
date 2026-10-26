import type { Metadata } from "next";
import { termParams, listingMetadata, ListingPage, parsePage } from "@/lib/blog/listing";

// Categoria do blog, páginas 2+.
export const revalidate = 60;
export function generateStaticParams() {
  return termParams("category", true);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }): Promise<Metadata> {
  const { slug, n } = await params;
  return listingMetadata({ kind: "category", slug }, parsePage(n));
}

export default async function Page({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  return <ListingPage target={{ kind: "category", slug }} page={parsePage(n)} />;
}
