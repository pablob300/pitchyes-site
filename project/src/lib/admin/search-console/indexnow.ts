import "server-only";
import { getSiteUrl } from "@/lib/site";

// IndexNow: avisa Bing, Yandex, Seznam e Naver (e, pelo índice do Bing, o ChatGPT Search e o
// Copilot) que uma URL foi criada, alterada ou apagada. O Google não participa.
// A chave fica no segredo INDEXNOW_KEY e é publicada em /indexnow-key.txt, que é o
// `keyLocation` informado — é assim que o buscador confere que o aviso é do dono do site.

const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS = 10_000;

export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}

export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";

export async function pingIndexNow(urls: string[]): Promise<{ status: number; message: string }> {
  const key = indexNowKey();
  if (!key) return { status: 0, message: "INDEXNOW_KEY não configurado no Worker." };
  const site = getSiteUrl();
  const urlList = [...new Set(urls)].filter((url) => new URL(url).host === site.host).slice(0, MAX_URLS);
  if (!urlList.length) return { status: 0, message: "Nenhuma URL do domínio para avisar." };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: site.host, key, keyLocation: new URL(INDEXNOW_KEY_PATH, site).toString(), urlList }),
      signal: AbortSignal.timeout(20_000),
    });
    // 200 = recebido; 202 = recebido, chave ainda em validação.
    const message =
      response.status === 200 || response.status === 202
        ? `${urlList.length} URL(s) avisada(s).`
        : response.status === 403
          ? "Chave do IndexNow recusada (o arquivo /indexnow-key.txt não confere)."
          : response.status === 422
            ? "IndexNow recusou as URLs (domínio diferente da chave)."
            : response.status === 429
              ? "IndexNow pediu para esperar (avisos demais)."
              : `IndexNow respondeu ${response.status}.`;
    return { status: response.status, message };
  } catch (error) {
    console.error("[indexnow] falha", error);
    return { status: 0, message: "IndexNow não respondeu." };
  }
}
