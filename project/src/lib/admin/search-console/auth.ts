import "server-only";

// Token OAuth do Google para a conta de serviço (Search Console API).
//
// A chave de API do Google (a mesma do PageSpeed) não abre o Search Console: ele exige um
// usuário da propriedade. A conta de serviço é esse usuário — o e-mail dela entra como
// Proprietário em Search Console > Configurações > Usuários e permissões, e o JSON da chave
// fica no segredo GSC_SERVICE_ACCOUNT_JSON do Worker. O JWT é assinado com WebCrypto
// (RS256), sem biblioteca.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters";

export class GscError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type ServiceAccount = { client_email: string; private_key: string };

let cached: { token: string; expiresAt: number; email: string } | null = null;

export function serviceAccount(): ServiceAccount | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
    if (!parsed.client_email || !parsed.private_key) return null;
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  } catch {
    return null;
  }
}

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signingKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

export async function accessToken(): Promise<string> {
  const account = serviceAccount();
  if (!account) {
    throw new GscError("Search Console não configurado: falta o segredo GSC_SERVICE_ACCOUNT_JSON no Worker.", 500);
  }
  if (cached && cached.email === account.client_email && cached.expiresAt - 60_000 > Date.now()) return cached.token;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({ iss: account.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  let signature: string;
  try {
    const key = await signingKey(account.private_key);
    signature = base64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claims}`)));
  } catch (error) {
    console.error("[gsc] chave privada inválida", error);
    throw new GscError("A chave privada da conta de serviço é inválida (confira o JSON em GSC_SERVICE_ACCOUNT_JSON).", 500);
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !data.access_token) {
    console.error("[gsc] token recusado", response.status, data.error_description);
    throw new GscError("O Google recusou a conta de serviço (chave revogada ou projeto sem a Search Console API).", 502);
  }
  cached = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000, email: account.client_email };
  return data.access_token;
}
