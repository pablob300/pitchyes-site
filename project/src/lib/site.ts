// Public URL of the site. Set SITE_URL in the Cloudflare dashboard to switch domains
// (e.g. https://pitchyes.com.br); until then we serve from the workers.dev address.
const DEFAULT_SITE_URL = "https://pitchyes-site.borges-filho.workers.dev";

export function getSiteUrl(): URL {
  const raw = process.env.SITE_URL?.trim();
  try {
    return new URL(raw || DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

/**
 * TEMPORÁRIO (21/09/2026, a pedido do time): com ROBOTS_MODE=teste o site libera
 * rastreamento e indexação mesmo no endereço de homologação, para testar Search
 * Console e os robôs de IA antes do domínio definitivo.
 *
 * RISCO ASSUMIDO: o endereço workers.dev pode entrar no índice do Google e depois
 * competir com pitchyes.com.br — tirar do índice dá trabalho. Voltar ao padrão é
 * mudar a variável para "padrao" no painel da Cloudflare (vale na hora, sem deploy).
 */
export function isTestCrawlMode(): boolean {
  return process.env.ROBOTS_MODE?.trim() === "teste";
}

// Search engines only index production on a real domain — never workers.dev or preview.
export function isIndexable(): boolean {
  if (isTestCrawlMode()) return true;
  return (
    process.env.SITE_ENV === "production" &&
    !getSiteUrl().hostname.endsWith(".workers.dev")
  );
}
