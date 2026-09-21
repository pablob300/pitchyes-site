import "server-only";
import { CODE_LENGTH, CODE_MAX_ATTEMPTS, CODE_TTL_MINUTES, INVITE_TTL_DAYS, RESET_TTL_HOURS } from "./config";
import { hmac, randomDigits, randomToken } from "./crypto";
import { DAY, getAdminSecret, getDb, HOUR, isoIn, MINUTE, newId, nowIso } from "./db";

// Códigos de 6 dígitos (verificação de aparelho) e tokens longos (convite e
// recuperação de senha). Guardados como HMAC com segredo fora do banco: um espaço
// de 10^6 com hash simples seria quebrado na hora num vazamento.

export type CodeKind = "dispositivo" | "convite" | "recuperacao";

const TTL: Record<CodeKind, number> = {
  dispositivo: CODE_TTL_MINUTES * MINUTE,
  convite: INVITE_TTL_DAYS * DAY,
  recuperacao: RESET_TTL_HOURS * HOUR,
};

async function codeHash(code: string, userId: string): Promise<string> {
  return hmac(getAdminSecret(), `codigo:${code}:${userId}`);
}

/**
 * Emite um código novo e invalida os anteriores do mesmo tipo — assim um código
 * antigo no e-mail não continua valendo depois de pedir outro.
 */
export async function issueCode({
  userId,
  kind,
  deviceId,
  sentTo,
}: {
  userId: string;
  kind: CodeKind;
  deviceId?: string | null;
  sentTo: string;
}): Promise<string> {
  const db = await getDb();
  const code = kind === "dispositivo" ? randomDigits(CODE_LENGTH) : randomToken(32);
  const at = nowIso();

  await db.batch([
    db
      .prepare("UPDATE admin_codes SET consumed_at = ? WHERE user_id = ? AND kind = ? AND consumed_at IS NULL")
      .bind(at, userId, kind),
    db
      .prepare(
        `INSERT INTO admin_codes (id, user_id, kind, code_hash, device_id, sent_to, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(newId("cod"), userId, kind, await codeHash(code, userId), deviceId ?? null, sentTo, at, isoIn(TTL[kind])),
  ]);

  return code;
}

export type CodeCheck =
  | { ok: true; deviceId: string | null }
  | { ok: false; reason: "invalido" | "expirado" | "tentativas" };

/**
 * Confere e queima o código. O consumo acontece dentro do próprio UPDATE
 * (`WHERE consumed_at IS NULL`), então dois envios simultâneos não passam os dois.
 */
export async function consumeCode({
  userId,
  kind,
  code,
}: {
  userId: string;
  kind: CodeKind;
  code: string;
}): Promise<CodeCheck> {
  const db = await getDb();
  const at = nowIso();

  const row = await db
    .prepare(
      `SELECT id, device_id, expires_at, attempts, consumed_at
         FROM admin_codes
        WHERE user_id = ? AND kind = ? AND consumed_at IS NULL
        ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(userId, kind)
    .first<{ id: string; device_id: string | null; expires_at: string; attempts: number }>();

  if (!row) return { ok: false, reason: "invalido" };
  if (new Date(row.expires_at).getTime() <= Date.now()) return { ok: false, reason: "expirado" };
  if (row.attempts >= CODE_MAX_ATTEMPTS) return { ok: false, reason: "tentativas" };

  const hash = await codeHash(code.trim(), userId);
  const consumed = await db
    .prepare("UPDATE admin_codes SET consumed_at = ? WHERE id = ? AND code_hash = ? AND consumed_at IS NULL")
    .bind(at, row.id, hash)
    .run();

  if (consumed.meta.changes !== 1) {
    const attempts = row.attempts + 1;
    await db
      .prepare(
        // Na última tentativa o código morre junto, para não deixar sobra utilizável.
        "UPDATE admin_codes SET attempts = ?, consumed_at = CASE WHEN ? >= ? THEN ? ELSE consumed_at END WHERE id = ?",
      )
      .bind(attempts, attempts, CODE_MAX_ATTEMPTS, at, row.id)
      .run();
    return { ok: false, reason: attempts >= CODE_MAX_ATTEMPTS ? "tentativas" : "invalido" };
  }

  return { ok: true, deviceId: row.device_id };
}

/** Quando o último código foi enviado — alimenta o contador do botão "reenviar". */
export async function lastCodeSentAt(userId: string, kind: CodeKind): Promise<string | null> {
  const db = await getDb();
  const row = await db
    .prepare("SELECT created_at FROM admin_codes WHERE user_id = ? AND kind = ? ORDER BY created_at DESC LIMIT 1")
    .bind(userId, kind)
    .first<{ created_at: string }>();
  return row?.created_at ?? null;
}
