import type { Metadata } from "next";
import { PagesEditor, type PageItem } from "@/components/admin/pages/PagesEditor";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { listEditablePages } from "@/lib/admin/pages";
import { pageMetadata } from "@/lib/seo";

// Page Editor: metadados de cada página do site. O blog fica de fora — ele é
// servido pelo WordPress headless, e os metadados de lá são editados lá.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Page Editor",
    description: "Área interna da PitchYes: metadados de cada página do site.",
    path: "/admin/paginas",
    noindex: true,
  });
}

export default async function Page() {
  const items = (await listEditablePages()) as PageItem[];
  const editadas = items.filter((item) => item.edited).length;

  return (
    <>
      <PageHeader
        eyebrow="Page Editor"
        title="Páginas do site"
        description={`${items.length} páginas${editadas ? ` · ${editadas} com metadados editados aqui` : ""}. O blog é editado no WordPress.`}
      />
      <PagesEditor items={items} defaultImage="/opengraph-image.jpg" />
    </>
  );
}
