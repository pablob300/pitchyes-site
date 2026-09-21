import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import {
  SESSION_ABSOLUTE_DAYS,
  SESSION_COOKIE,
  SESSION_RENEW_AFTER_HOURS,
  SESSION_TTL_DAYS,
} from "./config";
import { signSessionCookie, readSessionCookie } from "./cookie";
import { hmac, randomToken } from "./crypto";
import { DAY, getAdminSecret, getDb, HOUR, isoIn, nowIso } from "./db";
import { toSessionUser, type AdminUser, type SessionUser } from "./users";

// A autoridade sobre "esta sessão vale?" é aqui, no banco — o proxy só faz a
// checagem barata da assinatura. Nenhuma página ou rota do painel busca dado sem
// passar por `requireSession()`.

export type AdminSession = { id: string; userId: string; deviceId: string | null; user: SessionUser };

type SessionRow = AdminUser & {
  session_id: string;
  session_device: string | null;
  session_expires: string;
  session_created: string;
};

async function sessionId(token: string): Promise<string> {
  return hmac(getAdminSecret(), `sessao:${token}`);
}

export async function createSession({
  userId,
  deviceId,
  ipHash,
  userAgent,
}: {
  userId: string;
  deviceId: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
}): Promise<{ cookieValue: string; maxAge: number }> {
  const db = await getDb();
  const token = randomToken(32);
  const id = await sessionId(token);
  const at = nowIso();
  const expiresAt = isoIn(SESSION_TTL_DAYS * DAY);

  await db
    .prepare(
      `INSERT INTO admin_sessions (id, user_id, device_id, created_at, last_seen_at, expires_at, ip_hash, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, deviceId, at, at, expiresAt, ipHash ?? null, userAgent ?? null)
    .run();

  const expiresSeconds = Math.floor(new Date(expiresAt).getTime() / 1000);
  const cookieValue = await signSessionCookie(getAdminSecret(), {
    token,
    expiresAt: expiresSeconds,
    issuedAt: Math.floor(Date.now() / 1000),
  });
  return { cookieValue, maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 };
}

/**
 * Sessão do pedido atual, conferida no banco. Memoizada pelo `cache()` do React
 * para que layout e página não façam a mesma consulta duas vezes na renderização.
 */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  const parsed = await readSessionCookie(getAdminSecret(), raw);
  if (!parsed) return null;

  const db = await getDb();
  const row = await db
    .prepare(
      `SELECT u.*, s.id AS session_id, s.device_id AS session_device,
              s.expires_at AS session_expires, s.created_at AS session_created
         FROM admin_sessions s
         JOIN admin_users u ON u.id = s.user_id
        WHERE s.id = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'ativo'`,
    )
    .bind(await sessionId(parsed.token), nowIso())
    .first<SessionRow>();
  if (!row) return null;

  // Teto absoluto: depois disso, senha de novo (sem código, se o aparelho é confiável).
  if (Date.now() - new Date(row.session_created).getTime() > SESSION_ABSOLUTE_DAYS * DAY) {
    return null;
  }

  // Renovação em uso. Componente de servidor não escreve cookie — o prazo do cookie
  // é estendido pelo proxy; aqui estendemos a linha do banco.
  const expiresIn = new Date(row.session_expires).getTime() - Date.now();
  if (expiresIn < (SESSION_TTL_DAYS * 24 - SESSION_RENEW_AFTER_HOURS) * HOUR) {
    await db
      .prepare("UPDATE admin_sessions SET last_seen_at = ?, expires_at = ? WHERE id = ?")
      .bind(nowIso(), isoIn(SESSION_TTL_DAYS * DAY), row.session_id)
      .run();
  }

  return {
    id: row.session_id,
    userId: row.id,
    deviceId: row.session_device,
    user: toSessionUser(row),
  };
});

/** Para páginas: manda para a tela de entrar quando não há sessão. */
export async function requireSession(nextPath?: string): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    const target = nextPath ? `/admin/entrar?next=${encodeURIComponent(nextPath)}` : "/admin/entrar";
    redirect(target);
  }
  return session;
}

export async function revokeSession(id: string): Promise<void> {
  const db = await getDb();
  await db.prepare("UPDATE admin_sessions SET revoked_at = ? WHERE id = ?").bind(nowIso(), id).run();
}

export async function revokeAllSessions(userId: string): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE admin_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL")
    .bind(nowIso(), userId)
    .run();
}
