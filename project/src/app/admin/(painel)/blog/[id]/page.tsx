import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/blog/editor/PostEditor";
import { requireSession } from "@/lib/admin/session";
import { activeLock, getAdminPost } from "@/lib/blog/admin";
import { editorLookups } from "@/lib/blog/editor-data";
import { pageMetadata } from "@/lib/seo";

// Blog › editar artigo.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({ title: "Editar artigo", description: "Área interna da PitchYes: edição de artigo do blog.", path: "/admin/blog", noindex: true });
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, post, lookups] = await Promise.all([requireSession(), getAdminPost(id), editorLookups()]);
  if (!post) notFound();

  // Outra pessoa com o artigo aberto há menos de 2 minutos? A tela avisa (não bloqueia).
  return <PostEditor post={post} lockedBy={activeLock(post, session.user.id)} {...lookups} />;
}
