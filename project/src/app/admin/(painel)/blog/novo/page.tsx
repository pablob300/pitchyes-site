import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/blog/editor/PostEditor";
import { editorLookups } from "@/lib/blog/editor-data";
import { pageMetadata } from "@/lib/seo";

// Blog › Novo Artigo. O artigo só passa a existir no primeiro "salvar".
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Novo artigo", description: "Área interna da PitchYes: novo artigo do blog.", path: "/admin/blog/novo", noindex: true });
}

export default async function Page() {
  const lookups = await editorLookups();
  return <PostEditor post={null} lockedBy={null} {...lookups} />;
}
