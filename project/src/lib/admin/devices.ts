import "server-only";
import { DEVICE_TRUST_DAYS } from "./config";
import { hmac } from "./crypto";
import { DAY, getAdminSecret, getDb, newId, nowIso } from "./db";

// "Aparelho" aqui é o cookie py_dispositivo: navegador nenhum entrega identificador
// de máquina, e impressão digital de navegador é frágil e invasiva. Consequência
// assumida: janela anônima, outro navegador ou cookie apagado = aparelho novo.

export type AdminDevice = {
  id: string;
  user_id: string;
  label: string;
  created_at: string;
  trusted_at: string | null;
  last_seen_at: string | null;
  revoked_at: string | null;
};

/** Rótulo legível a partir do user-agent — só para a pessoa se reconhecer na lista. */
export function labelFromUserAgent(ua: string | null | undefined): string {
  const value = ua ?? "";
  const browser = /Edg\//.test(value)
    ? "Edge"
    : /OPR\//.test(value)
      ? "Opera"
      : /Chrome\//.test(value)
        ? "Chrome"
        : /Firefox\//.test(value)
          ? "Firefox"
          : /Safari\//.test(value)
            ? "Safari"
            : "Navegador";
  const system = /iPhone/.test(value)
    ? "iPhone"
    : /iPad/.test(value)
      ? "iPad"
      : /Android/.test(value)
        ? "Android"
        : /Windows/.test(value)
          ? "Windows"
          : /Mac OS X|Macintosh/.test(value)
            ? "Mac"
            : /Linux/.test(value)
              ? "Linux"
              : "sistema desconhecido";
  return `${browser} no ${system}`;
}

export async function deviceTokenHash(token: string): Promise<string> {
  return hmac(getAdminSecret(), `dispositivo:${token}`);
}

async function uaHash(userAgent: string | null): Promise<string | null> {
  return userAgent ? hmac(getAdminSecret(), `ua:${userAgent}`) : null;
}

/**
 * Encontra o aparelho daquele cookie para aquele usuário, ou cria um registro novo.
 * Um cookie vale para um usuário: se outra pessoa entrar no mesmo navegador, ela
 * ganha o próprio registro (e o próprio código).
 */
export async function findOrCreateDevice({
  userId,
  token,
  userAgent,
  ipHash,
}: {
  userId: string;
  token: string;
  userAgent: string | null;
  ipHash: string | null;
}): Promise<{ device: AdminDevice; trusted: boolean }> {
  const db = await getDb();
  const hash = await deviceTokenHash(token);
  const at = nowIso();

  const existing = await db
    .prepare("SELECT * FROM admin_devices WHERE token_hash = ? AND user_id = ?")
    .bind(hash, userId)
    .first<AdminDevice & { ua_hash: string | null }>();

  if (existing) {
    const sameBrowser = existing.ua_hash === (await uaHash(userAgent));
    const trustedAt = existing.trusted_at ? new Date(existing.trusted_at).getTime() : 0;
    const trusted =
      !existing.revoked_at && sameBrowser && trustedAt > 0 && Date.now() - trustedAt < DEVICE_TRUST_DAYS * DAY;
    await db
      .prepare("UPDATE admin_devices SET last_seen_at = ?, last_ip_hash = ? WHERE id = ?")
      .bind(at, ipHash, existing.id)
      .run();
    return { device: existing, trusted };
  }

  const id = newId("dev");
  await db
    .prepare(
      `INSERT INTO admin_devices (id, user_id, token_hash, label, ua_hash, user_agent, created_at, last_seen_at, last_ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, hash, labelFromUserAgent(userAgent), await uaHash(userAgent), userAgent, at, at, ipHash)
    .run();

  return { device: (await db.prepare("SELECT * FROM admin_devices WHERE id = ?").bind(id).first<AdminDevice>())!, trusted: false };
}

export async function trustDevice(deviceId: string, userAgent: string | null): Promise<void> {
  const db = await getDb();
  await db
    .prepare("UPDATE admin_devices SET trusted_at = ?, revoked_at = NULL, ua_hash = ? WHERE id = ?")
    .bind(nowIso(), await uaHash(userAgent), deviceId)
    .run();
}

export async function listDevices(userId: string): Promise<AdminDevice[]> {
  const db = await getDb();
  const { results } = await db
    .prepare("SELECT * FROM admin_devices WHERE user_id = ? ORDER BY last_seen_at DESC")
    .bind(userId)
    .all<AdminDevice>();
  return results ?? [];
}

/** Tira a confiança do aparelho e derruba as sessões abertas nele. */
export async function revokeDevice(deviceId: string, userId: string): Promise<void> {
  const db = await getDb();
  const at = nowIso();
  await db.batch([
    db
      .prepare("UPDATE admin_devices SET revoked_at = ?, trusted_at = NULL WHERE id = ? AND user_id = ?")
      .bind(at, deviceId, userId),
    db
      .prepare("UPDATE admin_sessions SET revoked_at = ? WHERE device_id = ? AND revoked_at IS NULL")
      .bind(at, deviceId),
  ]);
}
