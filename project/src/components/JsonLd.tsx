// Structured data for Google and AI crawlers. One @graph per page keeps the entities
// (Organization, WebSite, WebPage, BreadcrumbList…) linked by @id.
export function JsonLd({ graph }: { graph: Record<string, unknown>[] }) {
  const data = { "@context": "https://schema.org", "@graph": graph };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
