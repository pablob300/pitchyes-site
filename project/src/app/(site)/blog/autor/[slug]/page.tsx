import type { Metadata } from "next";
import { termParams, listingMetadata, ListingPage } from "@/lib/blog/listing";

// Página do autor (ProfilePage + Person: E-E-A-T).
export const revalidate = 60;
export function generateStaticParams() {
  return termParams("author", false);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return listingMetadata({ kind: "author", slug }, 1);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ListingPage target={{ kind: "author", slug }} page={1} />;
}
