// Formato do cookie de sessão, definido num lugar só porque duas partes o leem:
// o proxy (checagem barata da assinatura) e as rotas de API (checagem no banco).
//
//   v1.<token>.<expira>.<emitido>.<assinatura>
//
// O token é o segredo; a assinatura permite ao proxy rejeitar cookie forjado sem
// consultar o banco. Ela NÃO prova que a sessão continua válida — quem diz isso é
// o banco, em `session.ts`. Essa distinção é o que impede alguém de "otimizar"
// depois confiando só no proxy.

import { hmac, timingSafeEqual } from "./crypto";

export type SessionCookie = { token: string; expiresAt: number; issuedAt: number };

const VERSION = "v1";

function payload(token: string, expiresAt: number, issuedAt: number): string {
  return `${VERSION}.${token}.${expiresAt}.${issuedAt}`;
}

export async function signSessionCookie(secret: string, value: SessionCookie): Promise<string> {
  const body = payload(value.token, value.expiresAt, value.issuedAt);
  return `${body}.${await hmac(secret, body)}`;
}

/** Devolve null para cookie malformado, assinatura inválida ou prazo vencido. */
export async function readSessionCookie(secret: string, raw: string | undefined): Promise<SessionCookie | null> {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 5) return null;
  const [version, token, expiresRaw, issuedRaw, signature] = parts;
  if (version !== VERSION || !token) return null;

  const expiresAt = Number(expiresRaw);
  const issuedAt = Number(issuedRaw);
  if (!Number.isFinite(expiresAt) || !Number.isFinite(issuedAt)) return null;

  const expected = await hmac(secret, payload(token, expiresAt, issuedAt));
  if (!timingSafeEqual(expected, signature)) return null;
  if (expiresAt * 1000 <= Date.now()) return null;

  return { token, expiresAt, issuedAt };
}

/** Lê um cookie do cabeçalho bruto — usado onde não há helper do Next. */
export function readRawCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

// --- Cookie de login pendente ------------------------------------------------
// Liga o passo da senha ao passo do código sem guardar estado no servidor: leva
// só o id do usuário, assinado e com prazo curto.

const PENDING_VERSION = "p1";

export async function signPending(secret: string, userId: string, expiresAt: number): Promise<string> {
  const body = `${PENDING_VERSION}.${userId}.${expiresAt}`;
  return `${body}.${await hmac(secret, body)}`;
}

export async function readPending(secret: string, raw: string | undefined): Promise<string | null> {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [version, userId, expiresRaw, signature] = parts;
  if (version !== PENDING_VERSION || !userId) return null;
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt * 1000 <= Date.now()) return null;
  const expected = await hmac(secret, `${PENDING_VERSION}.${userId}.${expiresAt}`);
  return timingSafeEqual(expected, signature) ? userId : null;
}
