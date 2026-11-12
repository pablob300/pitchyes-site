// Public URL of the site. Set SITE_URL in the Cloudflare dashboard to switch domains
// (e.g. https://pitchyes.com.br); until then we serve from the workers.dev address.
const DEFAULT_SITE_URL = "https://pitchyes-site.matheus-arantes.workers.dev";

export function getSiteUrl(): URL {
  const raw = process.env.SITE_URL?.trim();
  try {
    return new URL(raw || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

// Search engines only index production on a real domain — never workers.dev or preview.
export function isIndexable(): boolean {
  return (
    process.env.SITE_ENV === "production" &&
    !getSiteUrl().hostname.endsWith(".workers.dev")
  );
}
