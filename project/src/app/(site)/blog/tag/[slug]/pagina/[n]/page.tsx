import type { Metadata } from "next";
import { termParams, listingMetadata, ListingPage, parsePage } from "@/lib/blog/listing";

// Tag do blog, páginas 2+.
export const revalidate = 60;
export function generateStaticParams() {
  return termParams("tag", true);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; n: string }> }): Promise<Metadata> {
  const { slug, n } = await params;
  return listingMetadata({ kind: "tag", slug }, parsePage(n));
}

export default async function Page({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n } = await params;
  return <ListingPage target={{ kind: "tag", slug }} page={parsePage(n)} />;
}
