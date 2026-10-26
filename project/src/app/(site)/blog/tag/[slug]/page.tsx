import type { Metadata } from "next";
import { termParams, listingMetadata, ListingPage } from "@/lib/blog/listing";

// Tag do blog (noindex abaixo de TAG_INDEX_MIN artigos).
export const revalidate = 60;
export function generateStaticParams() {
  return termParams("tag", false);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return listingMetadata({ kind: "tag", slug }, 1);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ListingPage target={{ kind: "tag", slug }} page={1} />;
}
