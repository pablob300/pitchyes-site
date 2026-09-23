import "server-only";
import { ADMIN_HOME } from "./config";
import { hmac } from "./crypto";
import { getAdminSecret } from "./db";
import { getSiteUrl } from "@/lib/site";

// Utilidades de pedido para as rotas do painel, na mesma linha do que /api/leads
// já faz (corpo com limite, JSON em try/catch, resposta {ok,...}).

export const MAX_BODY = 16 * 1024;

/**
 * Limite maior, só para o editor de conteúdo: o texto da home sozinho passa de 9 KB, e
 * um documento inteiro com formatação estoura os 16 KB do padrão. Continua sendo uma
 * guarda de memória (o corpo já foi lido), não de transporte.
 */
export const MAX_CONTENT_BODY = 256 * 1024;

export function jsonError(message: string, status: number, extra?: Record<string, unknown>): Response {
  return Response.json({ ok: false, message, ...extra }, { status, headers: { "cache-control": "no-store" } });
}

export function jsonOk(data: Record<string, unknown> = {}): Response {
  return Response.json({ ok: true, ...data }, { headers: { "cache-control": "no-store" } });
}

export async function readJson<T>(request: Request, limit = MAX_BODY): Promise<T | null> {
  const raw = await request.text();
  if (raw.length > limit) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Defesa contra CSRF. O cookie é SameSite=Lax, então um POST de outro site já não
 * leva o cookie; esta é a segunda camada. Aceita a origem do próprio pedido porque
 * o site ainda roda em workers.dev e em preview local, onde o host difere de SITE_URL.
 */
export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin, getSiteUrl().origin]);
  return allowed.has(origin);
}

export async function clientIpHash(request: Request): Promise<string | null> {
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for");
  return ip ? hmac(getAdminSecret(), `ip:${ip.split(",")[0].trim()}`) : null;
}

export async function emailBucket(email: string): Promise<string> {
  return `login:email:${await hmac(getAdminSecret(), `email:${email}`)}`;
}

/**
 * Destino seguro depois do login. Só caminho interno do painel: nada de
 * "//evil.com" nem de URL absoluta, que virariam redirecionamento aberto.
 */
export function safeNext(raw: string | null | undefined): string {
  if (!raw) return ADMIN_HOME;
  if (!raw.startsWith("/admin")) return ADMIN_HOME;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return ADMIN_HOME;
  return /^\/admin(?:\/[A-Za-z0-9\-._~/]*)?(?:\?[^#]*)?$/.test(raw) ? raw : ADMIN_HOME;
}

/** Cookie de sessão e de aparelho compartilham estes atributos. */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
