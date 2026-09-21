import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Acesso ao D1 e aos segredos do Worker, no mesmo padrão de lib/leads-db.ts.

export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.LEADS_DB;
}

/**
 * Segredo usado para assinar cookies, códigos e hashes de token. Sem ele a área
 * interna não abre — falha fechada, como já era com a senha básica.
 */
export function getAdminSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET não configurado no Worker");
  return secret;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function isoIn(ms: number): string {
  return new Date(Date.now() + ms).toISOString();
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
