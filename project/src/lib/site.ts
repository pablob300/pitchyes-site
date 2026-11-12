// Public URL of the site. Set SITE_URL in the Cloudflare dashboard to switch domains
// (e.g. a staging host); the default is the production domain.
const DEFAULT_SITE_URL = "https://pitchyes.com.br";

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
