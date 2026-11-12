import "server-only";
import { getSiteUrl } from "@/lib/site";
import { accessToken, GscError } from "./auth";

// Chamadas à Search Console API: reenviar sitemap, listar os sitemaps que o Google conhece
// e inspecionar uma URL (status de indexação e último rastreamento).
//
// Não existe API pública para "solicitar indexação" de página comum — a Indexing API do
// Google só vale para vagas de emprego e transmissões ao vivo. O pedido manual continua no
// próprio Search Console (inspectLink abre a página já inspecionada).

const WEBMASTERS = "https://www.googleapis.com/webmasters/v3";
const INSPECT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const TIMEOUT_MS = 30_000;

/** Propriedade do Search Console (prefixo de URL). GSC_SITE_URL troca, se precisar. */
export function gscProperty(): string {
  const raw = process.env.GSC_SITE_URL?.trim();
  return raw || `${getSiteUrl().origin}/`;
}

function friendlyError(status: number, message: string): string {
  if (status === 403) {
    return "A conta de serviço não tem permissão na propriedade. Adicione o e-mail dela como Proprietário no Search Console.";
  }
  if (status === 404) return "Propriedade não encontrada no Search Console (confira GSC_SITE_URL).";
  if (status === 429) return "Cota do Search Console esgotada no momento. Tente de novo mais tarde.";
  if (/has not been used|is disabled/i.test(message)) return "A Search Console API está desligada no projeto do Google Cloud.";
  return `O Search Console respondeu com erro (${status}).`;
}

async function call<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init.headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error("[gsc] falha na chamada", url, error);
    throw new GscError("O Search Console demorou demais para responder.", 504);
  }
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T & { error?: { message?: string } }) : ({} as T & { error?: { message?: string } });
  if (!response.ok) {
    const message = data.error?.message ?? "";
    console.error("[gsc] erro da API", response.status, message);
    throw new GscError(friendlyError(response.status, message), response.status === 429 ? 429 : 502);
  }
  return data;
}

const site = () => encodeURIComponent(gscProperty());

/** Reenvia um sitemap (URL absoluta). O Google responde 204 sem corpo. */
export async function submitSitemap(sitemapUrl: string): Promise<void> {
  await call(`${WEBMASTERS}/sites/${site()}/sitemaps/${encodeURIComponent(sitemapUrl)}`, { method: "PUT" });
}

export type GscSitemap = {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  warnings?: string;
  errors?: string;
  contents?: { type: string; submitted?: string; indexed?: string }[];
};

export async function listSitemaps(): Promise<GscSitemap[]> {
  const data = await call<{ sitemap?: GscSitemap[] }>(`${WEBMASTERS}/sites/${site()}/sitemaps`);
  return data.sitemap ?? [];
}

export type IndexStatus = {
  verdict?: string;
  coverageState?: string;
  robotsTxtState?: string;
  indexingState?: string;
  lastCrawlTime?: string;
  pageFetchState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  crawledAs?: string;
};

export async function inspectUrl(url: string): Promise<IndexStatus> {
  const data = await call<{ inspectionResult?: { indexStatusResult?: IndexStatus } }>(INSPECT, {
    method: "POST",
    body: JSON.stringify({ inspectionUrl: url, siteUrl: gscProperty(), languageCode: "pt-BR" }),
  });
  return data.inspectionResult?.indexStatusResult ?? {};
}

/** Abre a Inspeção de URL do Search Console já na página — lá fica o "Solicitar indexação". */
export function inspectLink(url: string): string {
  const query = new URLSearchParams({ resource_id: gscProperty(), id: url });
  return `https://search.google.com/search-console/inspect?${query}`;
}
