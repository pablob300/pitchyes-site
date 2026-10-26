import type { Metadata } from "next";
import { termParams, listingMetadata, ListingPage } from "@/lib/blog/listing";

// Categoria do blog (página 1). Categoria renomeada ou fundida: 301 via blog_redirects.
export const revalidate = 60;
export function generateStaticParams() {
  return termParams("category", false);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return listingMetadata({ kind: "category", slug }, 1);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ListingPage target={{ kind: "category", slug }} page={1} />;
}
