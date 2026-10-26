import type { Metadata } from "next";
import { blogPageParams, listingMetadata, ListingPage, parsePage } from "@/lib/blog/listing";

// Páginas 2+ da listagem do blog.
export const revalidate = 60;
export function generateStaticParams() {
  return blogPageParams();
}

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  return listingMetadata({ kind: "blog" }, parsePage(n));
}

export default async function Page({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  return <ListingPage target={{ kind: "blog" }} page={parsePage(n)} />;
}
