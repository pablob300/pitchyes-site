import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/blog/Breadcrumbs";
import styles from "@/components/blog/Blog.module.css";
import { JsonLd } from "@/components/JsonLd";
import { blogPaths, listCategories, listTags, TAG_INDEX_MIN } from "@/lib/blog";
import { pageDefault } from "@/lib/page-defaults";
import { breadcrumbSchema, pageMetadataWithOverrides, webPageSchema } from "@/lib/seo";

// Índice de categorias e assuntos do blog: a porta de entrada para cada tema.
export const revalidate = 60;

const path = "/blog/categorias";
const trail = [
  { name: "Início", path: "/" },
  { name: "Blog", path: "/blog" },
  { name: "Categorias", path },
];

export async function generateMetadata(): Promise<Metadata> {
  const fallback = pageDefault(path, "Categorias do blog", "");
  return pageMetadataWithOverrides({ title: fallback.title, description: fallback.description, path });
}

export default async function Page() {
  const [categories, tags] = await Promise.all([listCategories(), listTags()]);
  const fallback = pageDefault(path, "Categorias do blog", "");
  const visible = categories.filter((c) => c.count > 0);
  // Só as tags que têm página indexável: as outras continuam acessíveis pelos artigos.
  const strongTags = tags.filter((t) => t.count >= TAG_INDEX_MIN);

  return (
    <>
      <JsonLd graph={[webPageSchema({ title: fallback.title, description: fallback.description, path }), breadcrumbSchema(trail)]} />
      <section className={styles.hero}>
        <div className="container">
          <Breadcrumbs trail={trail} />
          <p className="eyebrow">Blog</p>
          <h1>Categorias do blog</h1>
          <p className={`lead ${styles.heroLead}`}>{fallback.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {visible.length ? (
            <ul className={styles.termList}>
              {visible.map((category) => (
                <li key={category.slug} data-reveal>
                  <Link href={blogPaths.category(category.slug)} className={styles.term}>
                    <h2>{category.name}</h2>
                    {category.description && <p>{category.description}</p>}
                    <span>
                      {category.count} {category.count === 1 ? "artigo" : "artigos"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>Nenhuma categoria com artigos ainda.</p>
          )}

          {strongTags.length > 0 && (
            <>
              <h2 className={styles.tagsTitle}>Assuntos</h2>
              <ul className={styles.tagCloud}>
                {strongTags.map((tag) => (
                  <li key={tag.slug}>
                    <Link href={blogPaths.tag(tag.slug)} className={styles.chip}>
                      {tag.name} <span className={styles.chipCount}>{tag.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}
