import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeadline } from "@/components/PageHeadline";
import { getPage, pages } from "@/lib/routes";
import styles from "./page.module.css";

// Placeholder for every inner page that doesn't have its own route file yet.
// To build a page for real: create app/<path>/page.tsx and set placeholder: false in lib/routes.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return pages
    .filter((p) => p.placeholder)
    .map((p) => ({ slug: p.path.slice(1).split("/") }));
}

async function resolve(params: PageProps<"/[...slug]">["params"]) {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  const page = getPage(path);
  if (!page) notFound();
  const parent = slug.length > 1 ? getPage(`/${slug[0]}`) : undefined;
  return { page, parent };
}

export async function generateMetadata({ params }: PageProps<"/[...slug]">): Promise<Metadata> {
  const { page } = await resolve(params);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    // Empty placeholder pages stay out of search results until they get content.
    robots: { index: false, follow: true },
  };
}

export default async function PlaceholderPage({ params }: PageProps<"/[...slug]">) {
  const { page, parent } = await resolve(params);
  return (
    <>
      <PageHeadline eyebrow={parent?.title} title={page.title} description={page.description} />
      <section className="section">
        <div className={`container ${styles.soon}`}>
          <p data-reveal>Conteúdo desta página em construção.</p>
        </div>
      </section>
    </>
  );
}
